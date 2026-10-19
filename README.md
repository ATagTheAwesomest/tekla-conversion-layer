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
| POST | `/api/powerfab/{command}` | any | Body is the command's fields as JSON. See below. |

Load, unload, ship and every pass-through command whose name does not start with `Get` are refused
until `POWERFAB_ALLOW_WRITES=true`. That keeps the service read-only while it is being checked
against real data.

**Pass-through.** PowerFab has about 250 commands (inventory, purchasing, production control,
time tracking, and so on). Instead of wrapping each one by hand, `POST /api/powerfab/{command}`
turns the JSON body into the command's XML: object keys become child elements, arrays become
repeated elements. The reply is PowerFab's XML turned back into JSON, where an element that appears
once is an object and one that repeats is an array. Field names come from Tekla's API reference
(for example [fsreqLoad](https://developer.tekla.com/doc/tekla-powerfab/2025/fsreq-load-class-56627)).
Commands the web app relies on should get a proper endpoint like the ones above once their real
response shape is known.

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
