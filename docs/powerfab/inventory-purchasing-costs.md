# Inventory, purchasing and costs

Most of this area answers "Permission denied." for the API user. Readable: the inventory location list,
the location restriction, the last inventory transaction ID, currencies and the 4 MB price list.

[← Back to the index](README.md)

## Read commands

| Command | Status | Answers |
|---|---|---|
| [`GetInventoryLocations`](#getinventorylocations) | ✅ data | What yard/inventory locations exist? |
| [`InventoryLocationRestriction_Get`](#inventorylocationrestriction_get) | ✅ data |  |
| [`GetInventoryTransactions`](#getinventorytransactions) | ✅ data |  |
| [`GetPricingInformation`](#getpricinginformation) | ✅ data |  |
| [`GetCurrencies`](#getcurrencies) | ✅ data |  |
| [`GetInventory`](#getinventory) | ⛔ permission denied |  |
| [`GetInventorySummary`](#getinventorysummary) | ⛔ permission denied |  |
| [`GetInventoryLocationSweeps`](#getinventorylocationsweeps) | ⚠️ refused |  |
| [`InventoryTransaction_GetLastTransactionID`](#inventorytransaction_getlasttransactionid) | ⛔ permission denied |  |
| [`InventoryJobCostingTransaction_Get`](#inventoryjobcostingtransaction_get) | ⛔ permission denied |  |
| [`ValInventory`](#valinventory) | ⚠️ refused |  |
| [`Remnant_Get`](#remnant_get) | ⛔ permission denied |  |
| [`GetPurchaseOrderInformation`](#getpurchaseorderinformation) | ⛔ permission denied |  |
| [`GetPurchaseOrderInformationTransactions`](#getpurchaseorderinformationtransactions) | ⛔ permission denied |  |
| [`PurchaseOrder_Get`](#purchaseorder_get) | ⛔ permission denied |  |
| [`PurchaseOrderItem_Get`](#purchaseorderitem_get) | ⛔ permission denied |  |
| [`PurchaseOrderSummary_Get`](#purchaseordersummary_get) | ⚠️ refused |  |
| [`PurchaseOrderItemReceiveTransaction_Get`](#purchaseorderitemreceivetransaction_get) | ⛔ permission denied |  |
| [`PurchaseOrderFOB_Get`](#purchaseorderfob_get) | ⛔ permission denied |  |
| [`PurchaseOrderPaymentTerm_Get`](#purchaseorderpaymentterm_get) | ⛔ permission denied |  |
| [`PurchaseOrderPOType_Get`](#purchaseorderpotype_get) | ⛔ permission denied |  |
| [`PurchaseOrderShippingMethod_Get`](#purchaseordershippingmethod_get) | ⛔ permission denied |  |
| [`PurchaseOrderSubcontractItem_Get`](#purchaseordersubcontractitem_get) | ⛔ permission denied |  |
| [`EstimateSummary_Get`](#estimatesummary_get) | ⛔ permission denied |  |
| [`EstimateJobCostSummary_Get`](#estimatejobcostsummary_get) | ⚠️ refused |  |
| [`EstimateJobCostGroupSummary_Get`](#estimatejobcostgroupsummary_get) | ⚠️ refused |  |
| [`CostCode_Get`](#costcode_get) | ⛔ permission denied |  |
| [`CostType_Get`](#costtype_get) | ⛔ permission denied |  |
| [`LaborRate_Get`](#laborrate_get) | ⛔ permission denied |  |
| [`GetCountries`](#getcountries) | ⛔ permission denied |  |

### `GetInventoryLocations`

**Status:** ✅ data

**Purpose.** Inventory location names and secondary locations.

**Answers:** What yard/inventory locations exist?

**Request that worked:**

```json
{"JobNumber":"EPM-001"}
```

**Result:** HTTP 200, 414 bytes, 117 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `Locations` | object | 1 |  |
| `Locations.Location` | list (22–22) of text | 1 | `0`, `A` |
| `SecondaryLocations` | object | 1 |  |
| `SecondaryLocations.Location` | list (5–5) of text | 1 | `5231`, `5232` |

**Sample** (trimmed; full trimmed sample in [samples/GetInventoryLocations.json](samples/GetInventoryLocations.json)):

```json
{
  "Locations": {
    "Location": [
      "",
      "… 21 more"
    ]
  },
  "SecondaryLocations": {
    "Location": [
      "",
      "… 4 more"
    ]
  }
}
```

**Gotchas:**

- Plain list of strings; the first entry is an empty string.

### `InventoryLocationRestriction_Get`

**Status:** ✅ data

**Purpose.** Whether inventory moves are restricted to certain locations (here: any location allowed).

**Request that worked:**

```json
{"JobNumber":"EPM-001"}
```

**Result:** HTTP 200, 201 bytes, 95 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `ResultData` | object | 1 |  |
| `ResultData.LastLogID` | number (as text) | 1 | `0` |
| `ResultData.InventoryLocationRestriction` | object | 1 |  |
| `ResultData.InventoryLocationRestriction.InventoryLocationRestrictionID` | number (as text) | 1 | `1` |
| `ResultData.InventoryLocationRestriction.AnyLocation` | number (as text) | 1 | `1` |
| `ResultData.InventoryLocationRestriction.Location` | text | 1 |  |
| `ResultData.InventoryLocationRestriction.AnySecondaryLocation` | number (as text) | 1 | `1` |
| `ResultData.InventoryLocationRestriction.SecondaryLocation` | text | 1 |  |

**Sample** (trimmed; full trimmed sample in [samples/InventoryLocationRestriction_Get.json](samples/InventoryLocationRestriction_Get.json)):

```json
{
  "InventoryLocationRestriction": {
    "InventoryLocationRestrictionID": "1",
    "AnyLocation": "1",
    "Location": "",
    "AnySecondaryLocation": "1",
    "SecondaryLocation": ""
  }
}
```

### `GetInventoryTransactions`

**Status:** ✅ data

**Purpose.** Inventory transactions since an ID.

**Request that worked:**

```json
{"LastTransactionID":0}
```

**Result:** HTTP 200, 97 bytes, 131 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `LastTransactionID` | number (as text) | 1 | `651` |

**Sample** (trimmed; full trimmed sample in [samples/GetInventoryTransactions.json](samples/GetInventoryTransactions.json)):

```json
{
  "LastTransactionID": "651"
}
```

**Gotchas:**

- Returned only `LastTransactionID` (651), with no transactions, for `{}` and `LastTransactionID: 0`. Likely limited by the missing inventory permission.

### `GetPricingInformation`

**Status:** ✅ data

**Purpose.** The material price list: supplier, shape, grade, size, and prices by length.

**Request that worked:**

```json
{"JobNumber":"EPM-001"}
```

**Result:** HTTP 200, 4,145,221 bytes, 4984 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `AvailableMaterial` | list (10322–10322) | 1 |  |
| `AvailableMaterial[].SupplierName` | text | 10322 | `Warehouse` |
| `AvailableMaterial[].Shape` | text | 10322 | `C`, `FB` |
| `AvailableMaterial[].Grade` | text | 10322 | `A36`, `A529-50` |
| `AvailableMaterial[].Dimensions` | object | 10322 |  |
| `AvailableMaterial[].Dimensions.@Metric` | number (as text) | 10322 | `0` |
| `AvailableMaterial[].Dimensions.#text` | text | 10322 | `3 x 3.5`, `3 x 4.1` |
| `AvailableMaterial[].MaterialPrice` | object or list | 10322 |  |
| `AvailableMaterial[].MaterialPrice[].Length` | object | 28453 |  |
| `AvailableMaterial[].MaterialPrice[].Length.@UOM` | text | 28453 | `in` |
| `AvailableMaterial[].MaterialPrice[].Length.#text` | number (as text) | 28453 | `240`, `480` |
| `AvailableMaterial[].MaterialPrice[].Price` | object | 28453 |  |
| `AvailableMaterial[].MaterialPrice[].Price.@Currency` | text | 28453 | `USD` |
| `AvailableMaterial[].MaterialPrice[].Price.@Units` | text | 28453 | `/CWT`, `/ITEM` |
| `AvailableMaterial[].MaterialPrice[].Price.#text` | number (as text) | 28453 | `25.6`, `35` |
| `AvailableMaterial[].MaterialPrice.Length` | object | 981 |  |
| `AvailableMaterial[].MaterialPrice.Length.@UOM` | text | 981 | `in` |
| `AvailableMaterial[].MaterialPrice.Length.#text` | number (as text) | 981 | `240`, `480` |
| `AvailableMaterial[].MaterialPrice.Price` | object | 981 |  |
| `AvailableMaterial[].MaterialPrice.Price.@Currency` | text | 981 | `USD` |
| `AvailableMaterial[].MaterialPrice.Price.@Units` | text | 981 | `/CWT` |
| `AvailableMaterial[].MaterialPrice.Price.#text` | number (as text) | 981 | `22`, `40` |
| `AvailableMaterial[].MaterialPrice[].Width` | object | 680 |  |
| `AvailableMaterial[].MaterialPrice[].Width.@UOM` | text | 680 | `in` |
| `AvailableMaterial[].MaterialPrice[].Width.#text` | number (as text) | 680 | `48`, `96` |

**Sample** (trimmed; full trimmed sample in [samples/GetPricingInformation.json](samples/GetPricingInformation.json)):

```json
{
  "AvailableMaterial": [
    {
      "SupplierName": "Warehouse",
      "Shape": "C",
      "Grade": "A36",
      "Dimensions": {
        "@Metric": "0",
        "#text": "3 x 3.5"
      },
      "MaterialPrice": [
        {
          "Length": {
            "@UOM": "in",
            "#text": "240"
          },
          "Price": {
            "@Currency": "USD",
            "@Units": "/CWT",
            "#text": "25.6"
          }
        },
        "… 2 more"
      ]
    },
    "… 10321 more"
  ]
}
```

**Gotchas:**

- Huge: about 4 MB and 5 s (10,322 rows). Not job specific.
- Price is `{"@Currency":"USD","@Units":"/CWT","#text":"25.6"}`.
- One or many: `AvailableMaterial.MaterialPrice` came back as an object in one place and a list in another. Always normalise to a list.

### `GetCurrencies`

**Status:** ✅ data

**Purpose.** Currencies (USD only).

**Request that worked:**

```json
{"JobNumber":"EPM-001"}
```

**Result:** HTTP 200, 211 bytes, 94 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `Currency` | object | 1 |  |
| `Currency.CurrencyID` | number (as text) | 1 | `1` |
| `Currency.Abbreviation` | text | 1 | `USD` |
| `Currency.Description` | text | 1 | `US Dollars` |
| `Currency.DisplayPrefix` | text | 1 | `$` |
| `Currency.DecimalPlaces` | number (as text) | 1 | `2` |
| `Currency.DefaultCurrency` | number (as text) | 1 | `1` |

**Sample** (trimmed; full trimmed sample in [samples/GetCurrencies.json](samples/GetCurrencies.json)):

```json
{
  "Currency": {
    "CurrencyID": "1",
    "Abbreviation": "USD",
    "Description": "US Dollars",
    "DisplayPrefix": "$",
    "DecimalPlaces": "2",
    "DefaultCurrency": "1"
  }
}
```

### `GetInventory`

**Status:** ⛔ permission denied

**Purpose.** Inventory items.

**Best attempt:**

```json
{"JobNumber":"TESTTEST"}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: Permission denied.
- `{"JobNumber":"TESTTEST"}` → 422: Permission denied.

**Gotchas:**

- PowerFab answered "Permission denied." for the API user (the PowerFab External User the service logs in as).

### `GetInventorySummary`

**Status:** ⛔ permission denied

**Purpose.** Inventory summary grouped by a field.

**Best attempt:**

```json
{"SummaryField":"Shape"}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: SummaryField is required
- `{"SummaryField":"Shape"}` → 422: Permission denied.
- `{"SummaryField":"Shape"}` → 422: Permission denied.
- `{"JobNumber":"TESTTEST"}` → 422: SummaryField is required

**Gotchas:**

- PowerFab answered "Permission denied." for the API user (the PowerFab External User the service logs in as).
- Needs `SummaryField`, then refused: "Permission denied".

### `GetInventoryLocationSweeps`

**Status:** ⚠️ refused

**Purpose.** Inventory location sweeps.

**Best attempt:**

```json
{"JobNumber":"TESTTEST"}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: InventoryLocationSweepSerialNumber is required
- `{"JobNumber":"TESTTEST"}` → 422: InventoryLocationSweepSerialNumber is required

**Gotchas:**

- Needs `InventoryLocationSweepSerialNumber`; none known, not tried further.

### `InventoryTransaction_GetLastTransactionID`

**Status:** ⛔ permission denied

**Purpose.** Last inventory transaction ID.

**Best attempt:**

```json
{"JobNumber":"TESTTEST"}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: Permission denied.
- `{"JobNumber":"TESTTEST"}` → 422: Permission denied.

**Gotchas:**

- PowerFab answered "Permission denied." for the API user (the PowerFab External User the service logs in as).
- `GetInventoryTransactions` returns the same number.

### `InventoryJobCostingTransaction_Get`

**Status:** ⛔ permission denied

**Purpose.** Inventory job costing transactions.

**Best attempt:**

```json
{"Workflow":"consumed","SinceInventoryTransactionID":0}
```

**Attempts:**

- `{"Workflow":"Inventory","SinceInventoryTransactionID":0}` → 422: Workflow - Value (Inventory) is not valid.
- `{"Workflow":"consumed","SinceInventoryTransactionID":0}` → 422: Permission denied.
- `{"JobNumber":"EPM-001"}` → 422: Workflow - Value is required
- `{"Workflow":"Inventory"}` → 422: SinceInventoryTransactionID - Value is required
- `{"Workflow":"Inventory","SinceInventoryTransactionID":0}` → 422: Workflow - Value (Inventory) is not valid.
- `{"Workflow":"consumed","SinceInventoryTransactionID":0}` → 422: Permission denied.
- `{"JobNumber":"TESTTEST"}` → 422: Workflow - Value is required
- `{"Workflow":"Inventory"}` → 422: SinceInventoryTransactionID - Value is required

**Gotchas:**

- PowerFab answered "Permission denied." for the API user (the PowerFab External User the service logs in as).
- Needs `Workflow` (Tekla: consumed, reserved, Item) and `SinceInventoryTransactionID`, then refused: "Permission denied".

### `ValInventory`

**Status:** ⚠️ refused

**Purpose.** Validates an inventory serial number.

**Best attempt:**

```json
{"JobNumber":"TESTTEST"}
```

**Attempts:**

- `{"JobNumber":"TESTTEST"}` → 422: SerialNumber is required
- `{"JobNumber":"EPM-001"}` → 422: SerialNumber is required

**Gotchas:**

- Needs `SerialNumber`; none known, not tried further.

### `Remnant_Get`

**Status:** ⛔ permission denied

**Purpose.** Remnants.

**Best attempt:**

```json
{"JobNumber":"TESTTEST"}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: Permission denied.
- `{"JobNumber":"TESTTEST"}` → 422: Permission denied.

**Gotchas:**

- PowerFab answered "Permission denied." for the API user (the PowerFab External User the service logs in as).

### `GetPurchaseOrderInformation`

**Status:** ⛔ permission denied

**Purpose.** Purchase orders.

**Best attempt:**

```json
{"JobNumber":"TESTTEST"}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: Permission denied.
- `{"JobNumber":"TESTTEST"}` → 422: Permission denied.

**Gotchas:**

- PowerFab answered "Permission denied." for the API user (the PowerFab External User the service logs in as).

### `GetPurchaseOrderInformationTransactions`

**Status:** ⛔ permission denied

**Purpose.** Purchase order changes.

**Best attempt:**

```json
{"JobNumber":"TESTTEST"}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: Permission denied.
- `{"JobNumber":"TESTTEST"}` → 422: Permission denied.

**Gotchas:**

- PowerFab answered "Permission denied." for the API user (the PowerFab External User the service logs in as).

### `PurchaseOrder_Get`

**Status:** ⛔ permission denied

**Purpose.** Purchase orders (newer read).

**Best attempt:**

```json
{"JobNumber":"TESTTEST"}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: Permission denied.
- `{"JobNumber":"TESTTEST"}` → 422: Permission denied.

**Gotchas:**

- PowerFab answered "Permission denied." for the API user (the PowerFab External User the service logs in as).

### `PurchaseOrderItem_Get`

**Status:** ⛔ permission denied

**Purpose.** Purchase order items.

**Best attempt:**

```json
{"JobNumber":"TESTTEST"}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: Permission denied.
- `{"JobNumber":"TESTTEST"}` → 422: Permission denied.

**Gotchas:**

- PowerFab answered "Permission denied." for the API user (the PowerFab External User the service logs in as).

### `PurchaseOrderSummary_Get`

**Status:** ⚠️ refused

**Purpose.** Purchase order summary over a date range.

**Best attempt:**

```json
{"GetOptions":{"SummaryType":"Job","StartDate":"2017-01-01","EndDate":"2026-12-31"}}
```

**Attempts:**

- `{"GetOptions":{"SummaryType":"Job","StartDate":"2017-01-01","EndDate":"2026-12-31"}}` → 422: SummaryType - Value (Job) is not valid.
- `{"JobNumber":"EPM-001"}` → 422: GetOptions - Element is required
- `{"GetOptions":{"SummaryType":"Job"}}` → 422: StartDate - Value is required
- `{"GetOptions":{"ProductionControlID":13}}` → 422: SummaryType - Value is required
- `{"GetOptions":{"SummaryType":"Job","StartDate":"2017-01-01","EndDate":"2026-12-31"}}` → 422: SummaryType - Value (Job) is not valid.
- `{"GetOptions":{"SummaryType":"Job"}}` → 422: StartDate - Value is required
- `{"GetOptions":{"ProductionControlID":90}}` → 422: SummaryType - Value is required
- `{"JobNumber":"TESTTEST"}` → 422: GetOptions - Element is required

**Gotchas:**

- Needs `GetOptions` with `SummaryType`, `StartDate`, `EndDate`; "Job" is not a valid SummaryType and the real values were not looked up.

### `PurchaseOrderItemReceiveTransaction_Get`

**Status:** ⛔ permission denied

**Purpose.** Receiving transactions on PO items.

**Best attempt:**

```json
{"ExportedSinceUnixTime":0}
```

**Attempts:**

- `{"ExportedSinceUnixTime":0}` → 422: Permission denied.
- `{"JobNumber":"EPM-001"}` → 422: ExportedSinceUnixTime - Value is required
- `{"ExportedSinceUnixTime":0}` → 422: Permission denied.
- `{"JobNumber":"TESTTEST"}` → 422: ExportedSinceUnixTime - Value is required

**Gotchas:**

- PowerFab answered "Permission denied." for the API user (the PowerFab External User the service logs in as).
- Needs `ExportedSinceUnixTime`, then refused: "Permission denied".

### `PurchaseOrderFOB_Get`

**Status:** ⛔ permission denied

**Purpose.** PO FOB terms.

**Best attempt:**

```json
{"JobNumber":"TESTTEST"}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: Permission denied.
- `{"JobNumber":"TESTTEST"}` → 422: Permission denied.

**Gotchas:**

- PowerFab answered "Permission denied." for the API user (the PowerFab External User the service logs in as).

### `PurchaseOrderPaymentTerm_Get`

**Status:** ⛔ permission denied

**Purpose.** PO payment terms.

**Best attempt:**

```json
{"JobNumber":"TESTTEST"}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: Permission denied.
- `{"JobNumber":"TESTTEST"}` → 422: Permission denied.

**Gotchas:**

- PowerFab answered "Permission denied." for the API user (the PowerFab External User the service logs in as).

### `PurchaseOrderPOType_Get`

**Status:** ⛔ permission denied

**Purpose.** PO types.

**Best attempt:**

```json
{"JobNumber":"TESTTEST"}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: Permission denied.
- `{"JobNumber":"TESTTEST"}` → 422: Permission denied.

**Gotchas:**

- PowerFab answered "Permission denied." for the API user (the PowerFab External User the service logs in as).

### `PurchaseOrderShippingMethod_Get`

**Status:** ⛔ permission denied

**Purpose.** PO shipping methods.

**Best attempt:**

```json
{"JobNumber":"TESTTEST"}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: Permission denied.
- `{"JobNumber":"TESTTEST"}` → 422: Permission denied.

**Gotchas:**

- PowerFab answered "Permission denied." for the API user (the PowerFab External User the service logs in as).

### `PurchaseOrderSubcontractItem_Get`

**Status:** ⛔ permission denied

**Purpose.** Subcontract PO items.

**Best attempt:**

```json
{"JobNumber":"TESTTEST"}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: Permission denied.
- `{"JobNumber":"TESTTEST"}` → 422: Permission denied.

**Gotchas:**

- PowerFab answered "Permission denied." for the API user (the PowerFab External User the service logs in as).

### `EstimateSummary_Get`

**Status:** ⛔ permission denied

**Purpose.** Estimate summary.

**Best attempt:**

```json
{"EstimateID":1}
```

**Attempts:**

- `{"EstimateID":1}` → 422: Permission denied.
- `{"JobNumber":"EPM-001"}` → 422: EstimateID - Value is required
- `{"EstimateID":1}` → 422: Permission denied.
- `{"JobNumber":"TESTTEST"}` → 422: EstimateID - Value is required

**Gotchas:**

- PowerFab answered "Permission denied." for the API user (the PowerFab External User the service logs in as).
- Needs `EstimateID`, then refused: "Permission denied".

### `EstimateJobCostSummary_Get`

**Status:** ⚠️ refused

**Purpose.** Estimate job cost summary by cost code or cost type.

**Best attempt:**

```json
{"EstimateJobCostSummary":{"EstimateID":1,"SummaryBy":"CostCode"}}
```

**Attempts:**

- `{"EstimateID":1,"SummaryBy":"CostCode"}` → 422: EstimateJobCostSummary - Element is required
- `{"JobNumber":"EPM-001"}` → 422: SummaryBy - Value is required
- `{"EstimateJobCostSummary":{"EstimateID":1,"SummaryBy":"CostCode"}}` → 422: SummaryBy - Value is required
- `{"SummaryBy":"CostCode","EstimateJobCostSummary":{"EstimateID":1}}` → 422: EstimateID - Value is required
- `{"EstimateID":1,"SummaryBy":"CostCode"}` → 422: EstimateJobCostSummary - Element is required
- `{"EstimateJobCostSummary":{"EstimateID":1,"SummaryBy":"CostCode"}}` → 422: SummaryBy - Value is required
- `{"JobNumber":"TESTTEST"}` → 422: SummaryBy - Value is required
- `{"SummaryBy":"CostCode","EstimateJobCostSummary":{"EstimateID":1}}` → 422: EstimateID - Value is required

**Gotchas:**

- Asks for `SummaryBy` and `EstimateID` but rejects them both at the top level and nested; the expected layout was not found. Estimates are probably refused anyway (see `EstimateSummary_Get`).

### `EstimateJobCostGroupSummary_Get`

**Status:** ⚠️ refused

**Purpose.** Estimate job cost group summary.

**Best attempt:**

```json
{"EstimateID":1,"SummaryBy":"CostCode"}
```

**Attempts:**

- `{"EstimateID":1,"SummaryBy":"CostCode"}` → 422: EstimateJobCostGroupSummary - Element is required
- `{"JobNumber":"EPM-001"}` → 422: SummaryBy - Value is required
- `{"EstimateID":1,"SummaryBy":"CostCode"}` → 422: EstimateJobCostGroupSummary - Element is required
- `{"JobNumber":"TESTTEST"}` → 422: SummaryBy - Value is required

**Gotchas:**

- Same layout problem as `EstimateJobCostSummary_Get`.

### `CostCode_Get`

**Status:** ⛔ permission denied

**Purpose.** Cost codes.

**Best attempt:**

```json
{"JobNumber":"TESTTEST"}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: Permission denied.
- `{"JobNumber":"TESTTEST"}` → 422: Permission denied.

**Gotchas:**

- PowerFab answered "Permission denied." for the API user (the PowerFab External User the service logs in as).

### `CostType_Get`

**Status:** ⛔ permission denied

**Purpose.** Cost types.

**Best attempt:**

```json
{"JobNumber":"TESTTEST"}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: Permission denied.
- `{"JobNumber":"TESTTEST"}` → 422: Permission denied.

**Gotchas:**

- PowerFab answered "Permission denied." for the API user (the PowerFab External User the service logs in as).

### `LaborRate_Get`

**Status:** ⛔ permission denied

**Purpose.** Labor rates.

**Best attempt:**

```json
{"JobNumber":"TESTTEST"}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: Permission denied.
- `{"JobNumber":"TESTTEST"}` → 422: Permission denied.

**Gotchas:**

- PowerFab answered "Permission denied." for the API user (the PowerFab External User the service logs in as).

### `GetCountries`

**Status:** ⛔ permission denied

**Purpose.** Countries.

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
| [`InventoryAdd`](#inventoryadd) | ⏸ not run | Changes data (from the name). |
| [`InventoryMove`](#inventorymove) | ⏸ not run | Changes data (from the name). |
| [`InventoryRemnant_Upsert`](#inventoryremnant_upsert) | ⏸ not run | Creates or edits a InventoryRemnant record (from the name). |
| [`InventoryAuditScan`](#inventoryauditscan) | ⏸ not run | Changes data (from the name). |
| [`InventoryAuditSave`](#inventoryauditsave) | ⏸ not run | Changes data (from the name). |
| [`CreateInventoryLocationSweep`](#createinventorylocationsweep) | ⏸ not run | Changes data (from the name). |
| [`InventoryLocationSweepScan`](#inventorylocationsweepscan) | ⏸ not run | Changes data (from the name). |
| [`InventoryLocationSweepComplete`](#inventorylocationsweepcomplete) | ⏸ not run | Changes data (from the name). |
| [`Receive`](#receive) | ⏸ not run | Receives material, likely against a purchase order (from the name). |
| [`ReceiveASN`](#receiveasn) | ⏸ not run | Receives an advance shipping notice (from the name). |
| [`ReceiveChecklistScan`](#receivechecklistscan) | ⏸ not run | Scans an item on a receiving checklist (from the name). |
| [`PurchaseOrder_UpdateSyncStatus`](#purchaseorder_updatesyncstatus) | ⏸ not run | Changes data (from the name). |
| [`PurchaseOrderFOB_Insert`](#purchaseorderfob_insert) | ⏸ not run | Creates a PurchaseOrderFOB record (from the name). |
| [`PurchaseOrderFOB_Update`](#purchaseorderfob_update) | ⏸ not run | Edits a PurchaseOrderFOB record (from the name). |
| [`PurchaseOrderFOB_Delete`](#purchaseorderfob_delete) | ⏸ not run | Deletes a PurchaseOrderFOB record (from the name). |
| [`PurchaseOrderPaymentTerm_Insert`](#purchaseorderpaymentterm_insert) | ⏸ not run | Creates a PurchaseOrderPaymentTerm record (from the name). |
| [`PurchaseOrderPaymentTerm_Update`](#purchaseorderpaymentterm_update) | ⏸ not run | Edits a PurchaseOrderPaymentTerm record (from the name). |
| [`PurchaseOrderPaymentTerm_Delete`](#purchaseorderpaymentterm_delete) | ⏸ not run | Deletes a PurchaseOrderPaymentTerm record (from the name). |
| [`PurchaseOrderPOType_Insert`](#purchaseorderpotype_insert) | ⏸ not run | Creates a PurchaseOrderPOType record (from the name). |
| [`PurchaseOrderPOType_Update`](#purchaseorderpotype_update) | ⏸ not run | Edits a PurchaseOrderPOType record (from the name). |
| [`PurchaseOrderPOType_Delete`](#purchaseorderpotype_delete) | ⏸ not run | Deletes a PurchaseOrderPOType record (from the name). |
| [`PurchaseOrderShippingMethod_Insert`](#purchaseordershippingmethod_insert) | ⏸ not run | Creates a PurchaseOrderShippingMethod record (from the name). |
| [`PurchaseOrderShippingMethod_Update`](#purchaseordershippingmethod_update) | ⏸ not run | Edits a PurchaseOrderShippingMethod record (from the name). |
| [`PurchaseOrderShippingMethod_Delete`](#purchaseordershippingmethod_delete) | ⏸ not run | Deletes a PurchaseOrderShippingMethod record (from the name). |
| [`PurchaseOrderSubcontractItem_Insert`](#purchaseordersubcontractitem_insert) | ⏸ not run | Creates a PurchaseOrderSubcontractItem record (from the name). |
| [`PurchaseOrderSubcontractItem_Update`](#purchaseordersubcontractitem_update) | ⏸ not run | Edits a PurchaseOrderSubcontractItem record (from the name). |
| [`PurchaseOrderSubcontractItem_Delete`](#purchaseordersubcontractitem_delete) | ⏸ not run | Deletes a PurchaseOrderSubcontractItem record (from the name). |
| [`EstimateSummary_Update`](#estimatesummary_update) | ⏸ not run | Edits a EstimateSummary record (from the name). |
| [`CostCode_Upsert`](#costcode_upsert) | ⏸ not run | Creates or edits a CostCode record (from the name). |
| [`CostCode_Delete`](#costcode_delete) | ⏸ not run | Deletes a CostCode record (from the name). |
| [`CostType_Upsert`](#costtype_upsert) | ⏸ not run | Creates or edits a CostType record (from the name). |
| [`CostType_Delete`](#costtype_delete) | ⏸ not run | Deletes a CostType record (from the name). |
| [`LaborRate_Upsert`](#laborrate_upsert) | ⏸ not run | Creates or edits a LaborRate record (from the name). |
| [`LaborRate_Delete`](#laborrate_delete) | ⏸ not run | Deletes a LaborRate record (from the name). |
| [`IntermediateCompanyCodes`](#intermediatecompanycodes) | ⏸ not run | Unclear from the reference. |

### `InventoryAdd`

**Status:** ⏸ not run

**What it does.** Changes data (from the name).

### `InventoryMove`

**Status:** ⏸ not run

**What it does.** Changes data (from the name).

### `InventoryRemnant_Upsert`

**Status:** ⏸ not run

**What it does.** Creates or edits a InventoryRemnant record (from the name).

### `InventoryAuditScan`

**Status:** ⏸ not run

**What it does.** Changes data (from the name).

### `InventoryAuditSave`

**Status:** ⏸ not run

**What it does.** Changes data (from the name).

### `CreateInventoryLocationSweep`

**Status:** ⏸ not run

**What it does.** Changes data (from the name).

### `InventoryLocationSweepScan`

**Status:** ⏸ not run

**What it does.** Changes data (from the name).

### `InventoryLocationSweepComplete`

**Status:** ⏸ not run

**What it does.** Changes data (from the name).

### `Receive`

**Status:** ⏸ not run

**What it does.** Receives material, likely against a purchase order (from the name).

### `ReceiveASN`

**Status:** ⏸ not run

**What it does.** Receives an advance shipping notice (from the name).

### `ReceiveChecklistScan`

**Status:** ⏸ not run

**What it does.** Scans an item on a receiving checklist (from the name).

### `PurchaseOrder_UpdateSyncStatus`

**Status:** ⏸ not run

**What it does.** Changes data (from the name).

### `PurchaseOrderFOB_Insert`

**Status:** ⏸ not run

**What it does.** Creates a PurchaseOrderFOB record (from the name).

### `PurchaseOrderFOB_Update`

**Status:** ⏸ not run

**What it does.** Edits a PurchaseOrderFOB record (from the name).

### `PurchaseOrderFOB_Delete`

**Status:** ⏸ not run

**What it does.** Deletes a PurchaseOrderFOB record (from the name).

### `PurchaseOrderPaymentTerm_Insert`

**Status:** ⏸ not run

**What it does.** Creates a PurchaseOrderPaymentTerm record (from the name).

### `PurchaseOrderPaymentTerm_Update`

**Status:** ⏸ not run

**What it does.** Edits a PurchaseOrderPaymentTerm record (from the name).

### `PurchaseOrderPaymentTerm_Delete`

**Status:** ⏸ not run

**What it does.** Deletes a PurchaseOrderPaymentTerm record (from the name).

### `PurchaseOrderPOType_Insert`

**Status:** ⏸ not run

**What it does.** Creates a PurchaseOrderPOType record (from the name).

### `PurchaseOrderPOType_Update`

**Status:** ⏸ not run

**What it does.** Edits a PurchaseOrderPOType record (from the name).

### `PurchaseOrderPOType_Delete`

**Status:** ⏸ not run

**What it does.** Deletes a PurchaseOrderPOType record (from the name).

### `PurchaseOrderShippingMethod_Insert`

**Status:** ⏸ not run

**What it does.** Creates a PurchaseOrderShippingMethod record (from the name).

### `PurchaseOrderShippingMethod_Update`

**Status:** ⏸ not run

**What it does.** Edits a PurchaseOrderShippingMethod record (from the name).

### `PurchaseOrderShippingMethod_Delete`

**Status:** ⏸ not run

**What it does.** Deletes a PurchaseOrderShippingMethod record (from the name).

### `PurchaseOrderSubcontractItem_Insert`

**Status:** ⏸ not run

**What it does.** Creates a PurchaseOrderSubcontractItem record (from the name).

### `PurchaseOrderSubcontractItem_Update`

**Status:** ⏸ not run

**What it does.** Edits a PurchaseOrderSubcontractItem record (from the name).

### `PurchaseOrderSubcontractItem_Delete`

**Status:** ⏸ not run

**What it does.** Deletes a PurchaseOrderSubcontractItem record (from the name).

### `EstimateSummary_Update`

**Status:** ⏸ not run

**What it does.** Edits a EstimateSummary record (from the name).

### `CostCode_Upsert`

**Status:** ⏸ not run

**What it does.** Creates or edits a CostCode record (from the name).

### `CostCode_Delete`

**Status:** ⏸ not run

**What it does.** Deletes a CostCode record (from the name).

### `CostType_Upsert`

**Status:** ⏸ not run

**What it does.** Creates or edits a CostType record (from the name).

### `CostType_Delete`

**Status:** ⏸ not run

**What it does.** Deletes a CostType record (from the name).

### `LaborRate_Upsert`

**Status:** ⏸ not run

**What it does.** Creates or edits a LaborRate record (from the name).

### `LaborRate_Delete`

**Status:** ⏸ not run

**What it does.** Deletes a LaborRate record (from the name).

### `IntermediateCompanyCodes`

**Status:** ⏸ not run

**What it does.** Unclear from the reference.
