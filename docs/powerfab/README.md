# PowerFab API wiki

What every Tekla PowerFab command returns through this service, checked against a live PowerFab server on
2026-10-19/20. Written for people and for AI agents: each command has the same block (status, request that worked,
response fields, sample, gotchas, feature ideas), and every sample is real data, trimmed.

- **Test job:** `EPM-001` ("Tekla EPM Demo", Closed, ProductionControlID 13, ProjectID 4). Data rich in drawings,
  assemblies, cut lists, RFIs and transmittals, but it has **no loads**. Load samples come from job `25-351`, the
  only job with trucks; those samples carry marks, quantities, weights and dates only.
- **Read only:** only read commands were called. Writes are refused by the service (`POWERFAB_ALLOW_WRITES=false`).
- **Masked:** people's names, usernames, phone numbers and street addresses in samples are replaced with `<redacted>`.
- **Not invented:** everything below was observed in a reply unless it says "inferred" or "not worked out".

## Run summary

- Commands in the table: **252** (122 read, 130 write).
- Read commands called: **122**, 185 requests in all ([calls.json](../../tools/powerfab-wiki/calls.json)).
- ✅ returned data: **54** · ⚪ empty: **10** · ⛔ permission denied: **44** · ⚠️ refused: **14**.
- Write commands: none called. See "Write commands (not run)" on each page.

## Pages

- [Jobs, projects and sequences](jobs-and-projects.md): Find a job, its IDs, status, sequences, lots, filters and schedule.
- [Loads and shipping](loads-and-shipping.md): Trucks, what is on them, what is left to ship, shipping status and load settings.
- [Assemblies, material and drawings](assemblies-and-drawings.md): Main marks, quantities, weights, bill of materials, model IDs, drawings, revisions, RFIs and change orders.
- [Production, cutting and planning](production-and-cutting.md): Stations, routes, cut lists, pick lists, nests, CNC, work areas and work packages.
- [Inventory, purchasing and costs](inventory-purchasing-costs.md): Stock, locations, price lists, purchase orders, receiving, estimates and cost codes.
- [Inspections, reports and exports](inspections-and-reports.md): QC inspections and test records, report types, and the export/report commands.
- [Firms, users and settings](firms-users-settings.md): Customers, addresses, contacts, users, hold rules and the connection itself.

## Quick start

Every call goes through the service with the bearer token:

```bash
curl -s -X POST "https://terra-api.helpiminthe.icu/api/powerfab/GetProjectStatus" -H "Authorization: Bearer $PF_KEY" -H "Content-Type: application/json" -d '{"JobNumber":"EPM-001"}'
```

1. **Find the job's IDs.** `GetProjectStatus` with `JobNumber` returns `ProductionControlID` and `ProjectID`.
   The older `Get*` commands take `JobNumber`; most newer `*_Get` commands need one of the IDs and either
   refuse `JobNumber` or **silently ignore it and return another job's data** (`ProductionControlLoad_Get` did).
2. **Read the reply as XML turned into JSON.** Every value is a string (`"1"`/`"0"` for booleans, numbers as text).
   An element seen once is an object, repeated is a list, so **normalise anything that can repeat to a list**.
   Attributes are `@name`; a value that carries attributes keeps its text in `#text`:
   `"Weight": {"@UOM": "kg", "#text": "412.5"}`. (Before PR #2 the `#text` was dropped and every weight was lost.)
3. **Units.** `@UOM` values were always kg for weight and in or mm for length, even though `InputDisplayUnits`
   says Imperial. The `*_Get` commands give bare metric numbers (kg, mm, m²) with no unit at all.
4. **Errors.** PowerFab refusing a command comes back as HTTP 422 with its message in `detail`, e.g.
   `"ProductionControlID - Value is required"` or `"Permission denied."`. The message names the missing field,
   which is the fastest way to find a command's parameters.

### Common blocks

Many replies repeat these; field tables point here instead of listing them each time.

| Block | What it holds |
|---|---|
| `InputDisplayUnits` | Display unit settings: `SizeUOM`, `LengthUOM`, `WeightUOM`, `PriceUOM` ("Imperial"), length type IDs. It does **not** describe the units of the numbers in the reply. |
| `FilterSet` / `PRJFilterSet` | The filter PowerFab applied, e.g. `Filter.Name` "Job #" with `FilterItem` `@Field1` = ProductionControlID (or ProjectID), `@Field2` / `#text` = job number. |
| `HoldSettings` | What happens to held pieces at each step (see `HoldSettings_Get`). |
| `FieldSettings` | Which load fields are shown/required (see `MaxTruck`). |
| `LastLogID` | A change-log position on `*_Get` replies, likely for incremental sync (not tested). |

## Shapes that differ from what the code assumed

The service's mock and README listed guesses about PowerFab's replies. What the real server does:

| Assumed (mock / README) | Real reply |
|---|---|
| Loads at the top of `GetLoads` as `Load` with `TruckNumber` | Under `Destination.Load[]`, numbered by `LoadNumber` |
| `Shipped` true/false and `ShipDate` | No flag in `GetLoads`: `DateShipped` is present only on shipped loads (`ProductionControlLoad_Get` has `Shipped` "1"/"0" and `ShippedDate`) |
| `Material` with `MainMark`, `Sequence`, `Quantity` | `Material` has `MainMark`, `PieceMark`, `Sequence`, `AssignedQuantity` (planned) and `LoadedQuantity` (on the truck), plus weight, length, shape, size, grade, finish |
| `LoadNumber` in `GetLoads` = `TruckNumber` in `Load` | Still unconfirmed (no write has been run), but `LoadNumber` is the only truck number in the reads |
| Weights as numbers | Objects `{"@UOM":"kg","#text":"…"}`, in kg |
| The first 4 characters of a mark are the sequence | True on 25-351 (mark `52312005`, sequence `5231`), **false on EPM-001** (mark `1B1`, sequence `1`). Use the `Sequence` field |
| `GetProductionControlJobs` lists the jobs | Lists **open** jobs only; closed jobs like EPM-001 are missing |

## Rerunning this

The wiki is generated, so it can be refreshed after a PowerFab permission change or on another job:

```bash
# 1. call the commands (token only in the environment; replies are big, keep them out of the repo)
node tools/powerfab-wiki/probe.mjs tools/powerfab-wiki/calls.json ../powerfab-raw
# 2. rebuild docs/powerfab from the replies
node tools/powerfab-wiki/build.mjs ../powerfab-raw
```

`calls.json` holds every request from this run. Edit it to change the job or add attempts, and put prose in
`tools/powerfab-wiki/meta.mjs`.

## Which command answers which question

| Question | Command | Status |
|---|---|---|
| Who are the customers and ship-to addresses? | [`Firm_Get`](firms-users-settings.md#firm_get) | ✅ data |
| What main marks are on a job and in which sequences? | [`GetAssemblies`](assemblies-and-drawings.md#getassemblies) | ✅ data |
| Which drawings are on a job and are they approved? | [`GetDrawings`](assemblies-and-drawings.md#getdrawings) | ✅ data |
| What yard/inventory locations exist? | [`GetInventoryLocations`](inventory-purchasing-costs.md#getinventorylocations) | ✅ data |
| What is on each truck, and what is left to ship? | [`GetLoads`](loads-and-shipping.md#getloads) | ✅ data |
| Which Tekla model objects belong to a mark? | [`GetModelObjectIDs`](assemblies-and-drawings.md#getmodelobjectids) | ✅ data |
| Which open jobs are there? | [`GetProductionControlJobs`](jobs-and-projects.md#getproductioncontroljobs) | ✅ data |
| How far along is a job in production and shipping? | [`GetProductionShippingStatus`](loads-and-shipping.md#getproductionshippingstatus) | ✅ data |
| What are a job's ProductionControlID and ProjectID, and how big is it? | [`GetProjectStatus`](jobs-and-projects.md#getprojectstatus) | ✅ data |
| Which shipping ticket layouts does PowerFab have? | [`GetReportTypes`](inspections-and-reports.md#getreporttypes) | ✅ data |
| What sequences does a job have and how much does each weigh? | [`GetSequences`](jobs-and-projects.md#getsequences) | ✅ data |
| Which production stations does a job go through? | [`GetStations`](production-and-cutting.md#getstations) | ✅ data |
| What is the next load number, and which load fields are required? | [`MaxTruck`](loads-and-shipping.md#maxtruck) | ✅ data |
| Is the PowerFab connection up? | [`Ping`](firms-users-settings.md#ping) | ✅ data |
| What cut lists exist for a job? | [`ProductionControlCutList_Get`](production-and-cutting.md#productioncontrolcutlist_get) | ✅ data |
| What still has to ship, with full piece details? | [`ProductionControlLoadRemaining_Get`](loads-and-shipping.md#productioncontrolloadremaining_get) | ✅ data |
| What are a truck's totals and who loaded what, when? | [`ProductionControlLoad_Get`](loads-and-shipping.md#productioncontrolload_get) | ✅ data |
| Is this truck number already taken? | [`ProductionControlLoad_IsDuplicateLoadNumber`](loads-and-shipping.md#productioncontrolload_isduplicateloadnumber) | ✅ data |
| Who is the client and detailer on a job, and is it open or closed? | [`Project_Get`](jobs-and-projects.md#project_get) | ✅ data |
| Which PowerFab users exist? | [`UserPartial_Get`](firms-users-settings.md#userpartial_get) | ✅ data |
| Does this job number exist? | [`ValJob`](jobs-and-projects.md#valjob) | ✅ data |

## Empty, refused or not allowed

Everything below came back with no data. Fix the cause in the last column and rerun to fill it in.

| Command | Status | What PowerFab said |
|---|---|---|
| [`CNCData`](production-and-cutting.md#cncdata) | ⚪ empty | Successful, but nothing in the reply |
| [`CostCode_Get`](inventory-purchasing-costs.md#costcode_get) | ⛔ permission denied | Permission denied. |
| [`CostType_Get`](inventory-purchasing-costs.md#costtype_get) | ⛔ permission denied | Permission denied. |
| [`DepartmentShift_Get`](production-and-cutting.md#departmentshift_get) | ⛔ permission denied | Permission denied. |
| [`Department_Get`](production-and-cutting.md#department_get) | ⛔ permission denied | Permission denied. |
| [`DrawingFile_Get`](assemblies-and-drawings.md#drawingfile_get) | ⚠️ refused | DrawingID - Value is required |
| [`DrawingRevision_Get`](assemblies-and-drawings.md#drawingrevision_get) | ⚪ empty | Successful, but nothing in the reply |
| [`EstimateJobCostGroupSummary_Get`](inventory-purchasing-costs.md#estimatejobcostgroupsummary_get) | ⚠️ refused | EstimateJobCostGroupSummary - Element is required |
| [`EstimateJobCostSummary_Get`](inventory-purchasing-costs.md#estimatejobcostsummary_get) | ⚠️ refused | SummaryBy - Value is required |
| [`EstimateSummary_Get`](inventory-purchasing-costs.md#estimatesummary_get) | ⛔ permission denied | Permission denied. |
| [`GetCountries`](inventory-purchasing-costs.md#getcountries) | ⛔ permission denied | Permission denied. |
| [`GetDocument`](assemblies-and-drawings.md#getdocument) | ⚠️ refused | Document index base directory has not been set. |
| [`GetFilterSelections`](jobs-and-projects.md#getfilterselections) | ⚪ empty | Successful, but nothing in the reply |
| [`GetFilterSetDetails`](jobs-and-projects.md#getfiltersetdetails) | ⚪ empty | Successful, but nothing in the reply |
| [`GetInspectionTestRecordSummary`](inspections-and-reports.md#getinspectiontestrecordsummary) | ⛔ permission denied | Permission denied. |
| [`GetInspectionTestRecords`](inspections-and-reports.md#getinspectiontestrecords) | ⛔ permission denied | Permission denied. |
| [`GetInspectionTestRecordsCondensed`](inspections-and-reports.md#getinspectiontestrecordscondensed) | ⛔ permission denied | Permission denied. |
| [`GetInspectionTestSubjects`](inspections-and-reports.md#getinspectiontestsubjects) | ⛔ permission denied | Permission denied. |
| [`GetInspectionTestTypes`](inspections-and-reports.md#getinspectiontesttypes) | ⛔ permission denied | Permission denied. |
| [`GetInspectionTests`](inspections-and-reports.md#getinspectiontests) | ⛔ permission denied | Permission denied. |
| [`GetInventory`](inventory-purchasing-costs.md#getinventory) | ⛔ permission denied | Permission denied. |
| [`GetInventoryLocationSweeps`](inventory-purchasing-costs.md#getinventorylocationsweeps) | ⚠️ refused | InventoryLocationSweepSerialNumber is required |
| [`GetInventorySummary`](inventory-purchasing-costs.md#getinventorysummary) | ⛔ permission denied | Permission denied. |
| [`GetNestData`](production-and-cutting.md#getnestdata) | ⚠️ refused | CutListItemID is required |
| [`GetNestImage`](production-and-cutting.md#getnestimage) | ⚪ empty | Successful, but nothing in the reply |
| [`GetNestStatus`](production-and-cutting.md#getneststatus) | ⚠️ refused | NestID is required. |
| [`GetProjectSchedule`](jobs-and-projects.md#getprojectschedule) | ⚠️ refused | Baseline plan not found. |
| [`GetProjectScheduleBaselinePlans`](jobs-and-projects.md#getprojectschedulebaselineplans) | ⛔ permission denied | Permission denied. |
| [`GetProjectScheduleSnapshots`](jobs-and-projects.md#getprojectschedulesnapshots) | ⚠️ refused | Baseline plan not found. |
| [`GetPurchaseOrderInformation`](inventory-purchasing-costs.md#getpurchaseorderinformation) | ⛔ permission denied | Permission denied. |
| [`GetPurchaseOrderInformationTransactions`](inventory-purchasing-costs.md#getpurchaseorderinformationtransactions) | ⛔ permission denied | Permission denied. |
| [`GetTFSDetails`](production-and-cutting.md#gettfsdetails) | ⚪ empty | Successful, but nothing in the reply |
| [`GetTimeTrackingSubjects`](production-and-cutting.md#gettimetrackingsubjects) | ⛔ permission denied | Permission denied. |
| [`InventoryJobCostingTransaction_Get`](inventory-purchasing-costs.md#inventoryjobcostingtransaction_get) | ⛔ permission denied | Permission denied. |
| [`InventoryTransaction_GetLastTransactionID`](inventory-purchasing-costs.md#inventorytransaction_getlasttransactionid) | ⛔ permission denied | Permission denied. |
| [`LaborRate_Get`](inventory-purchasing-costs.md#laborrate_get) | ⛔ permission denied | Permission denied. |
| [`MachineGroup_Get`](production-and-cutting.md#machinegroup_get) | ⚪ empty | Successful, but nothing in the reply |
| [`Machine_Get`](production-and-cutting.md#machine_get) | ⚪ empty | Successful, but nothing in the reply |
| [`NestSolution_Get`](production-and-cutting.md#nestsolution_get) | ⚪ empty | Successful, but nothing in the reply |
| [`PlanningRuleWarning_Get`](production-and-cutting.md#planningrulewarning_get) | ⛔ permission denied | Permission denied. |
| [`ProductionControlCutListItem_Swap_GetAvailable`](production-and-cutting.md#productioncontrolcutlistitem_swap_getavailable) | ⛔ permission denied | Permission denied. |
| [`ProductionControlJob_Get`](jobs-and-projects.md#productioncontroljob_get) | ⚪ empty | Successful, but nothing in the reply |
| [`ProductionShippingProductivity_Get`](loads-and-shipping.md#productionshippingproductivity_get) | ⚠️ refused | StatusType - Value (ShippingDestination) is not valid. |
| [`PurchaseOrderFOB_Get`](inventory-purchasing-costs.md#purchaseorderfob_get) | ⛔ permission denied | Permission denied. |
| [`PurchaseOrderItemReceiveTransaction_Get`](inventory-purchasing-costs.md#purchaseorderitemreceivetransaction_get) | ⛔ permission denied | Permission denied. |
| [`PurchaseOrderItem_Get`](inventory-purchasing-costs.md#purchaseorderitem_get) | ⛔ permission denied | Permission denied. |
| [`PurchaseOrderPOType_Get`](inventory-purchasing-costs.md#purchaseorderpotype_get) | ⛔ permission denied | Permission denied. |
| [`PurchaseOrderPaymentTerm_Get`](inventory-purchasing-costs.md#purchaseorderpaymentterm_get) | ⛔ permission denied | Permission denied. |
| [`PurchaseOrderShippingMethod_Get`](inventory-purchasing-costs.md#purchaseordershippingmethod_get) | ⛔ permission denied | Permission denied. |
| [`PurchaseOrderSubcontractItem_Get`](inventory-purchasing-costs.md#purchaseordersubcontractitem_get) | ⛔ permission denied | Permission denied. |
| [`PurchaseOrderSummary_Get`](inventory-purchasing-costs.md#purchaseordersummary_get) | ⚠️ refused | SummaryType - Value (Job) is not valid. |
| [`PurchaseOrder_Get`](inventory-purchasing-costs.md#purchaseorder_get) | ⛔ permission denied | Permission denied. |
| [`Remnant_Get`](inventory-purchasing-costs.md#remnant_get) | ⛔ permission denied | Permission denied. |
| [`Transmittal_Get`](assemblies-and-drawings.md#transmittal_get) | ⛔ permission denied | Permission denied. |
| [`TrimbleViewpointSettings_Get`](firms-users-settings.md#trimbleviewpointsettings_get) | ⛔ permission denied | Permission denied. |
| [`ValCutListItem`](production-and-cutting.md#valcutlistitem) | ⚠️ refused | CutListItemID/CutListSerialNumber/ExternalNestID/NestID is required |
| [`ValInventory`](inventory-purchasing-costs.md#valinventory) | ⚠️ refused | SerialNumber is required |
| [`ValTruck`](loads-and-shipping.md#valtruck) | ⚠️ refused | ActionIfNotExist is required |
| [`WorkAreaDepartmentFutureTask_Get`](production-and-cutting.md#workareadepartmentfuturetask_get) | ⛔ permission denied | Permission denied. |
| [`WorkAreaDepartmentScheduleShift_Get`](production-and-cutting.md#workareadepartmentscheduleshift_get) | ⛔ permission denied | Permission denied. |
| [`WorkAreaDepartmentSchedule_Get`](production-and-cutting.md#workareadepartmentschedule_get) | ⛔ permission denied | Permission denied. |
| [`WorkAreaDepartment_Get`](production-and-cutting.md#workareadepartment_get) | ⛔ permission denied | Permission denied. |
| [`WorkPackageDepartmentTaskCompletion_Get`](production-and-cutting.md#workpackagedepartmenttaskcompletion_get) | ⛔ permission denied | Permission denied. |
| [`WorkPackageDepartmentTask_Get`](production-and-cutting.md#workpackagedepartmenttask_get) | ⛔ permission denied | Permission denied. |
| [`WorkPackageDepartment_Get`](production-and-cutting.md#workpackagedepartment_get) | ⛔ permission denied | Permission denied. |
| [`WorkPackageGroup1List_Get`](production-and-cutting.md#workpackagegroup1list_get) | ⛔ permission denied | Permission denied. |
| [`WorkPackageGroup2List_Get`](production-and-cutting.md#workpackagegroup2list_get) | ⛔ permission denied | Permission denied. |
| [`WorkPackage_Get`](production-and-cutting.md#workpackage_get) | ⛔ permission denied | Permission denied. |

## Next steps that would fill the gaps

1. **Permissions.** Most refusals are "Permission denied" for the External User: inventory, purchasing, inspections,
   estimating, cost codes, labor rates, work packages and departments, time tracking, remnants, transmittals and
   Trimble Viewpoint. Granting those in PowerFab and rerunning would document them.
2. **A job with loads on it**, or a few test loads on EPM-001, to see load data on the test job itself.
3. **Parameter values still unknown:** `ProductionShippingProductivity_Get` StatusType, `PurchaseOrderSummary_Get`
   SummaryType, the estimate summaries' layout, a `ScheduleBaselineID`, a drawing `FileName` for `DrawingFile_Get`,
   and options that fill `GetAssemblies` weights and `GetBillOfMaterials` rows. Tekla's XSD files in the PowerFab
   Docs folder on the server would settle these.
