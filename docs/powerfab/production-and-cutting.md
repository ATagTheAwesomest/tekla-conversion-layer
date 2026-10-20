# Production, cutting and planning

Shop-floor data. EPM-001 has four stations, routes, and one cut list ("Seq 1 WF", ID 1) with 125 cutting
details. Nests, machines and CNC data are empty. Planning (departments, shifts, work-area schedules, work package
departments and tasks) has been readable since the 2026-10-20 permission change, but `WorkPackage_Get` lists nothing.

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
| [`WorkAreaDepartment_Get`](#workareadepartment_get) | ✅ data |  |
| [`WorkAreaDepartmentSchedule_Get`](#workareadepartmentschedule_get) | ✅ data | How much capacity does the shop have each week? |
| [`WorkAreaDepartmentScheduleShift_Get`](#workareadepartmentscheduleshift_get) | ✅ data |  |
| [`WorkAreaDepartmentFutureTask_Get`](#workareadepartmentfuturetask_get) | ⚪ empty |  |
| [`Department_Get`](#department_get) | ✅ data |  |
| [`DepartmentShift_Get`](#departmentshift_get) | ✅ data |  |
| [`WorkPackage_Get`](#workpackage_get) | ⚪ empty |  |
| [`WorkPackageDepartment_Get`](#workpackagedepartment_get) | ✅ data |  |
| [`WorkPackageDepartmentTask_Get`](#workpackagedepartmenttask_get) | ✅ data |  |
| [`WorkPackageDepartmentTaskCompletion_Get`](#workpackagedepartmenttaskcompletion_get) | ⚠️ refused |  |
| [`WorkPackageGroup1List_Get`](#workpackagegroup1list_get) | ⚪ empty |  |
| [`WorkPackageGroup2List_Get`](#workpackagegroup2list_get) | ⚪ empty |  |
| [`ProductionPlanningSettings_Get`](#productionplanningsettings_get) | ✅ data |  |
| [`PlanningRuleWarning_Get`](#planningrulewarning_get) | ⚪ empty |  |
| [`GetTimeTrackingSubjects`](#gettimetrackingsubjects) | ⛔ permission denied |  |

### `GetStations`

**Status:** ✅ data

**Purpose.** Production stations used on the job and their type.

**Answers:** Which production stations does a job go through?

**Request that worked:**

```json
{"JobNumber":"EPM-001"}
```

**Result:** HTTP 200, 828 bytes, 84 ms.

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

- Four stations on EPM-001 and TESTTEST.

### `ValStation`

**Status:** ✅ data

**Purpose.** Checks a station name and returns its `StationID`.

**Request that worked:**

```json
{"JobNumber":"TESTTEST","Station":"Quality Control"}
```

**Attempts:**

- `{"JobNumber":"TESTTEST","Station":"Quality Control"}` → 200, 87 bytes
- `{"JobNumber":"TESTTEST"}` → 422: Station is required
- `{"JobNumber":"EPM-001"}` → 422: Station is required
- `{"JobNumber":"EPM-001","Station":"Quality Control"}` → 200, 87 bytes

**Result:** HTTP 200, 87 bytes, 45 ms.

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
- `{"RouteID":1}` → 200, 514 bytes
- `{"JobNumber":"TESTTEST"}` → 422: Route or RouteID are required

**Result:** HTTP 200, 514 bytes, 118 ms.

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

**Result:** HTTP 200, 590 bytes, 150 ms. **Came back empty**: no data beyond the reply envelope.

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

**Result:** HTTP 200, 787 bytes, 96 ms.

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
- `{"CutListID":1}` → 200, 157802 bytes
- `{"JobNumber":"TESTTEST"}` → 422: CutListID is required

**Result:** HTTP 200, 157,802 bytes, 298 ms.

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
- `{"ProductionControlCutListID":1}` → 422: The cut list does not exist.
- `{"CutListID":1}` → 200, 30855 bytes
- `{"JobNumber":"TESTTEST"}` → 422: The cut list does not exist.

**Result:** HTTP 200, 30,855 bytes, 172 ms.

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
{"JobNumber":"TESTTEST"}
```

**Attempts:**

- `{"CutListItemID":37}` → 422: Cut list item material is not in stock.
- `{"JobNumber":"TESTTEST"}` → 422: CutListItemID/CutListSerialNumber/ExternalNestID/NestID is required
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
- `{"ProductionControlCutListItemID":37}` → 422: Permission denied.
- `{"JobNumber":"TESTTEST"}` → 422: ProductionControlCutListItemID - Value is required

**Gotchas:**

- PowerFab answered "Permission denied." for the API user (the PowerFab External User the service logs in as).

### `GetNestData`

**Status:** ⚠️ refused

**Purpose.** Nest data for a cut list item.

**Best attempt:**

```json
{"JobNumber":"TESTTEST"}
```

**Attempts:**

- `{"CutListItemID":37}` → 422: No nest results available.
- `{"JobNumber":"EPM-001"}` → 422: CutListItemID is required
- `{"CutListItemID":37}` → 422: No nest results available.
- `{"JobNumber":"TESTTEST"}` → 422: CutListItemID is required

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
- `{"ProductionControlCutListItemID":37}` → 200, empty
- `{"JobNumber":"TESTTEST"}` → 422: ProductionControlCutListItemID or ProductionControlCutListBarcodeID is required

**Result:** HTTP 200, 71 bytes, 96 ms. **Came back empty**: no data beyond the reply envelope.

**Gotchas:**

- Successful but empty: no nests.

### `GetNestStatus`

**Status:** ⚠️ refused

**Purpose.** Status of a nest.

**Best attempt:**

```json
{"JobNumber":"TESTTEST"}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: NestID is required.
- `{"JobNumber":"TESTTEST"}` → 422: NestID is required.

**Gotchas:**

- Needs `NestID`; no item on EPM-001 has one.

### `NestSolution_Get`

**Status:** ⚪ empty

**Purpose.** Nest solutions.

**Request that worked:**

```json
{"JobNumber":"EPM-001"}
```

**Result:** HTTP 200, 331 bytes, 116 ms. **Came back empty**: no data beyond the reply envelope.

**Gotchas:**

- Empty even with every Include option on.

### `CNCData`

**Status:** ⚪ empty

**Purpose.** CNC data. Tekla describes it as "Retrieves the CNC data".

**Request that worked:**

```json
{"JobNumber":"EPM-001"}
```

**Result:** HTTP 200, 71 bytes, 1161 ms. **Came back empty**: no data beyond the reply envelope.

**Gotchas:**

- Only the envelope came back for `JobNumber`.

### `Machine_Get`

**Status:** ⚪ empty

**Purpose.** Machines.

**Request that worked:**

```json
{"JobNumber":"EPM-001"}
```

**Result:** HTTP 200, 49 bytes, 93 ms. **Came back empty**: no data beyond the reply envelope.

**Gotchas:**

- None set up.

### `MachineGroup_Get`

**Status:** ⚪ empty

**Purpose.** Machine groups.

**Request that worked:**

```json
{"JobNumber":"EPM-001"}
```

**Result:** HTTP 200, 49 bytes, 117 ms. **Came back empty**: no data beyond the reply envelope.

**Gotchas:**

- None set up.

### `Workshop_Get`

**Status:** ✅ data

**Purpose.** Workshops (one: "Main Workshop").

**Request that worked:**

```json
{"JobNumber":"TESTTEST"}
```

**Result:** HTTP 200, 132 bytes, 43 ms.

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
{"JobNumber":"TESTTEST"}
```

**Result:** HTTP 200, 131 bytes, 45 ms.

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

**Status:** ✅ data

**Purpose.** Links between workshop, work area and department (one: workshop 1, work area 1, department 1).

**Request that worked:**

```json
{"JobNumber":"TESTTEST"}
```

**Result:** HTTP 200, 152 bytes, 48 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `ResultData` | object | 1 |  |
| `ResultData.LastLogID` | number (as text) | 1 | `8` |
| `ResultData.WorkAreaDepartment` | object | 1 |  |
| `ResultData.WorkAreaDepartment.WorkAreaDepartmentID` | number (as text) | 1 | `1` |
| `ResultData.WorkAreaDepartment.WorkshopID` | number (as text) | 1 | `1` |
| `ResultData.WorkAreaDepartment.WorkAreaID` | number (as text) | 1 | `1` |
| `ResultData.WorkAreaDepartment.DepartmentID` | number (as text) | 1 | `1` |

**Sample** (trimmed; full trimmed sample in [samples/WorkAreaDepartment_Get.json](samples/WorkAreaDepartment_Get.json)):

```json
{
  "WorkAreaDepartment": {
    "WorkAreaDepartmentID": "1",
    "WorkshopID": "1",
    "WorkAreaID": "1",
    "DepartmentID": "1"
  }
}
```

### `WorkAreaDepartmentSchedule_Get`

**Status:** ✅ data

**Purpose.** Weekly capacity schedule per department: start and end dates, capacity weight and hours, and what is booked.

**Answers:** How much capacity does the shop have each week?

**Request that worked:**

```json
{"JobNumber":"TESTTEST"}
```

**Result:** HTTP 200, 4,054 bytes, 56 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `ResultData` | object | 1 |  |
| `ResultData.LastLogID` | number (as text) | 1 | `20` |
| `ResultData.GetOptions` | text | 1 |  |
| `ResultData.WorkAreaDepartmentSchedule` | list (7–7) | 1 |  |
| `ResultData.WorkAreaDepartmentSchedule[].WorkAreaDepartmentScheduleID` | number (as text) | 7 | `1`, `2` |
| `ResultData.WorkAreaDepartmentSchedule[].WorkAreaDepartmentID` | number (as text) | 7 | `1` |
| `ResultData.WorkAreaDepartmentSchedule[].WorkshopID` | number (as text) | 7 | `1` |
| `ResultData.WorkAreaDepartmentSchedule[].WorkAreaID` | number (as text) | 7 | `1` |
| `ResultData.WorkAreaDepartmentSchedule[].DepartmentID` | number (as text) | 7 | `1` |
| `ResultData.WorkAreaDepartmentSchedule[].StartDate` | text | 7 | `2026-10-11`, `2026-10-18` |
| `ResultData.WorkAreaDepartmentSchedule[].EndDate` | text | 7 | `2026-10-17`, `2026-10-24` |
| `ResultData.WorkAreaDepartmentSchedule[].TotalCapacityWeight` | number (as text) | 7 | `100000` |
| `ResultData.WorkAreaDepartmentSchedule[].TotalCapacityHours` | number (as text) | 7 | `1000` |
| `ResultData.WorkAreaDepartmentSchedule[].ScheduledWeight` | number (as text) | 7 | `0` |
| `ResultData.WorkAreaDepartmentSchedule[].ScheduledWeightProduction` | number (as text) | 7 | `0` |
| `ResultData.WorkAreaDepartmentSchedule[].ScheduledWeightFuture` | number (as text) | 7 | `0` |
| `ResultData.WorkAreaDepartmentSchedule[].ScheduledHours` | number (as text) | 7 | `0` |
| `ResultData.WorkAreaDepartmentSchedule[].ScheduledHoursProduction` | number (as text) | 7 | `0` |
| `ResultData.WorkAreaDepartmentSchedule[].ScheduledHoursFuture` | number (as text) | 7 | `0` |
| `ResultData.WorkAreaDepartmentSchedule[].CompletedWeight` | number (as text) | 7 | `0` |
| `ResultData.WorkAreaDepartmentSchedule[].CompletedHours` | number (as text) | 7 | `0` |
| `ResultData.WorkAreaDepartmentSchedule[].AvailableCapacityWeight` | number (as text) | 7 | `100000` |
| `ResultData.WorkAreaDepartmentSchedule[].AvailableCapacityHours` | number (as text) | 7 | `1000` |
| `ResultData.WorkAreaDepartmentSchedule[].NextWorkAreaDepartmentScheduleID` | number (as text) | 6 | `2`, `3` |
| `ResultData.WorkAreaDepartmentSchedule[].PreviousWorkAreaDepartmentScheduleID` | number (as text) | 6 | `1`, `2` |

**Sample** (trimmed; full trimmed sample in [samples/WorkAreaDepartmentSchedule_Get.json](samples/WorkAreaDepartmentSchedule_Get.json)):

```json
{
  "WorkAreaDepartmentSchedule": [
    {
      "WorkAreaDepartmentScheduleID": "1",
      "WorkAreaDepartmentID": "1",
      "WorkshopID": "1",
      "WorkAreaID": "1",
      "DepartmentID": "1",
      "StartDate": "2026-10-11",
      "EndDate": "2026-10-17",
      "TotalCapacityWeight": "100000",
      "TotalCapacityHours": "1000",
      "ScheduledWeight": "0",
      "ScheduledWeightProduction": "0",
      "ScheduledWeightFuture": "0",
      "ScheduledHours": "0",
      "ScheduledHoursProduction": "0",
      "ScheduledHoursFuture": "0",
      "CompletedWeight": "0",
      "CompletedHours": "0",
      "AvailableCapacityWeight": "100000",
      "AvailableCapacityHours": "1000",
      "NextWorkAreaDepartmentScheduleID": "2"
    },
    "… 6 more"
  ]
}
```

**Gotchas:**

- Server-wide, not per job: `JobNumber` is ignored.

### `WorkAreaDepartmentScheduleShift_Get`

**Status:** ✅ data

**Purpose.** Shifts within each weekly department schedule, with capacity weight and hours.

**Request that worked:**

```json
{"JobNumber":"TESTTEST"}
```

**Result:** HTTP 200, 1,366 bytes, 43 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `ResultData` | object | 1 |  |
| `ResultData.LastLogID` | number (as text) | 1 | `7` |
| `ResultData.WorkAreaDepartmentScheduleShift` | list (7–7) | 1 |  |
| `ResultData.WorkAreaDepartmentScheduleShift[].WorkAreaDepartmentScheduleShiftID` | number (as text) | 7 | `1`, `2` |
| `ResultData.WorkAreaDepartmentScheduleShift[].WorkAreaDepartmentScheduleID` | number (as text) | 7 | `1`, `2` |
| `ResultData.WorkAreaDepartmentScheduleShift[].DepartmentShiftID` | number (as text) | 7 | `1` |
| `ResultData.WorkAreaDepartmentScheduleShift[].Name` | text | 7 | `Standard` |
| `ResultData.WorkAreaDepartmentScheduleShift[].CapacityWeight` | number (as text) | 7 | `100000` |
| `ResultData.WorkAreaDepartmentScheduleShift[].CapacityHours` | number (as text) | 7 | `1000` |
| `ResultData.WorkAreaDepartmentScheduleShift[].IsActive` | number (as text) | 7 | `1` |

**Sample** (trimmed; full trimmed sample in [samples/WorkAreaDepartmentScheduleShift_Get.json](samples/WorkAreaDepartmentScheduleShift_Get.json)):

```json
{
  "WorkAreaDepartmentScheduleShift": [
    {
      "WorkAreaDepartmentScheduleShiftID": "1",
      "WorkAreaDepartmentScheduleID": "1",
      "DepartmentShiftID": "1",
      "Name": "Standard",
      "CapacityWeight": "100000",
      "CapacityHours": "1000",
      "IsActive": "1"
    },
    "… 6 more"
  ]
}
```

### `WorkAreaDepartmentFutureTask_Get`

**Status:** ⚪ empty

**Purpose.** Future department tasks.

**Request that worked:**

```json
{"JobNumber":"TESTTEST"}
```

**Result:** HTTP 200, 49 bytes, 44 ms. **Came back empty**: no data beyond the reply envelope.

**Gotchas:**

- Returned only `LastLogID`: none exist.

### `Department_Get`

**Status:** ✅ data

**Purpose.** Departments (one: 10 "Fabrication"). `GetOptions.IncludeDepartmentShifts` adds each department's shifts.

**Request that worked:**

```json
{"GetOptions":{"IncludeDepartmentShifts":1}}
```

**Result:** HTTP 200, 383 bytes, 45 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `ResultData` | object | 1 |  |
| `ResultData.LastLogID` | number (as text) | 1 | `0` |
| `ResultData.Department` | object | 1 |  |
| `ResultData.Department.DepartmentID` | number (as text) | 1 | `1` |
| `ResultData.Department.DepartmentNumber` | number (as text) | 1 | `10` |
| `ResultData.Department.Name` | text | 1 | `Fabrication` |
| `ResultData.Department.Shift` | object | 1 |  |
| `ResultData.Department.Shift.DepartmentShiftID` | number (as text) | 1 | `1` |
| `ResultData.Department.Shift.WorkAreaDepartmentID` | number (as text) | 1 | `1` |
| `ResultData.Department.Shift.DepartmentID` | number (as text) | 1 | `1` |
| `ResultData.Department.Shift.WorkshopID` | number (as text) | 1 | `1` |
| `ResultData.Department.Shift.WorkAreaID` | number (as text) | 1 | `1` |
| `ResultData.Department.Shift.Name` | text | 1 | `Standard` |
| `ResultData.Department.Shift.WeightPerWeek` | number (as text) | 1 | `100000` |
| `ResultData.Department.Shift.HoursPerWeek` | number (as text) | 1 | `1000` |
| `ResultData.Department.Shift.IsActive` | number (as text) | 1 | `1` |
| `ResultData.Department.Shift.IsDeleted` | number (as text) | 1 | `0` |
| `ResultData.GetOptions` | object | 1 |  |
| `ResultData.GetOptions.IncludeDepartmentShifts` | number (as text) | 1 | `1` |

**Sample** (trimmed; full trimmed sample in [samples/Department_Get.json](samples/Department_Get.json)):

```json
{
  "Department": {
    "DepartmentID": "1",
    "DepartmentNumber": "10",
    "Name": "Fabrication",
    "Shift": {
      "DepartmentShiftID": "1",
      "WorkAreaDepartmentID": "1",
      "DepartmentID": "1",
      "WorkshopID": "1",
      "WorkAreaID": "1",
      "Name": "Standard",
      "WeightPerWeek": "100000",
      "HoursPerWeek": "1000",
      "IsActive": "1",
      "IsDeleted": "0"
    }
  }
}
```

### `DepartmentShift_Get`

**Status:** ✅ data

**Purpose.** Department shifts with weekly weight and hour capacity (one: "Standard", 100000 weight, 1000 hours per week).

**Request that worked:**

```json
{"JobNumber":"EPM-001"}
```

**Result:** HTTP 200, 305 bytes, 148 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `ResultData` | object | 1 |  |
| `ResultData.LastLogID` | number (as text) | 1 | `0` |
| `ResultData.DepartmentShift` | object | 1 |  |
| `ResultData.DepartmentShift.DepartmentShiftID` | number (as text) | 1 | `1` |
| `ResultData.DepartmentShift.WorkAreaDepartmentID` | number (as text) | 1 | `1` |
| `ResultData.DepartmentShift.DepartmentID` | number (as text) | 1 | `1` |
| `ResultData.DepartmentShift.WorkshopID` | number (as text) | 1 | `1` |
| `ResultData.DepartmentShift.WorkAreaID` | number (as text) | 1 | `1` |
| `ResultData.DepartmentShift.Name` | text | 1 | `Standard` |
| `ResultData.DepartmentShift.WeightPerWeek` | number (as text) | 1 | `100000` |
| `ResultData.DepartmentShift.HoursPerWeek` | number (as text) | 1 | `1000` |
| `ResultData.DepartmentShift.IsActive` | number (as text) | 1 | `1` |
| `ResultData.DepartmentShift.IsDeleted` | number (as text) | 1 | `0` |
| `ResultData.GetOptions` | object | 1 |  |
| `ResultData.GetOptions.IncludeDeleted` | number (as text) | 1 | `0` |

**Sample** (trimmed; full trimmed sample in [samples/DepartmentShift_Get.json](samples/DepartmentShift_Get.json)):

```json
{
  "DepartmentShift": {
    "DepartmentShiftID": "1",
    "WorkAreaDepartmentID": "1",
    "DepartmentID": "1",
    "WorkshopID": "1",
    "WorkAreaID": "1",
    "Name": "Standard",
    "WeightPerWeek": "100000",
    "HoursPerWeek": "1000",
    "IsActive": "1",
    "IsDeleted": "0"
  }
}
```

### `WorkPackage_Get`

**Status:** ⚪ empty

**Purpose.** Work packages.

**Request that worked:**

```json
{"ProductionControlID":90}
```

**Result:** HTTP 200, 88 bytes, 46 ms. **Came back empty**: no data beyond the reply envelope.

**Gotchas:**

- Returned only `LastLogID` and an empty `FilterSet` for `JobNumber`, `ProductionControlID` and `WorkPackageID: 3`, even though `WorkPackageDepartment_Get` refers to work package 3. That package may belong to a job the API user cannot read; not confirmed.

### `WorkPackageDepartment_Get`

**Status:** ✅ data

**Purpose.** Departments booked on each work package, with quantity, weight, hours and completion.

**Request that worked:**

```json
{"JobNumber":"TESTTEST"}
```

**Result:** HTTP 200, 1,993 bytes, 44 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `ResultData` | object | 1 |  |
| `ResultData.LastLogID` | text | 1 | `4,4` |
| `ResultData.WorkPackageDepartment` | list (4–4) | 1 |  |
| `ResultData.WorkPackageDepartment[].WorkPackageDepartmentID` | number (as text) | 4 | `1`, `2` |
| `ResultData.WorkPackageDepartment[].WorkPackageID` | number (as text) | 4 | `3`, `6` |
| `ResultData.WorkPackageDepartment[].DepartmentID` | number (as text) | 4 | `1` |
| `ResultData.WorkPackageDepartment[].DepartmentNumber` | number (as text) | 4 | `10` |
| `ResultData.WorkPackageDepartment[].DepartmentName` | text | 4 | `Fabrication` |
| `ResultData.WorkPackageDepartment[].Quantity` | number (as text) | 4 | `103`, `93` |
| `ResultData.WorkPackageDepartment[].Weight` | number (as text) | 4 | `1075.229329`, `33420.89563` |
| `ResultData.WorkPackageDepartment[].CalculatedHours` | number (as text) | 4 | `0` |
| `ResultData.WorkPackageDepartment[].Hours` | number (as text) | 4 | `0` |
| `ResultData.WorkPackageDepartment[].IsCompleted` | number (as text) | 4 | `0` |
| `ResultData.WorkPackageDepartment[].CompletedQuantity` | number (as text) | 4 | `0` |
| `ResultData.WorkPackageDepartment[].CompletedWeight` | number (as text) | 4 | `0` |
| `ResultData.WorkPackageDepartment[].CompletedHours` | number (as text) | 4 | `0` |
| `ResultData.WorkPackageDepartment[].PercentCompleted` | number (as text) | 4 | `0` |
| `ResultData.WorkPackageDepartment[].RemainingQuantity` | number (as text) | 4 | `103`, `93` |
| `ResultData.WorkPackageDepartment[].RemainingWeight` | number (as text) | 4 | `1075.229329`, `33420.89563` |
| `ResultData.WorkPackageDepartment[].RemainingHours` | number (as text) | 4 | `0` |
| `ResultData.WorkPackageDepartment[].OffsetFutureWorkPackageWeight` | number (as text) | 4 | `0` |
| `ResultData.WorkPackageDepartment[].OffsetFutureWorkPackageHours` | number (as text) | 4 | `0` |
| `ResultData.GetOptions` | object | 1 |  |
| `ResultData.GetOptions.IncludeDepartmentTasks` | number (as text) | 1 | `0` |
| `ResultData.GetOptions.IncludeDepartmentTaskCompletions` | number (as text) | 1 | `0` |

**Sample** (trimmed; full trimmed sample in [samples/WorkPackageDepartment_Get.json](samples/WorkPackageDepartment_Get.json)):

```json
{
  "WorkPackageDepartment": [
    {
      "WorkPackageDepartmentID": "1",
      "WorkPackageID": "3",
      "DepartmentID": "1",
      "DepartmentNumber": "10",
      "DepartmentName": "Fabrication",
      "Quantity": "103",
      "Weight": "1075.229329",
      "CalculatedHours": "0",
      "Hours": "0",
      "IsCompleted": "0",
      "CompletedQuantity": "0",
      "CompletedWeight": "0",
      "CompletedHours": "0",
      "PercentCompleted": "0",
      "RemainingQuantity": "103",
      "RemainingWeight": "1075.229329",
      "RemainingHours": "0",
      "OffsetFutureWorkPackageWeight": "0",
      "OffsetFutureWorkPackageHours": "0"
    },
    "… 3 more"
  ]
}
```

### `WorkPackageDepartmentTask_Get`

**Status:** ✅ data

**Purpose.** Department tasks on work packages with weight, hours, completed and remaining amounts. `GetOptions.IncludeDepartmentTaskCompletions` is echoed but added nothing here.

**Request that worked:**

```json
{"GetOptions":{"IncludeDepartmentTaskCompletions":1}}
```

**Result:** HTTP 200, 1,279 bytes, 47 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `ResultData` | object | 1 |  |
| `ResultData.LastLogID` | text | 1 | `4,0` |
| `ResultData.GetOptions` | object | 1 |  |
| `ResultData.GetOptions.IncludeDepartmentTaskCompletions` | number (as text) | 1 | `1` |
| `ResultData.WorkPackageDepartmentTask` | list (4–4) | 1 |  |
| `ResultData.WorkPackageDepartmentTask[].WorkPackageDepartmentTaskID` | number (as text) | 4 | `1`, `2` |
| `ResultData.WorkPackageDepartmentTask[].WorkPackageDepartmentID` | number (as text) | 4 | `1`, `2` |
| `ResultData.WorkPackageDepartmentTask[].Weight` | number (as text) | 4 | `1075.229329`, `33420.89563` |
| `ResultData.WorkPackageDepartmentTask[].Hours` | number (as text) | 4 | `0` |
| `ResultData.WorkPackageDepartmentTask[].IsCompleted` | number (as text) | 4 | `0` |
| `ResultData.WorkPackageDepartmentTask[].CompletedWeight` | number (as text) | 4 | `0` |
| `ResultData.WorkPackageDepartmentTask[].CompletedHours` | number (as text) | 4 | `0` |
| `ResultData.WorkPackageDepartmentTask[].RemainingWeight` | number (as text) | 4 | `1075.229329`, `33420.89563` |
| `ResultData.WorkPackageDepartmentTask[].RemainingHours` | number (as text) | 4 | `0` |
| `ResultData.WorkPackageDepartmentTask[].OffsetFutureWorkPackageWeight` | number (as text) | 4 | `0` |
| `ResultData.WorkPackageDepartmentTask[].OffsetFutureWorkPackageHours` | number (as text) | 4 | `0` |

**Sample** (trimmed; full trimmed sample in [samples/WorkPackageDepartmentTask_Get.json](samples/WorkPackageDepartmentTask_Get.json)):

```json
{
  "WorkPackageDepartmentTask": [
    {
      "WorkPackageDepartmentTaskID": "1",
      "WorkPackageDepartmentID": "1",
      "Weight": "1075.229329",
      "Hours": "0",
      "IsCompleted": "0",
      "CompletedWeight": "0",
      "CompletedHours": "0",
      "RemainingWeight": "1075.229329",
      "RemainingHours": "0",
      "OffsetFutureWorkPackageWeight": "0",
      "OffsetFutureWorkPackageHours": "0"
    },
    "… 3 more"
  ]
}
```

### `WorkPackageDepartmentTaskCompletion_Get`

**Status:** ⚠️ refused

**Purpose.** Completions recorded against work package department tasks.

**Best attempt:**

```json
{"WorkPackageDepartmentTaskCompletion":{"WorkPackageDepartmentTaskID":1}}
```

**Attempts:**

- `{"WorkPackageDepartmentTaskCompletion":{"WorkPackageDepartmentTaskID":1}}` → 422: WorkPackageDepartmentTaskCompletion - Element is required
- `{"JobNumber":"TESTTEST"}` → 422: WorkPackageDepartmentTaskCompletion - Element is required
- `{"JobNumber":"EPM-001"}` → 422: WorkPackageDepartmentTaskCompletion - Element is required
- `{"WorkPackageDepartmentTaskCompletion":{"WorkPackageDepartmentTaskID":1}}` → 422: WorkPackageDepartmentTaskCompletion - Element is required

**Gotchas:**

- Answers "WorkPackageDepartmentTaskCompletion - Element is required" for `JobNumber` and for a nested `WorkPackageDepartmentTaskCompletion` object; the expected layout was not found.

### `WorkPackageGroup1List_Get`

**Status:** ⚪ empty

**Purpose.** Work package group 1 list.

**Request that worked:**

```json
{"JobNumber":"TESTTEST"}
```

**Result:** HTTP 200, 34 bytes, 133 ms. **Came back empty**: no data beyond the reply envelope.

**Gotchas:**

- `ResultData` is an empty string: no groups.

### `WorkPackageGroup2List_Get`

**Status:** ⚪ empty

**Purpose.** Work package group 2 list.

**Request that worked:**

```json
{"JobNumber":"TESTTEST"}
```

**Result:** HTTP 200, 34 bytes, 504 ms. **Came back empty**: no data beyond the reply envelope.

**Gotchas:**

- `ResultData` is an empty string: no groups.

### `ProductionPlanningSettings_Get`

**Status:** ✅ data

**Purpose.** Production planning settings (week start day, default view).

**Request that worked:**

```json
{"JobNumber":"EPM-001"}
```

**Result:** HTTP 200, 280 bytes, 112 ms.

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

**Status:** ⚪ empty

**Purpose.** Planning rule warnings for an item.

**Request that worked:**

```json
{"Type":"WorkPackage","ID":1}
```

**Attempts:**

- `{"Type":"WorkPackage","ID":1}` → 200, empty
- `{"JobNumber":"EPM-001"}` → 422: Type - Value is required
- `{"Type":"WorkPackage","ID":3}` → 200, empty
- `{"Type":"WorkPackage"}` → 422: ID - Value is required
- `{"Type":"WorkPackage","ID":1}` → 200, empty
- `{"JobNumber":"TESTTEST"}` → 422: Type - Value is required
- `{"Type":"WorkPackage","ID":3}` → 200, empty
- `{"Type":"WorkPackage"}` → 422: ID - Value is required

**Result:** HTTP 200, 213 bytes, 188 ms. **Came back empty**: no data beyond the reply envelope.

**Gotchas:**

- Needs `Type` and `ID`. `Type: "WorkPackage"` with IDs 1 and 3 returned no warnings.

### `GetTimeTrackingSubjects`

**Status:** ⛔ permission denied

**Purpose.** Time tracking subjects.

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
| [`TFSCut`](#tfscut) | ⚠️ refused | Records a cut in production tracking (from the name). |
| [`TFSManual`](#tfsmanual) | ⚠️ refused | Records production tracking manually (from the name). |
| [`ShopFloorSave`](#shopfloorsave) | ✅ data | Saves shop floor progress (from the name). |
| [`SaveTimeTrackingRecord`](#savetimetrackingrecord) | ⚠️ refused | Changes data (from the name). |
| [`SetAssemblyAssociation`](#setassemblyassociation) | ⚠️ refused | Changes data (from the name). |
| [`SetInstanceLocation`](#setinstancelocation) | ✅ data | Sets where a piece instance is (from the name). |
| [`SplicePackage_TFS`](#splicepackage_tfs) | ⚠️ refused | Changes data (from the name). |
| [`SplitPackage_TFS`](#splitpackage_tfs) | ⚠️ refused | Changes data (from the name). |
| [`SaveCNCFile`](#savecncfile) | ⚠️ refused | Changes data (from the name). |
| [`SaveNest`](#savenest) | ⛔ permission denied | Changes data (from the name). |
| [`SetCutListItemNestID`](#setcutlistitemnestid) | ⚠️ refused | Changes data (from the name). |
| [`ProductionControlCutListItem_Swap`](#productioncontrolcutlistitem_swap) | ⚠️ refused | Changes data (from the name). |
| [`ProductionControlCutList_ExportDSTVPlus`](#productioncontrolcutlist_exportdstvplus) | ✅ data | Changes data (from the name). |
| [`Department_Upsert`](#department_upsert) | ⏸ not run | Creates or edits a Department record (from the name). |
| [`Department_Delete`](#department_delete) | ⏸ not run | Deletes a Department record (from the name). |
| [`DepartmentShift_Upsert`](#departmentshift_upsert) | ⏸ not run | Creates or edits a DepartmentShift record (from the name). |
| [`DepartmentShift_Delete`](#departmentshift_delete) | ⏸ not run | Deletes a DepartmentShift record (from the name). |
| [`WorkAreaDepartmentSchedule_Upsert`](#workareadepartmentschedule_upsert) | ⏸ not run | Creates or edits a WorkAreaDepartmentSchedule record (from the name). |
| [`WorkAreaDepartmentSchedule_Delete`](#workareadepartmentschedule_delete) | ⏸ not run | Deletes a WorkAreaDepartmentSchedule record (from the name). |
| [`WorkAreaDepartmentSchedule_Move_Start_And_End_Dates`](#workareadepartmentschedule_move_start_and_end_dates) | ⏸ not run | Changes data (from the name). |
| [`WorkAreaDepartmentScheduleShift_Upsert`](#workareadepartmentscheduleshift_upsert) | ⏸ not run | Creates or edits a WorkAreaDepartmentScheduleShift record (from the name). |
| [`WorkAreaDepartmentScheduleShift_Delete`](#workareadepartmentscheduleshift_delete) | ⏸ not run | Deletes a WorkAreaDepartmentScheduleShift record (from the name). |
| [`WorkAreaDepartmentFutureTask_Upsert`](#workareadepartmentfuturetask_upsert) | ⏸ not run | Creates or edits a WorkAreaDepartmentFutureTask record (from the name). |
| [`WorkAreaDepartmentFutureTask_Delete`](#workareadepartmentfuturetask_delete) | ⏸ not run | Deletes a WorkAreaDepartmentFutureTask record (from the name). |
| [`WorkPackage_Insert`](#workpackage_insert) | ⚠️ refused | Creates a WorkPackage record (from the name). |
| [`WorkPackage_Update`](#workpackage_update) | ⚠️ refused | Edits a WorkPackage record (from the name). |
| [`WorkPackage_Delete`](#workpackage_delete) | ⚠️ refused | Deletes a WorkPackage record (from the name). |
| [`WorkPackage_ScheduleToWorkshop`](#workpackage_scheduletoworkshop) | ⚠️ refused | Changes data (from the name). |
| [`WorkPackage_Unschedule`](#workpackage_unschedule) | ⚠️ refused | Changes data (from the name). |
| [`WorkPackage_OffsetFutureWorkPackage`](#workpackage_offsetfutureworkpackage) | ⚠️ refused | Changes data (from the name). |
| [`WorkPackageDepartment_Insert`](#workpackagedepartment_insert) | ⚠️ refused | Creates a WorkPackageDepartment record (from the name). |
| [`WorkPackageDepartment_Update`](#workpackagedepartment_update) | ⚠️ refused | Edits a WorkPackageDepartment record (from the name). |
| [`WorkPackageDepartment_Delete`](#workpackagedepartment_delete) | ⚠️ refused | Deletes a WorkPackageDepartment record (from the name). |
| [`WorkPackageDepartmentTask_Insert`](#workpackagedepartmenttask_insert) | ⚠️ refused | Creates a WorkPackageDepartmentTask record (from the name). |
| [`WorkPackageDepartmentTask_Update`](#workpackagedepartmenttask_update) | ⚠️ refused | Edits a WorkPackageDepartmentTask record (from the name). |
| [`WorkPackageDepartmentTask_Delete`](#workpackagedepartmenttask_delete) | ⚠️ refused | Deletes a WorkPackageDepartmentTask record (from the name). |
| [`WorkPackageDepartmentTask_Schedule`](#workpackagedepartmenttask_schedule) | ⚠️ refused | Changes data (from the name). |
| [`WorkPackageDepartmentTask_Unschedule`](#workpackagedepartmenttask_unschedule) | ⚠️ refused | Changes data (from the name). |
| [`WorkPackageDepartmentTask_Split`](#workpackagedepartmenttask_split) | ⚠️ refused | Changes data (from the name). |
| [`WorkPackageDepartmentTask_OffsetFutureWorkPackage`](#workpackagedepartmenttask_offsetfutureworkpackage) | ⚠️ refused | Changes data (from the name). |
| [`WorkPackageDepartmentTaskCompletion_Insert`](#workpackagedepartmenttaskcompletion_insert) | ⚠️ refused | Creates a WorkPackageDepartmentTaskCompletion record (from the name). |
| [`WorkPackageDepartmentTaskCompletion_Update`](#workpackagedepartmenttaskcompletion_update) | ⚠️ refused | Edits a WorkPackageDepartmentTaskCompletion record (from the name). |
| [`WorkPackageDepartmentTaskCompletion_Delete`](#workpackagedepartmenttaskcompletion_delete) | ⚠️ refused | Deletes a WorkPackageDepartmentTaskCompletion record (from the name). |

### `TFSCut`

**Status:** ⚠️ refused

**What it does.** Records a cut in production tracking (from the name).

**Attempts:**

- `{}` → 422: CutListItemID/CutListSerialNumber/ExternalNestID/NestID is required

### `TFSManual`

**Status:** ⚠️ refused

**What it does.** Records production tracking manually (from the name).

**Attempts:**

- `{}` → 422: Quantity is required

### `ShopFloorSave`

**Status:** ✅ worked

**What it does.** Records (`Save`) or removes (`Delete`) production work at a station.

**Request that worked:**

```json
{"CommitType":"Delete","JobNumber":"EPM-001","MainMark":"A32","Sequence":"3","Station":"Quality Control","Quantity":1,"Employee":"admin","Date":"2026-10-20"}
```

**Reply:** only `Successful` and a `CommandGUID`.

**Attempts:**

- `{}` → 422: CommitType is required
- `{"CommitType":"Save","JobNumber":"EPM-001","MainMark":"3B1","Sequence":"1","Station":"Quality Control","Quantity":1}` → 422: Employee is required
- `{"CommitType":"Delete","JobNumber":"EPM-001","MainMark":"3B1","Sequence":"1","Station":"Quality Control","Quantity":1}` → 422: Employee is required
- `{"CommitType":"Save","JobNumber":"EPM-001","MainMark":"A32","Sequence":"3","Station":"Quality Control","Quantity":1,"Employee":"admin","Date":"2026-10-20"}` → 200: accepted
- `{"CommitType":"Delete","JobNumber":"EPM-001","MainMark":"A32","Sequence":"3","Station":"Quality Control","Quantity":1,"Employee":"admin","Date":"2026-10-20"}` → 200: accepted

**Gotchas:**

- Needs `CommitType`, `Employee`, `Station`, `MainMark`, `Sequence`, `Quantity`, `Date`. Both `Save` and `Delete` were accepted for the Quality Control station.

### `SaveTimeTrackingRecord`

**Status:** ⚠️ refused

**What it does.** Changes data (from the name).

**Attempts:**

- `{}` → 422: StartDate is required

### `SetAssemblyAssociation`

**Status:** ⚠️ refused

**What it does.** Changes data (from the name).

**Attempts:**

- `{}` → 422: MainMark is required

### `SetInstanceLocation`

**Status:** ✅ worked

**What it does.** Sets the location of a piece instance.

**Request that worked:**

```json
{"JobNumber":"EPM-001","MainMark":"A32","Sequence":"3","InstanceNumbers":"1","InstanceLocation":""}
```

**Reply:** only `Successful` and a `CommandGUID`.

**Attempts:**

- `{}` → 422: MainMark is required
- `{"JobNumber":"EPM-001","MainMark":"3B1","Sequence":"1","Location":"A"}` → 422: The instance numbers or serial number must be specified.
- `{"JobNumber":"EPM-001","MainMark":"3B1","Sequence":"1","Location":""}` → 422: The instance numbers or serial number must be specified.
- `{"JobNumber":"EPM-001","MainMark":"A32","Sequence":"3","InstanceNumbers":"1","InstanceLocation":"A"}` → 200: accepted
- `{"JobNumber":"EPM-001","MainMark":"A32","Sequence":"3","InstanceNumbers":"1","InstanceLocation":""}` → 200: accepted

**Gotchas:**

- Needs `JobNumber`, `MainMark`, `Sequence`, `InstanceLocation` and either `InstanceNumbers` or `SerialNumber` with `Quantity`. `InstanceLocation` "A" and then "" were both accepted.

### `SplicePackage_TFS`

**Status:** ⚠️ refused

**What it does.** Changes data (from the name).

**Attempts:**

- `{}` → 422: NestSolutionID - Value is required

### `SplitPackage_TFS`

**Status:** ⚠️ refused

**What it does.** Changes data (from the name).

**Attempts:**

- `{}` → 422: NestSolutionID - Value is required

### `SaveCNCFile`

**Status:** ⚠️ refused

**What it does.** Changes data (from the name).

**Attempts:**

- `{}` → 422: CNCFileID is required

### `SaveNest`

**Status:** ⛔ permission denied

**What it does.** Saves a nest.

**Attempts:**

- `{}` → 422: Permission denied.

**Gotchas:**

- Answered `Permission denied.`

### `SetCutListItemNestID`

**Status:** ⚠️ refused

**What it does.** Changes data (from the name).

**Attempts:**

- `{}` → 422: CutListItem is required.

### `ProductionControlCutListItem_Swap`

**Status:** ⚠️ refused

**What it does.** Changes data (from the name).

**Attempts:**

- `{}` → 422: ProductionControlCutListItemID - Value is required

### `ProductionControlCutList_ExportDSTVPlus`

**Status:** ✅ worked

**What it does.** Exports a cut list as DSTV+ NC files.

**Request that worked:**

```json
{"CutListID":1}
```

**Reply** (trimmed; [samples/ProductionControlCutList_ExportDSTVPlus.json](samples/ProductionControlCutList_ExportDSTVPlus.json)):

```json
{
  "FileName": "EPM-001_Seq 1 WF_20261020.zip",
  "FileDataBase64": "UEsDBBQAAAAIAJlDVF0iCcCvwgAAAMwFAAAHAAAAMUIxLm5jMbVSywrCMBC8…"
}
```

**Attempts:**

- `{}` → 422: CutListID - Value is required
- `{"CutListID":1}` → 200: accepted

**Gotchas:**

- Needs `CutListID`. The reply holds `FileName` and a zip as base64 in `FileDataBase64` (the first entry is `1B1.nc1`).

### `Department_Upsert`

**Status:** ⏸ not run

**What it does.** Creates or edits a Department record (from the name).

### `Department_Delete`

**Status:** ⏸ not run

**What it does.** Deletes a Department record (from the name).

### `DepartmentShift_Upsert`

**Status:** ⏸ not run

**What it does.** Creates or edits a DepartmentShift record (from the name).

### `DepartmentShift_Delete`

**Status:** ⏸ not run

**What it does.** Deletes a DepartmentShift record (from the name).

### `WorkAreaDepartmentSchedule_Upsert`

**Status:** ⏸ not run

**What it does.** Creates or edits a WorkAreaDepartmentSchedule record (from the name).

### `WorkAreaDepartmentSchedule_Delete`

**Status:** ⏸ not run

**What it does.** Deletes a WorkAreaDepartmentSchedule record (from the name).

### `WorkAreaDepartmentSchedule_Move_Start_And_End_Dates`

**Status:** ⏸ not run

**What it does.** Changes data (from the name).

### `WorkAreaDepartmentScheduleShift_Upsert`

**Status:** ⏸ not run

**What it does.** Creates or edits a WorkAreaDepartmentScheduleShift record (from the name).

### `WorkAreaDepartmentScheduleShift_Delete`

**Status:** ⏸ not run

**What it does.** Deletes a WorkAreaDepartmentScheduleShift record (from the name).

### `WorkAreaDepartmentFutureTask_Upsert`

**Status:** ⏸ not run

**What it does.** Creates or edits a WorkAreaDepartmentFutureTask record (from the name).

### `WorkAreaDepartmentFutureTask_Delete`

**Status:** ⏸ not run

**What it does.** Deletes a WorkAreaDepartmentFutureTask record (from the name).

### `WorkPackage_Insert`

**Status:** ⚠️ refused

**What it does.** Creates a work package.

**Attempts:**

- `{"ProductionControlID":13}` → 422: WorkPackageNumber - Value is required
- `{"ProductionControlID":13,"WorkPackageNumber":"WIKI-WP","WorkshopID":1,"Description":"wiki test work package"}` → 422: Permission denied.

**Gotchas:**

- Asked for `WorkPackageNumber`; the attempt with `ProductionControlID`, `WorkPackageNumber`, `WorkshopID` and `Description` answered `Permission denied.`

### `WorkPackage_Update`

**Status:** ⚠️ refused

**What it does.** Edits a WorkPackage record (from the name).

**Attempts:**

- `{}` → 422: WorkPackageID - Value is required

### `WorkPackage_Delete`

**Status:** ⚠️ refused

**What it does.** Deletes a WorkPackage record (from the name).

**Attempts:**

- `{}` → 422: WorkPackageID - Value is required

### `WorkPackage_ScheduleToWorkshop`

**Status:** ⚠️ refused

**What it does.** Changes data (from the name).

**Attempts:**

- `{}` → 422: WorkshopID - Value is required

### `WorkPackage_Unschedule`

**Status:** ⚠️ refused

**What it does.** Changes data (from the name).

**Attempts:**

- `{}` → 422: WorkPackageID - Value is required

### `WorkPackage_OffsetFutureWorkPackage`

**Status:** ⚠️ refused

**What it does.** Changes data (from the name).

**Attempts:**

- `{}` → 422: WorkPackageID - Value is required

### `WorkPackageDepartment_Insert`

**Status:** ⚠️ refused

**What it does.** Creates a WorkPackageDepartment record (from the name).

**Attempts:**

- `{}` → 422: WorkPackageID - Value is required

### `WorkPackageDepartment_Update`

**Status:** ⚠️ refused

**What it does.** Edits a WorkPackageDepartment record (from the name).

**Attempts:**

- `{}` → 422: WorkPackageDepartmentID - Value is required

### `WorkPackageDepartment_Delete`

**Status:** ⚠️ refused

**What it does.** Deletes a WorkPackageDepartment record (from the name).

**Attempts:**

- `{}` → 422: WorkPackageDepartmentID - Value is required

### `WorkPackageDepartmentTask_Insert`

**Status:** ⚠️ refused

**What it does.** Creates a WorkPackageDepartmentTask record (from the name).

**Attempts:**

- `{}` → 422: WorkPackageDepartmentID - Value is required

### `WorkPackageDepartmentTask_Update`

**Status:** ⚠️ refused

**What it does.** Edits a WorkPackageDepartmentTask record (from the name).

**Attempts:**

- `{}` → 422: WorkPackageDepartmentTaskID - Value is required

### `WorkPackageDepartmentTask_Delete`

**Status:** ⚠️ refused

**What it does.** Deletes a WorkPackageDepartmentTask record (from the name).

**Attempts:**

- `{}` → 422: WorkPackageDepartmentTaskID - Value is required

### `WorkPackageDepartmentTask_Schedule`

**Status:** ⚠️ refused

**What it does.** Changes data (from the name).

**Attempts:**

- `{}` → 422: WorkPackageDepartmentTaskID - Value is required

### `WorkPackageDepartmentTask_Unschedule`

**Status:** ⚠️ refused

**What it does.** Changes data (from the name).

**Attempts:**

- `{}` → 422: WorkPackageDepartmentTaskID - Value is required

### `WorkPackageDepartmentTask_Split`

**Status:** ⚠️ refused

**What it does.** Changes data (from the name).

**Attempts:**

- `{}` → 422: WorkPackageDepartmentTaskID - Value is required

### `WorkPackageDepartmentTask_OffsetFutureWorkPackage`

**Status:** ⚠️ refused

**What it does.** Changes data (from the name).

**Attempts:**

- `{}` → 422: WorkPackageDepartmentTaskID - Value is required

### `WorkPackageDepartmentTaskCompletion_Insert`

**Status:** ⚠️ refused

**What it does.** Creates a WorkPackageDepartmentTaskCompletion record (from the name).

**Attempts:**

- `{}` → 502: HTTP 502 from the tunnel

### `WorkPackageDepartmentTaskCompletion_Update`

**Status:** ⚠️ refused

**What it does.** Edits a WorkPackageDepartmentTaskCompletion record (from the name).

**Attempts:**

- `{}` → 502: HTTP 502 from the tunnel

### `WorkPackageDepartmentTaskCompletion_Delete`

**Status:** ⚠️ refused

**What it does.** Deletes a WorkPackageDepartmentTaskCompletion record (from the name).

**Attempts:**

- `{}` → 502: HTTP 502 from the tunnel
