# Assemblies, material and drawings

What a job is made of. For a piece lookup by mark, `ProductionControlLoadRemaining_Get` on the loads page
is often better than anything here: it has shape, size, grade, finish, route, weight and drawing for every piece
still to ship, in one call. On EPM-001 the per-assembly weights in `GetAssemblies` and `GetBillOfMaterials` came
back empty; drawing weights in `GetDrawings` and `Drawing_Get` are filled.

[← Back to the index](README.md)

## Read commands

| Command | Status | Answers |
|---|---|---|
| [`GetAssemblies`](#getassemblies) | ✅ data | What main marks are on a job and in which sequences? |
| [`GetBillOfMaterials`](#getbillofmaterials) | ✅ data |  |
| [`GetCategories`](#getcategories) | ✅ data |  |
| [`GetSubCategories`](#getsubcategories) | ✅ data |  |
| [`GetModelObjectIDs`](#getmodelobjectids) | ✅ data | Which Tekla model objects belong to a mark? |
| [`ProductionControlFinish_Get`](#productioncontrolfinish_get) | ✅ data |  |
| [`GetDrawings`](#getdrawings) | ✅ data | Which drawings are on a job and are they approved? |
| [`Drawing_Get`](#drawing_get) | ✅ data |  |
| [`DrawingRevision_Get`](#drawingrevision_get) | ✅ data |  |
| [`DrawingLog_Get`](#drawinglog_get) | ✅ data |  |
| [`DrawingInputOptions_Get`](#drawinginputoptions_get) | ✅ data |  |
| [`DrawingFile_Get`](#drawingfile_get) | ⚠️ refused |  |
| [`GetDocument`](#getdocument) | ⚠️ refused |  |
| [`GetTransmittalDetails`](#gettransmittaldetails) | ✅ data |  |
| [`Transmittal_Get`](#transmittal_get) | ⛔ permission denied |  |
| [`GetRFIDetails`](#getrfidetails) | ✅ data |  |
| [`GetChangeOrderDetails`](#getchangeorderdetails) | ✅ data |  |

### `GetAssemblies`

**Status:** ✅ data

**Purpose.** Every assembly (main mark) with drawing number, approval status, quantity per assembly, total quantity, weight and per-sequence quantities.

**Answers:** What main marks are on a job and in which sequences?

**Request that worked:**

```json
{"JobNumber":"TESTTEST"}
```

**Result:** HTTP 200, 136,337 bytes, 197 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `ProductionControlID` | number (as text) | 1 | `90` |
| `JobNumber` | text | 1 | `TESTTEST` |
| `InputDisplayUnits` | object | 1 | common block, see README |
| `Assembly` | list (613–613) | 1 |  |
| `Assembly[].MainMark` | number (as text) | 613 | `55311000`, `55311001` |
| `Assembly[].DrawingNumber` | number (as text) | 613 | `55311000`, `55311001` |
| `Assembly[].ApprovalStatus` | text | 613 |  |
| `Assembly[].AssemblyQuantity` | number (as text) | 613 | `1`, `11` |
| `Assembly[].TotalQuantity` | number (as text) | 613 | `6`, `66` |
| `Assembly[].Weight` | object | 613 |  |
| `Assembly[].Weight.@UOM` | text | 613 | `kg` |
| `Assembly[].Weight.#text` | number (as text) | 613 | `263.709695670973021`, `3102.48305759762704` |
| `Assembly[].AssemblySequence` | object | 613 |  |
| `Assembly[].AssemblySequence.Sequence` | number (as text) | 613 | `5531`, `5532` |
| `Assembly[].AssemblySequence.Quantity` | number (as text) | 613 | `1`, `11` |
| `FilterSet` | object | 1 | common block, see README |
| `HoldSettings` | object | 1 | common block, see README |

**Sample** (trimmed; full trimmed sample in [samples/GetAssemblies.json](samples/GetAssemblies.json)):

```json
{
  "Assembly": [
    {
      "MainMark": "55311000",
      "DrawingNumber": "55311000",
      "ApprovalStatus": "",
      "AssemblyQuantity": "1",
      "TotalQuantity": "6",
      "Weight": {
        "@UOM": "kg",
        "#text": "263.709695670973021"
      },
      "AssemblySequence": {
        "Sequence": "5531",
        "Quantity": "1"
      }
    },
    "… 612 more"
  ]
}
```

**Gotchas:**

- On EPM-001 every `Weight` was `{"@UOM":"kg"}` with no value (all 592). Weights were not tried with other options. Get weight from `GetDrawings` or `ProductionControlLoadRemaining_Get`.
- `AssemblySequence` is an object for one sequence and a list when a mark is in several.

### `GetBillOfMaterials`

**Status:** ✅ data

**Purpose.** Same as GetAssemblies plus a `BillOfMaterials` entry per part.

**Request that worked:**

```json
{"JobNumber":"EPM-001"}
```

**Result:** HTTP 200, 163,475 bytes, 448 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `ProductionControlID` | number (as text) | 1 | `13` |
| `JobNumber` | text | 1 | `EPM-001` |
| `InputDisplayUnits` | object | 1 | common block, see README |
| `Assembly` | list (592–592) | 1 |  |
| `Assembly[].MainMark` | text | 592 | `1B1`, `1B2` |
| `Assembly[].DrawingNumber` | number (as text) | 592 | `1`, `2` |
| `Assembly[].ApprovalStatus` | text | 592 | `IFF`, `P` |
| `Assembly[].ApprovalStatusDescription` | text | 277 | `In For Fabrication`, `Approved As Noted` |
| `Assembly[].ApprovalStatusPurpose` | text | 143 | `Approved` |
| `Assembly[].AssemblyQuantity` | number (as text) | 592 | `1`, `2` |
| `Assembly[].TotalQuantity` | number (as text) | 592 | `59`, `70` |
| `Assembly[].Weight` | object | 592 |  |
| `Assembly[].Weight.@UOM` | text | 592 | `kg` |
| `Assembly[].Weight.#text` | number (as text) | 592 | `797.251695464567266`, `1094.098916718450877` |
| `Assembly[].AssemblySequence` | object or list | 592 |  |
| `Assembly[].AssemblySequence.Sequence` | number (as text) | 574 | `1`, `2` |
| `Assembly[].AssemblySequence.Quantity` | number (as text) | 574 | `1`, `2` |
| `Assembly[].BillOfMaterials` | text or list | 592 |  |
| `Assembly[].AssemblySequence[].Sequence` | number (as text) | 43 | `1`, `2` |
| `Assembly[].AssemblySequence[].Quantity` | number (as text) | 43 | `20`, `4` |
| `FilterSet` | object | 1 | common block, see README |
| `HoldSettings` | object | 1 | common block, see README |

**Sample** (trimmed; full trimmed sample in [samples/GetBillOfMaterials.json](samples/GetBillOfMaterials.json)):

```json
{
  "Assembly": [
    {
      "MainMark": "1B1",
      "DrawingNumber": "1",
      "ApprovalStatus": "IFF",
      "ApprovalStatusDescription": "In For Fabrication",
      "ApprovalStatusPurpose": "Approved",
      "AssemblyQuantity": "1",
      "TotalQuantity": "59",
      "Weight": {
        "@UOM": "kg",
        "#text": "797.251695464567266"
      },
      "AssemblySequence": {
        "Sequence": "1",
        "Quantity": "1"
      },
      "BillOfMaterials": [
        "",
        "… 7 more"
      ]
    },
    "… 591 more"
  ]
}
```

**Gotchas:**

- On EPM-001 the `BillOfMaterials` entries were all empty strings and weights empty. The options that fill them were not found.
- One or many: `Assembly.BillOfMaterials`, `Assembly.AssemblySequence` came back as an object in one place and a list in another. Always normalise to a list.

### `GetCategories`

**Status:** ✅ data

**Purpose.** Totals by category (BEAM, COLUMN, BRACE…): main member count, piece count, weight.

**Request that worked:**

```json
{"JobNumber":"EPM-001"}
```

**Result:** HTTP 200, 2,138 bytes, 108 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `ProductionControlID` | number (as text) | 1 | `13` |
| `JobNumber` | text | 1 | `EPM-001` |
| `InputDisplayUnits` | object | 1 | common block, see README |
| `Category` | list (13–13) | 1 |  |
| `Category[].Category` | text | 13 | `ANCHOR_ROD`, `Backer Bar` |
| `Category[].MainMemberQuantity` | number (as text) | 13 | `0`, `256` |
| `Category[].TotalQuantity` | number (as text) | 13 | `15628`, `256` |
| `Category[].Weight` | object | 13 |  |
| `Category[].Weight.@UOM` | text | 13 | `kg` |
| `Category[].Weight.#text` | number (as text) | 13 | `16998.840712460117137`, `0` |
| `FilterSet` | object | 1 | common block, see README |
| `HoldSettings` | object | 1 | common block, see README |

**Sample** (trimmed; full trimmed sample in [samples/GetCategories.json](samples/GetCategories.json)):

```json
{
  "Category": [
    {
      "Category": "",
      "MainMemberQuantity": "0",
      "TotalQuantity": "15628",
      "Weight": {
        "@UOM": "kg",
        "#text": "16998.840712460117137"
      }
    },
    "… 12 more"
  ]
}
```

### `GetSubCategories`

**Status:** ✅ data

**Purpose.** Totals by sub-category (on EPM-001 these are phases: "Phase 1"…).

**Request that worked:**

```json
{"JobNumber":"EPM-001"}
```

**Result:** HTTP 200, 1,376 bytes, 114 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `ProductionControlID` | number (as text) | 1 | `13` |
| `JobNumber` | text | 1 | `EPM-001` |
| `InputDisplayUnits` | object | 1 | common block, see README |
| `SubCategory` | list (6–6) | 1 |  |
| `SubCategory[].SubCategory` | text | 6 | `Phase 1`, `Phase 2` |
| `SubCategory[].MainMemberQuantity` | number (as text) | 6 | `0`, `174` |
| `SubCategory[].TotalQuantity` | number (as text) | 6 | `11659`, `984` |
| `SubCategory[].Weight` | object | 6 |  |
| `SubCategory[].Weight.@UOM` | text | 6 | `kg` |
| `SubCategory[].Weight.#text` | number (as text) | 6 | `2376.884528022158`, `75057.648022458714593` |
| `FilterSet` | object | 1 | common block, see README |
| `HoldSettings` | object | 1 | common block, see README |

**Sample** (trimmed; full trimmed sample in [samples/GetSubCategories.json](samples/GetSubCategories.json)):

```json
{
  "SubCategory": [
    {
      "SubCategory": "",
      "MainMemberQuantity": "0",
      "TotalQuantity": "11659",
      "Weight": {
        "@UOM": "kg",
        "#text": "2376.884528022158"
      }
    },
    "… 5 more"
  ]
}
```

### `GetModelObjectIDs`

**Status:** ✅ data

**Purpose.** Tekla model GUIDs for every assembly and its parts, by main mark and sequence.

**Answers:** Which Tekla model objects belong to a mark?

**Request that worked:**

```json
{"JobNumber":"EPM-001"}
```

**Result:** HTTP 200, 338,204 bytes, 1033 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `ProductionControlID` | number (as text) | 1 | `13` |
| `JobNumber` | text | 1 | `EPM-001` |
| `Assembly` | list (617–617) | 1 |  |
| `Assembly[].MainMark` | text | 617 | `1B1`, `1B2` |
| `Assembly[].Sequence` | number (as text) | 617 | `1`, `2` |
| `Assembly[].LotNumber` | text | 617 |  |
| `Assembly[].AssemblyID` | object or list | 617 |  |
| `Assembly[].AssemblyID.ModelObjectID` | text | 454 | `2vXKWSCKjDfxi_rlFHWsm8`, `3MtPMfmMb7_OhNWOY$z_Fc` |
| `Assembly[].AssemblyID.Part` | object or list | 454 |  |
| `Assembly[].AssemblyID.Part[].PieceMark` | text | 945 | `1B1`, `a19` |
| `Assembly[].AssemblyID.Part[].ModelObjectID` | text or list | 945 | `1tb5toJJb67v6vorXP_xi6`, `2mLMkEE9vF18tM7cy9LhhF` |
| `Assembly[].AssemblyID[].ModelObjectID` | text | 776 | `2jzzZM$ZTERA_pALBQMLY4`, `3jfH5HvjTDVBgpxKGVJwDZ` |
| `Assembly[].AssemblyID[].Part` | object or list | 776 |  |
| `Assembly[].AssemblyID[].Part.PieceMark` | text | 296 | `A3`, `A4` |
| `Assembly[].AssemblyID[].Part.ModelObjectID` | text | 296 | `2Z_NYYxb93FBHlWVQ2FiQt`, `22qlgxyU53HgZpCPcgxFlw` |
| `Assembly[].AssemblyID.Part.PieceMark` | text | 125 | `A5`, `A6` |
| `Assembly[].AssemblyID.Part.ModelObjectID` | text | 125 | `0ytxhNOZr1QuookK2NFlhE`, `0c2E4EX2z9V9$xgsBJmKpU` |
| `Assembly[].AssemblyID[].Part[].PieceMark` | text | 1500 | `A29`, `bp6` |
| `Assembly[].AssemblyID[].Part[].ModelObjectID` | text or list | 1500 | `1hcXIukob96A7MDhxqonl0`, `0ssXB3dWfDo9saS7mQoCJ8` |
| `FilterSet` | object | 1 | common block, see README |
| `HoldSettings` | object | 1 | common block, see README |

**Sample** (trimmed; full trimmed sample in [samples/GetModelObjectIDs.json](samples/GetModelObjectIDs.json)):

```json
{
  "Assembly": [
    {
      "MainMark": "1B1",
      "Sequence": "1",
      "LotNumber": "",
      "AssemblyID": {
        "ModelObjectID": "2vXKWSCKjDfxi_rlFHWsm8",
        "Part": [
          {
            "PieceMark": "1B1",
            "ModelObjectID": "1tb5toJJb67v6vorXP_xi6"
          },
          "… 4 more"
        ]
      }
    },
    "… 616 more"
  ]
}
```

**Gotchas:**

- Slow-ish (about 1 s) and 338 KB on EPM-001.
- `Part.ModelObjectID` can itself be a list.
- One or many: `Assembly.AssemblyID.Part.ModelObjectID`, `Assembly.AssemblyID`, `Assembly.AssemblyID.Part` came back as an object in one place and a list in another. Always normalise to a list.

### `ProductionControlFinish_Get`

**Status:** ✅ data

**Purpose.** Finish codes (PNT Painted, UNP Unpainted, GLV Galvanized…) with descriptions and import mappings.

**Request that worked:**

```json
{"JobNumber":"EPM-001"}
```

**Result:** HTTP 200, 2,078 bytes, 198 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `ResultData` | object | 1 |  |
| `ResultData.LastLogID` | number (as text) | 1 | `25` |
| `ResultData.ProductionControlFinish` | list (24–24) | 1 |  |
| `ResultData.ProductionControlFinish[].ProductionControlFinishID` | number (as text) | 24 | `1`, `2` |
| `ResultData.ProductionControlFinish[].Abbreviation` | text | 24 | `PNT`, `UNP` |
| `ResultData.ProductionControlFinish[].Description` | text | 24 | `Painted`, `Unpainted` |
| `ResultData.ProductionControlFinish[].FinishMapping` | text or list | 2 | `GALV.` |

**Sample** (trimmed; full trimmed sample in [samples/ProductionControlFinish_Get.json](samples/ProductionControlFinish_Get.json)):

```json
{
  "ProductionControlFinish": [
    {
      "ProductionControlFinishID": "1",
      "Abbreviation": "PNT",
      "Description": "Painted"
    },
    "… 23 more"
  ]
}
```

**Gotchas:**

- One or many: `ResultData.ProductionControlFinish.FinishMapping` came back as an object in one place and a list in another. Always normalise to a list.

### `GetDrawings`

**Status:** ✅ data

**Purpose.** Every drawing with description, approval status, revision, quantities and weight.

**Answers:** Which drawings are on a job and are they approved?

**Request that worked:**

```json
{"JobNumber":"EPM-001"}
```

**Result:** HTTP 200, 190,565 bytes, 967 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `ProductionControlID` | number (as text) | 1 | `13` |
| `JobNumber` | text | 1 | `EPM-001` |
| `InputDisplayUnits` | object | 1 | common block, see README |
| `Drawing` | list (1131–1131) | 1 |  |
| `Drawing[].DrawingNumber` | number (as text) | 1131 | `1`, `2` |
| `Drawing[].Description` | number (as text) | 1131 | `1`, `2` |
| `Drawing[].ApprovalStatus` | text | 1131 | `IFF`, `A` |
| `Drawing[].Revision` | text | 1131 |  |
| `Drawing[].AssemblyQuantity` | number (as text) | 1131 | `2`, `0` |
| `Drawing[].TotalQuantity` | number (as text) | 1131 | `129`, `48` |
| `Drawing[].Weight` | object | 1131 |  |
| `Drawing[].Weight.@UOM` | text | 1131 | `kg` |
| `Drawing[].Weight.#text` | number (as text) | 1131 | `1891.350612183018143`, `918.596871138775566` |
| `FilterSet` | object | 1 | common block, see README |
| `HoldSettings` | object | 1 | common block, see README |

**Sample** (trimmed; full trimmed sample in [samples/GetDrawings.json](samples/GetDrawings.json)):

```json
{
  "Drawing": [
    {
      "DrawingNumber": "1",
      "Description": "1",
      "ApprovalStatus": "IFF",
      "Revision": "",
      "AssemblyQuantity": "2",
      "TotalQuantity": "129",
      "Weight": {
        "@UOM": "kg",
        "#text": "1891.350612183018143"
      }
    },
    "… 1130 more"
  ]
}
```

**Gotchas:**

- `Revision` was empty on EPM-001 drawings.
- Weight here is filled (unlike GetAssemblies).

### `Drawing_Get`

**Status:** ✅ data

**Purpose.** Full drawing records: DrawingID, drawing log, category, dates (detailed, shop issue), release number, approval status, and production totals per drawing. With `Revisions`/`Transmittals` set to "all" it adds transmittal history.

**Request that worked:**

```json
{"ProjectID":4}
```

**Attempts:**

- `{"DrawingID":2916,"GetOptions":{"IncludeDrawingLogDetails":1,"Revisions":"all","Transmittals":"all"}}` → 200, 1291 bytes
- `{"JobNumber":"EPM-001"}` → 422: Either ProjectID, ProductionControlID, or DrawingID must be specified.
- `{"ProjectID":4}` → 200, 484750 bytes
- `{"DrawingID":2916,"GetOptions":{"IncludeDrawingLogDetails":1,"Revisions":"all","Transmittals":"all"}}` → 200, 1291 bytes
- `{"ProjectID":29}` → 200, 212852 bytes
- `{"JobNumber":"TESTTEST"}` → 422: Either ProjectID, ProductionControlID, or DrawingID must be specified.

**Result:** HTTP 200, 484,750 bytes, 801 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `ResultData` | object | 1 |  |
| `ResultData.LastLogID` | text | 1 | `17018,2257,27528,2150,17` |
| `ResultData.GetOptions` | object | 1 |  |
| `ResultData.GetOptions.IncludeDrawingLogDetails` | number (as text) | 1 | `0` |
| `ResultData.GetOptions.Revisions` | text | 1 | `none` |
| `ResultData.GetOptions.Transmittals` | text | 1 | `none` |
| `ResultData.Drawing` | list (1131–1131) | 1 |  |
| `ResultData.Drawing[].DrawingID` | number (as text) | 1131 | `2916`, `2917` |
| `ResultData.Drawing[].ProjectID` | number (as text) | 1131 | `4` |
| `ResultData.Drawing[].DrawingLogID` | number (as text) | 1131 | `24`, `23` |
| `ResultData.Drawing[].DrawingNumberDisplay` | number (as text) | 1131 | `1`, `2` |
| `ResultData.Drawing[].Description` | number (as text) | 674 | `1`, `2` |
| `ResultData.Drawing[].ApprovalStatusID` | number (as text) | 520 | `6`, `2` |
| `ResultData.Drawing[].DateDetailed` | text | 674 | `2020-08-31`, `2017-05-01` |
| `ResultData.Drawing[].DetailingHours` | number (as text) | 1131 | `0` |
| `ResultData.Drawing[].ReleaseNumber` | number (as text) | 1131 | `1`, `3` |
| `ResultData.Drawing[].Category` | text | 674 | `Multi-Drawing`, `General Arrangement` |
| `ResultData.Drawing[].ShopIssueDate` | text | 147 | `2020-08-28` |
| `ResultData.Drawing[].ReSubmit` | number (as text) | 1131 | `0` |
| `ResultData.Drawing[].DrawingProduction` | object | 1127 |  |
| `ResultData.Drawing[].DrawingProduction.TotalQuantity` | number (as text) | 1127 | `129`, `48` |
| `ResultData.Drawing[].DrawingProduction.AssemblyQuantity` | number (as text) | 1127 | `2`, `1` |
| `ResultData.Drawing[].DrawingProduction.Weight` | number (as text) | 1127 | `1891.350612`, `918.5968711` |
| `ResultData.Drawing[].DrawingProduction.Hours` | number (as text) | 1127 | `13.24181505`, `6.469812229` |
| `ResultData.Drawing[].DrawingProduction.Category` | text or list | 1127 | `BRACE`, `VERTICAL HSS BRACE` |
| `ResultData.Drawing[].DrawingProduction.SubCategory` | text or list | 1127 | `Phase 1`, `Phase 2` |
| `ResultData.Drawing[].DrawingProduction.PayCategory` | text | 1127 |  |
| `ResultData.Drawing[].DrawingProduction.Sequence` | number (as text) | 1127 | `1`, `2` |
| `ResultData.Drawing[].DrawingProduction.LotNumber` | text | 1127 |  |
| `ResultData.Drawing[].DrawingProduction.WorkPackageNumber` | text | 1127 |  |
| `ResultData.Drawing[].DetailedBy` | text | 1 | `DH` |
| `ResultData.Drawing[].CheckedBy` | text | 1 | `LS` |
| `ResultData.ApprovalStatus` | list (3–3) | 1 |  |
| `ResultData.ApprovalStatus[].ApprovalStatusID` | number (as text) | 3 | `2`, `4` |
| `ResultData.ApprovalStatus[].ApprovalStatus` | text | 3 | `A`, `P` |
| `ResultData.ApprovalStatus[].Description` | text | 3 | `Approved`, `Approved As Noted` |
| `ResultData.ApprovalStatus[].Purpose` | text | 2 | `Approved` |

**Sample** (trimmed; full trimmed sample in [samples/Drawing_Get.json](samples/Drawing_Get.json)):

```json
{
  "Drawing": [
    {
      "DrawingID": "2916",
      "ProjectID": "4",
      "DrawingLogID": "24",
      "DrawingNumberDisplay": "1",
      "Description": "1",
      "ApprovalStatusID": "6",
      "DateDetailed": "2020-08-31",
      "DetailingHours": "0",
      "ReleaseNumber": "1",
      "Category": "Multi-Drawing",
      "ShopIssueDate": "2020-08-28",
      "ReSubmit": "0",
      "DrawingProduction": {
        "TotalQuantity": "129",
        "AssemblyQuantity": "2",
        "Weight": "1891.350612",
        "Hours": "13.24181505",
        "Category": [
          "",
          "… 1 more"
        ],
        "SubCategory": [
          "",
          "… 1 more"
        ],
        "PayCategory": "",
        "Sequence": "1",
  …
```

**Gotchas:**

- Needs `ProjectID`, `ProductionControlID` or `DrawingID`. 485 KB for all 1131 drawings on EPM-001; pass `DrawingID` for one.
- Approval is an `ApprovalStatusID`; the lookup table (A, P, IFF…) comes back in `ResultData.ApprovalStatus`.
- One or many: `ResultData.Drawing.DrawingProduction.SubCategory`, `ResultData.Drawing.DrawingProduction.Sequence`, `ResultData.Drawing.DrawingProduction.Category` came back as an object in one place and a list in another. Always normalise to a list.

### `DrawingRevision_Get`

**Status:** ✅ data

**Purpose.** Drawing revisions.

**Request that worked:**

```json
{"ProjectID":29}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: Either ProjectID, ProductionControlID, DrawingID, or DrawingRevisionID must be specified.
- `{"ProjectID":4}` → 200, empty
- `{"ProjectID":29}` → 200, 63848 bytes
- `{"JobNumber":"TESTTEST"}` → 422: Either ProjectID, ProductionControlID, DrawingID, or DrawingRevisionID must be specified.

**Result:** HTTP 200, 63,848 bytes, 97 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `ResultData` | object | 1 |  |
| `ResultData.LastLogID` | number (as text) | 1 | `2265` |
| `ResultData.GetOptions` | object | 1 |  |
| `ResultData.GetOptions.Revisions` | text | 1 | `all` |
| `ResultData.DrawingRevision` | list (613–613) | 1 |  |
| `ResultData.DrawingRevision[].DrawingRevisionID` | number (as text) | 613 | `991`, `992` |
| `ResultData.DrawingRevision[].DrawingID` | number (as text) | 613 | `11123`, `11124` |
| `ResultData.DrawingRevision[].Revision` | number (as text) | 613 | `0` |
| `ResultData.DrawingRevision[].DateRevised` | text | 613 | `2026-08-10` |
| `ResultData.DrawingRevision[].Latest` | number (as text) | 613 | `1` |

**Sample** (trimmed; full trimmed sample in [samples/DrawingRevision_Get.json](samples/DrawingRevision_Get.json)):

```json
{
  "DrawingRevision": [
    {
      "DrawingRevisionID": "991",
      "DrawingID": "11123",
      "Revision": "0",
      "DateRevised": "2026-08-10",
      "Latest": "1"
    },
    "… 612 more"
  ]
}
```

**Gotchas:**

- Empty for `ProjectID: 4`: EPM-001 has no revision records.

### `DrawingLog_Get`

**Status:** ✅ data

**Purpose.** Drawing logs (Design, Assembly, GA, Multi, Single part) with their folder paths.

**Request that worked:**

```json
{"JobNumber":"EPM-001"}
```

**Result:** HTTP 200, 28,984 bytes, 138 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `ResultData` | object | 1 |  |
| `ResultData.LastLogID` | number (as text) | 1 | `151` |
| `ResultData.DrawingLog` | list (155–155) | 1 |  |
| `ResultData.DrawingLog[].DrawingLogID` | number (as text) | 155 | `5`, `6` |
| `ResultData.DrawingLog[].ProjectID` | number (as text) | 155 | `1`, `2` |
| `ResultData.DrawingLog[].DrawingType` | text | 155 | `Design`, `Detail` |
| `ResultData.DrawingLog[].DrawingLogName` | text | 155 | `Design`, `Detail` |
| `ResultData.DrawingLog[].PDCLink` | number (as text) | 155 | `0`, `10` |
| `ResultData.DrawingLog[].SubdirectoryPath` | text | 155 | `Design`, `Detail\Multidrawings` |
| `ResultData.DrawingLog[].DrawingLogMapping` | text | 155 | `Multi-Drawing⏎Detail sheets`, `Details` |

**Sample** (trimmed; full trimmed sample in [samples/DrawingLog_Get.json](samples/DrawingLog_Get.json)):

```json
{
  "DrawingLog": [
    {
      "DrawingLogID": "5",
      "ProjectID": "1",
      "DrawingType": "Design",
      "DrawingLogName": "Design",
      "PDCLink": "0",
      "SubdirectoryPath": "",
      "DrawingLogMapping": ""
    },
    "… 154 more"
  ]
}
```

**Gotchas:**

- Ignores `JobNumber` and returns the logs of every project (155 rows). `Project_Get` gives the logs for one job.

### `DrawingInputOptions_Get`

**Status:** ✅ data

**Purpose.** Choices for drawing fields: approval statuses, categories, detailer and checker initials.

**Request that worked:**

```json
{"ProjectID":4}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: ProjectID - Value is required
- `{"ProjectID":4}` → 200, 787 bytes
- `{"ProjectID":29}` → 200, 676 bytes
- `{"JobNumber":"TESTTEST"}` → 422: ProjectID - Value is required

**Result:** HTTP 200, 787 bytes, 87 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `ResultData` | object | 1 |  |
| `ResultData.InputOptions` | object | 1 |  |
| `ResultData.InputOptions.ApprovalStatus` | list (7–7) | 1 |  |
| `ResultData.InputOptions.ApprovalStatus[].ApprovalStatusID` | number (as text) | 7 | `2`, `1` |
| `ResultData.InputOptions.ApprovalStatus[].ApprovalStatus` | text | 7 | `A`, `H` |
| `ResultData.InputOptions.ApprovalStatus[].Description` | text | 7 | `Approved`, `Hold` |
| `ResultData.InputOptions.ApprovalStatus[].Purpose` | text | 4 | `Approved`, `Hold` |
| `ResultData.InputOptions.Category` | list (4–4) of text | 1 | `Assembly`, `General Arrangement` |
| `ResultData.InputOptions.CheckedBy` | text | 1 | `LS` |
| `ResultData.InputOptions.DetailedBy` | text | 1 | `DH` |

**Sample** (trimmed; full trimmed sample in [samples/DrawingInputOptions_Get.json](samples/DrawingInputOptions_Get.json)):

```json
{
  "InputOptions": {
    "ApprovalStatus": [
      {
        "ApprovalStatusID": "2",
        "ApprovalStatus": "A",
        "Description": "Approved",
        "Purpose": "Approved"
      },
      "… 6 more"
    ],
    "Category": [
      "Assembly",
      "… 3 more"
    ],
    "CheckedBy": "LS",
    "DetailedBy": "DH"
  }
}
```

**Gotchas:**

- Needs `ProjectID`.

### `DrawingFile_Get`

**Status:** ⚠️ refused

**Purpose.** Fetches a drawing file.

**Best attempt:**

```json
{"JobNumber":"TESTTEST"}
```

**Attempts:**

- `{"DrawingID":2916}` → 422: FileName - Value is required
- `{"JobNumber":"EPM-001"}` → 422: DrawingID - Value is required
- `{"DrawingID":2916}` → 422: FileName - Value is required
- `{"JobNumber":"TESTTEST"}` → 422: DrawingID - Value is required

**Gotchas:**

- Needs `DrawingID` and `FileName`. No reply showed file names, so it was not completed. It returns file content, so expect a large reply.

### `GetDocument`

**Status:** ⚠️ refused

**Purpose.** Fetches a document from PowerFab's document index.

**Best attempt:**

```json
{"JobNumber":"TESTTEST"}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: Document index base directory has not been set.
- `{"JobNumber":"TESTTEST"}` → 422: Document index base directory has not been set.

**Gotchas:**

- Server says "Document index base directory has not been set." A PowerFab setting, not an API problem.

### `GetTransmittalDetails`

**Status:** ✅ data

**Purpose.** Drawing transmittals: number, date, recipient, title, items, purpose, print counts, return date.

**Request that worked:**

```json
{"JobNumber":"EPM-001"}
```

**Result:** HTTP 200, 3,313 bytes, 128 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `JobNumber` | text | 1 | `EPM-001` |
| `Transmittals` | object | 1 |  |
| `Transmittals.Transmittal` | list (5–5) | 1 |  |
| `Transmittals.Transmittal[].TransmittalID` | number (as text) | 5 | `1`, `3` |
| `Transmittals.Transmittal[].TransmittalNumber` | number (as text) | 5 | `10001`, `10002` |
| `Transmittals.Transmittal[].TransmittalDate` | text | 5 | `2020-08-05`, `2020-08-21` |
| `Transmittals.Transmittal[].JobNumber` | text | 5 | `EPM-001` |
| `Transmittals.Transmittal[].Recipient` | object | 5 |  |
| `Transmittals.Transmittal[].Recipient.Name` | text | 5 | `Tekla EPM - Client`, `Detailer` |
| `Transmittals.Transmittal[].Recipient.Address1` | text | 5 | `<redacted>`, `<redacted>` |
| `Transmittals.Transmittal[].Recipient.Address2` | text | 3 | `<redacted>` |
| `Transmittals.Transmittal[].Recipient.City` | text | 5 | `<redacted>` |
| `Transmittals.Transmittal[].Recipient.State` | text | 5 | `GA` |
| `Transmittals.Transmittal[].Recipient.Zip` | number (as text) | 3 | `<redacted>` |
| `Transmittals.Transmittal[].Recipient.Phone` | text | 3 | `<redacted>` |
| `Transmittals.Transmittal[].Recipient.Attn` | text | 5 | `<redacted>`, `<redacted>` |
| `Transmittals.Transmittal[].Title` | text | 5 | `Sequence 1`, `Sequence 2` |
| `Transmittals.Transmittal[].Sending` | text | 5 | `Enclosed` |
| `Transmittals.Transmittal[].Type` | text | 5 | `To Be Returned` |
| `Transmittals.Transmittal[].TransmittalItem` | list (2–3) of text | 5 | `Erection Drawings`, `Shop Drawings` |
| `Transmittals.Transmittal[].TransmittalPurpose` | text | 5 | `For Approval`, `Scrub & Release For Production` |
| `Transmittals.Transmittal[].NumberOfPrints` | number (as text) | 5 | `147`, `134` |
| `Transmittals.Transmittal[].PrintsToReturn` | number (as text) | 5 | `147`, `134` |
| `Transmittals.Transmittal[].NumberOfSets` | number (as text) | 5 | `0` |
| `Transmittals.Transmittal[].ReturnDate` | text | 5 | `2020-08-19`, `2020-08-26` |
| `Transmittals.Transmittal[].SentVia` | text | 5 | `E-mail` |
| `Transmittals.Transmittal[].NumberOfDrawings` | number (as text) | 5 | `147`, `134` |
| `Transmittals.Transmittal[].NumberOfOutstandingDrawings` | number (as text) | 5 | `0`, `134` |
| `Transmittals.Transmittal[].LastDateReceived` | text | 3 | `2020-08-21`, `2020-08-28` |
| `Transmittals.Transmittal[].Outstanding` | number (as text) | 2 | `1` |
| `Transmittals.Transmittal[].Overdue` | number (as text) | 2 | `1` |

**Sample** (trimmed; full trimmed sample in [samples/GetTransmittalDetails.json](samples/GetTransmittalDetails.json)):

```json
{
  "Transmittals": {
    "Transmittal": [
      {
        "TransmittalID": "1",
        "TransmittalNumber": "10001",
        "TransmittalDate": "2020-08-05",
        "JobNumber": "EPM-001",
        "Recipient": {
          "Name": "Tekla EPM - Client",
          "Address1": "<redacted>",
          "Address2": "<redacted>",
          "City": "<redacted>",
          "State": "GA",
          "Zip": "<redacted>",
          "Phone": "<redacted>",
          "Attn": "<redacted>"
        },
        "Title": "Sequence 1",
        "Sending": "Enclosed",
        "Type": "To Be Returned",
        "TransmittalItem": [
          "Erection Drawings",
          "… 2 more"
        ],
        "TransmittalPurpose": "For Approval",
        "NumberOfPrints": "147",
        "PrintsToReturn": "147",
        "NumberOfSets": "0",
        "ReturnDate": "2020-08-19",
  …
```

**Gotchas:**

- Recipient address and phone are in the reply; masked in the sample.

### `Transmittal_Get`

**Status:** ⛔ permission denied

**Purpose.** Newer transmittal read.

**Best attempt:**

```json
{"JobNumber":"TESTTEST"}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: Permission denied.
- `{"JobNumber":"TESTTEST"}` → 422: Permission denied.

**Gotchas:**

- PowerFab answered "Permission denied." for the API user (the PowerFab External User the service logs in as).

### `GetRFIDetails`

**Status:** ✅ data

**Purpose.** RFIs on the job: number, date, subject, body, status, overdue flag, originator and recipient.

**Request that worked:**

```json
{"JobNumber":"EPM-001"}
```

**Result:** HTTP 200, 641 bytes, 106 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `JobNumber` | text | 1 | `EPM-001` |
| `RFIs` | object | 1 |  |
| `RFIs.RFI` | object | 1 |  |
| `RFIs.RFI.RequestForInformationID` | number (as text) | 1 | `1` |
| `RFIs.RFI.RFINumber` | number (as text) | 1 | `1` |
| `RFIs.RFI.RFIDate` | text | 1 | `2020-08-13` |
| `RFIs.RFI.JobNumber` | text | 1 | `EPM-001` |
| `RFIs.RFI.Subject` | text | 1 | `Material Not Called Out` |
| `RFIs.RFI.Body` | text | 1 | `Please define material required between ` |
| `RFIs.RFI.ResponseRequestedBy` | text | 1 | `2020-08-17` |
| `RFIs.RFI.Outstanding` | number (as text) | 1 | `1` |
| `RFIs.RFI.Overdue` | number (as text) | 1 | `1` |
| `RFIs.RFI.Status` | text | 1 | `Open` |
| `RFIs.RFI.Originator` | object | 1 |  |
| `RFIs.RFI.Originator.FirmType` | text | 1 | `My Company` |
| `RFIs.RFI.Originator.Firm` | text | 1 | `My Company` |
| `RFIs.RFI.Originator.Contact` | text | 1 | `Administrator` |
| `RFIs.RFI.Recipient` | object | 1 |  |
| `RFIs.RFI.Recipient.FirmType` | text | 1 | `Client` |
| `RFIs.RFI.Recipient.Firm` | text | 1 | `Tekla EPM - Client` |
| `RFIs.RFI.Recipient.Contact` | text | 1 | `Project Manager` |
| `RFIs.RFI.Recipient.RFINumber` | number (as text) | 1 | `27` |
| `RFIs.RFI.Recipient.DateSent` | text | 1 | `2020-08-13` |
| `RFIs.RFI.Recipient.SentVia` | text | 1 | `E-mail` |

**Sample** (trimmed; full trimmed sample in [samples/GetRFIDetails.json](samples/GetRFIDetails.json)):

```json
{
  "RFIs": {
    "RFI": {
      "RequestForInformationID": "1",
      "RFINumber": "1",
      "RFIDate": "2020-08-13",
      "JobNumber": "EPM-001",
      "Subject": "Material Not Called Out",
      "Body": "Please define material required between J & K and 1 & 2 at t…",
      "ResponseRequestedBy": "2020-08-17",
      "Outstanding": "1",
      "Overdue": "1",
      "Status": "Open",
      "Originator": {
        "FirmType": "My Company",
        "Firm": "My Company",
        "Contact": "Administrator"
      },
      "Recipient": {
        "FirmType": "Client",
        "Firm": "Tekla EPM - Client",
        "Contact": "Project Manager",
        "RFINumber": "27",
        "DateSent": "2020-08-13",
        "SentVia": "E-mail"
      }
    }
  }
}
```

### `GetChangeOrderDetails`

**Status:** ✅ data

**Purpose.** Change orders: number, date, firm, subject, description, cost and days added, approval.

**Request that worked:**

```json
{"JobNumber":"EPM-001"}
```

**Result:** HTTP 200, 703 bytes, 78 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `JobNumber` | text | 1 | `EPM-001` |
| `ChangeOrders` | object | 1 |  |
| `ChangeOrders.ChangeOrder` | object | 1 |  |
| `ChangeOrders.ChangeOrder.ChangeOrderID` | number (as text) | 1 | `1` |
| `ChangeOrders.ChangeOrder.ChangeOrderNumber` | number (as text) | 1 | `1` |
| `ChangeOrders.ChangeOrder.ChangeOrderDate` | text | 1 | `2020-08-18` |
| `ChangeOrders.ChangeOrder.JobNumber` | text | 1 | `EPM-001` |
| `ChangeOrders.ChangeOrder.Firm` | text | 1 | `Tekla EPM - Client` |
| `ChangeOrders.ChangeOrder.FirmContact` | text | 1 | `Project Manager` |
| `ChangeOrders.ChangeOrder.Subject` | text | 1 | `Cost Due to RFI Response 0027` |
| `ChangeOrders.ChangeOrder.DescriptionOfChange` | text | 1 | `Added materials not previously called ou` |
| `ChangeOrders.ChangeOrder.ChangeAdded` | object | 1 |  |
| `ChangeOrders.ChangeOrder.ChangeAdded.@Units` | text | 1 | `Calendar Days` |
| `ChangeOrders.ChangeOrder.ChangeAdded.#text` | number (as text) | 1 | `2` |
| `ChangeOrders.ChangeOrder.ChangeCauseAmount` | object | 1 |  |
| `ChangeOrders.ChangeOrder.ChangeCauseAmount.@Currency` | text | 1 | `USD` |
| `ChangeOrders.ChangeOrder.ChangeCauseAmount.#text` | number (as text) | 1 | `11750` |
| `ChangeOrders.ChangeOrder.ChangeRequestedBy` | text | 1 | `GC RFI 27` |
| `ChangeOrders.ChangeOrder.ResponseRequestedBy` | text | 1 | `2020-08-19` |
| `ChangeOrders.ChangeOrder.ResponseReceivedOn` | text | 1 | `2020-08-27` |
| `ChangeOrders.ChangeOrder.Approved` | number (as text) | 1 | `1` |
| `ChangeOrders.ChangeOrder.SentVia` | text | 1 | `E-mail` |
| `ChangeOrders.ChangeOrder.Author` | text | 1 | `Administrator` |
| `ChangeOrders.ChangeOrder.ContractItem` | text | 1 | `CO #1` |

**Sample** (trimmed; full trimmed sample in [samples/GetChangeOrderDetails.json](samples/GetChangeOrderDetails.json)):

```json
{
  "ChangeOrders": {
    "ChangeOrder": {
      "ChangeOrderID": "1",
      "ChangeOrderNumber": "1",
      "ChangeOrderDate": "2020-08-18",
      "JobNumber": "EPM-001",
      "Firm": "Tekla EPM - Client",
      "FirmContact": "Project Manager",
      "Subject": "Cost Due to RFI Response 0027",
      "DescriptionOfChange": "Added materials not previously called out in design.  See BO…",
      "ChangeAdded": {
        "@Units": "Calendar Days",
        "#text": "2"
      },
      "ChangeCauseAmount": {
        "@Currency": "USD",
        "#text": "11750"
      },
      "ChangeRequestedBy": "GC RFI 27",
      "ResponseRequestedBy": "2020-08-19",
      "ResponseReceivedOn": "2020-08-27",
      "Approved": "1",
      "SentVia": "E-mail",
      "Author": "Administrator",
      "ContractItem": "CO #1"
    }
  }
}
```

## Write commands

Run on the test jobs only (EPM-001, TESTTEST), each change undone afterwards. "Not run" means no request was sent; those purposes come from the command name and Tekla's reference.

| Command | Status | What it does |
|---|---|---|
| [`Drawing_Insert`](#drawing_insert) | ✅ data | Creates a Drawing record (from the name). |
| [`Drawing_Update`](#drawing_update) | ✅ data | Edits a Drawing record (from the name). |
| [`Drawing_Delete`](#drawing_delete) | ✅ data | Deletes a Drawing record (from the name). |
| [`DrawingRevision_Insert`](#drawingrevision_insert) | ✅ data | Creates a DrawingRevision record (from the name). |
| [`DrawingRevision_Update`](#drawingrevision_update) | ✅ data | Edits a DrawingRevision record (from the name). |
| [`DrawingRevision_Delete`](#drawingrevision_delete) | ✅ data | Deletes a DrawingRevision record (from the name). |
| [`DrawingLog_Insert`](#drawinglog_insert) | ⚠️ refused | Creates a DrawingLog record (from the name). |
| [`DrawingLog_Update`](#drawinglog_update) | ⚠️ refused | Edits a DrawingLog record (from the name). |
| [`DrawingLog_Delete`](#drawinglog_delete) | ⚠️ refused | Deletes a DrawingLog record (from the name). |
| [`ProductionControlFinish_Insert`](#productioncontrolfinish_insert) | ⏸ not run | Creates a ProductionControlFinish record (from the name). |
| [`ProductionControlFinish_Update`](#productioncontrolfinish_update) | ⏸ not run | Edits a ProductionControlFinish record (from the name). |
| [`ProductionControlFinish_Delete`](#productioncontrolfinish_delete) | ⏸ not run | Deletes a ProductionControlFinish record (from the name). |

### `Drawing_Insert`

**Status:** ✅ worked

**What it does.** Creates a drawing.

**Request that worked:**

```json
{"ProjectID":4,"DrawingLogID":24,"DrawingNumberDisplay":"WIKI-1","Description":"wiki test drawing"}
```

**Reply** (trimmed; [samples/Drawing_Insert.json](samples/Drawing_Insert.json)):

```json
{
  "Drawing": {
    "DrawingID": "12277",
    "ProjectID": "4",
    "DrawingLogID": "24",
    "DrawingNumberDisplay": "WIKI-1",
    "Description": "wiki test drawing",
    "DetailingHours": "0",
    "ReSubmit": "0"
  }
}
```

**Attempts:**

- `{"ProjectID":4}` → 422: DrawingLogID - Value is required
- `{"ProjectID":4,"DrawingLogID":24,"DrawingNumber":"WIKI-1","Description":"wiki test drawing"}` → 422: DrawingNumberDisplay - Value is required
- `{"ProjectID":4,"DrawingLogID":24,"DrawingNumberDisplay":"WIKI-1","Description":"wiki test drawing"}` → 200: accepted

**Gotchas:**

- Required: `ProjectID`, `DrawingLogID`, `DrawingNumberDisplay`. `DrawingNumber` is not accepted. Worked in drawing log 24 of EPM-001.

### `Drawing_Update`

**Status:** ✅ worked

**What it does.** Edits a drawing.

**Request that worked:**

```json
{"ProjectID":4,"DrawingID":"12277","Description":"wiki test drawing 2"}
```

**Reply** (trimmed; [samples/Drawing_Update.json](samples/Drawing_Update.json)):

```json
{
  "Drawing": {
    "DrawingID": "12277",
    "ProjectID": "4",
    "DrawingLogID": "24",
    "DrawingNumberDisplay": "WIKI-1",
    "Description": "wiki test drawing 2",
    "DetailingHours": "0",
    "ReSubmit": "0"
  }
}
```

**Attempts:**

- `{}` → 422: ProjectID - Value is required
- `{"ProjectID":4,"DrawingID":"12277","Description":"wiki test drawing 2"}` → 200: accepted

**Gotchas:**

- Needs `ProjectID` and `DrawingID`; `Description` changed.

### `Drawing_Delete`

**Status:** ✅ worked

**What it does.** Deletes a drawing.

**Request that worked:**

```json
{"DrawingID":"12277"}
```

**Reply** (trimmed; [samples/Drawing_Delete.json](samples/Drawing_Delete.json)):

```json
{
  "Drawing": {
    "DrawingID": "12277",
    "ProjectID": "4",
    "DrawingLogID": "24",
    "DrawingNumberDisplay": "WIKI-1",
    "Description": "wiki test drawing 2",
    "DetailingHours": "0",
    "ReSubmit": "0"
  }
}
```

**Attempts:**

- `{}` → 422: DrawingID - Value is required
- `{"DrawingID":"12277"}` → 200: accepted

**Gotchas:**

- Needs `DrawingID`. Returns the deleted drawing.

### `DrawingRevision_Insert`

**Status:** ✅ worked

**What it does.** Adds a revision to a drawing.

**Request that worked:**

```json
{"DrawingID":"12277"}
```

**Reply** (trimmed; [samples/DrawingRevision_Insert.json](samples/DrawingRevision_Insert.json)):

```json
{
  "DrawingRevision": {
    "DrawingRevisionID": "2146",
    "DrawingID": "12277",
    "Revision": "1",
    "DateRevised": "2026-10-20",
    "Latest": "1"
  }
}
```

**Attempts:**

- `{"DrawingID":2916}` → 200: accepted
- `{"DrawingID":"12277"}` → 200: accepted

**Gotchas:**

- Needs `DrawingID`. The new revision is numbered by PowerFab (`Revision` "1", `Latest` "1", dated today).

### `DrawingRevision_Update`

**Status:** ✅ worked

**What it does.** Edits a revision.

**Request that worked:**

```json
{"DrawingRevisionID":"2146","Revision":"A"}
```

**Reply** (trimmed; [samples/DrawingRevision_Update.json](samples/DrawingRevision_Update.json)):

```json
{
  "DrawingRevision": {
    "DrawingRevisionID": "2146",
    "DrawingID": "12277",
    "Revision": "A",
    "DateRevised": "2026-10-20",
    "Latest": "1"
  }
}
```

**Attempts:**

- `{}` → 422: DrawingRevisionID - Value is required
- `{"DrawingRevisionID":"2146","Revision":"A"}` → 200: accepted

**Gotchas:**

- Needs `DrawingRevisionID`; `Revision` changed to "A".

### `DrawingRevision_Delete`

**Status:** ✅ worked

**What it does.** Deletes a revision.

**Request that worked:**

```json
{"DrawingRevisionID":"2146"}
```

**Reply** (trimmed; [samples/DrawingRevision_Delete.json](samples/DrawingRevision_Delete.json)):

```json
{
  "DrawingRevision": {
    "DrawingRevisionID": "2146",
    "DrawingID": "12277",
    "Revision": "A",
    "DateRevised": "2026-10-20",
    "Latest": "1"
  }
}
```

**Attempts:**

- `{}` → 422: DrawingRevisionID - Value is required
- `{"DrawingRevisionID":"2146"}` → 200: accepted

**Gotchas:**

- Needs `DrawingRevisionID`. Returns the deleted revision.

### `DrawingLog_Insert`

**Status:** ⚠️ refused

**What it does.** Creates a drawing log.

**Attempts:**

- `{"ProjectID":4}` → 422: DrawingType - Value is required
- `{"ProjectID":4,"DrawingType":"Detail","DrawingLogName":"WIKI test log"}` → 422: PDCLink - Value is required
- `{"ProjectID":4,"DrawingType":"Detail","DrawingLogName":"WIKI test log","PDCLink":0}` → 422: SubdirectoryPath - Value is required
- `{"ProjectID":4,"DrawingType":"Detail","DrawingLogName":"WIKI test log","PDCLink":0,"SubdirectoryPath":"WIKI test log"}` → 422: Permission denied.

**Gotchas:**

- Asked for, one at a time: `DrawingType`, `PDCLink`, `SubdirectoryPath`. With all of them the next attempt answered `Permission denied.`

### `DrawingLog_Update`

**Status:** ⚠️ refused

**What it does.** Edits a DrawingLog record (from the name).

**Attempts:**

- `{}` → 422: DrawingLog - Element is required

### `DrawingLog_Delete`

**Status:** ⚠️ refused

**What it does.** Deletes a DrawingLog record (from the name).

**Attempts:**

- `{}` → 422: DrawingLogID - Value is required

### `ProductionControlFinish_Insert`

**Status:** ⏸ not run

**What it does.** Creates a ProductionControlFinish record (from the name).

### `ProductionControlFinish_Update`

**Status:** ⏸ not run

**What it does.** Edits a ProductionControlFinish record (from the name).

### `ProductionControlFinish_Delete`

**Status:** ⏸ not run

**What it does.** Deletes a ProductionControlFinish record (from the name).
