# Inspections, reports and exports

Inspection reads are all refused for the API user. `GetReportTypes` works and lists PowerFab's
report layouts, including shipping tickets. The report and export commands are classed as writes because they make
files or jobs on the server, so they were not run.

[← Back to the index](README.md)

## Read commands

| Command | Status | Answers |
|---|---|---|
| [`GetReportTypes`](#getreporttypes) | ✅ data | Which shipping ticket layouts does PowerFab have? |
| [`GetInspectionTests`](#getinspectiontests) | ⛔ permission denied |  |
| [`GetInspectionTestTypes`](#getinspectiontesttypes) | ⛔ permission denied |  |
| [`GetInspectionTestSubjects`](#getinspectiontestsubjects) | ⛔ permission denied |  |
| [`GetInspectionTestRecords`](#getinspectiontestrecords) | ⛔ permission denied |  |
| [`GetInspectionTestRecordsCondensed`](#getinspectiontestrecordscondensed) | ⛔ permission denied |  |
| [`GetInspectionTestRecordSummary`](#getinspectiontestrecordsummary) | ⛔ permission denied |  |

### `GetReportTypes`

**Status:** ✅ data

**Purpose.** Report layouts PowerFab offers for a report group (`Inspection` or `ProductionControlShippingTicket`).

**Answers:** Which shipping ticket layouts does PowerFab have?

**Request that worked:**

```json
{"ReportGroup":"Inspection"}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: ReportGroup is required
- `{"ReportGroup":"Inspection"}` → 200, 3823 bytes
- `{"ReportGroup":"ProductionControlShippingTicket"}` → 200, 2143 bytes
- `{"ReportGroup":"Inspection"}` → 200, 3823 bytes
- `{"ReportGroup":"ProductionControlShippingTicket"}` → 200, 2143 bytes
- `{"JobNumber":"TESTTEST"}` → 422: ReportGroup is required

**Result:** HTTP 200, 3,823 bytes, 409 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `ReportType` | object | 1 |  |
| `ReportType.ReportTypeID` | number (as text) | 1 | `32` |
| `ReportType.Description` | text | 1 | `All` |
| `ReportType.Report` | list (26–26) | 1 |  |
| `ReportType.Report[].ReportID` | number (as text) | 26 | `664`, `665` |
| `ReportType.Report[].ReportGUID` | text | 26 | `62994a40-a564-43c1-8576-fcf710c8eb85`, `a06f6067-5741-42f1-b178-a8485f0c4a4d` |
| `ReportType.Report[].Description` | text | 26 | `Inspection Test Records`, `Inspection Test Records with Notes` |
| `ReportType.Report[].Title` | text | 26 | `Inspection Test Records`, `Inspection Test Records with Notes` |

**Sample** (trimmed; full trimmed sample in [samples/GetReportTypes.json](samples/GetReportTypes.json)):

```json
{
  "ReportType": {
    "ReportTypeID": "32",
    "Description": "All",
    "Report": [
      {
        "ReportID": "664",
        "ReportGUID": "62994a40-a564-43c1-8576-fcf710c8eb85",
        "Description": "Inspection Test Records",
        "Title": "Inspection Test Records"
      },
      "… 25 more"
    ]
  }
}
```

**Gotchas:**

- Needs `ReportGroup`.
- Generating a report (`MakeReport`) is a write and was not run.

### `GetInspectionTests`

**Status:** ⛔ permission denied

**Purpose.** Inspection tests.

**Best attempt:**

```json
{"JobNumber":"TESTTEST"}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: Permission denied.
- `{"JobNumber":"TESTTEST"}` → 422: Permission denied.

**Gotchas:**

- PowerFab answered "Permission denied." for the API user (the PowerFab External User the service logs in as).

### `GetInspectionTestTypes`

**Status:** ⛔ permission denied

**Purpose.** Inspection test types.

**Best attempt:**

```json
{"JobNumber":"TESTTEST"}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: Permission denied.
- `{"JobNumber":"TESTTEST"}` → 422: Permission denied.

**Gotchas:**

- PowerFab answered "Permission denied." for the API user (the PowerFab External User the service logs in as).

### `GetInspectionTestSubjects`

**Status:** ⛔ permission denied

**Purpose.** Inspection test subjects.

**Best attempt:**

```json
{"InspectionTestVersionID":1}
```

**Attempts:**

- `{"InspectionTestVersionID":1}` → 422: Permission denied.
- `{"JobNumber":"EPM-001"}` → 422: InspectionTestVersionID is required
- `{"InspectionTestVersionID":1}` → 422: Permission denied.
- `{"JobNumber":"TESTTEST"}` → 422: InspectionTestVersionID is required

**Gotchas:**

- PowerFab answered "Permission denied." for the API user (the PowerFab External User the service logs in as).
- Needs `InspectionTestVersionID`, then refused: "Permission denied".

### `GetInspectionTestRecords`

**Status:** ⛔ permission denied

**Purpose.** Inspection test records.

**Best attempt:**

```json
{"JobNumber":"TESTTEST"}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: Permission denied.
- `{"JobNumber":"TESTTEST"}` → 422: Permission denied.

**Gotchas:**

- PowerFab answered "Permission denied." for the API user (the PowerFab External User the service logs in as).

### `GetInspectionTestRecordsCondensed`

**Status:** ⛔ permission denied

**Purpose.** Inspection test records, condensed.

**Best attempt:**

```json
{"JobNumber":"TESTTEST"}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: Permission denied.
- `{"JobNumber":"TESTTEST"}` → 422: Permission denied.

**Gotchas:**

- PowerFab answered "Permission denied." for the API user (the PowerFab External User the service logs in as).

### `GetInspectionTestRecordSummary`

**Status:** ⛔ permission denied

**Purpose.** Inspection test record summary.

**Best attempt:**

```json
{"JobNumber":"TESTTEST"}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: Permission denied.
- `{"JobNumber":"TESTTEST"}` → 422: Permission denied.

**Gotchas:**

- PowerFab answered "Permission denied." for the API user (the PowerFab External User the service logs in as).

## Write commands

Run on the test jobs only (EPM-001, TESTTEST), each change undone afterwards. "Not run" means no request was sent; those purposes come from the command name and Tekla's reference.

| Command | Status | What it does |
|---|---|---|
| [`SaveInspectionTestRecord`](#saveinspectiontestrecord) | ⚠️ refused | Saves an inspection test record (from the name). |
| [`DeleteInspectionTestRecord`](#deleteinspectiontestrecord) | ⚠️ refused | Deletes an inspection test record (from the name). |
| [`InspectionDocumentAdd`](#inspectiondocumentadd) | ⚠️ refused | Attaches a document to an inspection (from the name). |
| [`MakeReport`](#makereport) | ⚠️ refused | Generates a report on the server (from the name). |
| [`PrepareReportData`](#preparereportdata) | ⚠️ refused | Prepares data for a report (from the name). |
| [`ExportJob`](#exportjob) | ✅ data | Starts a job export on the server (from the name). |
| [`ExportJobStatus`](#exportjobstatus) | ✅ data | Status of a job export (from the name). Classed as a write because its effect is unclear; it may be a harmless read. |
| [`ExtensionCommand`](#extensioncommand) | ⏸ not run | Runs a PowerFab extension command. Effect unknown. |

### `SaveInspectionTestRecord`

**Status:** ⚠️ refused

**What it does.** Saves an inspection test record (from the name).

**Attempts:**

- `{}` → 422: InspectionTestVersionID is required

### `DeleteInspectionTestRecord`

**Status:** ⚠️ refused

**What it does.** Deletes an inspection test record (from the name).

**Attempts:**

- `{}` → 422: InspectionTestRecordID is required

### `InspectionDocumentAdd`

**Status:** ⚠️ refused

**What it does.** Attaches a document to an inspection (from the name).

**Attempts:**

- `{}` → 422: InspectionTestRecordID is required

### `MakeReport`

**Status:** ⚠️ refused

**What it does.** Renders a report.

**Attempts:**

- `{}` → 422: ReportGroup is required
- `{"ReportGroup":"ProductionControlShippingTicket","ReportID":1020,"ProductionControlLoadID":"397"}` → 422: ReportTypeID is required
- `{"ReportGroup":"ProductionControlShippingTicket","ReportTypeID":21,"ReportID":1020,"ProductionControlID":13,"ProductionControlLoadID":"401"}` → 422: ExportFormat is required
- `{"ReportGroup":"ProductionControlShippingTicket","ReportTypeID":21,"ReportID":1020,"ProductionControlID":90,"ProductionControlLoadID":"404","ExportFormat":"PDF"}` → 422: ProductionControlID report option is required.
- `{"ReportGroup":"ProductionControlShippingTicket","ReportTypeID":21,"ReportID":1020,"ExportFormat":"PDF","ReportOptions":{"ProductionControlID":90,"ProductionControlLoadID":"407"}}` → 422: ProductionControlID report option is required.
- `{"ReportGroup":"ProductionControlShippingTicket","ReportTypeID":21,"ReportID":1020,"ExportFormat":"PDF","ReportOption":[{"OptionName":"ProductionControlID","OptionValue":90},{"OptionName":"ProductionControlLoadID","OptionValue":"407"}]}` → 422: ProductionControlID report option is required.
- `{"ReportGroup":"ProductionControlShippingTicket","ReportTypeID":21,"ReportGUID":"a0a1106d-bda9-11f1-8386-2cea7f483ab7","ExportFormat":"PDF","ReportOptions":[{"OptionName":"ProductionControlID","OptionValue":"90"},{"OptionName":"ProductionControlLoadID","OptionValue":"383"}]}` → 422: ProductionControlID report option is required.
- `{"ReportGroup":"ProductionControlShippingTicket","ReportTypeID":21,"ReportGUID":"b7ab9125-0f5b-4543-928b-318f0baa5f2d","ExportFormat":"PDF","ReportOptions":[{"OptionName":"ProductionControlID","OptionValue":"90"},{"OptionName":"ProductionControlLoadID","OptionValue":"383"}]}` → 422: ProductionControlID report option is required.

**Gotchas:**

- Every layout of `ReportOptions` tried was answered `ProductionControlID report option is required.` The layout of the options is not worked out.
- Fields that were asked for: `ReportGroup`, `ReportTypeID`, `ExportFormat`; Tekla names `ReportGUID` (the old `ReportID` is deprecated), `ReportInstanceGUID` and `ReportOptions`.

### `PrepareReportData`

**Status:** ⚠️ refused

**What it does.** Prepares report data for a later `MakeReport`.

**Attempts:**

- `{}` → 422: ReportGroup is required
- `{"ReportGroup":"ProductionControlShippingTicket","ReportID":1020,"ProductionControlLoadID":"397"}` → 422: ProductionControlID report option is required.
- `{"ReportGroup":"ProductionControlShippingTicket","ReportTypeID":21,"ReportID":1020,"ProductionControlID":13,"ProductionControlLoadID":"401"}` → 422: ProductionControlID report option is required.
- `{"ReportGroup":"ProductionControlShippingTicket","ReportTypeID":21,"ReportID":1020,"ReportOption":[{"OptionName":"ProductionControlID","OptionValue":90},{"OptionName":"ProductionControlLoadID","OptionValue":"407"}]}` → 422: ProductionControlID report option is required.
- `{"ReportGroup":"ProductionControlShippingTicket","ReportTypeID":21,"ReportGUID":"a0a1106d-bda9-11f1-8386-2cea7f483ab7","ReportOptions":[{"OptionName":"ProductionControlID","OptionValue":"90"},{"OptionName":"ProductionControlLoadID","OptionValue":"383"}]}` → 422: ProductionControlID report option is required.

**Gotchas:**

- Same refusal as `MakeReport`: `ProductionControlID report option is required.`

### `ExportJob`

**Status:** ✅ worked

**What it does.** Exports a job to a KISS file on the server.

**Request that worked:**

```json
{"JobNumber":"EPM-001","Filename":"EPM-001.xml"}
```

**Reply:** only `Successful` and a `CommandGUID`.

**Attempts:**

- `{}` → 422: JobNumber is required
- `{"JobNumber":"EPM-001"}` → 422: Filename is required
- `{"JobNumber":"EPM-001","Filename":"EPM-001.xml"}` → 200: accepted

**Gotchas:**

- Needs `JobNumber` and `Filename`. The reply is only `Successful`; `ExportJobStatus` then names `EPM-001.xml`.

### `ExportJobStatus`

**Status:** ✅ worked

**What it does.** Reports the export file of a job.

**Request that worked:**

```json
{"JobNumber":"EPM-001"}
```

**Reply** (trimmed; [samples/ExportJobStatus.json](samples/ExportJobStatus.json)):

```json
{
  "ExportFile": {
    "FileName": "EPM-001.xml",
    "FileExtension": ".xml",
    "ContentType": "text/xml",
    "BinaryDataIndex": "0"
  }
}
```

**Attempts:**

- `{}` → 200: accepted
- `{"JobNumber":"EPM-001"}` → 200: accepted

**Gotchas:**

- Reply: `ExportFile` with `FileName`, `FileExtension`, `ContentType` and `BinaryDataIndex`. Without a job it answers `ProductionControlID or JobNumber is required` in `ErrorMessage` with `Successful` "1".

### `ExtensionCommand`

**Status:** ⏸ not run

**What it does.** Runs a PowerFab extension command. Effect unknown.
