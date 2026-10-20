# Loads and shipping

The commands behind terra-loads-web. **EPM-001 has no loads at all** (`MaxTruck` is empty and
`NextAvailableLoadNumber` is 1), so the load samples here come from job 25-351, the only job on the server with
trucks. Those samples contain marks, quantities, weights and dates only; nothing in them names a customer or person.
There are two ways to read loads: the older `GetLoads` (by JobNumber, units on every value) and the newer
`ProductionControlLoad_Get` (by ProductionControlID, more fields, metric numbers with no unit).

[← Back to the index](README.md)

## Read commands

| Command | Status | Answers |
|---|---|---|
| [`GetLoads`](#getloads) | ✅ data | What is on each truck, and what is left to ship? |
| [`ProductionControlLoad_Get`](#productioncontrolload_get) | ✅ data | What are a truck's totals and who loaded what, when? |
| [`ProductionControlLoadRemaining_Get`](#productioncontrolloadremaining_get) | ✅ data | What still has to ship, with full piece details? |
| [`MaxTruck`](#maxtruck) | ✅ data | What is the next load number, and which load fields are required? |
| [`ProductionControlLoad_InputOptions_Get`](#productioncontrolload_inputoptions_get) | ✅ data |  |
| [`ProductionControlLoad_IsDuplicateLoadNumber`](#productioncontrolload_isduplicateloadnumber) | ✅ data | Is this truck number already taken? |
| [`ValTruck`](#valtruck) | ⚠️ refused |  |
| [`GetProductionShippingStatus`](#getproductionshippingstatus) | ✅ data | How far along is a job in production and shipping? |
| [`ProductionShippingProductivity_Get`](#productionshippingproductivity_get) | ⚠️ refused |  |

### `GetLoads`

**Status:** ✅ data

**Purpose.** Loads (trucks) on a job with what is assigned and loaded on each, plus the material still to ship.

**Answers:** What is on each truck, and what is left to ship?

**Request that worked:**

```json
{"JobNumber":"25-351","IncludeLoads":true,"IncludeUnshippedLoads":true,"IncludeCompletedMaterial":true,"IncludeRemainingMaterial":true}
```

**Result:** HTTP 200, 418,887 bytes.

_This reply is from an earlier run. The API user can no longer read this job, so the field table is built from the trimmed sample (first 3 items of each list)._

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `ProductionControlID` | number (as text) | 1 | `80` |
| `JobNumber` | text | 1 | `25-351` |
| `InputDisplayUnits` | object | 1 | common block, see README |
| `Destination` | object | 1 |  |
| `Destination.DestinationName` | text | 1 | `Jobsite` |
| `Destination.Load` | list (3–3) | 1 |  |
| `Destination.Load[].LoadNumber` | number (as text) | 3 | `1`, `2` |
| `Destination.Load[].ShippedFromFirm` | text | 3 |  |
| `Destination.Load[].ShippedFromFirmAddress` | text | 3 |  |
| `Destination.Load[].DestinationGroup` | text | 3 |  |
| `Destination.Load[].ShippedToFirmAddress` | text | 3 |  |
| `Destination.Load[].TrailerNumber` | text | 3 |  |
| `Destination.Load[].Carrier` | text | 3 |  |
| `Destination.Load[].Capacity` | object | 3 |  |
| `Destination.Load[].Capacity.@UOM` | text | 3 | `kg` |
| `Destination.Load[].Capacity.#text` | number (as text) | 3 | `19958.06428` |
| `Destination.Load[].DateShipped` | text | 2 | `2026-09-30`, `2026-10-13` |
| `Destination.Load[].AssignedQuantity` | number (as text) | 3 | `48`, `49` |
| `Destination.Load[].AssignedWeight` | object | 3 |  |
| `Destination.Load[].AssignedWeight.@UOM` | text | 3 | `kg` |
| `Destination.Load[].AssignedWeight.#text` | number (as text) | 3 | `16225.8763078766`, `13719.6527571285` |
| `Destination.Load[].LoadedQuantity` | number (as text) | 3 | `48`, `49` |
| `Destination.Load[].LoadedWeight` | object | 3 |  |
| `Destination.Load[].LoadedWeight.@UOM` | text | 3 | `kg` |
| `Destination.Load[].LoadedWeight.#text` | number (as text) | 3 | `16225.8763078766`, `13719.6527571285` |
| `Destination.Load[].Material` | list (3–3) | 3 |  |
| `Destination.Load[].Material[].MainMark` | number (as text) | 9 | `52312005`, `52312007` |
| `Destination.Load[].Material[].PieceMark` | number (as text) | 9 | `52312005`, `52312007` |
| `Destination.Load[].Material[].Sequence` | number (as text) | 9 | `5231`, `5232` |
| `Destination.Load[].Material[].LotNumber` | text | 9 |  |
| `Destination.Load[].Material[].AssignedQuantity` | number (as text) | 9 | `1`, `7` |
| `Destination.Load[].Material[].AssignedWeight` | object | 9 |  |
| `Destination.Load[].Material[].AssignedWeight.@UOM` | text | 9 | `kg` |
| `Destination.Load[].Material[].AssignedWeight.#text` | number (as text) | 9 | `273.318602441639`, `307.621525422889` |
| `Destination.Load[].Material[].LoadedQuantity` | number (as text) | 9 | `1`, `7` |
| `Destination.Load[].Material[].LoadedWeight` | object | 9 |  |
| `Destination.Load[].Material[].LoadedWeight.@UOM` | text | 9 | `kg` |
| `Destination.Load[].Material[].LoadedWeight.#text` | number (as text) | 9 | `273.318602441639`, `307.621525422889` |
| `Destination.Load[].Material[].QuantityAtLocation` | number (as text) | 9 | `1`, `7` |
| `Destination.Load[].Material[].DrawingNumber` | number (as text) | 9 | `52312005`, `52312007` |
| `Destination.Load[].Material[].DrawingRevision` | number (as text) | 9 | `0` |
| `Destination.Load[].Material[].Shape` | text | 9 | `W` |
| `Destination.Load[].Material[].Dimensions` | object | 9 |  |
| `Destination.Load[].Material[].Dimensions.@Metric` | number (as text) | 9 | `0` |
| `Destination.Load[].Material[].Dimensions.#text` | text | 9 | `10 x 33`, `8 x 35` |
| `Destination.Load[].Material[].Length` | object | 9 |  |
| `Destination.Load[].Material[].Length.@UOM` | text | 9 | `in` |
| `Destination.Load[].Material[].Length.#text` | number (as text) | 9 | `208.25`, `235.75` |
| `Destination.Load[].Material[].ShippingLength` | object | 9 |  |
| `Destination.Load[].Material[].ShippingLength.@UOM` | text | 9 | `in` |
| `Destination.Load[].Material[].ShippingLength.#text` | number (as text) | 9 | `208.25`, `235.75` |
| `Destination.Load[].Material[].Grade` | text | 9 | `A992` |
| `Destination.Load[].Material[].Finish` | text | 9 | `3-1` |
| `Destination.Remaining` | object | 1 |  |
| `Destination.Remaining.MaterialRemaining` | list (3–3) | 1 |  |
| `Destination.Remaining.MaterialRemaining[].MainMark` | number (as text) | 3 | `52311004`, `52311005` |
| `Destination.Remaining.MaterialRemaining[].PieceMark` | number (as text) | 3 | `52311004`, `52311005` |
| `Destination.Remaining.MaterialRemaining[].Sequence` | number (as text) | 3 | `5231` |
| `Destination.Remaining.MaterialRemaining[].LotNumber` | text | 3 |  |
| `Destination.Remaining.MaterialRemaining[].TotalQuantity` | number (as text) | 3 | `1`, `10` |
| … | | | 18 more fields in the sample file |

**Sample** (trimmed; full trimmed sample in [samples/GetLoads.json](samples/GetLoads.json)):

```json
{
  "Destination": {
    "DestinationName": "Jobsite",
    "Load": [
      {
        "LoadNumber": "1",
        "ShippedFromFirm": "",
        "ShippedFromFirmAddress": "",
        "DestinationGroup": "",
        "ShippedToFirmAddress": "",
        "TrailerNumber": "",
        "Carrier": "",
        "Capacity": {
          "@UOM": "kg",
          "#text": "19958.06428"
        },
        "DateShipped": "2026-09-30",
        "AssignedQuantity": "48",
        "AssignedWeight": {
          "@UOM": "kg",
          "#text": "16225.8763078766"
        },
        "LoadedQuantity": "48",
        "LoadedWeight": {
          "@UOM": "kg",
          "#text": "16225.8763078766"
        },
        "Material": [
          {
            "MainMark": "52312005",
  …
```

**Gotchas:**

- **Send all four Include flags.** With only `JobNumber` the reply has the destination name and nothing else. On EPM-001 even the full request is empty because the job has no loads; the sample is from 25-351.
- Loads sit under `Destination.Load`, not at the top. Each has `LoadNumber` (the truck number), `AssignedQuantity` and `LoadedQuantity`; `DateShipped` is present **only on shipped loads**.
- Pieces are `Material[]` with `MainMark`, `PieceMark`, `Sequence`, `AssignedQuantity`, `LoadedQuantity`, `QuantityAtLocation`. Assigned = planned for this truck, Loaded = actually put on.
- Unshipped material is `Destination.Remaining.MaterialRemaining[]` with `TotalQuantity` and `Quantity` (still to ship).
- Weights, lengths and capacity are `{"@UOM":"kg","#text":"…"}` / `{"@UOM":"in",…}`. Weight is kg, length is inches, regardless of `InputDisplayUnits`. Read `#text`.
- Each `Material` row is one mark on one truck with a quantity, not one row per piece. A mark with quantity 5 is one row.

### `ProductionControlLoad_Get`

**Status:** ✅ data

**Purpose.** Newer load read: every load on a job with totals (quantity, length, weight, gross/model weight, surface area), ship status and, with `IncludeMaterial`, each piece with its item IDs, drawing IDs and load history.

**Answers:** What are a truck's totals and who loaded what, when?

**Request that worked:**

```json
{"ProductionControlID":80,"GetOptions":{"IncludeJobDetails":1,"IncludeMaterial":1}}
```

**Result:** HTTP 200, 147,506 bytes.

_This reply is from an earlier run. The API user can no longer read this job, so the field table is built from the trimmed sample (first 3 items of each list)._

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `ResultData` | object | 1 |  |
| `ResultData.LastLogID` | text | 1 | `689,783` |
| `ResultData.GetOptions` | object | 1 |  |
| `ResultData.GetOptions.IncludeJobDetails` | number (as text) | 1 | `1` |
| `ResultData.GetOptions.IncludeFirmDetails` | number (as text) | 1 | `0` |
| `ResultData.GetOptions.IncludeMaterial` | number (as text) | 1 | `1` |
| `ResultData.GetOptions.IncludeAttachedFiles` | number (as text) | 1 | `0` |
| `ResultData.ProductionControlLoad` | list (3–3) | 1 |  |
| `ResultData.ProductionControlLoad[].ProductionControlLoadID` | number (as text) | 3 | `388`, `389` |
| `ResultData.ProductionControlLoad[].ProductionControlID` | number (as text) | 3 | `80` |
| `ResultData.ProductionControlLoad[].LoadNumber` | number (as text) | 3 | `1`, `2` |
| `ResultData.ProductionControlLoad[].Capacity` | number (as text) | 3 | `19958.06428` |
| `ResultData.ProductionControlLoad[].LoadCategory1` | number (as text) | 3 | `5231`, `5232` |
| `ResultData.ProductionControlLoad[].ShippingDestinationGroupID` | text | 3 |  |
| `ResultData.ProductionControlLoad[].ShippedFromFirmID` | text | 3 |  |
| `ResultData.ProductionControlLoad[].ShippedToFirmID` | text | 3 |  |
| `ResultData.ProductionControlLoad[].Shipped` | number (as text) | 3 | `1`, `0` |
| `ResultData.ProductionControlLoad[].ShippedDate` | text | 2 | `2026-09-30`, `2026-10-13` |
| `ResultData.ProductionControlLoad[].QuantityAssigned` | number (as text) | 3 | `48`, `49` |
| `ResultData.ProductionControlLoad[].AssignedLength` | number (as text) | 3 | `377368.5547`, `315501.9685` |
| `ResultData.ProductionControlLoad[].AssignedSquareMeters` | number (as text) | 3 | `12.33121418`, `19.4049002` |
| `ResultData.ProductionControlLoad[].AssignedWeight` | number (as text) | 3 | `16225.87631`, `13719.65276` |
| `ResultData.ProductionControlLoad[].AssignedGrossWeight` | number (as text) | 3 | `16225.87631`, `13719.65276` |
| `ResultData.ProductionControlLoad[].AssignedModelWeight` | number (as text) | 3 | `16225.87631`, `13719.65276` |
| `ResultData.ProductionControlLoad[].AssignedSurfaceArea` | number (as text) | 3 | `422.7846649`, `330.1788763` |
| `ResultData.ProductionControlLoad[].QuantityLoaded` | number (as text) | 3 | `48`, `49` |
| `ResultData.ProductionControlLoad[].LoadedLength` | number (as text) | 3 | `377368.5547`, `315501.9685` |
| `ResultData.ProductionControlLoad[].LoadedSquareMeters` | number (as text) | 3 | `12.33121418`, `19.4049002` |
| `ResultData.ProductionControlLoad[].LoadedWeight` | number (as text) | 3 | `16225.87631`, `13719.65276` |
| `ResultData.ProductionControlLoad[].LoadedGrossWeight` | number (as text) | 3 | `16225.87631`, `13719.65276` |
| `ResultData.ProductionControlLoad[].LoadedModelWeight` | number (as text) | 3 | `16225.87631`, `13719.65276` |
| `ResultData.ProductionControlLoad[].LoadedSurfaceArea` | number (as text) | 3 | `422.7846649`, `330.1788763` |
| `ResultData.ProductionControlLoad[].Material` | list (3–3) | 3 |  |
| `ResultData.ProductionControlLoad[].Material[].ProductionControlItemTruckID` | number (as text) | 9 | `306`, `325` |
| `ResultData.ProductionControlLoad[].Material[].ProductionControlItemID` | number (as text) | 9 | `50728`, `50734` |
| `ResultData.ProductionControlLoad[].Material[].ProductionControlID` | number (as text) | 9 | `80` |
| `ResultData.ProductionControlLoad[].Material[].DrawingNumberDisplay` | number (as text) | 9 | `52312005`, `52312007` |
| `ResultData.ProductionControlLoad[].Material[].MainMarkDisplay` | number (as text) | 9 | `52312005`, `52312007` |
| `ResultData.ProductionControlLoad[].Material[].PieceMarkDisplay` | number (as text) | 9 | `52312005`, `52312007` |
| `ResultData.ProductionControlLoad[].Material[].MainPiece` | number (as text) | 9 | `1` |
| `ResultData.ProductionControlLoad[].Material[].SequenceDisplay` | number (as text) | 9 | `5231`, `5232` |
| `ResultData.ProductionControlLoad[].Material[].LotNumberDisplay` | text | 9 |  |
| `ResultData.ProductionControlLoad[].Material[].DrawingID` | number (as text) | 9 | `11765`, `11767` |
| `ResultData.ProductionControlLoad[].Material[].AssemblyDrawingID` | number (as text) | 9 | `11765`, `11767` |
| `ResultData.ProductionControlLoad[].Material[].PartDrawingID` | number (as text) | 9 | `11765`, `11767` |
| `ResultData.ProductionControlLoad[].Material[].ShippingLength` | number (as text) | 9 | `5289.560579`, `5988.061976` |
| `ResultData.ProductionControlLoad[].Material[].ShippingWeightEach` | number (as text) | 9 | `273.3186024`, `307.6215254` |
| `ResultData.ProductionControlLoad[].Material[].ShippingGrossWeightEach` | number (as text) | 9 | `273.3186024`, `307.6215254` |
| `ResultData.ProductionControlLoad[].Material[].ShippingModelWeightEach` | number (as text) | 9 | `273.3186024`, `307.6215254` |
| `ResultData.ProductionControlLoad[].Material[].ShippingSurfaceAreaEach` | number (as text) | 9 | `7.165459492`, `8.06533226` |
| `ResultData.ProductionControlLoad[].Material[].ShippingSquareMetersEach` | number (as text) | 9 | `0.1521575624`, `0.3757971226` |
| `ResultData.ProductionControlLoad[].Material[].ApprovalStatus` | text | 9 |  |
| `ResultData.ProductionControlLoad[].Material[].Quantity` | number (as text) | 9 | `1`, `7` |
| `ResultData.ProductionControlLoad[].Material[].QuantityLoaded` | number (as text) | 9 | `1`, `7` |
| `ResultData.ProductionControlLoad[].Material[].Loaded` | object or list | 9 |  |
| `ResultData.ProductionControlLoad[].Material[].Loaded.ID` | number (as text) | 7 | `306`, `325` |
| `ResultData.ProductionControlLoad[].Material[].Loaded.Date` | text | 7 | `2026-10-01`, `2026-10-09` |
| `ResultData.ProductionControlLoad[].Material[].Loaded.Quantity` | number (as text) | 7 | `1`, `3` |
| `ResultData.ProductionControlLoad[].Material[].QuantityAtLocation` | number (as text) | 6 | `1`, `7` |
| `ResultData.ProductionControlLoad[].Material[].Shape` | object | 9 |  |
| … | | | 38 more fields in the sample file |

**Sample** (trimmed; full trimmed sample in [samples/ProductionControlLoad_Get.json](samples/ProductionControlLoad_Get.json)):

```json
{
  "ProductionControlLoad": [
    {
      "ProductionControlLoadID": "388",
      "ProductionControlID": "80",
      "LoadNumber": "1",
      "Capacity": "19958.06428",
      "LoadCategory1": "5231",
      "ShippingDestinationGroupID": "",
      "ShippedFromFirmID": "",
      "ShippedToFirmID": "",
      "Shipped": "1",
      "ShippedDate": "2026-09-30",
      "QuantityAssigned": "48",
      "AssignedLength": "377368.5547",
      "AssignedSquareMeters": "12.33121418",
      "AssignedWeight": "16225.87631",
      "AssignedGrossWeight": "16225.87631",
      "AssignedModelWeight": "16225.87631",
      "AssignedSurfaceArea": "422.7846649",
      "QuantityLoaded": "48",
      "LoadedLength": "377368.5547",
      "LoadedSquareMeters": "12.33121418",
      "LoadedWeight": "16225.87631",
      "LoadedGrossWeight": "16225.87631",
      "LoadedModelWeight": "16225.87631",
      "LoadedSurfaceArea": "422.7846649",
      "Material": [
        {
          "ProductionControlItemTruckID": "306",
  …
```

**Gotchas:**

- Takes `ProductionControlID`, **not** `JobNumber`. Sending only `JobNumber` silently returned the loads of a different job (25-351), so always pass the ID.
- Numbers here have **no unit attribute** and are metric: weight in kg, length in mm, area in m². `Capacity` 19958.06 kg is 44,000 lb.
- `Shipped` is "1"/"0" and `ShippedDate` appears only when shipped.
- Material carries `ProductionControlItemID`, the stable piece ID, and `Loaded` entries with date and quantity: good for history, but `Loaded` is an object for one entry and a list for several.
- EPM-001 (ProductionControlID 13) has no loads; the sample is 25-351 (ProductionControlID 80).
- One or many: `ResultData.ProductionControlLoad.Material.Loaded` came back as an object in one place and a list in another. Always normalise to a list.

### `ProductionControlLoadRemaining_Get`

**Status:** ✅ data

**Purpose.** Every piece on the job that is not yet shipped, with mark, drawing, sequence, quantity remaining, shape, size, grade, finish, route, category, weight, length and surface area.

**Answers:** What still has to ship, with full piece details?

**Request that worked:**

```json
{"ProductionControlID":13}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: ProductionControlID - Value is required
- `{"ProductionControlID":13}` → 200, 571875 bytes

**Result:** HTTP 200, 571,875 bytes, 862 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `ResultData` | object | 1 |  |
| `ResultData.LastLogID` | text | 1 | `146424,38902` |
| `ResultData.GetOptions` | text | 1 |  |
| `ResultData.ProductionControlLoadRemaining` | list (617–617) | 1 |  |
| `ResultData.ProductionControlLoadRemaining[].ProductionControlItemID` | number (as text) | 617 | `8696`, `8704` |
| `ResultData.ProductionControlLoadRemaining[].ProductionControlID` | number (as text) | 617 | `13` |
| `ResultData.ProductionControlLoadRemaining[].DrawingNumberDisplay` | number (as text) | 617 | `1`, `2` |
| `ResultData.ProductionControlLoadRemaining[].MainMarkDisplay` | text | 617 | `1B1`, `1B2` |
| `ResultData.ProductionControlLoadRemaining[].PieceMarkDisplay` | text | 617 | `1B1`, `1B2` |
| `ResultData.ProductionControlLoadRemaining[].MainPiece` | number (as text) | 617 | `1` |
| `ResultData.ProductionControlLoadRemaining[].SequenceID` | number (as text) | 617 | `25`, `28` |
| `ResultData.ProductionControlLoadRemaining[].SequenceDisplay` | number (as text) | 617 | `1`, `2` |
| `ResultData.ProductionControlLoadRemaining[].DrawingID` | number (as text) | 617 | `2916`, `2917` |
| `ResultData.ProductionControlLoadRemaining[].ShippingLength` | number (as text) | 575 | `8788.417577`, `8794.76759` |
| `ResultData.ProductionControlLoadRemaining[].ShippingLengthEach` | number (as text) | 585 | `11263.33503`, `13201.6764` |
| `ResultData.ProductionControlLoadRemaining[].ShippingWeightEach` | number (as text) | 585 | `797.2516955`, `1094.098917` |
| `ResultData.ProductionControlLoadRemaining[].ShippingGrossWeightEach` | number (as text) | 585 | `798.6380359`, `1096.655422` |
| `ResultData.ProductionControlLoadRemaining[].ShippingModelWeightEach` | number (as text) | 585 | `797.2516955`, `1094.098917` |
| `ResultData.ProductionControlLoadRemaining[].ShippingSurfaceAreaEach` | number (as text) | 585 | `14.64677448`, `18.3173616` |
| `ResultData.ProductionControlLoadRemaining[].ShippingSquareMetersEach` | number (as text) | 148 | `0.2378034695`, `0.5455165476` |
| `ResultData.ProductionControlLoadRemaining[].HoursEach` | number (as text) | 570 | `4.908988784`, `6.636232492` |
| `ResultData.ProductionControlLoadRemaining[].ApprovalStatus` | object | 301 |  |
| `ResultData.ProductionControlLoadRemaining[].ApprovalStatus.@ID` | number (as text) | 301 | `6`, `4` |
| `ResultData.ProductionControlLoadRemaining[].ApprovalStatus.#text` | text | 301 | `IFF`, `P` |
| `ResultData.ProductionControlLoadRemaining[].TotalQuantity` | number (as text) | 617 | `1`, `2` |
| `ResultData.ProductionControlLoadRemaining[].QuantityAtShippedFromAddress` | number (as text) | 617 | `1`, `2` |
| `ResultData.ProductionControlLoadRemaining[].QuantityRemaining` | number (as text) | 617 | `1`, `2` |
| `ResultData.ProductionControlLoadRemaining[].Shape` | object | 617 |  |
| `ResultData.ProductionControlLoadRemaining[].Shape.@ID` | number (as text) | 617 | `9`, `185` |
| `ResultData.ProductionControlLoadRemaining[].Shape.#text` | text | 617 | `W`, `HSS` |
| `ResultData.ProductionControlLoadRemaining[].Grade` | object | 586 |  |
| `ResultData.ProductionControlLoadRemaining[].Grade.@ID` | number (as text) | 586 | `8`, `165` |
| `ResultData.ProductionControlLoadRemaining[].Grade.#text` | text | 586 | `A992`, `A500-B` |
| `ResultData.ProductionControlLoadRemaining[].Dimensions` | object | 617 |  |
| `ResultData.ProductionControlLoadRemaining[].Dimensions.@Metric` | number (as text) | 617 | `0` |
| `ResultData.ProductionControlLoadRemaining[].Dimensions.@SizeID` | number (as text) | 586 | `154`, `152` |
| `ResultData.ProductionControlLoadRemaining[].Dimensions.#text` | text | 617 | `16 x 57`, `16 x 77` |
| `ResultData.ProductionControlLoadRemaining[].Length` | number (as text) | 575 | `8788.417577`, `8794.76759` |
| `ResultData.ProductionControlLoadRemaining[].Finish` | object | 617 |  |
| `ResultData.ProductionControlLoadRemaining[].Finish.@ID` | number (as text) | 617 | `1`, `3` |
| `ResultData.ProductionControlLoadRemaining[].Finish.#text` | text | 617 | `PNT`, `GLV` |
| `ResultData.ProductionControlLoadRemaining[].ReferenceNumber` | text | 301 | `1B1`, `1B2` |
| `ResultData.ProductionControlLoadRemaining[].Route` | object | 617 |  |
| `ResultData.ProductionControlLoadRemaining[].Route.@ID` | number (as text) | 617 | `1`, `2` |
| `ResultData.ProductionControlLoadRemaining[].Route.#text` | text | 617 | `SP`, `SU` |
| `ResultData.ProductionControlLoadRemaining[].Category` | text | 617 | `BEAM`, `COLUMN` |
| `ResultData.ProductionControlLoadRemaining[].SubCategory` | text | 617 | `Phase 1`, `Phase 2` |
| `ResultData.ProductionControlLoadRemaining[].InstanceTracking` | number (as text) | 617 | `0` |
| `ResultData.ProductionControlLoadRemaining[].ProductionCode` | text | 617 | `BFB`, `IFB` |
| `ResultData.ProductionControlLoadRemaining[].AssemblyDrawingID` | number (as text) | 611 | `2923`, `2924` |
| `ResultData.ProductionControlLoadRemaining[].PartDrawingID` | number (as text) | 537 | `3567`, `3568` |
| `ResultData.ProductionControlLoadRemaining[].Remark` | text | 11 | `GC RFI 27` |
| `ResultData.ProductionControlLoadRemaining[].Dimensions.@DimComment` | text | 31 | `24K`, `20K` |
| `ResultData.ProductionControlLoadRemaining[].Dimensions.@DimWidth` | number (as text) | 2 | `301.6256033`, `1600.2032` |
| `ResultData.ProductionControlLoadRemaining[].Dimensions.@TrueShapeSquareMetersOverride` | number (as text) | 1 | `5.78548601` |
| `ResultData.HoldSettings` | object | 1 | common block, see README |

**Sample** (trimmed; full trimmed sample in [samples/ProductionControlLoadRemaining_Get.json](samples/ProductionControlLoadRemaining_Get.json)):

```json
{
  "ProductionControlLoadRemaining": [
    {
      "ProductionControlItemID": "8696",
      "ProductionControlID": "13",
      "DrawingNumberDisplay": "1",
      "MainMarkDisplay": "1B1",
      "PieceMarkDisplay": "1B1",
      "MainPiece": "1",
      "SequenceID": "25",
      "SequenceDisplay": "1",
      "DrawingID": "2916",
      "ShippingLength": "8788.417577",
      "ShippingLengthEach": "11263.33503",
      "ShippingWeightEach": "797.2516955",
      "ShippingGrossWeightEach": "798.6380359",
      "ShippingModelWeightEach": "797.2516955",
      "ShippingSurfaceAreaEach": "14.64677448",
      "ShippingSquareMetersEach": "0.2378034695",
      "HoursEach": "4.908988784",
      "ApprovalStatus": {
        "@ID": "6",
        "#text": "IFF"
      },
      "TotalQuantity": "1",
      "QuantityAtShippedFromAddress": "1",
      "QuantityRemaining": "1",
      "Shape": {
        "@ID": "9",
        "#text": "W"
  …
```

**Gotchas:**

- Needs `ProductionControlID`.
- Large: 572 KB for EPM-001 (617 rows). Cache it, do not call per scan.
- Numbers are metric with no unit (kg, mm, m²). `Shape`, `Grade`, `Finish`, `Route` and `ApprovalStatus` are `{"@ID":…,"#text":…}`.
- Uses `MainMarkDisplay` / `SequenceDisplay`, not `MainMark` / `Sequence` as in GetLoads.

### `MaxTruck`

**Status:** ✅ data

**Purpose.** Highest load number on the job, the next free load number, default capacity and which load fields (trailer, carrier, categories) are shown or required.

**Answers:** What is the next load number, and which load fields are required?

**Request that worked:**

```json
{"JobNumber":"EPM-001"}
```

**Result:** HTTP 200, 844 bytes, 97 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `ProductionControlID` | number (as text) | 1 | `13` |
| `JobNumber` | text | 1 | `EPM-001` |
| `MaxTruck` | text | 1 |  |
| `NextAvailableLoadNumber` | number (as text) | 1 | `1` |
| `DefaultCapacity` | object | 1 |  |
| `DefaultCapacity.@UOM` | text | 1 | `kg` |
| `DefaultCapacity.#text` | number (as text) | 1 | `19958.06428` |
| `DefaultMaximumLength` | object | 1 |  |
| `DefaultMaximumLength.@UOM` | text | 1 | `mm` |
| `DefaultMaximumLength.#text` | number (as text) | 1 | `0` |
| `TrailerNumber` | object | 1 |  |
| `TrailerNumber.ShowField` | number (as text) | 1 | `1` |
| `TrailerNumber.Required` | number (as text) | 1 | `0` |
| `TrailerNumber.RestrictToList` | number (as text) | 1 | `0` |
| `Carrier` | object | 1 |  |
| `Carrier.ShowField` | number (as text) | 1 | `1` |
| `Carrier.Required` | number (as text) | 1 | `0` |
| `Carrier.RestrictToList` | number (as text) | 1 | `0` |
| `LoadCategory1` | object | 1 |  |
| `LoadCategory1.ShowField` | number (as text) | 1 | `1` |
| `LoadCategory1.Required` | number (as text) | 1 | `0` |
| `LoadCategory1.RestrictToList` | number (as text) | 1 | `0` |
| `LoadCategory2` | object | 1 |  |
| `LoadCategory2.ShowField` | number (as text) | 1 | `1` |
| `LoadCategory2.Required` | number (as text) | 1 | `0` |
| `LoadCategory2.RestrictToList` | number (as text) | 1 | `0` |
| `LoadCategory3` | object | 1 |  |
| `LoadCategory3.ShowField` | number (as text) | 1 | `1` |
| `LoadCategory3.Required` | number (as text) | 1 | `0` |
| `LoadCategory3.RestrictToList` | number (as text) | 1 | `0` |
| `ShippedFrom` | object | 1 |  |
| `ShippedFrom.ShowField` | number (as text) | 1 | `0` |
| `ShippedFrom.Required` | number (as text) | 1 | `0` |
| `ShippedFrom.RestrictToList` | number (as text) | 1 | `0` |
| `InputDisplayUnits` | object | 1 | common block, see README |

**Sample** (trimmed; full trimmed sample in [samples/MaxTruck.json](samples/MaxTruck.json)):

```json
{
  "MaxTruck": "",
  "NextAvailableLoadNumber": "1",
  "DefaultCapacity": {
    "@UOM": "kg",
    "#text": "19958.06428"
  },
  "DefaultMaximumLength": {
    "@UOM": "mm",
    "#text": "0"
  },
  "TrailerNumber": {
    "ShowField": "1",
    "Required": "0",
    "RestrictToList": "0"
  },
  "Carrier": {
    "ShowField": "1",
    "Required": "0",
    "RestrictToList": "0"
  },
  "LoadCategory1": {
    "ShowField": "1",
    "Required": "0",
    "RestrictToList": "0"
  },
  "LoadCategory2": {
    "ShowField": "1",
    "Required": "0",
    "RestrictToList": "0"
  …
```

**Gotchas:**

- On EPM-001 `MaxTruck` is an empty string (no loads); on 25-351 it was "5" with next 6.
- Show/Required/RestrictToList flags are "1"/"0" strings.

### `ProductionControlLoad_InputOptions_Get`

**Status:** ✅ data

**Purpose.** Choices for a new load: next load number, default capacity and length, shipped-from firm/address and shipping destination groups.

**Request that worked:**

```json
{"ProductionControlID":13}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: ProductionControlID - Value is required
- `{"ProductionControlID":13}` → 200, 2150 bytes

**Result:** HTTP 200, 2,150 bytes, 131 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `ResultData` | object | 1 |  |
| `ResultData.InputOptions` | object | 1 |  |
| `ResultData.InputOptions.NextLoadNumber` | number (as text) | 1 | `1` |
| `ResultData.InputOptions.DefaultCapacity` | number (as text) | 1 | `19958.06428` |
| `ResultData.InputOptions.DefaultMaximumLength` | number (as text) | 1 | `0` |
| `ResultData.InputOptions.ShippedFrom` | object | 1 |  |
| `ResultData.InputOptions.ShippedFrom.Firm` | object | 1 |  |
| `ResultData.InputOptions.ShippedFrom.Firm.FirmID` | number (as text) | 1 | `6` |
| `ResultData.InputOptions.ShippedFrom.Firm.FirmType` | text | 1 | `Coating` |
| `ResultData.InputOptions.ShippedFrom.Firm.Name` | text | 1 | `Galvanizer` |
| `ResultData.InputOptions.ShippedFrom.Firm.Code` | text | 1 | `Galvanizer` |
| `ResultData.InputOptions.ShippedFrom.Firm.PrimaryCurrency` | object | 1 |  |
| `ResultData.InputOptions.ShippedFrom.Firm.PrimaryCurrency.@ID` | number (as text) | 1 | `1` |
| `ResultData.InputOptions.ShippedFrom.Firm.PrimaryCurrency.#text` | text | 1 | `USD` |
| `ResultData.InputOptions.ShippedFrom.Firm.ShipToAddress` | object | 1 |  |
| `ResultData.InputOptions.ShippedFrom.Firm.ShipToAddress.FirmAddressID` | number (as text) | 1 | `10` |
| `ResultData.InputOptions.ShippedFrom.Firm.ShipToAddress.FirmID` | number (as text) | 1 | `6` |
| `ResultData.InputOptions.ShippedFrom.Firm.ShipToAddress.Description` | text | 1 | `Default` |
| `ResultData.InputOptions.ShippedFrom.Firm.ShipToAddress.Address1` | text | 1 | `<redacted>` |
| `ResultData.InputOptions.ShippedFrom.Firm.ShipToAddress.IsShipTo` | number (as text) | 1 | `1` |
| `ResultData.InputOptions.ShippedFrom.Firm.ShipToAddress.IsBillTo` | number (as text) | 1 | `1` |
| `ResultData.InputOptions.ShippedFrom.Firm.ShipToAddress.Active` | number (as text) | 1 | `1` |
| `ResultData.InputOptions.ShippedFrom.Firm.BillToAddress` | object | 1 |  |
| `ResultData.InputOptions.ShippedFrom.Firm.BillToAddress.FirmAddressID` | number (as text) | 1 | `10` |
| `ResultData.InputOptions.ShippedFrom.Firm.BillToAddress.FirmID` | number (as text) | 1 | `6` |
| `ResultData.InputOptions.ShippedFrom.Firm.BillToAddress.Description` | text | 1 | `Default` |
| `ResultData.InputOptions.ShippedFrom.Firm.BillToAddress.Address1` | text | 1 | `<redacted>` |
| `ResultData.InputOptions.ShippedFrom.Firm.BillToAddress.IsShipTo` | number (as text) | 1 | `1` |
| `ResultData.InputOptions.ShippedFrom.Firm.BillToAddress.IsBillTo` | number (as text) | 1 | `1` |
| `ResultData.InputOptions.ShippedFrom.Firm.BillToAddress.Active` | number (as text) | 1 | `1` |
| `ResultData.InputOptions.ShippedFrom.Firm.Contact` | object | 1 |  |
| `ResultData.InputOptions.ShippedFrom.Firm.Contact.FirmContactID` | number (as text) | 1 | `6` |
| `ResultData.InputOptions.ShippedFrom.Firm.Contact.FirmID` | number (as text) | 1 | `6` |
| `ResultData.InputOptions.ShippedFrom.Firm.Contact.Name` | text | 1 | `<redacted>` |
| `ResultData.InputOptions.ShippedFrom.Firm.Contact.Inspector` | number (as text) | 1 | `0` |
| `ResultData.InputOptions.ShippedFrom.Firm.Contact.Active` | number (as text) | 1 | `1` |
| `ResultData.InputOptions.ShippedFrom.Firm.Notes` | text | 1 | `Generic Destination Assignment` |
| `ResultData.InputOptions.ShippedFrom.FirmAddress` | object | 1 |  |
| `ResultData.InputOptions.ShippedFrom.FirmAddress.FirmAddressID` | number (as text) | 1 | `10` |
| `ResultData.InputOptions.ShippedFrom.FirmAddress.FirmID` | number (as text) | 1 | `6` |
| `ResultData.InputOptions.ShippedFrom.FirmAddress.Description` | text | 1 | `Default` |
| `ResultData.InputOptions.ShippedFrom.FirmAddress.Address1` | text | 1 | `<redacted>` |
| `ResultData.InputOptions.ShippedFrom.FirmAddress.IsShipTo` | number (as text) | 1 | `1` |
| `ResultData.InputOptions.ShippedFrom.FirmAddress.IsBillTo` | number (as text) | 1 | `1` |
| `ResultData.InputOptions.ShippedFrom.FirmAddress.Active` | number (as text) | 1 | `1` |
| `ResultData.InputOptions.ShippingDestinationGroup` | object | 1 |  |
| `ResultData.InputOptions.ShippingDestinationGroup.ShippingDestinationGroup` | object | 1 |  |
| `ResultData.InputOptions.ShippingDestinationGroup.ShippingDestinationGroup.ShippingDestinationGroupID` | number (as text) | 1 | `1` |
| `ResultData.InputOptions.ShippingDestinationGroup.ShippingDestinationGroup.DestinationGroup` | text | 1 | `Galvanizer` |
| `ResultData.InputOptions.ShippingDestinationGroup.ShippedTo` | object | 1 |  |
| `ResultData.InputOptions.ShippingDestinationGroup.ShippedTo.Firm` | object | 1 |  |
| `ResultData.InputOptions.ShippingDestinationGroup.ShippedTo.Firm.FirmID` | number (as text) | 1 | `6` |
| `ResultData.InputOptions.ShippingDestinationGroup.ShippedTo.Firm.FirmType` | text | 1 | `Coating` |
| `ResultData.InputOptions.ShippingDestinationGroup.ShippedTo.Firm.Name` | text | 1 | `Galvanizer` |
| `ResultData.InputOptions.ShippingDestinationGroup.ShippedTo.Firm.Code` | text | 1 | `Galvanizer` |
| `ResultData.InputOptions.ShippingDestinationGroup.ShippedTo.Firm.PrimaryCurrency` | object | 1 |  |
| `ResultData.InputOptions.ShippingDestinationGroup.ShippedTo.Firm.PrimaryCurrency.@ID` | number (as text) | 1 | `1` |
| `ResultData.InputOptions.ShippingDestinationGroup.ShippedTo.Firm.PrimaryCurrency.#text` | text | 1 | `USD` |
| `ResultData.InputOptions.ShippingDestinationGroup.ShippedTo.Firm.ShipToAddress` | object | 1 |  |
| `ResultData.InputOptions.ShippingDestinationGroup.ShippedTo.Firm.ShipToAddress.FirmAddressID` | number (as text) | 1 | `10` |
| … | | | 30 more fields in the sample file |

**Sample** (trimmed; full trimmed sample in [samples/ProductionControlLoad_InputOptions_Get.json](samples/ProductionControlLoad_InputOptions_Get.json)):

```json
{
  "InputOptions": {
    "NextLoadNumber": "1",
    "DefaultCapacity": "19958.06428",
    "DefaultMaximumLength": "0",
    "ShippedFrom": {
      "Firm": {
        "FirmID": "6",
        "FirmType": "Coating",
        "Name": "Galvanizer",
        "Code": "Galvanizer",
        "PrimaryCurrency": {
          "@ID": "1",
          "#text": "USD"
        },
        "ShipToAddress": {
          "FirmAddressID": "10",
          "FirmID": "6",
          "Description": "Default",
          "Address1": "<redacted>",
          "IsShipTo": "1",
          "IsBillTo": "1",
          "Active": "1"
        },
        "BillToAddress": {
          "FirmAddressID": "10",
          "FirmID": "6",
          "Description": "Default",
          "Address1": "<redacted>",
          "IsShipTo": "1",
  …
```

**Gotchas:**

- Needs `ProductionControlID`.

### `ProductionControlLoad_IsDuplicateLoadNumber`

**Status:** ✅ data

**Purpose.** Checks whether a load number is already used on a job.

**Answers:** Is this truck number already taken?

**Request that worked:**

```json
{"ProductionControlID":13,"LoadNumber":"1"}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: ProductionControlID - Value is required
- `{"ProductionControlID":13,"LoadNumber":"1"}` → 200, 51 bytes

**Result:** HTTP 200, 51 bytes, 95 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `ResultData` | object | 1 |  |
| `ResultData.IsDuplicate` | number (as text) | 1 | `0` |

**Sample** (trimmed; full trimmed sample in [samples/ProductionControlLoad_IsDuplicateLoadNumber.json](samples/ProductionControlLoad_IsDuplicateLoadNumber.json)):

```json
{
  "IsDuplicate": "0"
}
```

**Gotchas:**

- Needs `ProductionControlID` and `LoadNumber`. Reply `IsDuplicate` "0"/"1".

### `ValTruck`

**Status:** ⚠️ refused · purpose not confirmed by Tekla, inferred from the name and reply

**Purpose.** Validates a truck (load) number.

**Best attempt:**

```json
{"JobNumber":"EPM-001","TruckNumber":"1"}
```

**Attempts:**

- `{"JobNumber":"EPM-001","TruckNumber":"1"}` → 422: ActionIfNotExist is required
- `{"JobNumber":"EPM-001"}` → 422: TruckNumber is required

**Gotchas:**

- Requires `ActionIfNotExist`, which suggests it can **create** the truck when it does not exist. Not sent, to stay read-only. Use `ProductionControlLoad_IsDuplicateLoadNumber` to check a number instead.

### `GetProductionShippingStatus`

**Status:** ✅ data

**Purpose.** Job-wide progress: total pieces and weight, completion per production station and per shipping destination, plus the list of load numbers.

**Answers:** How far along is a job in production and shipping?

**Request that worked:**

```json
{"JobNumber":"EPM-001"}
```

**Result:** HTTP 200, 1,852 bytes, 433 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `ProductionControlID` | number (as text) | 1 | `13` |
| `JobNumber` | text | 1 | `EPM-001` |
| `ExcludeAccessoriesWithoutPieceLoadTracking` | number (as text) | 1 | `1` |
| `StatusOfOnlyMainMembers` | number (as text) | 1 | `0` |
| `ProductionStation` | list (4–4) | 1 |  |
| `ProductionStation[].@Index` | number (as text) | 4 | `0`, `1` |
| `ProductionStation[].#text` | text | 4 | `Cut/Saw/Beamline/BurnTable`, `Layout/Weld` |
| `ShippingDestination` | object | 1 |  |
| `ShippingDestination.@Index` | number (as text) | 1 | `0` |
| `ShippingDestination.#text` | text | 1 | `Jobsite` |
| `InputDisplayUnits` | object | 1 | common block, see README |
| `Item` | object | 1 |  |
| `Item.AssemblyQuantity` | number (as text) | 1 | `1230` |
| `Item.Quantity` | number (as text) | 1 | `1230` |
| `Item.Weight` | object | 1 |  |
| `Item.Weight.@UOM` | text | 1 | `kg` |
| `Item.Weight.#text` | number (as text) | 1 | `418813.2677` |
| `Item.GrossWeight` | object | 1 |  |
| `Item.GrossWeight.@UOM` | text | 1 | `kg` |
| `Item.GrossWeight.#text` | number (as text) | 1 | `418860.5342` |
| `Item.ModelWeight` | object | 1 |  |
| `Item.ModelWeight.@UOM` | text | 1 | `kg` |
| `Item.ModelWeight.#text` | number (as text) | 1 | `418813.2677` |
| `Item.TFSStatus` | object | 1 |  |
| `Item.TFSStatus.@Completed` | number (as text) | 1 | `0` |
| `Item.TFSStatus.@TGWt` | number (as text) | 1 | `418860.5342` |
| `Item.TFSStatus.@TMWt` | number (as text) | 1 | `418813.2677` |
| `Item.TFSStatus.@TWt` | number (as text) | 1 | `418813.2677` |
| `Item.TFSStatus.@Total` | number (as text) | 1 | `1230` |
| `Item.ProductionStation` | list (4–4) | 1 |  |
| `Item.ProductionStation[].@Completed` | number (as text) | 4 | `0` |
| `Item.ProductionStation[].@Index` | number (as text) | 4 | `0`, `1` |
| `Item.ProductionStation[].@TGWt` | number (as text) | 4 | `418860.5342`, `412490.1133` |
| `Item.ProductionStation[].@TMWt` | number (as text) | 4 | `418813.2677`, `412447.884` |
| `Item.ProductionStation[].@TWt` | number (as text) | 4 | `418813.2677`, `412447.884` |
| `Item.ProductionStation[].@Total` | number (as text) | 4 | `1230`, `1222` |
| `Item.ShippingDestination` | object | 1 |  |
| `Item.ShippingDestination.ShipStatus` | object | 1 |  |
| `Item.ShippingDestination.ShipStatus.@Completed` | number (as text) | 1 | `0` |
| `Item.ShippingDestination.ShipStatus.@Index` | number (as text) | 1 | `0` |
| `Item.ShippingDestination.ShipStatus.@TGWt` | number (as text) | 1 | `418860.5342` |
| `Item.ShippingDestination.ShipStatus.@TMWt` | number (as text) | 1 | `418813.2677` |
| `Item.ShippingDestination.ShipStatus.@TWt` | number (as text) | 1 | `418813.2677` |
| `Item.ShippingDestination.ShipStatus.@Total` | number (as text) | 1 | `1230` |
| `FilterSet` | object | 1 | common block, see README |
| `HoldSettings` | object | 1 | common block, see README |

**Sample** (trimmed; full trimmed sample in [samples/GetProductionShippingStatus.json](samples/GetProductionShippingStatus.json)):

```json
{
  "ExcludeAccessoriesWithoutPieceLoadTracking": "1",
  "StatusOfOnlyMainMembers": "0",
  "ProductionStation": [
    {
      "@Index": "0",
      "#text": "Cut/Saw/Beamline/BurnTable"
    },
    "… 3 more"
  ],
  "ShippingDestination": {
    "@Index": "0",
    "#text": "Jobsite"
  },
  "Item": {
    "AssemblyQuantity": "1230",
    "Quantity": "1230",
    "Weight": {
      "@UOM": "kg",
      "#text": "418813.2677"
    },
    "GrossWeight": {
      "@UOM": "kg",
      "#text": "418860.5342"
    },
    "ModelWeight": {
      "@UOM": "kg",
      "#text": "418813.2677"
    },
    "TFSStatus": {
  …
```

**Gotchas:**

- Progress is in attributes: `@Total`, `@Completed`, `@TWt` (total weight), `@CWt` (completed weight), gross and model variants. Weights in kg.
- EPM-001: 1230 pieces, 0 completed at every station and 0 shipped.

### `ProductionShippingProductivity_Get`

**Status:** ⚠️ refused

**Purpose.** Shipping and production productivity over a date range.

**Best attempt:**

```json
{"GetOptions":{"StatusType":"ShippingDestination","StartDate":"2017-01-01","EndDate":"2026-12-31"}}
```

**Attempts:**

- `{"GetOptions":{"StatusType":"Shipping","StartDate":"2017-01-01","EndDate":"2026-12-31"}}` → 422: StatusType - Value (Shipping) is not valid.
- `{"JobNumber":"EPM-001"}` → 422: GetOptions - Element is required
- `{"GetOptions":{"StatusType":"4","StartDate":"2017-01-01","EndDate":"2026-12-31"}}` → 422: StatusType - Value (4) is not valid.
- `{"GetOptions":{"ProductionControlID":13}}` → 422: StatusType - Value is required
- `{"GetOptions":{"StatusType":"ShippingDestination","StartDate":"2017-01-01","EndDate":"2026-12-31"}}` → 422: StatusType - Value (ShippingDestination) is not valid.
- `{"GetOptions":{"StatusType":"Shipping","ProductionControlID":13}}` → 422: StartDate - Value is required
- `{"GetOptions":{"StatusType":"shippingdestination","StartDate":"2017-01-01","EndDate":"2026-12-31"}}` → 422: StatusType - Value (shippingdestination) is not valid.
- `{"GetOptions":{"StatusType":"productionstation","StartDate":"2017-01-01","EndDate":"2026-12-31"}}` → 422: StatusType - Value (productionstation) is not valid.

**Gotchas:**

- Needs `GetOptions` with `StatusType`, `StartDate`, `EndDate`. Tekla lists StatusType values `productionstation`, `shippingdestination` and others, but the server rejected every spelling tried (lower case, Pascal case, number). Not worked out.

## Write commands (not run)

These change PowerFab data, so they were not called. The service refuses them while `POWERFAB_ALLOW_WRITES` is off. Purposes come from the command name and Tekla's reference, not from a call.

| Command | What it does |
|---|---|
| `Load` | Puts pieces on a truck (`CommitType` Save) or takes them off (Delete). Used by the service's `/trucks/{truck}/pieces` routes. |
| `Ship` | Marks a truck as shipped. Used by the service's `/trucks/{truck}/ship` route. |
| `Return` | Returns shipped material (from the name). |
| `ProductionControlLoad_Insert` | Creates a load (from the name). |
| `ProductionControlLoad_Update` | Edits a load (from the name). |
| `ProductionControlLoad_Delete` | Deletes a load (from the name). |
| `ProductionControlLoad_Ship` | Ships a load (from the name). |
| `ProductionControlLoad_Unship` | Reverses shipping a load (from the name). |
| `ProductionControlLoad_AddAttachedFile` | Attaches a file (e.g. a photo or ticket) to a load (from the name). |
| `ProductionControlLoadMaterial_Add` | Assigns material to a load (from the name). |
| `ProductionControlLoadMaterial_Remove` | Removes assigned material from a load (from the name). |
| `ProductionControlLoadMaterial_Load` | Marks assigned material as loaded (from the name). |
| `ProductionControlLoadMaterial_Unload` | Marks loaded material as not loaded (from the name). |
| `ProductionControlLoadMaterial_Return` | Returns material from a shipped load (from the name). |
| `ProductionControlLoadMaterial_Unreturn` | Reverses a return (from the name). |
| `ProductionControlLoadAdditional_Insert` | Adds an additional (non-model) item to a load (from the name). |
| `ProductionControlLoadAdditional_Update` | Edits an additional load item (from the name). |
| `ProductionControlLoadAdditional_Delete` | Deletes an additional load item (from the name). |
