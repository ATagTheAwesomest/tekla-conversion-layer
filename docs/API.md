# API reference

Every `/api` call needs `Authorization: Bearer <API_TOKEN>`. Errors come back as JSON problem
details: `401` bad token, `400` bad input, `403` writes turned off, `422` PowerFab refused the
command (its message is passed through), `502` PowerFab unreachable or replied with an XML error.

| Method | Path | Notes |
|---|---|---|
| GET | `/health` | No token needed. Shows mode and whether writes are on. |
| POST | `/api/powerfab/{command}` | Any PowerFab command by name. Body is the command's fields as JSON. This is what terra-tekla-server uses. |
| GET | `/api/commands` | Lists every PowerFab command with its route and whether it is a read or a write. |
| GET | `/api/commands/{command}?Field=value` | Read commands only. Query string becomes the fields; a repeated key becomes a list. |
| POST | `/api/commands/{command}` | Any command in the table. Body is the command's fields as JSON. |

Write commands are refused until `POWERFAB_ALLOW_WRITES=true`.

**Pass-through.** `POST /api/powerfab/{command}` sends any command by name. A command in the table
uses its read/write class; an unknown name counts as a write unless it starts with `Get`. It
turns the JSON body into the command's XML: object keys become child elements, arrays become
repeated elements. The reply is PowerFab's XML turned back into JSON, where an element that appears
once is an object and one that repeats is an array. Attributes become `@name` keys, and a value that
carries one keeps its text under `#text`: `<Weight UOM="kg">123</Weight>` becomes
`{ "@UOM": "kg", "#text": "123" }`. PowerFab sends weights, lengths, capacities and dimensions this way. Field names come from Tekla's API reference
(for example [fsreqLoad](https://developer.tekla.com/doc/tekla-powerfab/2025/fsreq-load-class-56627)).

**Every command.** [PowerFabCommands.cs](../src/TeklaConversionLayer/PowerFabCommands.cs) holds all 252
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
same as the pass-through. Not every command has been tried against a real PowerFab: the [wiki](powerfab/README.md) says
which have. Look up a command's fields in Tekla's reference
(`fsreq<Command>` and `fsres<Command>` classes) before relying on it. In mock mode, every command other
than `GetLoads`, `Load` and `Ship` returns a fake success with `"MockResponse": "true"`.

**What each command returns.** [powerfab/](powerfab/README.md) is a wiki of every read command
called against a live PowerFab: the request that worked, the reply's fields, a trimmed real sample,
gotchas, and which commands came back empty or refused. Start there before building on a command.

## How it talks to PowerFab

Code: [PowerFabClient.cs](../src/TeklaConversionLayer/PowerFabClient.cs). It logs in once with
`ConnectRemote`, keeps the returned `ConnectionGUID`, sends one command at a time, reconnects once
if PowerFab answers with an `XMLError` (for example an expired session), and stamps every command
with a new `CommandGUID` so PowerFab can ignore a duplicate if a command is resent.

### From Tekla's documentation and package

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
