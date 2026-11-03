# tekla-conversion-layer

A small service that runs next to **Tekla PowerFab** and turns PowerFab's XML API into plain
HTTP + JSON. [terra-tekla-server](https://github.com/ATagTheAwesomest/terra-tekla-server) uses it
to read and change PowerFab data for the TERRA iPad app. It keeps no data of its own.

```
terra-tekla-server ──HTTP + JSON──► tekla-conversion-layer :8090 ──XML over TCP──► PowerFab Remote Server :9154
                                    (this, on 127.0.0.1)
```

Everything goes through Tekla's supported API (`Tekla.PowerFab.API`), never PowerFab's database, so
PowerFab's own rules still apply.

## Requirements

- Windows with the [.NET 10 SDK](https://dotnet.microsoft.com/download) and git (or Docker on any OS)
- PowerFab's **Remote Server** service running (Remote Monitor > Socket, default port 9154)
- A PowerFab **External User** (username and password) that can log in and view jobs

## Install (Windows service)

In an elevated PowerShell:

```powershell
git clone https://github.com/ATagTheAwesomest/tekla-conversion-layer C:\src\tekla-conversion-layer
cd C:\src\tekla-conversion-layer
dotnet publish src\TeklaConversionLayer -c Release -o C:\TeklaConversionLayer
copy windows\install-service.ps1, windows\local.settings.example.json C:\TeklaConversionLayer\
cd C:\TeklaConversionLayer
copy local.settings.example.json local.settings.json   # then fill it in (see Configure)
.\install-service.ps1                                   # installs and starts the service
Invoke-RestMethod http://127.0.0.1:8090/health          # should say status: ok
```

No .NET on the server? Run `windows\build-release.ps1` on another machine; it makes a self-contained
zip (`dist\TeklaConversionLayer-win-x64.zip`) to unzip into `C:\TeklaConversionLayer`.

## Configure

`C:\TeklaConversionLayer\local.settings.json` (or `.env` for Docker):

| Key | What to put |
|---|---|
| `Urls` | `http://127.0.0.1:8090`. Keep it on 127.0.0.1: only terra-tekla-server should reach it. |
| `API_TOKEN` | A long random secret (32+ characters). terra-tekla-server's `CONVERSION_KEY` is this same value. |
| `POWERFAB_MODE` | `remote` for the real PowerFab, `mock` for a built-in fake (for trying things out). |
| `POWERFAB_HOST`, `POWERFAB_PORT` | The PowerFab Remote Server, usually `localhost` and `9154`. |
| `POWERFAB_USERNAME`, `POWERFAB_PASSWORD` | The PowerFab External User. |
| `POWERFAB_ALLOW_WRITES` | `false` keeps it read-only. TERRA's Shipping needs `true`. |

Restart after changing it: `Restart-Service TeklaConversionLayer`. The file holds the PowerFab
password, so keep it out of git and readable only by administrators.

## Update

```powershell
cd C:\src\tekla-conversion-layer
.\windows\deploy.ps1     # git pull, build, restart the service, check /health
```

It never overwrites `local.settings.json`. If the pull fails, nothing is deployed.

## Run it on your own computer

With the .NET 10 SDK, against the built-in fake PowerFab:

```bash
API_TOKEN=dev-token-0123456789abcdef0123456789 POWERFAB_MODE=mock Urls=http://127.0.0.1:8090 \
  dotnet run --project src/TeklaConversionLayer
curl http://127.0.0.1:8090/health
dotnet test
```

Or with Docker: `cp .env.example .env`, fill in `API_TOKEN`, then `docker compose up -d --build`
(listens on `127.0.0.1:8080`).

## Using the API

Send any PowerFab command by name, with the bearer token:

```bash
curl -X POST http://127.0.0.1:8090/api/powerfab/GetProjectStatus \
  -H "Authorization: Bearer $API_TOKEN" -H "Content-Type: application/json" \
  -d '{"JobNumber":"EPM-001"}'
```

The JSON body becomes the command's XML fields and PowerFab's XML reply comes back as JSON.

- [docs/API.md](docs/API.md): every route, errors, how XML maps to JSON, and how the service talks
  to PowerFab.
- [docs/powerfab/](docs/powerfab/README.md): what each PowerFab command returns, from a live
  PowerFab, with gotchas.

The `Tekla.PowerFab.API` package is Trimble's and comes under Trimble's EULA; it is downloaded from
NuGet at build time, not stored in this repository.
