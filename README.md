# tekla-conversion-layer

A small service that sits next to **Tekla PowerFab** and lets the
[terra-loads-web](https://github.com/ATagTheAwesomest/terra-loads-web) shop app read and change
PowerFab data over HTTPS/JSON. It starts with piece and load tracking (load, unload, ship, read
loads) and passes any other PowerFab command through, so the rest of PowerFab can be reached as we go.

```
iPad (terra-loads-web)
   │  HTTPS + JSON, "Authorization: Bearer <API_TOKEN>"
   ▼
Cloudflare Tunnel (cloudflared container, no inbound firewall port)
   │  http://api:8080
   ▼
tekla-conversion-layer (this container, on the PowerFab server)
   │  FabSuiteXMLRequest XML over TCP, Tekla.PowerFab.API ExecuteRemote
   ▼
PowerFab Remote Server service (default port 9154) ──► PowerFab MySQL database
```

The service never touches PowerFab's MySQL tables directly. Everything goes through Tekla's
supported API, so PowerFab's own rules (quantities, shipped trucks, permissions) still apply.

## Running it

```bash
cp .env.example .env        # then fill in API_TOKEN at minimum
docker compose up -d --build
curl http://127.0.0.1:8080/health
```

`POWERFAB_MODE=mock` (the default) runs against an in-memory fake PowerFab, so everything can be
built and tried without a PowerFab server. Switch to `remote` and fill in the `POWERFAB_*` values to
talk to the real thing. Add `--profile tunnel` to also start the Cloudflare Tunnel.

Without Docker: `dotnet run --project src/TeklaConversionLayer` (with the same variables set), and
`dotnet test` for the tests.

## Running on Windows without Docker

Docker Desktop will not install on Windows Server or older Windows 10, so the service can also run as
a plain Windows service. The package is self-contained: no .NET install is needed on the server.

1. On a machine with the .NET 10 SDK, run `powershell -File windows/build-release.ps1`. It writes
   `dist/TeklaConversionLayer-win-x64.zip`.
2. Unzip it on the server, copy `local.settings.example.json` to `local.settings.json` and fill it in
   (same keys as `.env.example`, plus `Urls`).
3. In an administrator PowerShell in that folder: `.\install-service.ps1`. The service starts with
   Windows and restarts after a crash.
4. Point the Cloudflare Tunnel's public hostname at `http://localhost:8090`, the port in the example
   `Urls` (the Docker setup above uses 8080; the Windows service uses 8090).

`local.settings.json` holds the API token and PowerFab password, so keep it out of git (it is not in
the package) and readable only by administrators.

### Updating a server that runs from a clone

On the server, with git and the .NET 10 SDK installed, an update is one command from the repo root in
an administrator PowerShell:

```powershell
.\windows\deploy.ps1
```

It runs `git pull --ff-only`, builds the code, stops the service, copies the build into
`C:\TeklaConversionLayer` (leaving `local.settings.json` alone), starts the service and checks `/health`.
If the pull fails, nothing is deployed.

## API

Every `/api` call needs `Authorization: Bearer <API_TOKEN>`. Errors come back as JSON problem
details: `401` bad token, `400` bad input, `403` writes turned off, `422` PowerFab refused the
command (its message is passed through), `502` PowerFab unreachable or replied with an XML error.

| Method | Path | PowerFab command | Notes |
|---|---|---|---|
| GET | `/health` | none | No token needed. Shows mode and whether writes are on. |
| GET | `/api/jobs/{job}/loads?load=` | `GetLoads` | Loads, loaded and remaining material for a job. |
| POST | `/api/jobs/{job}/trucks/{truck}/pieces` | `Load` (CommitType Save) | Body `{ "mainMark": "1001-C1", "quantity": 1, "sequence": "1" }` |
| DELETE | `/api/jobs/{job}/trucks/{truck}/pieces` | `Load` (CommitType Delete) | Same body. Takes pieces off the truck. |
| POST | `/api/jobs/{job}/trucks/{truck}/ship` | `Ship` | Optional body `{ "date": "2026-10-19" }` |
| GET | `/api/commands` | none | Lists every PowerFab command with its route and whether it is a read or a write. |
| GET | `/api/commands/{command}?Field=value` | that command | Read commands only. Query string becomes the fields; a repeated key becomes a list. |
| POST | `/api/commands/{command}` | that command | Any command. Body is the command's fields as JSON. |
| POST | `/api/powerfab/{command}` | any | Pass-through by name, including names not in the table. |
| GET | `/api/files` | none | Files: on or off, size limit, types taken. |
| GET | `/api/files/{job}/{load}` | none | Files: what has been saved for a load. |
| POST | `/api/files/{job}/{load}` | none | Files: save photos (multipart `file` fields, optional `mark`). Needs `FILES_ENABLED`. |
| GET | `/api/files/help` | none | Files: the full setup guide ([docs/FILES.md](docs/FILES.md)) as Markdown. |

Load, unload, ship and every write command are refused until `POWERFAB_ALLOW_WRITES=true`. That
keeps the service read-only while it is being checked against real data.

**Files.** The app can send photos of a load, or of a piece on it. They are saved in a folder for the
job and a folder per load, under `FILES_ROOT` or wherever a regex rule in `file-rules.json` points that
job. Off until `FILES_ENABLED=true`. Setup, the rules file format, limits and checks are in
[docs/FILES.md](docs/FILES.md), which also ships next to the exe and is served at `GET /api/files/help`.

**Every command.** [PowerFabCommands.cs](src/TeklaConversionLayer/PowerFabCommands.cs) holds all 252
commands of PowerFab's `FabSuiteXMLRequest`, copied from the property list of `fsreqFabSuiteXMLRequest`
in [Tekla's PowerFab 2026 API reference](https://developer.tekla.com/doc/tekla-powerfab/2026/fsreq-fab-suite-xml-request-properties-78439)
(257 entries, less `Connect`, `ConnectRemote`, `Close`, `CloseRemote` and the `ConnectionGUID` field,
which the service handles itself). The `Tekla.PowerFab.API` package only carries the transport, not the
command classes, so the reference is the source. Each command gets `/api/commands/{command}`, generated
from that one table.

- **Read** (122): names starting with `Get` or ending in `_Get`, plus `CNCData`, `MaxTruck`, `Ping`,
  `InventoryTransaction_GetLastTransactionID`, `ProductionControlCutListItem_Swap_GetAvailable`,
  `ProductionControlLoad_IsDuplicateLoadNumber` and the `Val*` commands (judged a lookup from their names; Tekla gives no description).
- **Write** (130): everything else, including anything whose effect is unclear from the reference
  (`ExportJob`, `MakeReport`, `PrepareReportData`, `TrimbleIdentityToken`, `ExtensionCommand`, `Lang`,
  `Version`...). Treating an unclear command as a write only means it stays behind the switch.

These routes do not reshape anything: the fields and the reply are each command's own XML as JSON, the
same as the pass-through. **Request and response layouts for these commands are not checked against a
real PowerFab**, only `GetProductionControlJobs` is. Look up a command's fields in Tekla's reference
(`fsreq<Command>` and `fsres<Command>` classes) before relying on it. In mock mode, every command other
than `GetLoads`, `Load` and `Ship` returns a fake success with `"MockResponse": "true"`.

**Pass-through.** `POST /api/powerfab/{command}` sends any command by name. A command in the table
uses its read/write class; an unknown name counts as a write unless it starts with `Get`. It
turns the JSON body into the command's XML: object keys become child elements, arrays become
repeated elements. The reply is PowerFab's XML turned back into JSON, where an element that appears
once is an object and one that repeats is an array. Attributes become `@name` keys, and a value that
carries one keeps its text under `#text`: `<Weight UOM="kg">123</Weight>` becomes
`{ "@UOM": "kg", "#text": "123" }`. PowerFab sends weights, lengths, capacities and dimensions this way. Field names come from Tekla's API reference
(for example [fsreqLoad](https://developer.tekla.com/doc/tekla-powerfab/2025/fsreq-load-class-56627)).
Commands the web app relies on should get a proper endpoint like the ones above once their real
response shape is known.

**What each command returns.** [docs/powerfab/](docs/powerfab/README.md) is a wiki of every read command
called against a live PowerFab: the request that worked, the reply's fields, a trimmed real sample, gotchas, and
which commands came back empty or refused. Start there before building on a command.

## How it talks to PowerFab

Code: [PowerFabClient.cs](src/TeklaConversionLayer/PowerFabClient.cs). It logs in once with
`ConnectRemote`, keeps the returned `ConnectionGUID`, sends one command at a time, reconnects once
if PowerFab answers with an `XMLError` (for example an expired session), and stamps every command
with a new `CommandGUID` so PowerFab can ignore a duplicate if a command is resent.

### Confirmed from Tekla's documentation and package

- The `Tekla.PowerFab.API` NuGet package (1.0.1, targets net8.0) exposes
  `ITeklaPowerFabAPI.ExecuteRemote(string ipAddress, long port, string request)` and
  `ExecuteDirect(string request)`. Checked by inspecting the package.
  `ExecuteDirect` launches PowerFab's local `Tekla.EPM.API.Redirect.exe`, so it needs Windows with
  PowerFab installed. `ExecuteRemote` is a plain TCP client, which is why this service can run in a
  Linux container. ([update notes](https://developer.tekla.com/tekla-powerfab/documentation/tekla-powerfab-api-update-information))
- `ExecuteRemote` talks to the **PowerFab Remote Server** service, whose port is set under Remote
  Monitor > Socket and defaults to **9154**. 3306 is the MySQL port, not this one.
  ([Remote Server setup](https://support.tekla.com/doc/tekla-powerfab/2024i/am_remote_server))
- Requests are a `FabSuiteXMLRequest` document. `ConnectRemote` takes `Username` and `Password` of a
  PowerFab External User and returns `Successful` and `ConnectionGUID`, which every later request
  carries. `CloseRemote` ends the session. A request-level problem comes back as `XMLError`.
  ([Connection Management](https://developer.tekla.com/documentation/connection-management))
- Request schema namespace `http://www.fabsuite.com/xml/fabsuite-xml-request-v0108.xsd`.
- `fsreqLoad` fields: JobNumber, MainMark, Quantity, Sequence, TruckNumber, LotNumber,
  BarcodeSerialNumber, CommitType (`Save` loads, `Delete` unloads), and more.
  `fsreqShip`: JobNumber, TruckNumber, Date, CommitType. `fsreqGetLoads`: JobNumber, LoadNumber,
  IncludeLoads, IncludeUnshippedLoads, IncludeCompletedMaterial, IncludeRemainingMaterial.
- PowerFab's newer REST API (Trimble Identity login, `powerfab-go-api.<region>.teklapowerfab.net`)
  has only a few endpoints so far. ([overview](https://support.tekla.com/article/tekla-powerfab-apis))

### Assumed, to check against a real PowerFab

- The XML element for each command matches its class name without `fsreq`
  (`fsreqLoad` → `<Load>`, `fsreqGetLoads` → `<GetLoads>`), and the reply carries an element of the
  same name with `Successful` and `ErrorMessage`. This matches the `ConnectRemote` examples but
  is not shown for these commands.
- Where `CommandGUID` sits inside the command, and whether element order matters.
- `CommitType` `Save` is right for `Ship`.
- `LoadNumber` in `GetLoads` is the same value as `TruckNumber` in `Load`.
- An expired `ConnectionGUID` shows up as an `XMLError` (it triggers the reconnect).
- The real `GetLoads` reply layout. The mock's layout is made up; nothing should depend on it yet.
- How PowerFab job numbers, main marks and sequences line up with the marks the web app scans
  (the web app treats the first 4 characters of a mark as the sequence).

Tekla's request/response XSD files ship in the PowerFab Docs folder on the server, and the
**Interface Test Program** (`C:\Program Files (x86)\Tekla\Tekla PowerFab\Tekla.PowerFab.Interface.Test.exe`)
can send raw requests. Those two will settle most of the list above in a few minutes.

## What is needed from the PowerFab side

1. PowerFab version.
2. An **External User** username and password with permission to log in and view jobs (and to
   load/ship once writes are turned on). These go in `.env` on the server only.
3. Is the **PowerFab Remote Server** service installed and running, and on which port?
4. Server OS. This image is a Linux container. On Windows Server that needs Docker Desktop or
   another WSL2-backed Docker; if only Windows containers are allowed there, the project can be
   rebuilt on a Windows base image, or run as a plain Windows service without Docker.
5. A Cloudflare account and the hostname the API should live at, for the tunnel.
6. The web app's origin (for `CORS_ORIGINS`).

## Security

- The token is compared in constant time; generate it with `openssl rand -hex 32`.
- The port is bound to `127.0.0.1` only. Outside access is through the Cloudflare Tunnel, which
  provides HTTPS. Cloudflare Access can be added in front of it for a second layer.
- Writes are off by default. The container runs as a non-root user.
- `.env` is ignored by git. Never commit PowerFab credentials or the API token.

The `Tekla.PowerFab.API` package is Trimble's and comes under Trimble's EULA; it is downloaded from
NuGet at build time, not stored in this repository.
