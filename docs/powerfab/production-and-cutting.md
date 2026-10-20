# Production, cutting and planning

Shop-floor data. EPM-001 has four stations, routes, and one cut list ("Seq 1 WF", ID 1) with 125 cutting
details. Nests, machines and CNC data are empty, and the planning side (work packages, departments, schedules) is
refused for this API user.

[← Back to the index](README.md)

## Read commands

| Command | Status | Answers |
|---|---|---|
| [`GetStations`](#getstations) | ✅ data | Which production stations does a job go through? |
| [`ValStation`](#valstation) | ✅ data |  |
| [`GetRouteDetails`](#getroutedetails) | ✅ data |  |
| [`GetTFSDetails`](#gettfsdetails) | ⚪ empty |  |
| [`ProductionControlCutList_Get`](#productioncontrolcutlist_get) | ✅ data | What cut lists exist for a job? |
| [`GetCutList`](#getcutlist) | ✅ data |  |
| [`PickList_Get`](#picklist_get) | ✅ data |  |
| [`ValCutListItem`](#valcutlistitem) | ⚠️ refused |  |
| [`ProductionControlCutListItem_Swap_GetAvailable`](#productioncontrolcutlistitem_swap_getavailable) | ⛔ permission denied |  |
| [`GetNestData`](#getnestdata) | ⚠️ refused |  |
| [`GetNestImage`](#getnestimage) | ⚪ empty |  |
| [`GetNestStatus`](#getneststatus) | ⚠️ refused |  |
| [`NestSolution_Get`](#nestsolution_get) | ⚪ empty |  |
| [`CNCData`](#cncdata) | ⚪ empty |  |
| [`Machine_Get`](#machine_get) | ⚪ empty |  |
| [`MachineGroup_Get`](#machinegroup_get) | ⚪ empty |  |
| [`Workshop_Get`](#workshop_get) | ✅ data |  |
| [`WorkArea_Get`](#workarea_get) | ✅ data |  |
| [`WorkAreaDepartment_Get`](#workareadepartment_get) | ⛔ permission denied |  |
| [`WorkAreaDepartmentSchedule_Get`](#workareadepartmentschedule_get) | ⛔ permission denied |  |
| [`WorkAreaDepartmentScheduleShift_Get`](#workareadepartmentscheduleshift_get) | ⛔ permission denied |  |
| [`WorkAreaDepartmentFutureTask_Get`](#workareadepartmentfuturetask_get) | ⛔ permission denied |  |
| [`Department_Get`](#department_get) | ⛔ permission denied |  |
| [`DepartmentShift_Get`](#departmentshift_get) | ⛔ permission denied |  |
| [`WorkPackage_Get`](#workpackage_get) | ⛔ permission denied |  |
| [`WorkPackageDepartment_Get`](#workpackagedepartment_get) | ⛔ permission denied |  |
| [`WorkPackageDepartmentTask_Get`](#workpackagedepartmenttask_get) | ⛔ permission denied |  |
| [`WorkPackageDepartmentTaskCompletion_Get`](#workpackagedepartmenttaskcompletion_get) | ⛔ permission denied |  |
| [`WorkPackageGroup1List_Get`](#workpackagegroup1list_get) | ⛔ permission denied |  |
| [`WorkPackageGroup2List_Get`](#workpackagegroup2list_get) | ⛔ permission denied |  |
| [`ProductionPlanningSettings_Get`](#productionplanningsettings_get) | ✅ data |  |
| [`PlanningRuleWarning_Get`](#planningrulewarning_get) | ⛔ permission denied |  |
| [`GetTimeTrackingSubjects`](#gettimetrackingsubjects) | ⛔ permission denied |  |

### `GetStations`

**Status:** ✅ data

**Purpose.** Production stations used on the job and their type.

**Answers:** Which production stations does a job go through?

**Request that worked:**

```json
{"JobNumber":"EPM-001"}
```

**Result:** HTTP 200, 828 bytes, 105 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `ProductionControlID` | number (as text) | 1 | `13` |
| `JobNumber` | text | 1 | `EPM-001` |
| `InputDisplayUnits` | object | 1 | common block, see README |
| `Station` | list (4–4) | 1 |  |
| `Station[].StationName` | text | 4 | `Cut/Saw/Beamline/BurnTable`, `Layout/Weld` |
| `Station[].Type` | text | 4 | `Production` |
| `FilterSet` | object | 1 | common block, see README |
| `HoldSettings` | object | 1 | common block, see README |

**Sample** (trimmed; full trimmed sample in [samples/GetStations.json](samples/GetStations.json)):

```json
{
  "Station": [
    {
      "StationName": "Cut/Saw/Beamline/BurnTable",
      "Type": "Production"
    },
    "… 3 more"
  ]
}
```

**Gotchas:**

- Empty for 25-351 but four stations on EPM-001.

**Feature ideas:**

- Station picker for a future "mark complete at station" feature.

### `ValStation`

**Status:** ✅ data

**Purpose.** Checks a station name and returns its `StationID`.

**Request that worked:**

```json
{"JobNumber":"EPM-001","Station":"Quality Control"}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: Station is required
- `{"JobNumber":"EPM-001","Station":"Quality Control"}` → 200, 87 bytes

**Result:** HTTP 200, 87 bytes, 123 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `StationID` | number (as text) | 1 | `4` |

**Sample** (trimmed; full trimmed sample in [samples/ValStation.json](samples/ValStation.json)):

```json
{
  "StationID": "4"
}
```

**Gotchas:**

- Station names include slashes, e.g. "Cut/Saw/Beamline/BurnTable".

### `GetRouteDetails`

**Status:** ✅ data

**Purpose.** A route (e.g. SP "Sample - Painted") and its stations in order.

**Request that worked:**

```json
{"RouteID":1}
```

**Attempts:**

- `{"RouteID":1}` → 200, 514 bytes
- `{"JobNumber":"EPM-001"}` → 422: Route or RouteID are required

**Result:** HTTP 200, 514 bytes, 115 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `RouteID` | number (as text) | 1 | `1` |
| `Route` | text | 1 | `SP` |
| `Description` | text | 1 | `Sample - Painted` |
| `RouteStation` | list (4–4) | 1 |  |
| `RouteStation[].StationID` | number (as text) | 4 | `1`, `2` |
| `RouteStation[].Description` | text | 4 | `Cut/Saw/Beamline/BurnTable`, `Layout/Weld` |
| `RouteStation[].Type` | text | 4 | `Production` |
| `RouteStation[].IsTFSStation` | number (as text) | 4 | `1`, `0` |

**Sample** (trimmed; full trimmed sample in [samples/GetRouteDetails.json](samples/GetRouteDetails.json)):

```json
{
  "RouteID": "1",
  "Route": "SP",
  "Description": "Sample - Painted",
  "RouteStation": [
    {
      "StationID": "1",
      "Description": "Cut/Saw/Beamline/BurnTable",
      "Type": "Production",
      "IsTFSStation": "1"
    },
    "… 3 more"
  ]
}
```

**Gotchas:**

- Needs `RouteID` or `Route`. Pieces carry their route in `ProductionControlLoadRemaining_Get`.

### `GetTFSDetails`

**Status:** ⚪ empty

**Purpose.** Production tracking (TFS) details for a job.

**Request that worked:**

```json
{"JobNumber":"EPM-001"}
```

**Result:** HTTP 200, 590 bytes, 181 ms. **Came back empty**: no data beyond the reply envelope.

**Gotchas:**

- Returned only the envelope for EPM-001, with and without `Station`. Nothing has been tracked through stations on this job (see `GetProductionShippingStatus`: 0 completed).

### `ProductionControlCutList_Get`

**Status:** ✅ data

**Purpose.** Cut lists on a job with totals (cutting details, cut, remaining, in stock, invalidated).

**Answers:** What cut lists exist for a job?

**Request that worked:**

```json
{"JobNumber":"EPM-001"}
```

**Result:** HTTP 200, 787 bytes, 202 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `ResultData` | object | 1 |  |
| `ResultData.LastLogID` | number (as text) | 1 | `0` |
| `ResultData.GetOptions` | object | 1 |  |
| `ResultData.GetOptions.FilterSet` | object | 1 | common block, see README |
| `ResultData.ProductionControlCutList` | object | 1 |  |
| `ResultData.ProductionControlCutList.ProductionControlCutListID` | number (as text) | 1 | `1` |
| `ResultData.ProductionControlCutList.Description` | text | 1 | `Seq 1 WF` |
| `ResultData.ProductionControlCutList.ProductionControlID` | number (as text) | 1 | `13` |
| `ResultData.ProductionControlCutList.JobNumber` | text | 1 | `EPM-001` |
| `ResultData.ProductionControlCutList.DateCreated` | text | 1 | `2020-09-01` |
| `ResultData.ProductionControlCutList.DateRequired` | text | 1 | `2020-09-25` |
| `ResultData.ProductionControlCutList.TotalCuttingDetails` | number (as text) | 1 | `125` |
| `ResultData.ProductionControlCutList.TotalCut` | number (as text) | 1 | `0` |
| `ResultData.ProductionControlCutList.TotalRemaining` | number (as text) | 1 | `109` |
| `ResultData.ProductionControlCutList.TotalInStock` | number (as text) | 1 | `0` |
| `ResultData.ProductionControlCutList.TotalInvalidated` | number (as text) | 1 | `16` |
| `ResultData.ProductionControlCutList.TotalValidationRequired` | number (as text) | 1 | `0` |
| `ResultData.ProductionControlCutList.WarningCount` | number (as text) | 1 | `0` |
| `ResultData.ProductionControlCutList.WarningChangeCount` | number (as text) | 1 | `0` |

**Sample** (trimmed; full trimmed sample in [samples/ProductionControlCutList_Get.json](samples/ProductionControlCutList_Get.json)):

```json
{
  "ProductionControlCutList": {
    "ProductionControlCutListID": "1",
    "Description": "Seq 1 WF",
    "ProductionControlID": "13",
    "JobNumber": "EPM-001",
    "DateCreated": "2020-09-01",
    "DateRequired": "2020-09-25",
    "TotalCuttingDetails": "125",
    "TotalCut": "0",
    "TotalRemaining": "109",
    "TotalInStock": "0",
    "TotalInvalidated": "16",
    "TotalValidationRequired": "0",
    "WarningCount": "0",
    "WarningChangeCount": "0"
  }
}
```

### `GetCutList`

**Status:** ✅ data

**Purpose.** One cut list with every cutting detail: stock size, length, weight, expected drop, status, PO, and the parts cut from it.

**Request that worked:**

```json
{"CutListID":1}
```

**Attempts:**

- `{"CutListID":1}` → 200, 157802 bytes
- `{"JobNumber":"EPM-001"}` → 422: CutListID is required

**Result:** HTTP 200, 157,802 bytes, 853 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `ProductionControlID` | number (as text) | 1 | `13` |
| `JobNumber` | text | 1 | `EPM-001` |
| `CutListID` | number (as text) | 1 | `1` |
| `CutListName` | text | 1 | `Seq 1 WF` |
| `DateCreated` | text | 1 | `2020-09-01` |
| `DateRequired` | text | 1 | `2020-09-25` |
| `CuttingDetails` | number (as text) | 1 | `125` |
| `TotalCut` | number (as text) | 1 | `0` |
| `TotalInvalidated` | number (as text) | 1 | `16` |
| `TotalValidationRequired` | number (as text) | 1 | `0` |
| `InputDisplayUnits` | object | 1 | common block, see README |
| `CutListItem` | list (125–125) | 1 |  |
| `CutListItem[].CutListItemID` | number (as text) | 125 | `37`, `89` |
| `CutListItem[].CutListSerialNumber` | number (as text) | 125 | `441`, `483` |
| `CutListItem[].PlannedInventoryItemID` | number (as text) | 109 | `784`, `830` |
| `CutListItem[].OnOrder` | number (as text) | 125 | `1`, `0` |
| `CutListItem[].Status` | text | 125 | `On Order`, `Invalidated` |
| `CutListItem[].Shape` | text | 125 | `W` |
| `CutListItem[].Grade` | text | 125 | `A992` |
| `CutListItem[].Dimensions` | object | 125 |  |
| `CutListItem[].Dimensions.@Metric` | number (as text) | 125 | `0` |
| `CutListItem[].Dimensions.#text` | text | 125 | `18 x 40`, `18 x 35` |
| `CutListItem[].Length` | object | 125 |  |
| `CutListItem[].Length.@UOM` | text | 125 | `in` |
| `CutListItem[].Length.#text` | number (as text) | 125 | `720`, `480` |
| `CutListItem[].Weight` | object | 125 |  |
| `CutListItem[].Weight.@UOM` | text | 125 | `kg` |
| `CutListItem[].Weight.#text` | number (as text) | 125 | `1088.621688000001742524015527860962`, `725.747792000001161682677018573974` |
| `CutListItem[].ExpectedDrop` | object | 125 |  |
| `CutListItem[].ExpectedDrop.@UOM` | text | 125 | `in`, `mm` |
| `CutListItem[].ExpectedDrop.#text` | number (as text) | 125 | `75.9375`, `132.4375` |
| `CutListItem[].ExpectedPercentDrop` | number (as text) | 125 | `10.5469`, `27.5911` |
| `CutListItem[].HasTFSStation` | number (as text) | 123 | `1` |
| `CutListItem[].HasCNCData` | number (as text) | 125 | `1` |
| `CutListItem[].NestID` | text | 125 |  |
| `CutListItem[].NestExtra1` | text | 125 |  |
| `CutListItem[].NestExtra2` | text | 125 |  |
| `CutListItem[].DateTimeUpdated` | text | 125 | `2020-09-01T08:37:59`, `2026-08-06T09:50:32` |
| `CutListItem[].PlannedInventoryItem` | object | 109 |  |
| `CutListItem[].PlannedInventoryItem.PONumber` | text | 109 | `EPM-0001` |
| `CutListItem[].CutListItemPart` | object or list | 125 |  |
| `CutListItem[].CutListItemPart[].ProductionControlID` | number (as text) | 141 | `13` |
| `CutListItem[].CutListItemPart[].JobNumber` | text | 141 | `EPM-001` |
| `CutListItem[].CutListItemPart[].DrawingNumber` | text | 141 | `B130`, `B116` |
| `CutListItem[].CutListItemPart[].MainMark` | text | 141 | `B130`, `B116` |
| `CutListItem[].CutListItemPart[].MainPiece` | number (as text) | 140 | `1` |
| `CutListItem[].CutListItemPart[].PieceMark` | text | 141 | `B130`, `B116` |
| `CutListItem[].CutListItemPart[].Sequence` | number (as text) | 141 | `2`, `1` |
| `CutListItem[].CutListItemPart[].LotNumber` | text | 141 |  |
| `CutListItem[].CutListItemPart[].Quantity` | number (as text) | 141 | `1`, `2` |
| `CutListItem[].CutListItemPart[].Length` | object | 141 |  |
| `CutListItem[].CutListItemPart[].Length.@UOM` | text | 141 | `in`, `mm` |
| `CutListItem[].CutListItemPart[].Length.#text` | number (as text) | 141 | `425.625`, `5548.323597` |
| `CutListItem[].CutListItemPart[].ApprovalStatusCode` | text | 141 | `P`, `IFF` |
| `CutListItem[].CutListItemPart[].Category` | text | 140 | `BEAM`, `BRACE` |
| `CutListItem[].CutListItemPart[].SubCategory` | text | 141 | `Phase 2`, `Phase 1` |
| `CutListItem[].CutListItemPart[].Route` | text | 141 | `SP`, `SU` |
| `CutListItem[].CutListItemPart[].TFSStation` | text | 136 | `Cut/Saw/Beamline/BurnTable` |
| `CutListItem[].CutListItemPart[].NextStation` | text | 141 | `Layout/Weld`, `Cut/Saw/Beamline/BurnTable` |
| `CutListItem[].CutListItemPart[].CNCFileID` | number (as text) | 141 | `1030`, `1014` |
| … | | | 28 more fields in the sample file |

**Sample** (trimmed; full trimmed sample in [samples/GetCutList.json](samples/GetCutList.json)):

```json
{
  "CutListID": "1",
  "CutListName": "Seq 1 WF",
  "DateCreated": "2020-09-01",
  "DateRequired": "2020-09-25",
  "CuttingDetails": "125",
  "TotalCut": "0",
  "TotalInvalidated": "16",
  "TotalValidationRequired": "0",
  "CutListItem": [
    {
      "CutListItemID": "37",
      "CutListSerialNumber": "441",
      "PlannedInventoryItemID": "784",
      "OnOrder": "1",
      "Status": "On Order",
      "Shape": "W",
      "Grade": "A992",
      "Dimensions": {
        "@Metric": "0",
        "#text": "18 x 40"
      },
      "Length": {
        "@UOM": "in",
        "#text": "720"
      },
      "Weight": {
        "@UOM": "kg",
        "#text": "1088.621688000001742524015527860962"
      },
  …
```

**Gotchas:**

- Needs `CutListID` (from `ProductionControlCutList_Get`).
- One or many: `CutListItem.CutListItemPart` came back as an object in one place and a list in another. Always normalise to a list.

**Feature ideas:**

- Show which stock bar a piece is cut from.

### `PickList_Get`

**Status:** ✅ data

**Purpose.** The pick list for a cut list: stock to pull, quantity, size, length, weight, PO and supplier.

**Request that worked:**

```json
{"CutListID":1}
```

**Attempts:**

- `{"ProductionControlCutListID":1}` → 422: The cut list does not exist.
- `{"CutListID":1}` → 200, 30855 bytes
- `{"JobNumber":"EPM-001"}` → 422: The cut list does not exist.

**Result:** HTTP 200, 30,855 bytes, 180 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `ResultData` | object | 1 |  |
| `ResultData.GetOptions` | object | 1 |  |
| `ResultData.GetOptions.InputDisplayUnits` | object | 1 | common block, see README |
| `ResultData.PickList` | object | 1 |  |
| `ResultData.PickList.ProductionControlID` | number (as text) | 1 | `13` |
| `ResultData.PickList.JobNumber` | text | 1 | `EPM-001` |
| `ResultData.PickList.CutListID` | number (as text) | 1 | `1` |
| `ResultData.PickList.CutListName` | text | 1 | `Seq 1 WF` |
| `ResultData.PickList.DateCreated` | text | 1 | `2020-09-01` |
| `ResultData.PickList.DateRequired` | text | 1 | `2020-09-25` |
| `ResultData.PickList.PickListItem` | list (109–109) | 1 |  |
| `ResultData.PickList.PickListItem[].CutListItemID` | number (as text) | 109 | `37`, `89` |
| `ResultData.PickList.PickListItem[].Quantity` | number (as text) | 109 | `1` |
| `ResultData.PickList.PickListItem[].Shape` | text | 109 | `W` |
| `ResultData.PickList.PickListItem[].Grade` | text | 109 | `A992` |
| `ResultData.PickList.PickListItem[].Dimensions` | object | 109 |  |
| `ResultData.PickList.PickListItem[].Dimensions.@AlternateDisplay` | text | 109 | `460 x 60`, `460 x 52` |
| `ResultData.PickList.PickListItem[].Dimensions.@Metric` | number (as text) | 109 | `0` |
| `ResultData.PickList.PickListItem[].Dimensions.@SizeID` | number (as text) | 109 | `148`, `149` |
| `ResultData.PickList.PickListItem[].Dimensions.#text` | text | 109 | `18 x 40`, `18 x 35` |
| `ResultData.PickList.PickListItem[].Length` | number (as text) | 109 | `18288.03658`, `12192.02438` |
| `ResultData.PickList.PickListItem[].WeightEach` | number (as text) | 109 | `1088.621688`, `725.747792` |
| `ResultData.PickList.PickListItem[].PONumber` | text | 109 | `EPM-0001` |
| `ResultData.PickList.PickListItem[].Supplier` | text | 109 | `Tekla EPM - Supplier` |
| `ResultData.PickList.PickListItem[].OnOrder` | number (as text) | 109 | `1` |
| `ResultData.PickList.PickListItem[].Location` | number (as text) | 1 | `0` |

**Sample** (trimmed; full trimmed sample in [samples/PickList_Get.json](samples/PickList_Get.json)):

```json
{
  "PickList": {
    "ProductionControlID": "13",
    "JobNumber": "EPM-001",
    "CutListID": "1",
    "CutListName": "Seq 1 WF",
    "DateCreated": "2020-09-01",
    "DateRequired": "2020-09-25",
    "PickListItem": [
      {
        "CutListItemID": "37",
        "Quantity": "1",
        "Shape": "W",
        "Grade": "A992",
        "Dimensions": {
          "@AlternateDisplay": "460 x 60",
          "@Metric": "0",
          "@SizeID": "148",
          "#text": "18 x 40"
        },
        "Length": "18288.03658",
        "WeightEach": "1088.621688",
        "PONumber": "EPM-0001",
        "Supplier": "Tekla EPM - Supplier",
        "OnOrder": "1"
      },
      "… 108 more"
    ]
  }
}
```

**Gotchas:**

- Takes `CutListID`. `ProductionControlCutListID` gave "The cut list does not exist".

### `ValCutListItem`

**Status:** ⚠️ refused

**Purpose.** Validates a cut list item for cutting.

**Best attempt:**

```json
{"JobNumber":"EPM-001"}
```

**Attempts:**

- `{"CutListItemID":37}` → 422: Cut list item material is not in stock.
- `{"JobNumber":"EPM-001"}` → 422: CutListItemID/CutListSerialNumber/ExternalNestID/NestID is required

**Gotchas:**

- Item 37 is valid, but PowerFab answered "Cut list item material is not in stock."

### `ProductionControlCutListItem_Swap_GetAvailable`

**Status:** ⛔ permission denied

**Purpose.** Stock available to swap in for a cut list item.

**Best attempt:**

```json
{"ProductionControlCutListItemID":37}
```

**Attempts:**

- `{"ProductionControlCutListItemID":37}` → 422: Permission denied.
- `{"JobNumber":"EPM-001"}` → 422: ProductionControlCutListItemID - Value is required

**Gotchas:**

- Refused with "Permission denied" for the API user. Grant the matching permission to the PowerFab External User and rerun.

### `GetNestData`

**Status:** ⚠️ refused

**Purpose.** Nest data for a cut list item.

**Best attempt:**

```json
{"JobNumber":"EPM-001"}
```

**Attempts:**

- `{"CutListItemID":37}` → 422: No nest results available.
- `{"JobNumber":"EPM-001"}` → 422: CutListItemID is required

**Gotchas:**

- "No nest results available." for item 37: nothing is nested on EPM-001.

### `GetNestImage`

**Status:** ⚪ empty

**Purpose.** Nest image for a cut list item.

**Request that worked:**

```json
{"ProductionControlCutListItemID":37}
```

**Attempts:**

- `{"ProductionControlCutListItemID":37}` → 200, empty
- `{"JobNumber":"EPM-001"}` → 422: ProductionControlCutListItemID or ProductionControlCutListBarcodeID is required

**Result:** HTTP 200, 71 bytes, 152 ms. **Came back empty**: no data beyond the reply envelope.

**Gotchas:**

- Successful but empty: no nests.

### `GetNestStatus`

**Status:** ⚠️ refused

**Purpose.** Status of a nest.

**Best attempt:**

```json
{"JobNumber":"EPM-001"}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: NestID is required.

**Gotchas:**

- Needs `NestID`; no item on EPM-001 has one.

### `NestSolution_Get`

**Status:** ⚪ empty

**Purpose.** Nest solutions.

**Request that worked:**

```json
{"JobNumber":"EPM-001"}
```

**Result:** HTTP 200, 331 bytes, 117 ms. **Came back empty**: no data beyond the reply envelope.

**Gotchas:**

- Empty even with every Include option on.

### `CNCData`

**Status:** ⚪ empty

**Purpose.** CNC data. Tekla describes it as "Retrieves the CNC data".

**Request that worked:**

```json
{"JobNumber":"EPM-001"}
```

**Result:** HTTP 200, 71 bytes, 639 ms. **Came back empty**: no data beyond the reply envelope.

**Gotchas:**

- Only the envelope came back for `JobNumber`.

### `Machine_Get`

**Status:** ⚪ empty

**Purpose.** Machines.

**Request that worked:**

```json
{"JobNumber":"EPM-001"}
```

**Result:** HTTP 200, 49 bytes, 121 ms. **Came back empty**: no data beyond the reply envelope.

**Gotchas:**

- None set up.

### `MachineGroup_Get`

**Status:** ⚪ empty

**Purpose.** Machine groups.

**Request that worked:**

```json
{"JobNumber":"EPM-001"}
```

**Result:** HTTP 200, 49 bytes, 218 ms. **Came back empty**: no data beyond the reply envelope.

**Gotchas:**

- None set up.

### `Workshop_Get`

**Status:** ✅ data

**Purpose.** Workshops (one: "Main Workshop").

**Request that worked:**

```json
{"JobNumber":"EPM-001"}
```

**Result:** HTTP 200, 132 bytes, 110 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `ResultData` | object | 1 |  |
| `ResultData.LastLogID` | number (as text) | 1 | `0` |
| `ResultData.Workshop` | object | 1 |  |
| `ResultData.Workshop.WorkshopID` | number (as text) | 1 | `1` |
| `ResultData.Workshop.Name` | text | 1 | `Main Workshop` |
| `ResultData.Workshop.Description` | text | 1 | `Main Workshop` |

**Sample** (trimmed; full trimmed sample in [samples/Workshop_Get.json](samples/Workshop_Get.json)):

```json
{
  "Workshop": {
    "WorkshopID": "1",
    "Name": "Main Workshop",
    "Description": "Main Workshop"
  }
}
```

### `WorkArea_Get`

**Status:** ✅ data

**Purpose.** Work areas (one: "Main").

**Request that worked:**

```json
{"JobNumber":"EPM-001"}
```

**Result:** HTTP 200, 131 bytes, 117 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `ResultData` | object | 1 |  |
| `ResultData.LastLogID` | number (as text) | 1 | `0` |
| `ResultData.WorkArea` | object | 1 |  |
| `ResultData.WorkArea.WorkAreaID` | number (as text) | 1 | `1` |
| `ResultData.WorkArea.Name` | text | 1 | `Main` |
| `ResultData.WorkArea.Description` | text | 1 | `Main` |
| `ResultData.WorkArea.WorkshopID` | number (as text) | 1 | `1` |

**Sample** (trimmed; full trimmed sample in [samples/WorkArea_Get.json](samples/WorkArea_Get.json)):

```json
{
  "WorkArea": {
    "WorkAreaID": "1",
    "Name": "Main",
    "Description": "Main",
    "WorkshopID": "1"
  }
}
```

### `WorkAreaDepartment_Get`

**Status:** ⛔ permission denied

**Purpose.** Departments in a work area.

**Best attempt:**

```json
{"JobNumber":"EPM-001"}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: Permission denied.

**Gotchas:**

- Refused with "Permission denied" for the API user. Grant the matching permission to the PowerFab External User and rerun.

### `WorkAreaDepartmentSchedule_Get`

**Status:** ⛔ permission denied

**Purpose.** Department schedules.

**Best attempt:**

```json
{"JobNumber":"EPM-001"}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: Permission denied.

**Gotchas:**

- Refused with "Permission denied" for the API user. Grant the matching permission to the PowerFab External User and rerun.

### `WorkAreaDepartmentScheduleShift_Get`

**Status:** ⛔ permission denied

**Purpose.** Department schedule shifts.

**Best attempt:**

```json
{"JobNumber":"EPM-001"}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: Permission denied.

**Gotchas:**

- Refused with "Permission denied" for the API user. Grant the matching permission to the PowerFab External User and rerun.

### `WorkAreaDepartmentFutureTask_Get`

**Status:** ⛔ permission denied

**Purpose.** Future department tasks.

**Best attempt:**

```json
{"JobNumber":"EPM-001"}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: Permission denied.

**Gotchas:**

- Refused with "Permission denied" for the API user. Grant the matching permission to the PowerFab External User and rerun.

### `Department_Get`

**Status:** ⛔ permission denied

**Purpose.** Departments.

**Best attempt:**

```json
{"JobNumber":"EPM-001"}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: Permission denied.

**Gotchas:**

- Refused with "Permission denied" for the API user. Grant the matching permission to the PowerFab External User and rerun.

### `DepartmentShift_Get`

**Status:** ⛔ permission denied

**Purpose.** Department shifts.

**Best attempt:**

```json
{"JobNumber":"EPM-001"}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: Permission denied.

**Gotchas:**

- Refused with "Permission denied" for the API user. Grant the matching permission to the PowerFab External User and rerun.

### `WorkPackage_Get`

**Status:** ⛔ permission denied

**Purpose.** Work packages.

**Best attempt:**

```json
{"JobNumber":"EPM-001"}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: Permission denied.

**Gotchas:**

- Refused with "Permission denied" for the API user. Grant the matching permission to the PowerFab External User and rerun.

### `WorkPackageDepartment_Get`

**Status:** ⛔ permission denied

**Purpose.** Work package departments.

**Best attempt:**

```json
{"JobNumber":"EPM-001"}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: Permission denied.

**Gotchas:**

- Refused with "Permission denied" for the API user. Grant the matching permission to the PowerFab External User and rerun.

### `WorkPackageDepartmentTask_Get`

**Status:** ⛔ permission denied

**Purpose.** Work package department tasks.

**Best attempt:**

```json
{"JobNumber":"EPM-001"}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: Permission denied.

**Gotchas:**

- Refused with "Permission denied" for the API user. Grant the matching permission to the PowerFab External User and rerun.

### `WorkPackageDepartmentTaskCompletion_Get`

**Status:** ⛔ permission denied

**Purpose.** Work package task completions.

**Best attempt:**

```json
{"JobNumber":"EPM-001"}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: Permission denied.

**Gotchas:**

- Refused with "Permission denied" for the API user. Grant the matching permission to the PowerFab External User and rerun.

### `WorkPackageGroup1List_Get`

**Status:** ⛔ permission denied

**Purpose.** Work package group 1 list.

**Best attempt:**

```json
{"JobNumber":"EPM-001"}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: Permission denied.

**Gotchas:**

- Refused with "Permission denied" for the API user. Grant the matching permission to the PowerFab External User and rerun.

### `WorkPackageGroup2List_Get`

**Status:** ⛔ permission denied

**Purpose.** Work package group 2 list.

**Best attempt:**

```json
{"JobNumber":"EPM-001"}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: Permission denied.

**Gotchas:**

- Refused with "Permission denied" for the API user. Grant the matching permission to the PowerFab External User and rerun.

### `ProductionPlanningSettings_Get`

**Status:** ✅ data

**Purpose.** Production planning settings (week start day, default view).

**Request that worked:**

```json
{"JobNumber":"EPM-001"}
```

**Result:** HTTP 200, 280 bytes, 219 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `ResultData` | object | 1 |  |
| `ResultData.ProductionPlanningSettings` | object | 1 |  |
| `ResultData.ProductionPlanningSettings.ProductionWeekStartDay` | number (as text) | 1 | `0` |
| `ResultData.ProductionPlanningSettings.DefaultView` | text | 1 | `hours` |
| `ResultData.ProductionPlanningSettings.InputDisplayUnits` | object | 1 | common block, see README |

**Sample** (trimmed; full trimmed sample in [samples/ProductionPlanningSettings_Get.json](samples/ProductionPlanningSettings_Get.json)):

```json
{
  "ProductionPlanningSettings": {
    "ProductionWeekStartDay": "0",
    "DefaultView": "hours",
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

### `PlanningRuleWarning_Get`

**Status:** ⛔ permission denied

**Purpose.** Planning rule warnings for an item.

**Best attempt:**

```json
{"Type":"WorkPackage","ID":1}
```

**Attempts:**

- `{"Type":"WorkPackage","ID":1}` → 422: Permission denied.
- `{"JobNumber":"EPM-001"}` → 422: Type - Value is required
- `{"Type":"WorkPackage"}` → 422: ID - Value is required

**Gotchas:**

- Needs `Type` and `ID`, then refused: "Permission denied".

### `GetTimeTrackingSubjects`

**Status:** ⛔ permission denied

**Purpose.** Time tracking subjects.

**Best attempt:**

```json
{"JobNumber":"EPM-001"}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: Permission denied.

**Gotchas:**

- Refused with "Permission denied" for the API user. Grant the matching permission to the PowerFab External User and rerun.

## Write commands (not run)

These change PowerFab data, so they were not called. The service refuses them while `POWERFAB_ALLOW_WRITES` is off. Purposes come from the command name and Tekla's reference, not from a call.

| Command | What it does |
|---|---|
| `TFSCut` | Records a cut in production tracking (from the name). |
| `TFSManual` | Records production tracking manually (from the name). |
| `ShopFloorSave` | Saves shop floor progress (from the name). |
| `SaveTimeTrackingRecord` | Changes data (from the name). |
| `SetAssemblyAssociation` | Changes data (from the name). |
| `SetInstanceLocation` | Sets where a piece instance is (from the name). |
| `SplicePackage_TFS` | Changes data (from the name). |
| `SplitPackage_TFS` | Changes data (from the name). |
| `SaveCNCFile` | Changes data (from the name). |
| `SaveNest` | Changes data (from the name). |
| `SetCutListItemNestID` | Changes data (from the name). |
| `ProductionControlCutListItem_Swap` | Changes data (from the name). |
| `ProductionControlCutList_ExportDSTVPlus` | Changes data (from the name). |
| `Department_Upsert` | Creates or edits a Department record (from the name). |
| `Department_Delete` | Deletes a Department record (from the name). |
| `DepartmentShift_Upsert` | Creates or edits a DepartmentShift record (from the name). |
| `DepartmentShift_Delete` | Deletes a DepartmentShift record (from the name). |
| `WorkAreaDepartmentSchedule_Upsert` | Creates or edits a WorkAreaDepartmentSchedule record (from the name). |
| `WorkAreaDepartmentSchedule_Delete` | Deletes a WorkAreaDepartmentSchedule record (from the name). |
| `WorkAreaDepartmentSchedule_Move_Start_And_End_Dates` | Changes data (from the name). |
| `WorkAreaDepartmentScheduleShift_Upsert` | Creates or edits a WorkAreaDepartmentScheduleShift record (from the name). |
| `WorkAreaDepartmentScheduleShift_Delete` | Deletes a WorkAreaDepartmentScheduleShift record (from the name). |
| `WorkAreaDepartmentFutureTask_Upsert` | Creates or edits a WorkAreaDepartmentFutureTask record (from the name). |
| `WorkAreaDepartmentFutureTask_Delete` | Deletes a WorkAreaDepartmentFutureTask record (from the name). |
| `WorkPackage_Insert` | Creates a WorkPackage record (from the name). |
| `WorkPackage_Update` | Edits a WorkPackage record (from the name). |
| `WorkPackage_Delete` | Deletes a WorkPackage record (from the name). |
| `WorkPackage_ScheduleToWorkshop` | Changes data (from the name). |
| `WorkPackage_Unschedule` | Changes data (from the name). |
| `WorkPackage_OffsetFutureWorkPackage` | Changes data (from the name). |
| `WorkPackageDepartment_Insert` | Creates a WorkPackageDepartment record (from the name). |
| `WorkPackageDepartment_Update` | Edits a WorkPackageDepartment record (from the name). |
| `WorkPackageDepartment_Delete` | Deletes a WorkPackageDepartment record (from the name). |
| `WorkPackageDepartmentTask_Insert` | Creates a WorkPackageDepartmentTask record (from the name). |
| `WorkPackageDepartmentTask_Update` | Edits a WorkPackageDepartmentTask record (from the name). |
| `WorkPackageDepartmentTask_Delete` | Deletes a WorkPackageDepartmentTask record (from the name). |
| `WorkPackageDepartmentTask_Schedule` | Changes data (from the name). |
| `WorkPackageDepartmentTask_Unschedule` | Changes data (from the name). |
| `WorkPackageDepartmentTask_Split` | Changes data (from the name). |
| `WorkPackageDepartmentTask_OffsetFutureWorkPackage` | Changes data (from the name). |
| `WorkPackageDepartmentTaskCompletion_Insert` | Creates a WorkPackageDepartmentTaskCompletion record (from the name). |
| `WorkPackageDepartmentTaskCompletion_Update` | Edits a WorkPackageDepartmentTaskCompletion record (from the name). |
| `WorkPackageDepartmentTaskCompletion_Delete` | Deletes a WorkPackageDepartmentTaskCompletion record (from the name). |
