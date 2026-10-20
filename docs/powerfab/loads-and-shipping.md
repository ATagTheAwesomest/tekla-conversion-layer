# Loads and shipping

The commands behind the shipping app. Samples come from TESTTEST (ProductionControlID 90), which has loads;
EPM-001 has none. Two sets of commands cover loads: the older `GetLoads`, `Load`, `Ship`, `Return`, `MaxTruck` and
`ValTruck` (job number and mark based, values with units), and the newer `ProductionControlLoad_*` family (by
ProductionControlID and load ID, bare metric numbers). See [shipping-rules.md](shipping-rules.md) for what PowerFab
allows and refuses.

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
| [`ValTruck`](#valtruck) | ✅ data |  |
| [`GetProductionShippingStatus`](#getproductionshippingstatus) | ✅ data | How far along is a job in production and shipping? |
| [`ProductionShippingProductivity_Get`](#productionshippingproductivity_get) | ⚠️ refused |  |

### `GetLoads`

**Status:** ✅ data

**Purpose.** Loads (trucks) on a job with what is assigned and loaded on each, plus the material still to ship.

**Answers:** What is on each truck, and what is left to ship?

**Request that worked:**

```json
{"JobNumber":"TESTTEST","IncludeLoads":true,"IncludeUnshippedLoads":true,"IncludeCompletedMaterial":true,"IncludeRemainingMaterial":true}
```

**Result:** HTTP 200, 234,840 bytes, 330 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `ProductionControlID` | number (as text) | 1 | `90` |
| `JobNumber` | text | 1 | `TESTTEST` |
| `InputDisplayUnits` | object | 1 | common block, see README |
| `Destination` | object | 1 |  |
| `Destination.DestinationName` | text | 1 | `Jobsite` |
| `Destination.Load` | list (6–6) | 1 |  |
| `Destination.Load[].LoadNumber` | number (as text) | 6 | `1`, `2` |
| `Destination.Load[].ShippedFromFirm` | text | 6 |  |
| `Destination.Load[].ShippedFromFirmAddress` | text | 6 |  |
| `Destination.Load[].DestinationGroup` | text | 6 |  |
| `Destination.Load[].ShippedToFirmAddress` | text | 6 |  |
| `Destination.Load[].TrailerNumber` | text | 6 |  |
| `Destination.Load[].Carrier` | text | 6 |  |
| `Destination.Load[].Capacity` | object | 6 |  |
| `Destination.Load[].Capacity.@UOM` | text | 6 | `kg` |
| `Destination.Load[].Capacity.#text` | number (as text) | 6 | `19958.06428` |
| `Destination.Load[].AssignedQuantity` | number (as text) | 6 | `20`, `53` |
| `Destination.Load[].AssignedWeight` | object | 6 |  |
| `Destination.Load[].AssignedWeight.@UOM` | text | 6 | `kg` |
| `Destination.Load[].AssignedWeight.#text` | number (as text) | 6 | `1331.20085531721`, `19714.5548007857` |
| `Destination.Load[].LoadedQuantity` | number (as text) | 6 | `20`, `53` |
| `Destination.Load[].LoadedWeight` | object | 6 |  |
| `Destination.Load[].LoadedWeight.@UOM` | text | 6 | `kg` |
| `Destination.Load[].LoadedWeight.#text` | number (as text) | 6 | `1331.20085531721`, `19714.5548007857` |
| `Destination.Load[].Material` | object or list | 4 |  |
| `Destination.Load[].Material[].MainMark` | number (as text) | 27 | `55314000`, `55314001` |
| `Destination.Load[].Material[].PieceMark` | number (as text) | 27 | `55314000`, `55314001` |
| `Destination.Load[].Material[].Sequence` | number (as text) | 27 | `5531`, `5532` |
| `Destination.Load[].Material[].LotNumber` | text | 27 |  |
| `Destination.Load[].Material[].AssignedQuantity` | number (as text) | 27 | `14`, `1` |
| `Destination.Load[].Material[].AssignedWeight` | object | 27 |  |
| `Destination.Load[].Material[].AssignedWeight.@UOM` | text | 27 | `kg` |
| `Destination.Load[].Material[].AssignedWeight.#text` | number (as text) | 27 | `404.831190224999`, `53.9349677453123` |
| `Destination.Load[].Material[].LoadedQuantity` | number (as text) | 27 | `14`, `1` |
| `Destination.Load[].Material[].LoadedWeight` | object | 27 |  |
| `Destination.Load[].Material[].LoadedWeight.@UOM` | text | 27 | `kg` |
| `Destination.Load[].Material[].LoadedWeight.#text` | number (as text) | 27 | `404.831190224999`, `53.9349677453123` |
| `Destination.Load[].Material[].QuantityAtLocation` | number (as text) | 27 | `0`, `1` |
| `Destination.Load[].Material[].DrawingNumber` | number (as text) | 27 | `55314000`, `55314001` |
| `Destination.Load[].Material[].DrawingRevision` | number (as text) | 27 | `0` |
| `Destination.Load[].Material[].Shape` | text | 27 | `W`, `SHT` |
| `Destination.Load[].Material[].Dimensions` | object | 27 |  |
| `Destination.Load[].Material[].Dimensions.@Metric` | number (as text) | 27 | `0` |
| `Destination.Load[].Material[].Dimensions.#text` | text | 27 | `8 x 15`, `8 x 18` |
| `Destination.Load[].Material[].Length` | object | 27 |  |
| `Destination.Load[].Material[].Length.@UOM` | text | 27 | `in` |
| `Destination.Load[].Material[].Length.#text` | number (as text) | 27 | `51`, `95.125` |
| `Destination.Load[].Material[].ShippingLength` | object | 27 |  |
| `Destination.Load[].Material[].ShippingLength.@UOM` | text | 27 | `in` |
| `Destination.Load[].Material[].ShippingLength.#text` | number (as text) | 27 | `51`, `95.125` |
| `Destination.Load[].Material[].Grade` | text | 27 | `A992`, `A1011-50` |
| `Destination.Load[].Material[].Finish` | text | 27 | `3-1`, `0-0` |
| `Destination.Load[].DateShipped` | text | 2 | `2026-10-20` |
| `Destination.Load[].MaximumLength` | object | 4 |  |
| `Destination.Load[].MaximumLength.@UOM` | text | 4 | `mm` |
| `Destination.Load[].MaximumLength.#text` | number (as text) | 4 | `0` |
| `Destination.Load[].Material.MainMark` | number (as text) | 1 | `55311003` |
| `Destination.Load[].Material.PieceMark` | number (as text) | 1 | `55311003` |
| `Destination.Load[].Material.Sequence` | number (as text) | 1 | `5531` |
| `Destination.Load[].Material.LotNumber` | text | 1 |  |
| … | | | 48 more fields in the sample file |

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
        "AssignedQuantity": "20",
        "AssignedWeight": {
          "@UOM": "kg",
          "#text": "1331.20085531721"
        },
        "LoadedQuantity": "20",
        "LoadedWeight": {
          "@UOM": "kg",
          "#text": "1331.20085531721"
        },
        "Material": [
          {
            "MainMark": "55314000",
            "PieceMark": "55314000",
  …
```

**Gotchas:**

- **Send all four Include flags.** With only `JobNumber` the reply has the destination name and nothing else. On EPM-001, which has no loads, even the full request returns no `Load`.
- Loads sit under `Destination.Load`, not at the top. Each has `LoadNumber` (the truck number), `AssignedQuantity` and `LoadedQuantity`; `DateShipped` is present **only on shipped loads**.
- Pieces are `Material[]` with `MainMark`, `PieceMark`, `Sequence`, `AssignedQuantity`, `LoadedQuantity`, `QuantityAtLocation`. Assigned = planned for this truck, Loaded = actually put on.
- Unshipped material is `Destination.Remaining.MaterialRemaining[]` with `TotalQuantity` and `Quantity` (still to ship).
- Weights, lengths and capacity are `{"@UOM":"kg","#text":"…"}` / `{"@UOM":"in",…}`. Weight is kg, length is inches, regardless of `InputDisplayUnits`. Read `#text`.
- Each `Material` row is one mark on one truck with a quantity, not one row per piece. A mark with quantity 5 is one row.
- One or many: `Destination.Load.Material` came back as an object in one place and a list in another. Always normalise to a list.

### `ProductionControlLoad_Get`

**Status:** ✅ data

**Purpose.** Newer load read: every load on a job with totals (quantity, length, weight, gross/model weight, surface area), ship status and, with `IncludeMaterial`, each piece with its item IDs, drawing IDs and load history.

**Answers:** What are a truck's totals and who loaded what, when?

**Request that worked:**

```json
{"ProductionControlID":90,"GetOptions":{"IncludeJobDetails":1,"IncludeFirmDetails":1,"IncludeMaterial":1,"IncludeAttachedFiles":1}}
```

**Result:** HTTP 200, 32,760 bytes, 120 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `ResultData` | object | 1 |  |
| `ResultData.LastLogID` | text | 1 | `714,803` |
| `ResultData.GetOptions` | object | 1 |  |
| `ResultData.GetOptions.IncludeJobDetails` | number (as text) | 1 | `1` |
| `ResultData.GetOptions.IncludeFirmDetails` | number (as text) | 1 | `1` |
| `ResultData.GetOptions.IncludeMaterial` | number (as text) | 1 | `1` |
| `ResultData.GetOptions.IncludeAttachedFiles` | number (as text) | 1 | `1` |
| `ResultData.ProductionControlLoad` | list (6–6) | 1 |  |
| `ResultData.ProductionControlLoad[].ProductionControlLoadID` | number (as text) | 6 | `382`, `383` |
| `ResultData.ProductionControlLoad[].ProductionControlID` | number (as text) | 6 | `90` |
| `ResultData.ProductionControlLoad[].LoadNumber` | number (as text) | 6 | `1`, `2` |
| `ResultData.ProductionControlLoad[].Capacity` | number (as text) | 6 | `19958.06428` |
| `ResultData.ProductionControlLoad[].ShippingDestinationGroupID` | text | 6 |  |
| `ResultData.ProductionControlLoad[].ShippedFromFirmID` | text | 6 |  |
| `ResultData.ProductionControlLoad[].ShippedToFirmID` | text | 6 |  |
| `ResultData.ProductionControlLoad[].Shipped` | number (as text) | 6 | `0`, `1` |
| `ResultData.ProductionControlLoad[].QuantityAssigned` | number (as text) | 6 | `20`, `53` |
| `ResultData.ProductionControlLoad[].AssignedLength` | number (as text) | 4 | `42264.09703`, `427678.1179` |
| `ResultData.ProductionControlLoad[].AssignedSquareMeters` | number (as text) | 4 | `0.5534587682`, `13.99216508` |
| `ResultData.ProductionControlLoad[].AssignedWeight` | number (as text) | 4 | `1331.200855`, `19714.5548` |
| `ResultData.ProductionControlLoad[].AssignedGrossWeight` | number (as text) | 4 | `1331.200855`, `19714.5548` |
| `ResultData.ProductionControlLoad[].AssignedModelWeight` | number (as text) | 4 | `1331.200855`, `19714.5548` |
| `ResultData.ProductionControlLoad[].AssignedSurfaceArea` | number (as text) | 4 | `39.57404608`, `505.5667898` |
| `ResultData.ProductionControlLoad[].QuantityLoaded` | number (as text) | 6 | `20`, `53` |
| `ResultData.ProductionControlLoad[].LoadedLength` | number (as text) | 4 | `42264.09703`, `427678.1179` |
| `ResultData.ProductionControlLoad[].LoadedSquareMeters` | number (as text) | 4 | `0.5534587682`, `13.99216508` |
| `ResultData.ProductionControlLoad[].LoadedWeight` | number (as text) | 4 | `1331.200855`, `19714.5548` |
| `ResultData.ProductionControlLoad[].LoadedGrossWeight` | number (as text) | 4 | `1331.200855`, `19714.5548` |
| `ResultData.ProductionControlLoad[].LoadedModelWeight` | number (as text) | 4 | `1331.200855`, `19714.5548` |
| `ResultData.ProductionControlLoad[].LoadedSurfaceArea` | number (as text) | 4 | `39.57404608`, `505.5667898` |
| `ResultData.ProductionControlLoad[].Material` | object or list | 4 |  |
| `ResultData.ProductionControlLoad[].Material[].ProductionControlItemTruckID` | number (as text) | 27 | `347`, `348` |
| `ResultData.ProductionControlLoad[].Material[].ProductionControlItemID` | number (as text) | 27 | `45019`, `45020` |
| `ResultData.ProductionControlLoad[].Material[].ProductionControlID` | number (as text) | 27 | `90` |
| `ResultData.ProductionControlLoad[].Material[].DrawingNumberDisplay` | number (as text) | 27 | `55314000`, `55314001` |
| `ResultData.ProductionControlLoad[].Material[].MainMarkDisplay` | number (as text) | 27 | `55314000`, `55314001` |
| `ResultData.ProductionControlLoad[].Material[].PieceMarkDisplay` | number (as text) | 27 | `55314000`, `55314001` |
| `ResultData.ProductionControlLoad[].Material[].MainPiece` | number (as text) | 27 | `1` |
| `ResultData.ProductionControlLoad[].Material[].SequenceDisplay` | number (as text) | 27 | `5531`, `5532` |
| `ResultData.ProductionControlLoad[].Material[].LotNumberDisplay` | text | 27 |  |
| `ResultData.ProductionControlLoad[].Material[].DrawingID` | number (as text) | 27 | `11207`, `11208` |
| `ResultData.ProductionControlLoad[].Material[].AssemblyDrawingID` | number (as text) | 27 | `11207`, `11208` |
| `ResultData.ProductionControlLoad[].Material[].PartDrawingID` | number (as text) | 27 | `11207`, `11208` |
| `ResultData.ProductionControlLoad[].Material[].ShippingLength` | number (as text) | 27 | `1295.402591`, `2416.179832` |
| `ResultData.ProductionControlLoad[].Material[].ShippingWeightEach` | number (as text) | 27 | `28.91651359`, `53.93496775` |
| `ResultData.ProductionControlLoad[].Material[].ShippingGrossWeightEach` | number (as text) | 27 | `28.91651359`, `53.93496775` |
| `ResultData.ProductionControlLoad[].Material[].ShippingModelWeightEach` | number (as text) | 27 | `28.91651359`, `53.93496775` |
| `ResultData.ProductionControlLoad[].Material[].ShippingSurfaceAreaEach` | number (as text) | 27 | `1.046653706`, `1.952214388` |
| `ResultData.ProductionControlLoad[].Material[].ShippingSquareMetersEach` | number (as text) | 27 | `0`, `0.0270968284` |
| `ResultData.ProductionControlLoad[].Material[].ApprovalStatus` | text | 27 |  |
| `ResultData.ProductionControlLoad[].Material[].Quantity` | number (as text) | 27 | `14`, `1` |
| `ResultData.ProductionControlLoad[].Material[].QuantityLoaded` | number (as text) | 27 | `14`, `1` |
| `ResultData.ProductionControlLoad[].Material[].Loaded` | object | 27 |  |
| `ResultData.ProductionControlLoad[].Material[].Loaded.ID` | number (as text) | 27 | `347`, `348` |
| `ResultData.ProductionControlLoad[].Material[].Loaded.Date` | text | 27 | `2026-10-02`, `2026-09-10` |
| `ResultData.ProductionControlLoad[].Material[].Loaded.Quantity` | number (as text) | 27 | `14`, `1` |
| `ResultData.ProductionControlLoad[].Material[].Shape` | object | 27 |  |
| `ResultData.ProductionControlLoad[].Material[].Shape.@ID` | number (as text) | 27 | `9`, `192` |
| `ResultData.ProductionControlLoad[].Material[].Shape.#text` | text | 27 | `W`, `SHT` |
| `ResultData.ProductionControlLoad[].Material[].Grade` | object | 27 |  |
| … | | | 92 more fields in the sample file |

**Sample** (trimmed; full trimmed sample in [samples/ProductionControlLoad_Get.json](samples/ProductionControlLoad_Get.json)):

```json
{
  "ProductionControlLoad": [
    {
      "ProductionControlLoadID": "382",
      "ProductionControlID": "90",
      "LoadNumber": "1",
      "Capacity": "19958.06428",
      "ShippingDestinationGroupID": "",
      "ShippedFromFirmID": "",
      "ShippedToFirmID": "",
      "Shipped": "0",
      "QuantityAssigned": "20",
      "AssignedLength": "42264.09703",
      "AssignedSquareMeters": "0.5534587682",
      "AssignedWeight": "1331.200855",
      "AssignedGrossWeight": "1331.200855",
      "AssignedModelWeight": "1331.200855",
      "AssignedSurfaceArea": "39.57404608",
      "QuantityLoaded": "20",
      "LoadedLength": "42264.09703",
      "LoadedSquareMeters": "0.5534587682",
      "LoadedWeight": "1331.200855",
      "LoadedGrossWeight": "1331.200855",
      "LoadedModelWeight": "1331.200855",
      "LoadedSurfaceArea": "39.57404608",
      "Material": [
        {
          "ProductionControlItemTruckID": "347",
          "ProductionControlItemID": "45019",
          "ProductionControlID": "90",
  …
```

**Gotchas:**

- Takes `ProductionControlID`, **not** `JobNumber`. Sending only `JobNumber` silently returned the loads of a different job, so always pass the ID.
- Numbers here have **no unit attribute** and are metric: weight in kg, length in mm, area in m². `Capacity` 19958.06 kg is 44,000 lb.
- `Shipped` is "1"/"0" and `ShippedDate` appears only when shipped.
- Material carries `ProductionControlItemID`, the stable piece ID, and `Loaded` entries with date and quantity: good for history, but `Loaded` is an object for one entry and a list for several.
- One or many: `ResultData.ProductionControlLoad.Material` came back as an object in one place and a list in another. Always normalise to a list.

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
- `{"ProductionControlID":90}` → 200, 555308 bytes
- `{"JobNumber":"TESTTEST"}` → 422: ProductionControlID - Value is required

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
{"JobNumber":"TESTTEST"}
```

**Result:** HTTP 200, 846 bytes, 48 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `ProductionControlID` | number (as text) | 1 | `90` |
| `JobNumber` | text | 1 | `TESTTEST` |
| `MaxTruck` | number (as text) | 1 | `6` |
| `NextAvailableLoadNumber` | number (as text) | 1 | `7` |
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
  "MaxTruck": "6",
  "NextAvailableLoadNumber": "7",
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

- On EPM-001 `MaxTruck` is an empty string (no loads); on TESTTEST it was "6" with next 7.
- Show/Required/RestrictToList flags are "1"/"0" strings.

### `ProductionControlLoad_InputOptions_Get`

**Status:** ✅ data

**Purpose.** Choices for a new load: next load number, default capacity and length, shipped-from firm/address and shipping destination groups.

**Request that worked:**

```json
{"ProductionControlID":90}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: ProductionControlID - Value is required
- `{"ProductionControlID":13}` → 200, 2150 bytes
- `{"ProductionControlID":90}` → 200, 3422 bytes
- `{"JobNumber":"TESTTEST"}` → 422: ProductionControlID - Value is required

**Result:** HTTP 200, 3,422 bytes, 55 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `ResultData` | object | 1 |  |
| `ResultData.InputOptions` | object | 1 |  |
| `ResultData.InputOptions.NextLoadNumber` | number (as text) | 1 | `7` |
| `ResultData.InputOptions.DefaultCapacity` | number (as text) | 1 | `19958.06428` |
| `ResultData.InputOptions.DefaultMaximumLength` | number (as text) | 1 | `0` |
| `ResultData.InputOptions.ShippedFrom` | list (2–2) | 1 |  |
| `ResultData.InputOptions.ShippedFrom[].Firm` | object | 2 |  |
| `ResultData.InputOptions.ShippedFrom[].Firm.FirmID` | number (as text) | 2 | `6`, `5` |
| `ResultData.InputOptions.ShippedFrom[].Firm.FirmType` | text | 2 | `Coating`, `My Company` |
| `ResultData.InputOptions.ShippedFrom[].Firm.Name` | text | 2 | `Galvanizer`, `My Company` |
| `ResultData.InputOptions.ShippedFrom[].Firm.Code` | text | 2 | `Galvanizer`, `My Company` |
| `ResultData.InputOptions.ShippedFrom[].Firm.PrimaryCurrency` | object | 2 |  |
| `ResultData.InputOptions.ShippedFrom[].Firm.PrimaryCurrency.@ID` | number (as text) | 2 | `1` |
| `ResultData.InputOptions.ShippedFrom[].Firm.PrimaryCurrency.#text` | text | 2 | `USD` |
| `ResultData.InputOptions.ShippedFrom[].Firm.ShipToAddress` | object | 2 |  |
| `ResultData.InputOptions.ShippedFrom[].Firm.ShipToAddress.FirmAddressID` | number (as text) | 2 | `10`, `5` |
| `ResultData.InputOptions.ShippedFrom[].Firm.ShipToAddress.FirmID` | number (as text) | 2 | `6`, `5` |
| `ResultData.InputOptions.ShippedFrom[].Firm.ShipToAddress.Description` | text | 2 | `Default` |
| `ResultData.InputOptions.ShippedFrom[].Firm.ShipToAddress.Address1` | text | 1 | `<redacted>` |
| `ResultData.InputOptions.ShippedFrom[].Firm.ShipToAddress.IsShipTo` | number (as text) | 2 | `1` |
| `ResultData.InputOptions.ShippedFrom[].Firm.ShipToAddress.IsBillTo` | number (as text) | 2 | `1` |
| `ResultData.InputOptions.ShippedFrom[].Firm.ShipToAddress.Active` | number (as text) | 2 | `1` |
| `ResultData.InputOptions.ShippedFrom[].Firm.BillToAddress` | object | 2 |  |
| `ResultData.InputOptions.ShippedFrom[].Firm.BillToAddress.FirmAddressID` | number (as text) | 2 | `10`, `5` |
| `ResultData.InputOptions.ShippedFrom[].Firm.BillToAddress.FirmID` | number (as text) | 2 | `6`, `5` |
| `ResultData.InputOptions.ShippedFrom[].Firm.BillToAddress.Description` | text | 2 | `Default` |
| `ResultData.InputOptions.ShippedFrom[].Firm.BillToAddress.Address1` | text | 1 | `<redacted>` |
| `ResultData.InputOptions.ShippedFrom[].Firm.BillToAddress.IsShipTo` | number (as text) | 2 | `1` |
| `ResultData.InputOptions.ShippedFrom[].Firm.BillToAddress.IsBillTo` | number (as text) | 2 | `1` |
| `ResultData.InputOptions.ShippedFrom[].Firm.BillToAddress.Active` | number (as text) | 2 | `1` |
| `ResultData.InputOptions.ShippedFrom[].Firm.Contact` | object | 2 |  |
| `ResultData.InputOptions.ShippedFrom[].Firm.Contact.FirmContactID` | number (as text) | 2 | `6`, `5` |
| `ResultData.InputOptions.ShippedFrom[].Firm.Contact.FirmID` | number (as text) | 2 | `6`, `5` |
| `ResultData.InputOptions.ShippedFrom[].Firm.Contact.Name` | text | 2 | `<redacted>`, `<redacted>` |
| `ResultData.InputOptions.ShippedFrom[].Firm.Contact.Inspector` | number (as text) | 2 | `0` |
| `ResultData.InputOptions.ShippedFrom[].Firm.Contact.Active` | number (as text) | 2 | `1` |
| `ResultData.InputOptions.ShippedFrom[].Firm.Notes` | text | 1 | `Generic Destination Assignment` |
| `ResultData.InputOptions.ShippedFrom[].FirmAddress` | object | 2 |  |
| `ResultData.InputOptions.ShippedFrom[].FirmAddress.FirmAddressID` | number (as text) | 2 | `10`, `5` |
| `ResultData.InputOptions.ShippedFrom[].FirmAddress.FirmID` | number (as text) | 2 | `6`, `5` |
| `ResultData.InputOptions.ShippedFrom[].FirmAddress.Description` | text | 2 | `Default` |
| `ResultData.InputOptions.ShippedFrom[].FirmAddress.Address1` | text | 1 | `<redacted>` |
| `ResultData.InputOptions.ShippedFrom[].FirmAddress.IsShipTo` | number (as text) | 2 | `1` |
| `ResultData.InputOptions.ShippedFrom[].FirmAddress.IsBillTo` | number (as text) | 2 | `1` |
| `ResultData.InputOptions.ShippedFrom[].FirmAddress.Active` | number (as text) | 2 | `1` |
| `ResultData.InputOptions.ShippingDestinationGroup` | list (2–2) | 1 |  |
| `ResultData.InputOptions.ShippingDestinationGroup[].ShippingDestinationGroup` | object | 2 |  |
| `ResultData.InputOptions.ShippingDestinationGroup[].ShippingDestinationGroup.ShippingDestinationGroupID` | number (as text) | 2 | `1`, `2` |
| `ResultData.InputOptions.ShippingDestinationGroup[].ShippingDestinationGroup.DestinationGroup` | text | 2 | `Galvanizer`, `Workshop` |
| `ResultData.InputOptions.ShippingDestinationGroup[].ShippedTo` | object | 2 |  |
| `ResultData.InputOptions.ShippingDestinationGroup[].ShippedTo.Firm` | object | 2 |  |
| `ResultData.InputOptions.ShippingDestinationGroup[].ShippedTo.Firm.FirmID` | number (as text) | 2 | `6`, `5` |
| `ResultData.InputOptions.ShippingDestinationGroup[].ShippedTo.Firm.FirmType` | text | 2 | `Coating`, `My Company` |
| `ResultData.InputOptions.ShippingDestinationGroup[].ShippedTo.Firm.Name` | text | 2 | `Galvanizer`, `My Company` |
| `ResultData.InputOptions.ShippingDestinationGroup[].ShippedTo.Firm.Code` | text | 2 | `Galvanizer`, `My Company` |
| `ResultData.InputOptions.ShippingDestinationGroup[].ShippedTo.Firm.PrimaryCurrency` | object | 2 |  |
| `ResultData.InputOptions.ShippingDestinationGroup[].ShippedTo.Firm.PrimaryCurrency.@ID` | number (as text) | 2 | `1` |
| `ResultData.InputOptions.ShippingDestinationGroup[].ShippedTo.Firm.PrimaryCurrency.#text` | text | 2 | `USD` |
| `ResultData.InputOptions.ShippingDestinationGroup[].ShippedTo.Firm.ShipToAddress` | object | 2 |  |
| `ResultData.InputOptions.ShippingDestinationGroup[].ShippedTo.Firm.ShipToAddress.FirmAddressID` | number (as text) | 2 | `10`, `5` |
| … | | | 30 more fields in the sample file |

**Sample** (trimmed; full trimmed sample in [samples/ProductionControlLoad_InputOptions_Get.json](samples/ProductionControlLoad_InputOptions_Get.json)):

```json
{
  "InputOptions": {
    "NextLoadNumber": "7",
    "DefaultCapacity": "19958.06428",
    "DefaultMaximumLength": "0",
    "ShippedFrom": [
      {
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
- `{"ProductionControlID":90,"LoadNumber":"1"}` → 200, 51 bytes
- `{"JobNumber":"TESTTEST"}` → 422: ProductionControlID - Value is required

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

**Status:** ✅ data

**Purpose.** Checks that a load exists; with `ActionIfNotExist` `Add` it creates it.

**Request that worked:**

```json
{"JobNumber":"EPM-001","TruckNumber":"WIKI-2","ActionIfNotExist":"Add","Destination":"Jobsite","Carrier":"WIKI TEST"}
```

**Attempts:**

- `{"JobNumber":"TESTTEST","TruckNumber":"1"}` → 422: ActionIfNotExist is required
- `{"JobNumber":"TESTTEST"}` → 422: TruckNumber is required
- `{"JobNumber":"EPM-001","TruckNumber":"1"}` → 422: ActionIfNotExist is required
- `{"JobNumber":"EPM-001"}` → 422: TruckNumber is required
- `{"JobNumber":"EPM-001","TruckNumber":"T-WIKI-1"}` → 422: ActionIfNotExist is required
- `{"JobNumber":"EPM-001","TruckNumber":"WIKI-2","ActionIfNotExist":"Nothing"}` → 422: The load 'WIKI-2' does not exist in job 'EPM-001'.
- `{"JobNumber":"EPM-001","TruckNumber":"WIKI-2","ActionIfNotExist":"Add","Destination":"Jobsite","Carrier":"WIKI TEST"}` → 200, 137 bytes
- `{"JobNumber":"EPM-001","TruckNumber":"1","ActionIfNotExist":"Nothing"}` → 200, 137 bytes
- `{"JobNumber":"EPM-001","TruckNumber":"WIKI-2","ActionIfNotExist":"Add","Destination":"Galvanizer","Carrier":"WIKI TEST"}` → 200, 137 bytes
- `{"JobNumber":"EPM-001","TruckNumber":"1","ActionIfNotExist":"Nothing"}` → 200, 137 bytes
- `{"JobNumber":"EPM-001","TruckNumber":"WIKI-2","ActionIfNotExist":"Add","Destination":"Galvanizer","Carrier":"WIKI TEST"}` → 200, 137 bytes
- `{"JobNumber":"TESTTEST","TruckNumber":"WIKI-T2","ActionIfNotExist":"Nothing"}` → 422: The load 'WIKI-T2' does not exist in job 'TESTTEST'.
- `{"JobNumber":"TESTTEST","TruckNumber":"WIKI-T2","ActionIfNotExist":"Add","Destination":"Jobsite","Carrier":"WIKI TEST"}` → 200, 138 bytes

**Result:** HTTP 200, 137 bytes, 52 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `ProductionControlID` | number (as text) | 1 | `13` |
| `JobNumber` | text | 1 | `EPM-001` |
| `TruckAdded` | number (as text) | 1 | `1` |

**Sample** (trimmed; full trimmed sample in [samples/ValTruck.json](samples/ValTruck.json)):

```json
{
  "TruckAdded": "1"
}
```

**Gotchas:**

- Fields: `JobNumber`, `TruckNumber`, `ActionIfNotExist` (`Nothing` or `Add`), and for a new load `Destination` ("Jobsite" worked) and `Carrier`.
- Reply `TruckAdded` "1" when created, "0" when it already existed. A missing load with `Nothing` is HTTP 422 `The load 'X' does not exist in job 'Y'.`

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
- `{"GetOptions":{"StatusType":"Shipping","StartDate":"2017-01-01","EndDate":"2026-12-31"}}` → 422: StatusType - Value (Shipping) is not valid.
- `{"GetOptions":{"StatusType":"4","StartDate":"2017-01-01","EndDate":"2026-12-31"}}` → 422: StatusType - Value (4) is not valid.
- `{"GetOptions":{"ProductionControlID":90}}` → 422: StatusType - Value is required
- `{"GetOptions":{"StatusType":"ShippingDestination","StartDate":"2017-01-01","EndDate":"2026-12-31"}}` → 422: StatusType - Value (ShippingDestination) is not valid.
- `{"GetOptions":{"StatusType":"Shipping","ProductionControlID":90}}` → 422: StartDate - Value is required
- `{"GetOptions":{"StatusType":"shippingdestination","StartDate":"2017-01-01","EndDate":"2026-12-31"}}` → 422: StatusType - Value (shippingdestination) is not valid.
- `{"GetOptions":{"StatusType":"productionstation","StartDate":"2017-01-01","EndDate":"2026-12-31"}}` → 422: StatusType - Value (productionstation) is not valid.
- `{"JobNumber":"TESTTEST"}` → 422: GetOptions - Element is required

**Gotchas:**

- Needs `GetOptions` with `StatusType`, `StartDate`, `EndDate`. Tekla lists StatusType values `productionstation`, `shippingdestination` and others, but the server rejected every spelling tried (lower case, Pascal case, number). Not worked out.

## Write commands

Run on the test jobs only (EPM-001, TESTTEST), each change undone afterwards. "Not run" means no request was sent; those purposes come from the command name and Tekla's reference.

| Command | Status | What it does |
|---|---|---|
| [`Load`](#load) | ✅ data | Puts pieces on a truck (`CommitType` Save) or takes them off (Delete). Used by the service's `/trucks/{truck}/pieces` routes. |
| [`Ship`](#ship) | ✅ data | Marks a truck as shipped. Used by the service's `/trucks/{truck}/ship` route. |
| [`Return`](#return) | ⚠️ refused | Returns shipped material (from the name). |
| [`ProductionControlLoad_Insert`](#productioncontrolload_insert) | ✅ data | Creates a load (from the name). |
| [`ProductionControlLoad_Update`](#productioncontrolload_update) | ✅ data | Edits a load (from the name). |
| [`ProductionControlLoad_Delete`](#productioncontrolload_delete) | ✅ data | Deletes a load (from the name). |
| [`ProductionControlLoad_Ship`](#productioncontrolload_ship) | ✅ data | Ships a load (from the name). |
| [`ProductionControlLoad_Unship`](#productioncontrolload_unship) | ✅ data | Reverses shipping a load (from the name). |
| [`ProductionControlLoad_AddAttachedFile`](#productioncontrolload_addattachedfile) | ⚠️ refused | Attaches a file (e.g. a photo or ticket) to a load (from the name). |
| [`ProductionControlLoadMaterial_Add`](#productioncontrolloadmaterial_add) | ✅ data | Assigns material to a load (from the name). |
| [`ProductionControlLoadMaterial_Remove`](#productioncontrolloadmaterial_remove) | ✅ data | Removes assigned material from a load (from the name). |
| [`ProductionControlLoadMaterial_Load`](#productioncontrolloadmaterial_load) | ✅ data | Marks assigned material as loaded (from the name). |
| [`ProductionControlLoadMaterial_Unload`](#productioncontrolloadmaterial_unload) | ✅ data | Marks loaded material as not loaded (from the name). |
| [`ProductionControlLoadMaterial_Return`](#productioncontrolloadmaterial_return) | ⚠️ refused | Returns material from a shipped load (from the name). |
| [`ProductionControlLoadMaterial_Unreturn`](#productioncontrolloadmaterial_unreturn) | ⚠️ refused | Reverses a return (from the name). |
| [`ProductionControlLoadAdditional_Insert`](#productioncontrolloadadditional_insert) | ✅ data | Adds an additional (non-model) item to a load (from the name). |
| [`ProductionControlLoadAdditional_Update`](#productioncontrolloadadditional_update) | ✅ data | Edits an additional load item (from the name). |
| [`ProductionControlLoadAdditional_Delete`](#productioncontrolloadadditional_delete) | ✅ data | Deletes an additional load item (from the name). |

### `Load`

**Status:** ✅ worked

**What it does.** Older command: puts a piece on a truck (`CommitType` `Save`) or takes it off (`Delete`).

**Request that worked:**

```json
{"CommitType":"Delete","JobNumber":"TESTTEST","TruckNumber":"WIKI-T2","MainMark":"55311005","Sequence":"5531","Quantity":1}
```

**Reply:** only `Successful` and a `CommandGUID`.

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: CommitType is required
- `{"CommitType":"Save","JobNumber":"EPM-001","TruckNumber":"WIKI-2","MainMark":"2B1","Sequence":"1","Quantity":1}` → 422: Invalid quantity (1).  0 Max.
- `{"CommitType":"Delete","JobNumber":"EPM-001","TruckNumber":"WIKI-2","MainMark":"2B1","Sequence":"1","Quantity":1}` → 422: Invalid quantity (1).  0 Max.
- `{"CommitType":"Save","JobNumber":"EPM-001","TruckNumber":"WIKI-2","MainMark":"A32","Sequence":"3","Quantity":1}` → 422: Invalid quantity (1).  0 Max.
- `{"CommitType":"Delete","JobNumber":"EPM-001","TruckNumber":"WIKI-2","MainMark":"A32","Sequence":"3","Quantity":1}` → 422: Invalid quantity (1).  0 Max.
- `{"CommitType":"Save","JobNumber":"TESTTEST","TruckNumber":"WIKI-T2","MainMark":"55311005","Sequence":"5531","Quantity":1}` → 200: accepted
- `{"CommitType":"Delete","JobNumber":"TESTTEST","TruckNumber":"WIKI-T2","MainMark":"55311005","Sequence":"5531","Quantity":1}` → 422: The load 'WIKI-T2' has been shipped.
- `{"CommitType":"Delete","JobNumber":"TESTTEST","TruckNumber":"WIKI-T2","MainMark":"55311005","Sequence":"5531","Quantity":1}` → 200: accepted

**Gotchas:**

- Fields: `CommitType`, `JobNumber`, `TruckNumber`, `MainMark`, `Sequence`, `Quantity`.
- On TESTTEST, `Save` assigned and loaded the piece in one step.
- Refused for a piece already on another load (`Invalid quantity (1).  0 Max.`) and `Delete` is refused on a shipped truck.

### `Ship`

**Status:** ✅ worked

**What it does.** Older command: ships a truck.

**Request that worked:**

```json
{"CommitType":"Ship","JobNumber":"TESTTEST","TruckNumber":"WIKI-T2","Date":"2026-10-20"}
```

**Reply:** only `Successful` and a `CommandGUID`.

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: CommitType is required
- `{"CommitType":"Save","JobNumber":"EPM-001","TruckNumber":"WIKI-2","Date":"2026-10-20"}` → 422: CommitType is invalid
- `{"CommitType":"Delete","JobNumber":"EPM-001","TruckNumber":"WIKI-2"}` → 422: CommitType is invalid
- `{"CommitType":"Ship","JobNumber":"EPM-001","TruckNumber":"WIKI-2","Date":"2026-10-20"}` → 422: There are no items assigned to the load, it cannot be shipped.
- `{"CommitType":"UnShip","JobNumber":"EPM-001","TruckNumber":"WIKI-2"}` → 422: CommitType is invalid
- `{"CommitType":"Ship","JobNumber":"TESTTEST","TruckNumber":"WIKI-T2","Date":"2026-10-20"}` → 200: accepted
- `{"CommitType":"UnShip","JobNumber":"TESTTEST","TruckNumber":"WIKI-T2"}` → 422: CommitType is invalid

**Gotchas:**

- `CommitType` `Ship` worked with `JobNumber`, `TruckNumber`, `Date`. `Save`, `Delete` and `UnShip` were all answered `CommitType is invalid`; use `ProductionControlLoad_Unship`.

### `Return`

**Status:** ⚠️ refused

**What it does.** Older command: returns pieces from a truck.

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: CommitType is required
- `{"CommitType":"Save","JobNumber":"EPM-001","TruckNumber":"WIKI-2","MainMark":"2B1","Sequence":"1","Quantity":1}` → 422: Cannot return a load shipped to the jobsite.
- `{"CommitType":"Delete","JobNumber":"EPM-001","TruckNumber":"WIKI-2","MainMark":"2B1","Sequence":"1","Quantity":1}` → 422: Cannot return a load shipped to the jobsite.
- `{"CommitType":"Save","JobNumber":"EPM-001","TruckNumber":"WIKI-2","MainMark":"A32","Sequence":"3","Quantity":1}` → 422: The load 'WIKI-2' has not been shipped.
- `{"CommitType":"Delete","JobNumber":"EPM-001","TruckNumber":"WIKI-2","MainMark":"A32","Sequence":"3","Quantity":1}` → 422: The load 'WIKI-2' has not been shipped.

**Gotchas:**

- Needs `CommitType`. Refused: `Cannot return a load shipped to the jobsite.` and `The load 'WIKI-2' has not been shipped.`

### `ProductionControlLoad_Insert`

**Status:** ✅ worked

**What it does.** Creates a load (truck) and returns it with its `ProductionControlLoadID`.

**Request that worked:**

```json
{"ProductionControlID":90,"LoadNumber":"WIKI-T4","Capacity":19958.06428,"ShippingDestinationGroupID":""}
```

**Reply** (trimmed; [samples/ProductionControlLoad_Insert.json](samples/ProductionControlLoad_Insert.json)):

```json
{
  "ProductionControlLoad": {
    "ProductionControlLoadID": "407",
    "ProductionControlID": "90",
    "LoadNumber": "WIKI-T4",
    "Capacity": "19958.06428",
    "ShippingDestinationGroupID": "",
    "ShippedFromFirmID": "",
    "ShippedToFirmID": "",
    "Shipped": "0",
    "QuantityAssigned": "0",
    "QuantityLoaded": "0"
  }
}
```

**Attempts:**

- `{"ProductionControlID":13}` → 422: ShippingDestinationGroupID - Value is required
- `{"ProductionControlID":13,"LoadNumber":"WIKI-1","ShippingDestinationGroupID":1,"TrailerNumber":"WIKI-TRAILER","Carrier":"WIKI TEST","TopText":"Wiki test load, deleted after the test"}` → 422: Capacity - Value is required
- `{"ProductionControlID":13,"LoadNumber":"WIKI-1","Capacity":19958.06428,"ShippingDestinationGroupID":1,"TrailerNumber":"WIKI-TRAILER","Carrier":"WIKI TEST","TopText":"Wiki test load, deleted after the test"}` → 422: Invalid ship to firm.
- `{"ProductionControlID":13,"LoadNumber":"WIKI-1","Capacity":19958.06428,"ShippingDestinationGroupID":1,"TrailerNumber":"WIKI-TRAILER","Carrier":"WIKI TEST","TopText":"Wiki test load, deleted after the test","ShippedToFirmID":6,"ShippedToFirmAddressID":10}` → 200: accepted
- `{"ProductionControlID":13,"LoadNumber":"WIKI-3","Capacity":19958.06428,"ShippingDestinationGroupID":1,"ShippedToFirmID":6,"ShippedToFirmAddressID":10,"TrailerNumber":"WIKI-TRAILER","Carrier":"WIKI TEST"}` → 200: accepted
- `{"ProductionControlID":13,"LoadNumber":"WIKI-3","Capacity":19958.06428,"ShippingDestinationGroupID":"","TrailerNumber":"WIKI-TRAILER","Carrier":"WIKI TEST"}` → 200: accepted
- `{"ProductionControlID":90,"LoadNumber":"WIKI-T1","Capacity":19958.06428,"ShippingDestinationGroupID":"","TrailerNumber":"WIKI-TRAILER","Carrier":"WIKI TEST","TopText":"wiki test load"}` → 200: accepted
- `{"ProductionControlID":90,"LoadNumber":"WIKI-T3","Capacity":19958.06428,"ShippingDestinationGroupID":1,"ShippedToFirmID":6,"ShippedToFirmAddressID":10,"Carrier":"WIKI TEST"}` → 200: accepted
- `{"ProductionControlID":90,"LoadNumber":"WIKI-T4","Capacity":19958.06428,"ShippingDestinationGroupID":""}` → 200: accepted

**Gotchas:**

- Required: `ProductionControlID`, `LoadNumber`, `Capacity` (kg) and `ShippingDestinationGroupID`. An empty string means the jobsite; `1` (Galvanizer) also needs `ShippedToFirmID` 6 and `ShippedToFirmAddressID` 10, otherwise `Invalid ship to firm.`
- `TrailerNumber`, `Carrier` and `TopText` were accepted and echoed back.
- `LoadNumber` is free text: `WIKI-T1` was accepted.

### `ProductionControlLoad_Update`

**Status:** ✅ worked

**What it does.** Edits a load.

**Request that worked:**

```json
{"ProductionControlLoadID":"404","Carrier":"WIKI TEST 2"}
```

**Reply** (trimmed; [samples/ProductionControlLoad_Update.json](samples/ProductionControlLoad_Update.json)):

```json
{
  "ProductionControlLoad": {
    "ProductionControlLoadID": "404",
    "ProductionControlID": "90",
    "LoadNumber": "WIKI-T1",
    "TrailerNumber": "WIKI-TRAILER",
    "Carrier": "WIKI TEST 2",
    "Capacity": "19958.06428",
    "ShippingDestinationGroupID": "",
    "ShippedFromFirmID": "",
    "ShippedToFirmID": "",
    "Shipped": "0",
    "TopText": "wiki test load",
    "QuantityAssigned": "0",
    "QuantityLoaded": "0"
  }
}
```

**Attempts:**

- `{}` → 422: ProductionControlLoadID - Value is required
- `{"ProductionControlLoadID":"397","Carrier":"WIKI TEST 2"}` → 200: accepted
- `{"ProductionControlLoadID":"404","Carrier":"WIKI TEST 2"}` → 200: accepted

**Gotchas:**

- Needs `ProductionControlLoadID`; changing only `Carrier` worked.

### `ProductionControlLoad_Delete`

**Status:** ✅ worked

**What it does.** Deletes a load.

**Request that worked:**

```json
{"ProductionControlLoadID":"407"}
```

**Reply:** only `Successful` and a `CommandGUID`.

**Attempts:**

- `{}` → 422: ProductionControlLoadID - Value is required
- `{"ProductionControlLoadID":"395"}` → 200: accepted
- `{"ProductionControlLoadID":"396"}` → 200: accepted
- `{"ProductionControlLoadID":"397"}` → 422: There are additional items assigned to the load, it cannot be deleted.
- `{"ProductionControlLoadID":"398"}` → 200: accepted
- `{"ProductionControlLoadID":397}` → 200: accepted
- `{"ProductionControlLoadID":"399"}` → 200: accepted
- `{"ProductionControlLoadID":"401"}` → 200: accepted
- `{"ProductionControlLoadID":"404"}` → 422: There are items assigned to the load, it cannot be deleted.
- `{"ProductionControlLoadID":"404"}` → 200: accepted
- `{"ProductionControlLoadID":"405"}` → 422: There are items assigned to the load, it cannot be deleted.
- `{"ProductionControlLoadID":"385"}` → 200: accepted
- `{"ProductionControlLoadID":"386"}` → 200: accepted
- `{"ProductionControlLoadID":"405"}` → 200: accepted
- … 2 more

**Gotchas:**

- Refused while the load has assigned pieces or extra items (see [shipping rules](shipping-rules.md)). Empty loads and loads emptied beforehand deleted fine.

### `ProductionControlLoad_Ship`

**Status:** ✅ worked

**What it does.** Ships a load.

**Request that worked:**

```json
{"ProductionControlLoadID":"407","ShippedDate":"2026-10-20"}
```

**Reply** (trimmed; [samples/ProductionControlLoad_Ship.json](samples/ProductionControlLoad_Ship.json)):

```json
{
  "ProductionControlLoad": {
    "ProductionControlLoadID": "407",
    "ProductionControlID": "90",
    "LoadNumber": "WIKI-T4",
    "Capacity": "19958.06428",
    "ShippingDestinationGroupID": "",
    "ShippedFromFirmID": "",
    "ShippedToFirmID": "",
    "Shipped": "1",
    "ShippedDate": "2026-10-20",
    "QuantityAssigned": "3",
    "AssignedLength": "0",
    "AssignedSquareMeters": "0",
    "AssignedWeight": "18",
    "AssignedGrossWeight": "18",
    "AssignedModelWeight": "18",
    "AssignedSurfaceArea": "0",
    "QuantityLoaded": "3",
    "LoadedLength": "0",
    "LoadedSquareMeters": "0",
    "LoadedWeight": "18",
    "LoadedGrossWeight": "18",
    "LoadedModelWeight": "18",
    "LoadedSurfaceArea": "0",
    "Additional": {
      "ProductionControlTrucksAdditionalID": "3",
      "Quantity": "3",
  …
```

**Attempts:**

- `{}` → 422: ProductionControlLoadID - Value is required
- `{"ProductionControlLoadID":"397","ShippedDate":"2026-10-20"}` → 200: accepted
- `{"ProductionControlLoadID":"401","ShippedDate":"2026-10-20"}` → 422: There are items assigned to the load that are not yet loaded, it cannot be shipped.
- `{"ProductionControlLoadID":"404","ShippedDate":"2026-10-20"}` → 422: There are items assigned to the load that are not yet loaded, it cannot be shipped.
- `{"ProductionControlLoadID":"404","ShippedDate":"2026-10-20"}` → 200: accepted
- `{"ProductionControlLoadID":"383","ShippedDate":"2026-10-20"}` → 200: accepted
- `{"ProductionControlLoadID":"384","ShippedDate":"2026-10-20"}` → 200: accepted
- `{"ProductionControlLoadID":"385","ShippedDate":"2026-10-20"}` → 422: There are no items assigned to the load, it cannot be shipped.
- `{"ProductionControlLoadID":"406","ShippedDate":"2026-10-20"}` → 422: There are no items assigned to the load, it cannot be shipped.
- `{"ProductionControlLoadID":"407","ShippedDate":"2026-10-20"}` → 200: accepted

**Gotchas:**

- Fields: `ProductionControlLoadID`, `ShippedDate`.
- Refused when something assigned is not loaded, and when nothing is assigned.
- The reply is the load with `Shipped` "1" and `ShippedDate`.

### `ProductionControlLoad_Unship`

**Status:** ✅ worked

**What it does.** Reverses shipping a load.

**Request that worked:**

```json
{"ProductionControlLoadID":"407"}
```

**Reply** (trimmed; [samples/ProductionControlLoad_Unship.json](samples/ProductionControlLoad_Unship.json)):

```json
{
  "ProductionControlLoad": {
    "ProductionControlLoadID": "407",
    "ProductionControlID": "90",
    "LoadNumber": "WIKI-T4",
    "Capacity": "19958.06428",
    "ShippingDestinationGroupID": "",
    "ShippedFromFirmID": "",
    "ShippedToFirmID": "",
    "Shipped": "0",
    "QuantityAssigned": "3",
    "AssignedLength": "0",
    "AssignedSquareMeters": "0",
    "AssignedWeight": "18",
    "AssignedGrossWeight": "18",
    "AssignedModelWeight": "18",
    "AssignedSurfaceArea": "0",
    "QuantityLoaded": "3",
    "LoadedLength": "0",
    "LoadedSquareMeters": "0",
    "LoadedWeight": "18",
    "LoadedGrossWeight": "18",
    "LoadedModelWeight": "18",
    "LoadedSurfaceArea": "0",
    "Additional": {
      "ProductionControlTrucksAdditionalID": "3",
      "Quantity": "3",
      "Description": "WIKI test bolts 2",
  …
```

**Attempts:**

- `{}` → 422: ProductionControlLoadID - Value is required
- `{"ProductionControlLoadID":"395"}` → 200: accepted
- `{"ProductionControlLoadID":"396"}` → 200: accepted
- `{"ProductionControlLoadID":"397"}` → 200: accepted
- `{"ProductionControlLoadID":"398"}` → 200: accepted
- `{"ProductionControlLoadID":"399"}` → 200: accepted
- `{"ProductionControlLoadID":"401"}` → 200: accepted
- `{"ProductionControlLoadID":"404"}` → 200: accepted
- `{"ProductionControlLoadID":"405"}` → 200: accepted
- `{"ProductionControlLoadID":"383"}` → 200: accepted
- `{"ProductionControlLoadID":"384"}` → 200: accepted
- `{"ProductionControlLoadID":"406"}` → 200: accepted
- `{"ProductionControlLoadID":"407"}` → 200: accepted

**Gotchas:**

- Needs only `ProductionControlLoadID`. Worked on loads shipped with `ProductionControlLoad_Ship` and with the older `Ship`.

### `ProductionControlLoad_AddAttachedFile`

**Status:** ⚠️ refused

**What it does.** Attaches a file to a load.

**Attempts:**

- `{}` → 422: ProductionControlLoadID - Value is required

**Gotchas:**

- Not tried past its first error (`ProductionControlLoadID - Value is required`).

### `ProductionControlLoadMaterial_Add`

**Status:** ✅ worked

**What it does.** Assigns pieces to a load.

**Request that worked:**

```json
{"ProductionControlLoadID":"404","LoadItemsOnAssign":0,"AddItem":[{"ProductionControlItemID":"44702","SequenceID":"260","Quantity":1},{"ProductionControlItemID":"44706","SequenceID":"260","Quantity":1},{"ProductionControlItemID":"44710","SequenceID":"260","Quantity":1}]}
```

**Reply** (trimmed; [samples/ProductionControlLoadMaterial_Add.json](samples/ProductionControlLoadMaterial_Add.json)):

```json
{
  "ProductionControlLoad": {
    "ProductionControlLoadID": "404",
    "ProductionControlID": "90",
    "LoadNumber": "WIKI-T1",
    "TrailerNumber": "WIKI-TRAILER",
    "Carrier": "WIKI TEST 2",
    "Capacity": "19958.06428",
    "ShippingDestinationGroupID": "",
    "ShippedFromFirmID": "",
    "ShippedToFirmID": "",
    "Shipped": "0",
    "TopText": "wiki test load",
    "QuantityAssigned": "3",
    "AssignedLength": "19446.91389",
    "AssignedSquareMeters": "1.376897915",
    "AssignedWeight": "840.2681419",
    "AssignedGrossWeight": "840.2681419",
    "AssignedModelWeight": "840.2681419",
    "AssignedSurfaceArea": "16.88317086",
    "QuantityLoaded": "0",
    "Material": [
      {
        "ProductionControlItemTruckID": "586",
        "ProductionControlItemID": "44702",
        "ProductionControlID": "90",
        "DrawingNumberDisplay": "55311002",
        "MainMarkDisplay": "55311002",
  …
```

**Attempts:**

- `{}` → 422: ProductionControlLoadID - Value is required
- `{"ProductionControlLoadID":"397","AddItem":[{"ProductionControlItemID":"8851","SequenceID":"27","Quantity":1},{"ProductionControlItemID":"8854","SequenceID":"27","Quantity":1}]}` → 422: LoadItemsOnAssign - Value is required
- `{"ProductionControlLoadID":"398","AddItem":[{"ProductionControlItemID":"8858","SequenceID":"27","Quantity":1}]}` → 422: LoadItemsOnAssign - Value is required
- `{"ProductionControlLoadID":"399","LoadItemsOnAssign":0,"AddItem":[{"ProductionControlItemID":"8851","SequenceID":"27","Quantity":1},{"ProductionControlItemID":"8854","SequenceID":"27","Quantity":1}]}` → 422: Invalid quantity (1).  0 Max.
- `{"ProductionControlLoadID":"401","LoadItemsOnAssign":0,"AddItem":[{"ProductionControlItemID":"8851","SequenceID":"27","Quantity":1},{"ProductionControlItemID":"8854","SequenceID":"27","Quantity":1}]}` → 200: accepted
- `{"ProductionControlLoadID":"404","LoadItemsOnAssign":0,"AddItem":[{"ProductionControlItemID":"44702","SequenceID":"260","Quantity":1},{"ProductionControlItemID":"44706","SequenceID":"260","Quantity":1},{"ProductionControlItemID":"44710","SequenceID":"260","Quantity":1}]}` → 200: accepted
- `{"ProductionControlLoadID":"406","LoadItemsOnAssign":1,"AddItem":[{"ProductionControlItemID":"44726","SequenceID":"260","Quantity":1}]}` → 422: Invalid quantity (1).  0 Max.

**Gotchas:**

- Fields: `ProductionControlLoadID`, `LoadItemsOnAssign` (0 or 1, required) and `AddItem` rows of `ProductionControlItemID`, `SequenceID`, `Quantity`.
- Answered `Invalid quantity (1).  0 Max.` for pieces already on another load and for any piece on a galvanizer load.
- The reply is the load with updated totals. Use `ProductionControlLoad_Get` with `IncludeMaterial` to read each row's `ProductionControlItemTruckID`.

### `ProductionControlLoadMaterial_Remove`

**Status:** ✅ worked

**What it does.** Takes assigned pieces off a load.

**Request that worked:**

```json
{"ProductionControlLoadID":"404","RemoveItem":[{"ProductionControlItemTruckID":"586","Quantity":1},{"ProductionControlItemTruckID":"587","Quantity":1},{"ProductionControlItemTruckID":"588","Quantity":1}]}
```

**Reply** (trimmed; [samples/ProductionControlLoadMaterial_Remove.json](samples/ProductionControlLoadMaterial_Remove.json)):

```json
{
  "ProductionControlLoad": {
    "ProductionControlLoadID": "404",
    "ProductionControlID": "90",
    "LoadNumber": "WIKI-T1",
    "TrailerNumber": "WIKI-TRAILER",
    "Carrier": "WIKI TEST 2",
    "Capacity": "19958.06428",
    "ShippingDestinationGroupID": "",
    "ShippedFromFirmID": "",
    "ShippedToFirmID": "",
    "Shipped": "0",
    "TopText": "wiki test load",
    "QuantityAssigned": "0",
    "QuantityLoaded": "0"
  }
}
```

**Attempts:**

- `{}` → 422: ProductionControlLoadID - Value is required
- `{"ProductionControlLoadID":"401","RemoveItem":[{"ProductionControlItemTruckID":"579","Quantity":1},{"ProductionControlItemTruckID":"580","Quantity":1}]}` → 200: accepted
- `{"ProductionControlLoadID":"404","RemoveItem":[{"ProductionControlItemTruckID":"586","Quantity":1},{"ProductionControlItemTruckID":"587","Quantity":1},{"ProductionControlItemTruckID":"588","Quantity":1}]}` → 200: accepted

**Gotchas:**

- `RemoveItem` rows of `ProductionControlItemTruckID` and `Quantity` worked on unloaded pieces.

### `ProductionControlLoadMaterial_Load`

**Status:** ✅ worked

**What it does.** Marks assigned pieces as loaded on the truck.

**Request that worked:**

```json
{"ProductionControlLoadID":"404","DateLoaded":"2026-10-20","LoadItem":[{"ProductionControlItemTruckID":"586","Quantity":1}]}
```

**Reply** (trimmed; [samples/ProductionControlLoadMaterial_Load.json](samples/ProductionControlLoadMaterial_Load.json)):

```json
{
  "ProductionControlLoad": {
    "ProductionControlLoadID": "404",
    "ProductionControlID": "90",
    "LoadNumber": "WIKI-T1",
    "TrailerNumber": "WIKI-TRAILER",
    "Carrier": "WIKI TEST 2",
    "Capacity": "19958.06428",
    "ShippingDestinationGroupID": "",
    "ShippedFromFirmID": "",
    "ShippedToFirmID": "",
    "Shipped": "0",
    "TopText": "wiki test load",
    "QuantityAssigned": "3",
    "AssignedLength": "19446.91389",
    "AssignedSquareMeters": "1.376897915",
    "AssignedWeight": "840.2681419",
    "AssignedGrossWeight": "840.2681419",
    "AssignedModelWeight": "840.2681419",
    "AssignedSurfaceArea": "16.88317086",
    "QuantityLoaded": "3",
    "LoadedLength": "19446.91389",
    "LoadedSquareMeters": "1.376897915",
    "LoadedWeight": "840.2681419",
    "LoadedGrossWeight": "840.2681419",
    "LoadedModelWeight": "840.2681419",
    "LoadedSurfaceArea": "16.88317086",
    "Material": [
  …
```

**Attempts:**

- `{}` → 422: ProductionControlLoadID - Value is required
- `{"ProductionControlLoadID":"401","DateLoaded":"2026-10-20","LoadItem":[{"ProductionControlItemTruckID":"579","Quantity":1}]}` → 200: accepted
- `{"ProductionControlLoadID":"404","DateLoaded":"2026-10-20","LoadItem":[{"ProductionControlItemTruckID":"586","Quantity":1},{"ProductionControlItemTruckID":"587","Quantity":1},{"ProductionControlItemTruckID":"588","Quantity":1}]}` → 200: accepted
- `{"ProductionControlLoadID":"404","DateLoaded":"2026-10-20","LoadItem":[{"ProductionControlItemTruckID":"586","Quantity":1}]}` → 200: accepted

**Gotchas:**

- Fields: `ProductionControlLoadID`, `DateLoaded` and `LoadItem` rows of `ProductionControlItemTruckID` and `Quantity`.
- Each call adds a `Loaded` entry (`ID`, `Date`, `Quantity`) to the piece in `ProductionControlLoad_Get`.

### `ProductionControlLoadMaterial_Unload`

**Status:** ✅ worked

**What it does.** Reverses a load action on a piece.

**Request that worked:**

```json
{"ProductionControlLoadID":"404","UnloadItem":[{"ProductionControlItemTrucksLoadID":"593","Quantity":1},{"ProductionControlItemTrucksLoadID":"591","Quantity":1},{"ProductionControlItemTrucksLoadID":"592","Quantity":1}]}
```

**Reply** (trimmed; [samples/ProductionControlLoadMaterial_Unload.json](samples/ProductionControlLoadMaterial_Unload.json)):

```json
{
  "ProductionControlLoad": {
    "ProductionControlLoadID": "404",
    "ProductionControlID": "90",
    "LoadNumber": "WIKI-T1",
    "TrailerNumber": "WIKI-TRAILER",
    "Carrier": "WIKI TEST 2",
    "Capacity": "19958.06428",
    "ShippingDestinationGroupID": "",
    "ShippedFromFirmID": "",
    "ShippedToFirmID": "",
    "Shipped": "0",
    "TopText": "wiki test load",
    "QuantityAssigned": "5",
    "AssignedLength": "19446.91389",
    "AssignedSquareMeters": "1.376897915",
    "AssignedWeight": "850.2681419",
    "AssignedGrossWeight": "850.2681419",
    "AssignedModelWeight": "850.2681419",
    "AssignedSurfaceArea": "16.88317086",
    "QuantityLoaded": "2",
    "LoadedLength": "0",
    "LoadedSquareMeters": "0",
    "LoadedWeight": "10",
    "LoadedGrossWeight": "10",
    "LoadedModelWeight": "10",
    "LoadedSurfaceArea": "0",
    "Material": [
  …
```

**Attempts:**

- `{}` → 422: ProductionControlLoadID - Value is required
- `{"ProductionControlLoadID":"401","UnloadItem":[{"ProductionControlItemTruckID":"579","Quantity":1}]}` → 422: ProductionControlItemTrucksLoadID - Value is required
- `{"ProductionControlLoadID":"404","UnloadItem":[{"ProductionControlItemTrucksLoadID":"590","Quantity":1}]}` → 200: accepted
- `{"ProductionControlLoadID":"404","UnloadItem":[{"ProductionControlItemTrucksLoadID":"590","Quantity":1}]}` → 422: The load has already been shipped.
- `{"ProductionControlLoadID":"404","UnloadItem":[{"ProductionControlItemTrucksLoadID":"593","Quantity":1},{"ProductionControlItemTrucksLoadID":"591","Quantity":1},{"ProductionControlItemTrucksLoadID":"592","Quantity":1}]}` → 200: accepted

**Gotchas:**

- `UnloadItem` rows of `ProductionControlItemTrucksLoadID` (the `Loaded.ID` from `ProductionControlLoad_Get`) and `Quantity`. `ProductionControlItemTruckID` is not accepted.
- Refused on a shipped load: `The load has already been shipped.`

### `ProductionControlLoadMaterial_Return`

**Status:** ⚠️ refused

**What it does.** Returns pieces from a shipped load.

**Attempts:**

- `{}` → 422: ProductionControlLoadID - Value is required
- `{"ProductionControlLoadID":"401","ReturnItem":[{"ProductionControlItemTruckID":"579","Quantity":1}]}` → 422: DateReturned - Value is required
- `{"ProductionControlLoadID":"404","DateReturned":"2026-10-20","ReturnItem":[{"ProductionControlItemTruckID":"586","Quantity":1}]}` → 422: Unable to return items from the jobsite.

**Gotchas:**

- Needs `DateReturned`.
- Refused for jobsite loads: `Unable to return items from the jobsite.` No destination that accepts pieces also allows returns in these tests, so no return has been recorded.

### `ProductionControlLoadMaterial_Unreturn`

**Status:** ⚠️ refused

**What it does.** Reverses a return.

**Attempts:**

- `{}` → 422: ProductionControlLoadID - Value is required
- `{"ProductionControlLoadID":"401","UnreturnItem":[{"ProductionControlItemTruckID":"579","Quantity":1}]}` → 422: ProductionControlItemTrucksReturnID - Value is required

**Gotchas:**

- Asks for `ProductionControlItemTrucksReturnID`. No return exists to reverse, so it was never accepted.

### `ProductionControlLoadAdditional_Insert`

**Status:** ✅ worked

**What it does.** Adds an extra (non-model) item to a load.

**Request that worked:**

```json
{"ProductionControlLoadID":"407","Description":"WIKI test bolts","Quantity":2,"WeightEach":5}
```

**Reply** (trimmed; [samples/ProductionControlLoadAdditional_Insert.json](samples/ProductionControlLoadAdditional_Insert.json)):

```json
{
  "ProductionControlLoad": {
    "ProductionControlLoadID": "407",
    "ProductionControlID": "90",
    "LoadNumber": "WIKI-T4",
    "Capacity": "19958.06428",
    "ShippingDestinationGroupID": "",
    "ShippedFromFirmID": "",
    "ShippedToFirmID": "",
    "Shipped": "0",
    "QuantityAssigned": "2",
    "AssignedLength": "0",
    "AssignedSquareMeters": "0",
    "AssignedWeight": "10",
    "AssignedGrossWeight": "10",
    "AssignedModelWeight": "10",
    "AssignedSurfaceArea": "0",
    "QuantityLoaded": "2",
    "LoadedLength": "0",
    "LoadedSquareMeters": "0",
    "LoadedWeight": "10",
    "LoadedGrossWeight": "10",
    "LoadedModelWeight": "10",
    "LoadedSurfaceArea": "0",
    "Additional": {
      "ProductionControlTrucksAdditionalID": "3",
      "Quantity": "2",
      "Description": "WIKI test bolts",
  …
```

**Attempts:**

- `{}` → 422: ProductionControlLoadID - Value is required
- `{"ProductionControlLoadID":"397","Description":"WIKI test bolts","Quantity":2,"WeightEach":5}` → 200: accepted
- `{"ProductionControlLoadID":"404","Description":"WIKI test bolts","Quantity":2,"WeightEach":5}` → 200: accepted
- `{"ProductionControlLoadID":"407","Description":"WIKI test bolts","Quantity":2,"WeightEach":5}` → 200: accepted

**Gotchas:**

- Fields: `ProductionControlLoadID`, `Description`, `Quantity`, `WeightEach`.
- The reply carries `Additional` with `ProductionControlTrucksAdditionalID`.
- The item counts in the load's `QuantityAssigned` and `QuantityLoaded`.

### `ProductionControlLoadAdditional_Update`

**Status:** ✅ worked

**What it does.** Edits an extra item.

**Request that worked:**

```json
{"ProductionControlLoadID":"407","ProductionControlTrucksAdditionalID":"3","Description":"WIKI test bolts 2","Quantity":3,"WeightEach":6}
```

**Reply** (trimmed; [samples/ProductionControlLoadAdditional_Update.json](samples/ProductionControlLoadAdditional_Update.json)):

```json
{
  "ProductionControlLoad": {
    "ProductionControlLoadID": "407",
    "ProductionControlID": "90",
    "LoadNumber": "WIKI-T4",
    "Capacity": "19958.06428",
    "ShippingDestinationGroupID": "",
    "ShippedFromFirmID": "",
    "ShippedToFirmID": "",
    "Shipped": "0",
    "QuantityAssigned": "3",
    "AssignedLength": "0",
    "AssignedSquareMeters": "0",
    "AssignedWeight": "18",
    "AssignedGrossWeight": "18",
    "AssignedModelWeight": "18",
    "AssignedSurfaceArea": "0",
    "QuantityLoaded": "3",
    "LoadedLength": "0",
    "LoadedSquareMeters": "0",
    "LoadedWeight": "18",
    "LoadedGrossWeight": "18",
    "LoadedModelWeight": "18",
    "LoadedSurfaceArea": "0",
    "Additional": {
      "ProductionControlTrucksAdditionalID": "3",
      "Quantity": "3",
      "Description": "WIKI test bolts 2",
  …
```

**Attempts:**

- `{}` → 422: ProductionControlLoadID - Value is required
- `{"ProductionControlLoadID":"404","ProductionControlTrucksAdditionalID":"2","Description":"WIKI test bolts 2"}` → 422: Quantity - Value is required
- `{"ProductionControlLoadID":"407","ProductionControlTrucksAdditionalID":"3","Description":"WIKI test bolts 2","Quantity":3,"WeightEach":6}` → 200: accepted

**Gotchas:**

- Needs `ProductionControlLoadID`, `ProductionControlTrucksAdditionalID` and `Quantity`; `Description` and `WeightEach` were accepted.

### `ProductionControlLoadAdditional_Delete`

**Status:** ✅ worked

**What it does.** Deletes an extra item.

**Request that worked:**

```json
{"ProductionControlLoadID":"407","ProductionControlTrucksAdditionalID":"3"}
```

**Reply** (trimmed; [samples/ProductionControlLoadAdditional_Delete.json](samples/ProductionControlLoadAdditional_Delete.json)):

```json
{
  "ProductionControlLoad": {
    "ProductionControlLoadID": "407",
    "ProductionControlID": "90",
    "LoadNumber": "WIKI-T4",
    "Capacity": "19958.06428",
    "ShippingDestinationGroupID": "",
    "ShippedFromFirmID": "",
    "ShippedToFirmID": "",
    "Shipped": "0",
    "QuantityAssigned": "0",
    "QuantityLoaded": "0"
  }
}
```

**Attempts:**

- `{}` → 422: ProductionControlLoadID - Value is required
- `{"ProductionControlLoadID":397,"ProductionControlTrucksAdditionalID":1}` → 200: accepted
- `{"ProductionControlLoadID":397,"ProductionControlLoadAdditionalID":1}` → 422: ProductionControlTrucksAdditionalID - Value is required
- `{"ProductionControlLoadID":"404","ProductionControlTrucksAdditionalID":"2"}` → 200: accepted
- `{"ProductionControlLoadID":"407","ProductionControlTrucksAdditionalID":"3"}` → 200: accepted

**Gotchas:**

- Needs `ProductionControlLoadID` and `ProductionControlTrucksAdditionalID`. `ProductionControlLoadAdditionalID` is answered `ProductionControlTrucksAdditionalID - Value is required`.
