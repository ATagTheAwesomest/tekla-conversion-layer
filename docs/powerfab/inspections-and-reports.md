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
{"JobNumber":"EPM-001"}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: Permission denied.

**Gotchas:**

- PowerFab answered "Permission denied." for the API user (the PowerFab External User the service logs in as).

### `GetInspectionTestTypes`

**Status:** ⛔ permission denied

**Purpose.** Inspection test types.

**Best attempt:**

```json
{"JobNumber":"EPM-001"}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: Permission denied.

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

**Gotchas:**

- PowerFab answered "Permission denied." for the API user (the PowerFab External User the service logs in as).
- Needs `InspectionTestVersionID`, then refused: "Permission denied".

### `GetInspectionTestRecords`

**Status:** ⛔ permission denied

**Purpose.** Inspection test records.

**Best attempt:**

```json
{"JobNumber":"EPM-001"}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: Permission denied.

**Gotchas:**

- PowerFab answered "Permission denied." for the API user (the PowerFab External User the service logs in as).

### `GetInspectionTestRecordsCondensed`

**Status:** ⛔ permission denied

**Purpose.** Inspection test records, condensed.

**Best attempt:**

```json
{"JobNumber":"EPM-001"}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: Permission denied.

**Gotchas:**

- PowerFab answered "Permission denied." for the API user (the PowerFab External User the service logs in as).

### `GetInspectionTestRecordSummary`

**Status:** ⛔ permission denied

**Purpose.** Inspection test record summary.

**Best attempt:**

```json
{"JobNumber":"EPM-001"}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: Permission denied.

**Gotchas:**

- PowerFab answered "Permission denied." for the API user (the PowerFab External User the service logs in as).

## Write commands (not run)

These change PowerFab data, so they were not called. The service refuses them while `POWERFAB_ALLOW_WRITES` is off. Purposes come from the command name and Tekla's reference, not from a call.

| Command | What it does |
|---|---|
| `SaveInspectionTestRecord` | Saves an inspection test record (from the name). |
| `DeleteInspectionTestRecord` | Deletes an inspection test record (from the name). |
| `InspectionDocumentAdd` | Attaches a document to an inspection (from the name). |
| `MakeReport` | Generates a report on the server (from the name). |
| `PrepareReportData` | Prepares data for a report (from the name). |
| `ExportJob` | Starts a job export on the server (from the name). |
| `ExportJobStatus` | Status of a job export (from the name). Classed as a write because its effect is unclear; it may be a harmless read. |
| `ExtensionCommand` | Runs a PowerFab extension command. Effect unknown. |
