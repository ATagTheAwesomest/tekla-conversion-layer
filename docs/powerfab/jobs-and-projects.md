# Jobs, projects and sequences

Start here. Most commands take `JobNumber`, but the newer `*_Get` commands want PowerFab's internal IDs
instead. A job has two: **ProductionControlID** (production side; 13 for EPM-001) and **ProjectID** (project
side; 4 for EPM-001). `GetProjectStatus` returns both in one call, so call it first and keep them.

[← Back to the index](README.md)

## Read commands

| Command | Status | Answers |
|---|---|---|
| [`GetProjectStatus`](#getprojectstatus) | ✅ data | What are a job's ProductionControlID and ProjectID, and how big is it? |
| [`ValJob`](#valjob) | ✅ data | Does this job number exist? |
| [`GetProductionControlJobs`](#getproductioncontroljobs) | ⚪ empty | Which open jobs are there? |
| [`ProductionControlJob_Get`](#productioncontroljob_get) | ✅ data |  |
| [`Project_Get`](#project_get) | ✅ data | Who is the client and detailer on a job, and is it open or closed? |
| [`GetProductionControlJobInformation`](#getproductioncontroljobinformation) | ✅ data |  |
| [`GetProductionControlJobInformationTransactions`](#getproductioncontroljobinformationtransactions) | ✅ data |  |
| [`GetSequences`](#getsequences) | ✅ data | What sequences does a job have and how much does each weigh? |
| [`GetLots`](#getlots) | ✅ data |  |
| [`GetFilterSelections`](#getfilterselections) | ⚪ empty |  |
| [`GetFilterSetDetails`](#getfiltersetdetails) | ⚪ empty |  |
| [`FilterSelections_PDC_Get`](#filterselections_pdc_get) | ✅ data |  |
| [`FilterSelections_PRJ_Get`](#filterselections_prj_get) | ✅ data |  |
| [`FilterSetDetails_Get`](#filtersetdetails_get) | ✅ data |  |
| [`GetProjectSchedule`](#getprojectschedule) | ⚠️ refused |  |
| [`GetProjectScheduleBaselinePlans`](#getprojectschedulebaselineplans) | ⛔ permission denied |  |
| [`GetProjectScheduleSnapshots`](#getprojectschedulesnapshots) | ⚠️ refused |  |

### `GetProjectStatus`

**Status:** ✅ data

**Purpose.** One-call job summary: both internal IDs, description, assembly/drawing/sequence/lot counts, whether a schedule exists, and the linked Trimble Connect project.

**Answers:** What are a job's ProductionControlID and ProjectID, and how big is it?

**Request that worked:**

```json
{"JobNumber":"EPM-001"}
```

**Result:** HTTP 200, 1,060 bytes, 150 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `ProductionControlID` | number (as text) | 1 | `13` |
| `JobNumber` | text | 1 | `EPM-001` |
| `JobDescription` | text | 1 | `Tekla EPM Demo` |
| `JobLocation` | text | 1 |  |
| `GroupName` | text | 1 |  |
| `GroupName2` | text | 1 |  |
| `ProjectID` | number (as text) | 1 | `4` |
| `HasProjectSchedule` | number (as text) | 1 | `1` |
| `InputDisplayUnits` | object | 1 | common block, see README |
| `Assemblies` | object | 1 |  |
| `Assemblies.Quantity` | number (as text) | 1 | `1230` |
| `Drawings` | object | 1 |  |
| `Drawings.Total` | number (as text) | 1 | `1131` |
| `Drawings.TotalApproved` | number (as text) | 1 | `386` |
| `Sequences` | object | 1 |  |
| `Sequences.Total` | number (as text) | 1 | `5` |
| `Lots` | object | 1 |  |
| `Lots.Total` | number (as text) | 1 | `1` |
| `TrimbleConnect` | object | 1 |  |
| `TrimbleConnect.ProjectID` | text | 1 | `Qqs7brRWc_g` |
| `TrimbleConnect.Region` | text | 1 | `northAmerica` |
| `FilterSet` | object | 1 | common block, see README |
| `PRJFilterSet` | object | 1 | common block, see README |
| `HoldSettings` | object | 1 | common block, see README |

**Sample** (trimmed; full trimmed sample in [samples/GetProjectStatus.json](samples/GetProjectStatus.json)):

```json
{
  "JobDescription": "Tekla EPM Demo",
  "JobLocation": "",
  "GroupName": "",
  "GroupName2": "",
  "ProjectID": "4",
  "HasProjectSchedule": "1",
  "Assemblies": {
    "Quantity": "1230"
  },
  "Drawings": {
    "Total": "1131",
    "TotalApproved": "386"
  },
  "Sequences": {
    "Total": "5"
  },
  "Lots": {
    "Total": "1"
  },
  "TrimbleConnect": {
    "ProjectID": "Qqs7brRWc_g",
    "Region": "northAmerica"
  }
}
```

**Gotchas:**

- Call this first: most `*_Get` commands need `ProductionControlID` or `ProjectID`, not `JobNumber`.

### `ValJob`

**Status:** ✅ data

**Purpose.** Checks that a job number exists. Reply is just `Successful`.

**Answers:** Does this job number exist?

**Request that worked:**

```json
{"JobNumber":"EPM-001"}
```

**Result:** HTTP 200, 71 bytes, 77 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|


**Sample** (trimmed; full trimmed sample in [samples/ValJob.json](samples/ValJob.json)):

```json
{}
```

**Gotchas:**

- Unknown jobs come back as HTTP 422 "The job 'X' does not exist." (seen for EMP-001 and 26123).

### `GetProductionControlJobs`

**Status:** ⚪ empty

**Purpose.** Lists production-control jobs.

**Answers:** Which open jobs are there?

**Request that worked:**

```json
{"JobStatus":"Closed"}
```

**Result:** HTTP 200, 116 bytes, 129 ms. **Came back empty**: no data beyond the reply envelope.

**Gotchas:**

- Lists **open jobs only**. EPM-001 is Closed and never appears, even with `JobStatus: "Closed"` (that field was ignored). Sending `JobNumber: "EPM-001"` returned no job at all.
- With one job the `ProductionControlJob` is an object, not a list.

### `ProductionControlJob_Get`

**Status:** ✅ data

**Purpose.** Newer-style job read. Returned no job for any input tried.

**Request that worked:**

```json
{"JobNumber":"EPM-001"}
```

**Result:** HTTP 200, 499 bytes, 346 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `ResultData` | object | 1 |  |
| `ResultData.LastLogID` | number (as text) | 1 | `270` |
| `ResultData.GetOptions` | object | 1 |  |
| `ResultData.GetOptions.FilterSet` | text | 1 | common block, see README |
| `ResultData.ProductionControlJob` | object | 1 |  |
| `ResultData.ProductionControlJob.ProductionControlID` | number (as text) | 1 | `13` |
| `ResultData.ProductionControlJob.JobNumber` | text | 1 | `EPM-001` |
| `ResultData.ProductionControlJob.JobDescription` | text | 1 | `Tekla EPM Demo` |
| `ResultData.ProductionControlJob.JobStatus` | object | 1 |  |
| `ResultData.ProductionControlJob.JobStatus.JobStatusID` | number (as text) | 1 | `2` |
| `ResultData.ProductionControlJob.JobStatus.Description` | text | 1 | `Closed` |
| `ResultData.ProductionControlJob.JobStatus.Purpose` | number (as text) | 1 | `10` |
| `ResultData.ProductionControlJob.JobStatus.IsDefault` | number (as text) | 1 | `0` |
| `ResultData.ProductionControlJob.JobStatus.Active` | number (as text) | 1 | `1` |
| `ResultData.ProductionControlJob.JobDate` | text | 1 | `2020-08-31` |
| `ResultData.ProductionControlJob.TFSDropOption` | number (as text) | 1 | `1000` |
| `ResultData.ProductionControlJob.InputDisplayUnits` | object | 1 | common block, see README |

**Sample** (trimmed; full trimmed sample in [samples/ProductionControlJob_Get.json](samples/ProductionControlJob_Get.json)):

```json
{
  "ProductionControlJob": {
    "ProductionControlID": "13",
    "JobNumber": "EPM-001",
    "JobDescription": "Tekla EPM Demo",
    "JobStatus": {
      "JobStatusID": "2",
      "Description": "Closed",
      "Purpose": "10",
      "IsDefault": "0",
      "Active": "1"
    },
    "JobDate": "2020-08-31",
    "TFSDropOption": "1000",
    "InputDisplayUnits": {
      "SizeUOM": "Imperial",
      "LengthUOM": "Imperial",
      "LengthTypeIDMetric": "101",
      "LengthTypeIDImperial": "1",
      "WeightUOM": "Imperial",
      "PriceUOM": "Imperial"
    }
  }
}
```

**Gotchas:**

- Came back with only `LastLogID` and an empty `FilterSet` for `{}`, `JobNumber` and `ProductionControlID`. Probably needs a filled `GetOptions.FilterSet`; not worked out.

### `Project_Get`

**Status:** ✅ data

**Purpose.** Project records: job number, description, location, date, status, drawing logs and, with `IncludeFirms`, the firms on the project (client, detailer, billing).

**Answers:** Who is the client and detailer on a job, and is it open or closed?

**Request that worked:**

```json
{"JobNumber":"EPM-001","GetOptions":{"IncludeDrawingLogs":1,"IncludeFirms":1}}
```

**Result:** HTTP 200, 3,805 bytes, 118 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `ResultData` | object | 1 |  |
| `ResultData.LastLogID` | text | 1 | `70,0` |
| `ResultData.GetOptions` | object | 1 |  |
| `ResultData.GetOptions.IncludeDrawingLogs` | number (as text) | 1 | `1` |
| `ResultData.GetOptions.IncludeFirms` | number (as text) | 1 | `1` |
| `ResultData.Project` | object | 1 |  |
| `ResultData.Project.ProjectID` | number (as text) | 1 | `4` |
| `ResultData.Project.JobNumber` | text | 1 | `EPM-001` |
| `ResultData.Project.JobDescription` | text | 1 | `Tekla EPM Demo` |
| `ResultData.Project.JobLocation` | text | 1 | `Trimble Solutions USA` |
| `ResultData.Project.JobDate` | text | 1 | `2020-08-31` |
| `ResultData.Project.JobStatus` | object | 1 |  |
| `ResultData.Project.JobStatus.JobStatusID` | number (as text) | 1 | `2` |
| `ResultData.Project.JobStatus.Description` | text | 1 | `Closed` |
| `ResultData.Project.JobStatus.Purpose` | number (as text) | 1 | `10` |
| `ResultData.Project.JobStatus.IsDefault` | number (as text) | 1 | `0` |
| `ResultData.Project.JobStatus.Active` | number (as text) | 1 | `1` |
| `ResultData.Project.DrawingLog` | list (5–5) | 1 |  |
| `ResultData.Project.DrawingLog[].DrawingLogID` | number (as text) | 5 | `21`, `22` |
| `ResultData.Project.DrawingLog[].ProjectID` | number (as text) | 5 | `4` |
| `ResultData.Project.DrawingLog[].DrawingType` | text | 5 | `Design`, `Detail` |
| `ResultData.Project.DrawingLog[].DrawingLogName` | text | 5 | `Design`, `Assembly` |
| `ResultData.Project.DrawingLog[].PDCLink` | number (as text) | 5 | `0`, `20` |
| `ResultData.Project.DrawingLog[].SubdirectoryPath` | text | 5 | `Design`, `Detail\Assembly drawings` |
| `ResultData.Project.DrawingLog[].DrawingLogMapping` | text | 5 | `Details`, `General Arrangement⏎Erection sheets⏎GA` |
| `ResultData.Project.ProjectFirm` | list (5–5) | 1 |  |
| `ResultData.Project.ProjectFirm[].FirmType` | text | 5 | `Client`, `Detailer` |
| `ResultData.Project.ProjectFirm[].FirmID` | number (as text) | 5 | `1`, `7` |
| `ResultData.Project.ProjectFirm[].ShipToFirmAddressID` | number (as text) | 5 | `11`, `12` |
| `ResultData.Project.ProjectFirm[].BillToFirmAddressID` | number (as text) | 5 | `6`, `12` |
| `ResultData.Project.ProjectFirm[].FirmContactID` | number (as text) | 5 | `8`, `11` |
| `ResultData.Project.ProjectFirm[].Description` | text | 5 | `Project Manager`, `Detailer` |
| `ResultData.Project.InputDisplayUnits` | object | 1 | common block, see README |
| `ResultData.Firm` | list (2–2) | 1 |  |
| `ResultData.Firm[].FirmID` | number (as text) | 2 | `1`, `7` |
| `ResultData.Firm[].FirmType` | text | 2 | `Client`, `Detailer` |
| `ResultData.Firm[].Name` | text | 2 | `Tekla EPM - Client`, `Detailer` |
| `ResultData.Firm[].Code` | text | 2 | `EPM - Client`, `Detailer` |
| `ResultData.Firm[].PrimaryCurrency` | object | 2 |  |
| `ResultData.Firm[].PrimaryCurrency.@ID` | number (as text) | 2 | `1` |
| `ResultData.Firm[].PrimaryCurrency.#text` | text | 2 | `USD` |
| `ResultData.Firm[].InfoSharing` | number (as text) | 1 | `0` |
| `ResultData.FirmAddress` | list (4–4) | 1 |  |
| `ResultData.FirmAddress[].FirmAddressID` | number (as text) | 4 | `1`, `6` |
| `ResultData.FirmAddress[].FirmID` | number (as text) | 4 | `1`, `7` |
| `ResultData.FirmAddress[].Description` | text | 4 | `Default - Shipping`, `Default - Mailing` |
| `ResultData.FirmAddress[].Attn` | text | 3 | `<redacted>`, `<redacted>` |
| `ResultData.FirmAddress[].Address1` | text | 4 | `<redacted>`, `<redacted>` |
| `ResultData.FirmAddress[].Address2` | text | 2 | `<redacted>` |
| `ResultData.FirmAddress[].City` | text | 4 | `Kennesaw` |
| `ResultData.FirmAddress[].State` | text | 4 | `GA` |
| `ResultData.FirmAddress[].Zip` | number (as text) | 3 | `30144` |
| `ResultData.FirmAddress[].Phone` | text | 3 | `<redacted>` |
| `ResultData.FirmAddress[].IsShipTo` | number (as text) | 3 | `1` |
| `ResultData.FirmAddress[].Active` | number (as text) | 4 | `1` |
| `ResultData.FirmAddress[].IsBillTo` | number (as text) | 2 | `1` |
| `ResultData.FirmContact` | list (5–5) | 1 |  |
| `ResultData.FirmContact[].FirmContactID` | number (as text) | 5 | `2`, `8` |
| `ResultData.FirmContact[].FirmID` | number (as text) | 5 | `1`, `7` |
| `ResultData.FirmContact[].Name` | text | 5 | `<redacted>`, `<redacted>` |
| … | | | 3 more fields in the sample file |

**Sample** (trimmed; full trimmed sample in [samples/Project_Get.json](samples/Project_Get.json)):

```json
{
  "Project": {
    "ProjectID": "4",
    "JobNumber": "EPM-001",
    "JobDescription": "Tekla EPM Demo",
    "JobLocation": "Trimble Solutions USA",
    "JobDate": "2020-08-31",
    "JobStatus": {
      "JobStatusID": "2",
      "Description": "Closed",
      "Purpose": "10",
      "IsDefault": "0",
      "Active": "1"
    },
    "DrawingLog": [
      {
        "DrawingLogID": "21",
        "ProjectID": "4",
        "DrawingType": "Design",
        "DrawingLogName": "Design",
        "PDCLink": "0",
        "SubdirectoryPath": "Design",
        "DrawingLogMapping": ""
      },
      "… 4 more"
    ],
    "ProjectFirm": [
      {
        "FirmType": "Client",
        "FirmID": "1",
  …
```

**Gotchas:**

- `JobNumber` does **not** filter: the reply held both EPM-001 and 25-351. Filter the `Project` list yourself.
- `JobStatus` is an object (`Description`: "Open"/"Closed").

### `GetProductionControlJobInformation`

**Status:** ✅ data

**Purpose.** Job information block: ProductionControlID, job number, description, date, notes.

**Request that worked:**

```json
{"JobNumber":"EPM-001"}
```

**Result:** HTTP 200, 231 bytes, 99 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `LastLogID` | number (as text) | 1 | `270` |
| `ProductionControlJobInformation` | object | 1 |  |
| `ProductionControlJobInformation.ProductionControlID` | number (as text) | 1 | `13` |
| `ProductionControlJobInformation.JobNumber` | text | 1 | `EPM-001` |
| `ProductionControlJobInformation.JobDescription` | text | 1 | `Tekla EPM Demo` |
| `ProductionControlJobInformation.JobDate` | text | 1 | `2020-08-31` |

**Sample** (trimmed; full trimmed sample in [samples/GetProductionControlJobInformation.json](samples/GetProductionControlJobInformation.json)):

```json
{
  "ProductionControlJobInformation": {
    "ProductionControlID": "13",
    "JobNumber": "EPM-001",
    "JobDescription": "Tekla EPM Demo",
    "JobDate": "2020-08-31"
  }
}
```

### `GetProductionControlJobInformationTransactions`

**Status:** ✅ data

**Purpose.** Change history of the job information (old and new values per edit).

**Request that worked:**

```json
{"JobNumber":"EPM-001"}
```

**Result:** HTTP 200, 451 bytes, 91 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `LastLogID` | number (as text) | 1 | `270` |
| `ProductionControlJobInformationTransaction` | object | 1 |  |
| `ProductionControlJobInformationTransaction.TransactionType` | text | 1 | `edit` |
| `ProductionControlJobInformationTransaction.OldProductionControlJobInformation` | object | 1 |  |
| `ProductionControlJobInformationTransaction.OldProductionControlJobInformation.ProductionControlID` | number (as text) | 1 | `13` |
| `ProductionControlJobInformationTransaction.OldProductionControlJobInformation.JobNumber` | text | 1 | `EPM-001` |
| `ProductionControlJobInformationTransaction.OldProductionControlJobInformation.JobDescription` | text | 1 | `Tekla EPM Demo` |
| `ProductionControlJobInformationTransaction.OldProductionControlJobInformation.JobDate` | text | 1 | `2020-08-31` |
| `ProductionControlJobInformationTransaction.NewProductionControlJobInformation` | object | 1 |  |
| `ProductionControlJobInformationTransaction.NewProductionControlJobInformation.ProductionControlID` | number (as text) | 1 | `13` |
| `ProductionControlJobInformationTransaction.NewProductionControlJobInformation.JobNumber` | text | 1 | `EPM-001` |
| `ProductionControlJobInformationTransaction.NewProductionControlJobInformation.JobDescription` | text | 1 | `Tekla EPM Demo` |
| `ProductionControlJobInformationTransaction.NewProductionControlJobInformation.JobDate` | text | 1 | `2020-08-31` |

**Sample** (trimmed; full trimmed sample in [samples/GetProductionControlJobInformationTransactions.json](samples/GetProductionControlJobInformationTransactions.json)):

```json
{
  "ProductionControlJobInformationTransaction": {
    "TransactionType": "edit",
    "OldProductionControlJobInformation": {
      "ProductionControlID": "13",
      "JobNumber": "EPM-001",
      "JobDescription": "Tekla EPM Demo",
      "JobDate": "2020-08-31"
    },
    "NewProductionControlJobInformation": {
      "ProductionControlID": "13",
      "JobNumber": "EPM-001",
      "JobDescription": "Tekla EPM Demo",
      "JobDate": "2020-08-31"
    }
  }
}
```

### `GetSequences`

**Status:** ✅ data

**Purpose.** Every sequence on the job with assembly count, piece count and total weight.

**Answers:** What sequences does a job have and how much does each weigh?

**Request that worked:**

```json
{"JobNumber":"EPM-001"}
```

**Result:** HTTP 200, 1,215 bytes, 115 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `ProductionControlID` | number (as text) | 1 | `13` |
| `JobNumber` | text | 1 | `EPM-001` |
| `InputDisplayUnits` | object | 1 | common block, see README |
| `Sequence` | list (5–5) | 1 |  |
| `Sequence[].Sequence` | number (as text) | 5 | `1`, `2` |
| `Sequence[].AssemblyQuantity` | number (as text) | 5 | `259`, `282` |
| `Sequence[].TotalQuantity` | number (as text) | 5 | `4407`, `4674` |
| `Sequence[].Weight` | object | 5 |  |
| `Sequence[].Weight.@UOM` | text | 5 | `kg` |
| `Sequence[].Weight.#text` | number (as text) | 5 | `77814.4595928264141752436`, `117638.5964952696400156678` |
| `FilterSet` | object | 1 | common block, see README |
| `HoldSettings` | object | 1 | common block, see README |

**Sample** (trimmed; full trimmed sample in [samples/GetSequences.json](samples/GetSequences.json)):

```json
{
  "Sequence": [
    {
      "Sequence": "1",
      "AssemblyQuantity": "259",
      "TotalQuantity": "4407",
      "Weight": {
        "@UOM": "kg",
        "#text": "77814.4595928264141752436"
      }
    },
    "… 4 more"
  ]
}
```

**Gotchas:**

- Weight is `{"@UOM":"kg","#text":"77814.45…"}`: kilograms with long decimals, even though `InputDisplayUnits` says Imperial. Multiply by 2.20462 for lb.
- EPM-001 sequences are `1`–`5`; 25-351 sequences are 4 digits (`5231`). Do not assume the sequence is the first 4 characters of a mark: EPM-001 marks look like `1B1`.

### `GetLots`

**Status:** ✅ data

**Purpose.** Lots on the job with assembly count, piece count and weight. EPM-001 has one unnamed lot.

**Request that worked:**

```json
{"JobNumber":"EPM-001"}
```

**Result:** HTTP 200, 723 bytes, 169 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `ProductionControlID` | number (as text) | 1 | `13` |
| `JobNumber` | text | 1 | `EPM-001` |
| `InputDisplayUnits` | object | 1 | common block, see README |
| `Lot` | object | 1 |  |
| `Lot.LotNumber` | text | 1 |  |
| `Lot.AssemblyQuantity` | number (as text) | 1 | `1230` |
| `Lot.TotalQuantity` | number (as text) | 1 | `16858` |
| `Lot.Weight` | object | 1 |  |
| `Lot.Weight.@UOM` | text | 1 | `kg` |
| `Lot.Weight.#text` | number (as text) | 1 | `418813.2676983926818430002` |
| `FilterSet` | object | 1 | common block, see README |
| `HoldSettings` | object | 1 | common block, see README |

**Sample** (trimmed; full trimmed sample in [samples/GetLots.json](samples/GetLots.json)):

```json
{
  "Lot": {
    "LotNumber": "",
    "AssemblyQuantity": "1230",
    "TotalQuantity": "16858",
    "Weight": {
      "@UOM": "kg",
      "#text": "418813.2676983926818430002"
    }
  }
}
```

### `GetFilterSelections`

**Status:** ⚪ empty · purpose not confirmed by Tekla, inferred from the name and reply

**Purpose.** Saved filter selections.

**Request that worked:**

```json
{"JobNumber":"EPM-001"}
```

**Result:** HTTP 200, 112 bytes, 78 ms. **Came back empty**: no data beyond the reply envelope.

### `GetFilterSetDetails`

**Status:** ⚪ empty · purpose not confirmed by Tekla, inferred from the name and reply

**Purpose.** Details of a filter set.

**Request that worked:**

```json
{"JobNumber":"EPM-001"}
```

**Result:** HTTP 200, 125 bytes, 102 ms. **Came back empty**: no data beyond the reply envelope.

**Gotchas:**

- Empty without a `FilterSetType`; the right values were not worked out.

### `FilterSelections_PDC_Get`

**Status:** ✅ data

**Purpose.** Values available for one production-control filter. With `FilterName: "Job #"` it lists the jobs (ProductionControlID + job number) the filter can pick.

**Request that worked:**

```json
{"FilterName":"Job #"}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: FilterName - Value is required
- `{"FilterName":"Job #"}` → 200, 214 bytes

**Result:** HTTP 200, 214 bytes, 95 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `ResultData` | object | 1 |  |
| `ResultData.Filter` | object | 1 |  |
| `ResultData.Filter.Name` | text | 1 | `Job #` |
| `ResultData.Filter.DisplayName` | text | 1 | `Job #` |
| `ResultData.Filter.FilterItems` | object | 1 |  |
| `ResultData.Filter.FilterItems.TotalCount` | number (as text) | 1 | `1` |
| `ResultData.Filter.FilterItems.FilterItem` | object | 1 |  |
| `ResultData.Filter.FilterItems.FilterItem.@Field1` | number (as text) | 1 | `13` |
| `ResultData.Filter.FilterItems.FilterItem.@Field2` | text | 1 | `EPM-001` |
| `ResultData.Filter.FilterItems.FilterItem.@Included` | number (as text) | 1 | `1` |
| `ResultData.Filter.FilterItems.FilterItem.#text` | text | 1 | `EPM-001` |
| `ResultData.GetOptions` | text | 1 |  |

**Sample** (trimmed; full trimmed sample in [samples/FilterSelections_PDC_Get.json](samples/FilterSelections_PDC_Get.json)):

```json
{
  "Filter": {
    "Name": "Job #",
    "DisplayName": "Job #",
    "FilterItems": {
      "TotalCount": "1",
      "FilterItem": {
        "@Field1": "13",
        "@Field2": "EPM-001",
        "@Included": "1",
        "#text": "EPM-001"
      }
    }
  }
}
```

**Gotchas:**

- Listed only the open jobs (25-351), like `GetProductionControlJobs`.

### `FilterSelections_PRJ_Get`

**Status:** ✅ data

**Purpose.** Values available for one project filter.

**Request that worked:**

```json
{"ProjectID":4,"FilterName":"Job #"}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: ProjectID - Value is required
- `{"ProjectID":4,"FilterName":"Job #"}` → 200, 97 bytes
- `{"ProjectID":4}` → 422: FilterName - Value is required

**Result:** HTTP 200, 97 bytes, 96 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `ResultData` | object | 1 |  |
| `ResultData.Filter` | object | 1 |  |
| `ResultData.Filter.Name` | text | 1 | `Job #` |
| `ResultData.Filter.DisplayName` | text | 1 | `Job #` |
| `ResultData.GetOptions` | text | 1 |  |

**Sample** (trimmed; full trimmed sample in [samples/FilterSelections_PRJ_Get.json](samples/FilterSelections_PRJ_Get.json)):

```json
{
  "Filter": {
    "Name": "Job #",
    "DisplayName": "Job #"
  }
}
```

**Gotchas:**

- With `ProjectID: 4, FilterName: "Job #"` it returned the filter name but no items.

### `FilterSetDetails_Get`

**Status:** ✅ data · purpose not confirmed by Tekla, inferred from the name and reply

**Purpose.** Definitions of the filters PowerFab offers for a filter type (names and how they are selected).

**Request that worked:**

```json
{"Type":"PDC"}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: Type - Value is required
- `{"Type":"PDC"}` → 200, 8686 bytes

**Result:** HTTP 200, 8,686 bytes, 121 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `ResultData` | object | 1 |  |
| `ResultData.FilterSetDetails` | object | 1 |  |
| `ResultData.FilterSetDetails.Type` | text | 1 | `PDC` |
| `ResultData.FilterSetDetails.Filter` | list (92–92) | 1 |  |
| `ResultData.FilterSetDetails.Filter[].Name` | text | 92 | `Approval Status`, `Main/Accessory Pieces` |
| `ResultData.FilterSetDetails.Filter[].DisplayName` | text | 92 | `Approval Status`, `Main/Accessory Pieces` |
| `ResultData.FilterSetDetails.Filter[].FilterType` | text | 92 | `Selection`, `Range_Length` |
| `ResultData.FilterSetDetails.Filter[].HasTextSearch` | number (as text) | 26 | `1` |

**Sample** (trimmed; full trimmed sample in [samples/FilterSetDetails_Get.json](samples/FilterSetDetails_Get.json)):

```json
{
  "FilterSetDetails": {
    "Type": "PDC",
    "Filter": [
      {
        "Name": "Approval Status",
        "DisplayName": "Approval Status",
        "FilterType": "Selection"
      },
      "… 91 more"
    ]
  }
}
```

**Gotchas:**

- `Type: "PDC"` worked; other types were not tried.

### `GetProjectSchedule`

**Status:** ⚠️ refused

**Purpose.** The project schedule for a baseline plan.

**Best attempt:**

```json
{"JobNumber":"EPM-001","ScheduleBaselineID":0}
```

**Attempts:**

- `{"JobNumber":"EPM-001","ScheduleBaselineID":0}` → 422: Baseline plan not found.
- `{"JobNumber":"EPM-001","ScheduleBaselineID":1}` → 422: Baseline plan not found.
- `{"JobNumber":"EPM-001"}` → 422: ScheduleBaselineID is required.

**Gotchas:**

- Needs `ScheduleBaselineID`. 0 and 1 gave "Baseline plan not found", and the command that lists baselines (`GetProjectScheduleBaselinePlans`) is refused, so the real ID is unknown. EPM-001 does have a schedule (`HasProjectSchedule` = 1).

### `GetProjectScheduleBaselinePlans`

**Status:** ⛔ permission denied

**Purpose.** Lists schedule baseline plans.

**Best attempt:**

```json
{"JobNumber":"EPM-001"}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: Permission denied.

**Gotchas:**

- PowerFab answered "Permission denied." for the API user (the PowerFab External User the service logs in as).

### `GetProjectScheduleSnapshots`

**Status:** ⚠️ refused

**Purpose.** Schedule snapshots for a baseline plan.

**Best attempt:**

```json
{"JobNumber":"EPM-001","ScheduleBaselineID":1}
```

**Attempts:**

- `{"JobNumber":"EPM-001","ScheduleBaselineID":1}` → 422: Baseline plan not found.
- `{"JobNumber":"EPM-001"}` → 422: ScheduleBaselineID is required.

**Gotchas:**

- Needs a `ScheduleBaselineID`; see `GetProjectSchedule`.

## Write commands (not run)

These change PowerFab data, so they were not called. The service refuses them while `POWERFAB_ALLOW_WRITES` is off. Purposes come from the command name and Tekla's reference, not from a call.

| Command | What it does |
|---|---|
| `ExportProjectSchedule` | Exports the project schedule (from the name). |
