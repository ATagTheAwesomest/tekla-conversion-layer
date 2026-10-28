# Files: photos from the app, saved per job and load

The TERRA app (terra-tekla-client, Shipping) can take photos of a load, or of one piece on it, and
send them here. The service saves each one in a folder for the job, then a folder for the load:

```
<job folder>\<load folder>\<date-time>_<mark or "load">.<ext>

D:\TerraFiles\EPM-001\Load 8\20261028-143502_load.jpg
D:\TerraFiles\EPM-001\Load 8\20261028-143611_1001-C1.jpg
\\fileserver\Jobs\2026\26101\Photos\Load 3\20261028-150012_load (2).jpg
```

This is off until it is turned on. The app has its own switch too (Server settings, "Send photos to
the server"), also off until turned on on each iPad.

This file ships next to `TeklaConversionLayer.exe` as `FILES.md` and is served by
`GET /api/files/help`, so it always matches the running build.

## Turning it on (startup options)

Same place as the other settings: `local.settings.json` in the install folder for the Windows service
(`C:\TeklaConversionLayer\local.settings.json`), or `.env` for Docker. Restart the service after
changing them (`Restart-Service TeklaConversionLayer`).

| Key | Default | Meaning |
|---|---|---|
| `FILES_ENABLED` | `false` | `true` lets the app send files. Off: the file routes answer 403. |
| `FILES_ROOT` | none | Full path of the base folder. Required when on. Jobs go in `FILES_ROOT\{job}` unless a rule says otherwise. |
| `FILES_RULES` | `file-rules.json` | The rules file. A relative path is next to the exe. Missing file = no rules. |
| `FILES_MAX_MB` | `25` | Largest single file, in MB. |
| `FILES_MAX_PER_UPLOAD` | `20` | Most files in one upload. |
| `FILES_TYPES` | `jpg,png,heic,webp,pdf` | File types taken, from that list. The type is read from the file's first bytes, not its name. |

Example `local.settings.json` additions:

```json
{
  "FILES_ENABLED": "true",
  "FILES_ROOT": "D:\\TerraFiles",
  "FILES_RULES": "file-rules.json",
  "FILES_MAX_MB": "25"
}
```

The Windows service runs as LocalSystem by default. LocalSystem can write to local drives, but on a
network share (`\\fileserver\...`) it acts as the computer account (`DOMAIN\SERVERNAME$`), which needs
write permission on that share, or set the service to log on as a user that has it
(`services.msc` > Tekla Conversion Layer > Log On). Mapped drive letters (`J:`) are per user and
don't exist for a service: use the `\\server\share\...` path in rules instead.

With Docker, `FILES_ROOT` is a path inside the container: mount a host folder there
(for example `volumes: ["D:/TerraFiles:/files"]` in compose.yaml and `FILES_ROOT=/files`).

## The rules file (which folder a job goes in)

`file-rules.json` maps job numbers to folders with regexes. It is re-read when it changes, so edits
take effect without a restart. `file-rules.example.json` next to the exe is a starting point:

```jsonc
{
  "default": "D:\\TerraFiles\\{job}",
  "loadFolder": "Load {load}",
  "rules": [
    { "match": "^25-\\d+$", "folder": "\\\\fileserver\\Projects 2025\\{job}\\Shipping Photos" },
    { "match": "^(?<year>\\d{2})\\d{3}$", "folder": "\\\\fileserver\\Jobs\\20{year}\\{job}\\Photos" },
    { "match": "^EPM-001$", "folder": "E:\\Special\\EPM\\Load photos" }
  ]
}
```

- `rules`: checked top to bottom, first match wins. `match` is a .NET regex tested against the job
  number (case-insensitive, 1 second time limit). Anchor it with `^...$` to match the whole number.
- `folder`: the **job's** folder, a full path (`C:\...`, `D:\...` or `\\server\share\...`). It can
  use `{job}` and the regex's groups: named groups like `(?<year>\d{2})` as `{year}`, or plain
  `( )` groups as `{1}`, `{2}`... (.NET numbers the plain groups first, then the named ones, so naming
  them is clearer). The load folder is always added under it.
- `default` (optional): the job folder when no rule matches. Without it, `FILES_ROOT\{job}`.
- `loadFolder` (optional): the folder name per load, from `{load}` (and `{job}`). Default `{load}`,
  so `...\8\`. `"Load {load}"` gives `...\Load 8\`.
- In JSON, every `\` is written `\\`: `D:\Jobs` is `"D:\\Jobs"`, `\\fs\share` is `"\\\\fs\\share"`, and
  the regex `\d` is `"\\d"`. Comments (`//`) and trailing commas are allowed.
- If the file can't be read, isn't valid JSON or a regex is broken, uploads answer 500 with the reason
  and nothing is saved. Fix the file and try again; no restart needed.

To check a rule without the app, list a load's files (this creates nothing):
`GET /api/files/{job}/{load}` answers 500 with the reason if the rules are wrong, 200 otherwise.

## What is checked

- The API key, as for every `/api` route (`Authorization: Bearer <API_TOKEN>`).
- Job, load and mark: 1 to 64 characters; none of `< > : " / \ | ? *` or control characters; not `.`
  or `..`; no leading/trailing space or trailing dot; not a Windows device name (`CON`, `NUL`,
  `COM1`...). Anything else is refused with 400, never cleaned up, so a name can't reach a folder
  outside its job folder. The final path is also checked to be inside the job folder.
- Each file's size (`FILES_MAX_MB`, 413) and type by its first bytes (`FILES_TYPES`, 415). The name
  the app gives a file is ignored; the server names every file itself and never overwrites one
  (a second photo in the same second gets ` (2)`).
- Every file in an upload is checked before any is saved.

## API

All need `Authorization: Bearer <API_TOKEN>`. Errors are JSON problem details with `detail` saying why.

| Method | Path | Answer |
|---|---|---|
| GET | `/api/files` | `{ "enabled": true, "maxBytes": 26214400, "maxFiles": 20, "types": ["jpg", ...] }`. Works when off (enabled false). |
| GET | `/api/files/help` | This document, as Markdown. Works when off. |
| GET | `/api/files/{job}/{load}` | `{ "job", "load", "files": [{ "name", "bytes", "modified" }] }`, oldest first. Empty list if the folder doesn't exist yet. |
| POST | `/api/files/{job}/{load}` | `multipart/form-data`: one or more `file` fields, optional `mark` field (the piece the photos are of; left out = the whole load). 201 `{ "job", "load", "saved": [{ "name", "bytes" }] }`. |

`{job}` is the PowerFab job number and `{load}` the app's load number (`8`, not PowerFab's split
`8.1010`), URL-encoded. Status codes: 400 bad name or no files, 401 bad key, 403 files off, 413 too
big or too many, 415 type not taken, 500 rules file wrong.

```bash
curl -H "Authorization: Bearer $API_TOKEN" -F file=@photo.jpg -F mark=1001-C1 \
  http://127.0.0.1:8090/api/files/EPM-001/8
```

```powershell
$h = @{ Authorization = "Bearer $token" }
Invoke-RestMethod http://127.0.0.1:8090/api/files -Headers $h
Invoke-RestMethod http://127.0.0.1:8090/api/files/EPM-001/8 -Headers $h
```

## Setting it up on the server (checklist)

1. Pick the base folder and create it (`D:\TerraFiles`). Make sure the service's account can write
   there and to every folder a rule points at.
2. Add `FILES_ENABLED`, `FILES_ROOT` (and any limits) to `local.settings.json`.
3. Optional: copy `file-rules.example.json` to `file-rules.json` in the install folder and write the
   rules. `deploy.ps1` never overwrites `file-rules.json` or `local.settings.json`.
4. `Restart-Service TeklaConversionLayer`, then `GET /health` shows `"filesEnabled": true`.
5. Check a job's folder: `GET /api/files/<job>/1` must answer 200.
6. On each iPad: Server settings > turn on "Send photos to the server".

Photos taken in the app wait on the iPad until they are sent, so a dropped connection doesn't lose
them; the app retries when it is back online.
