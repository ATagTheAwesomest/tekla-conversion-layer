# PowerFab API wiki

What every Tekla PowerFab command returns through this service, checked against a live PowerFab server on
2026-10-19/20. Written for people and for AI agents: each command has the same block (status, request that worked,
response fields, sample, gotchas), and every sample is real data, trimmed.

- **Test job:** `EPM-001` ("Tekla EPM Demo", Closed, ProductionControlID 13, ProjectID 4). Data rich in drawings,
  assemblies, cut lists, RFIs and transmittals, but it has **no loads**.
- **Second test job:** `TESTTEST` (Open, ProductionControlID 90, ProjectID 29), a copy of a real job with 4,254 pieces and loads. Load samples and the shipping tests come from it.
- **Writes:** run on the two test jobs only, each change undone afterwards. See [Shipping rules](shipping-rules.md) and the write sections of each page.
- **Masked:** people's names, usernames, phone numbers and street addresses in samples are replaced with `<redacted>`.
- **Not invented:** everything below was observed in a reply unless it says "inferred" or "not worked out".

## Run summary

- Commands in the table: **252** (122 read, 130 write).
- Read commands called: **122**, 388 requests in all ([calls.json](../../tools/powerfab-wiki/calls.json)).
- ✅ returned data: **64** · ⚪ empty: **13** · ⛔ permission denied: **31** · ⚠️ refused: **14**.
- Write commands (130), run on the test jobs only: ✅ worked **27** · ⚠️ refused **41** · ⛔ permission denied **1** · ⏸ not run **61**.

## Pages

- [Shipping rules](shipping-rules.md): what PowerFab accepts and refuses when assigning, loading, shipping, unshipping and returning, with its exact messages.
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
   `"ProductionControlID - Value is required"` or `"Permission denied."`. The message names the first missing
   field, so a command's parameters can be found one error at a time.

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
| The first 4 characters of a mark are the sequence | True on TESTTEST (mark `55311005`, sequence `5531`), **false on EPM-001** (mark `1B1`, sequence `1`). The `Sequence` field holds it |
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
| How much capacity does the shop have each week? | [`WorkAreaDepartmentSchedule_Get`](production-and-cutting.md#workareadepartmentschedule_get) | ✅ data |

## Empty, refused or not allowed

Everything below came back with no data. Fix the cause in the last column and rerun to fill it in.

| Command | Status | What PowerFab said |
|---|---|---|
| [`CNCData`](production-and-cutting.md#cncdata) | ⚪ empty | Successful, but nothing in the reply |
| [`CostCode_Get`](inventory-purchasing-costs.md#costcode_get) | ⛔ permission denied | Permission denied. |
| [`CostType_Get`](inventory-purchasing-costs.md#costtype_get) | ⛔ permission denied | Permission denied. |
| [`DrawingFile_Get`](assemblies-and-drawings.md#drawingfile_get) | ⚠️ refused | DrawingID - Value is required |
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
| [`PlanningRuleWarning_Get`](production-and-cutting.md#planningrulewarning_get) | ⚪ empty | Successful, but nothing in the reply |
| [`ProductionControlCutListItem_Swap_GetAvailable`](production-and-cutting.md#productioncontrolcutlistitem_swap_getavailable) | ⛔ permission denied | Permission denied. |
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
| [`WorkAreaDepartmentFutureTask_Get`](production-and-cutting.md#workareadepartmentfuturetask_get) | ⚪ empty | Successful, but nothing in the reply |
| [`WorkPackageDepartmentTaskCompletion_Get`](production-and-cutting.md#workpackagedepartmenttaskcompletion_get) | ⚠️ refused | WorkPackageDepartmentTaskCompletion - Element is required |
| [`WorkPackageGroup1List_Get`](production-and-cutting.md#workpackagegroup1list_get) | ⚪ empty | Successful, but nothing in the reply |
| [`WorkPackageGroup2List_Get`](production-and-cutting.md#workpackagegroup2list_get) | ⚪ empty | Successful, but nothing in the reply |
| [`WorkPackage_Get`](production-and-cutting.md#workpackage_get) | ⚪ empty | Successful, but nothing in the reply |

## Write commands that did not work

| Command | Status | What PowerFab said (last attempt) |
|---|---|---|
| [`DeleteInspectionTestRecord`](inspections-and-reports.md#deleteinspectiontestrecord) | ⚠️ refused | InspectionTestRecordID is required |
| [`DrawingLog_Delete`](assemblies-and-drawings.md#drawinglog_delete) | ⚠️ refused | DrawingLogID - Value is required |
| [`DrawingLog_Insert`](assemblies-and-drawings.md#drawinglog_insert) | ⚠️ refused | Permission denied. |
| [`DrawingLog_Update`](assemblies-and-drawings.md#drawinglog_update) | ⚠️ refused | DrawingLog - Element is required |
| [`ExportProjectSchedule`](jobs-and-projects.md#exportprojectschedule) | ⚠️ refused | ScheduleBaselineID is required. |
| [`InspectionDocumentAdd`](inspections-and-reports.md#inspectiondocumentadd) | ⚠️ refused | InspectionTestRecordID is required |
| [`MakeReport`](inspections-and-reports.md#makereport) | ⚠️ refused | ProductionControlID report option is required. |
| [`PrepareReportData`](inspections-and-reports.md#preparereportdata) | ⚠️ refused | ProductionControlID report option is required. |
| [`ProductionControlCutListItem_Swap`](production-and-cutting.md#productioncontrolcutlistitem_swap) | ⚠️ refused | ProductionControlCutListItemID - Value is required |
| [`ProductionControlLoadMaterial_Return`](loads-and-shipping.md#productioncontrolloadmaterial_return) | ⚠️ refused | Unable to return items from the jobsite. |
| [`ProductionControlLoadMaterial_Unreturn`](loads-and-shipping.md#productioncontrolloadmaterial_unreturn) | ⚠️ refused | ProductionControlItemTrucksReturnID - Value is required |
| [`ProductionControlLoad_AddAttachedFile`](loads-and-shipping.md#productioncontrolload_addattachedfile) | ⚠️ refused | ProductionControlLoadID - Value is required |
| [`Return`](loads-and-shipping.md#return) | ⚠️ refused | The load 'WIKI-2' has not been shipped. |
| [`SaveCNCFile`](production-and-cutting.md#savecncfile) | ⚠️ refused | CNCFileID is required |
| [`SaveInspectionTestRecord`](inspections-and-reports.md#saveinspectiontestrecord) | ⚠️ refused | InspectionTestVersionID is required |
| [`SaveNest`](production-and-cutting.md#savenest) | ⛔ permission denied | Permission denied. |
| [`SaveTimeTrackingRecord`](production-and-cutting.md#savetimetrackingrecord) | ⚠️ refused | StartDate is required |
| [`SetAssemblyAssociation`](production-and-cutting.md#setassemblyassociation) | ⚠️ refused | MainMark is required |
| [`SetCutListItemNestID`](production-and-cutting.md#setcutlistitemnestid) | ⚠️ refused | CutListItem is required. |
| [`SplicePackage_TFS`](production-and-cutting.md#splicepackage_tfs) | ⚠️ refused | NestSolutionID - Value is required |
| [`SplitPackage_TFS`](production-and-cutting.md#splitpackage_tfs) | ⚠️ refused | NestSolutionID - Value is required |
| [`TFSCut`](production-and-cutting.md#tfscut) | ⚠️ refused | CutListItemID/CutListSerialNumber/ExternalNestID/NestID is required |
| [`TFSManual`](production-and-cutting.md#tfsmanual) | ⚠️ refused | Quantity is required |
| [`WorkPackageDepartmentTaskCompletion_Delete`](production-and-cutting.md#workpackagedepartmenttaskcompletion_delete) | ⚠️ refused | HTTP 502 from the tunnel |
| [`WorkPackageDepartmentTaskCompletion_Insert`](production-and-cutting.md#workpackagedepartmenttaskcompletion_insert) | ⚠️ refused | HTTP 502 from the tunnel |
| [`WorkPackageDepartmentTaskCompletion_Update`](production-and-cutting.md#workpackagedepartmenttaskcompletion_update) | ⚠️ refused | HTTP 502 from the tunnel |
| [`WorkPackageDepartmentTask_Delete`](production-and-cutting.md#workpackagedepartmenttask_delete) | ⚠️ refused | WorkPackageDepartmentTaskID - Value is required |
| [`WorkPackageDepartmentTask_Insert`](production-and-cutting.md#workpackagedepartmenttask_insert) | ⚠️ refused | WorkPackageDepartmentID - Value is required |
| [`WorkPackageDepartmentTask_OffsetFutureWorkPackage`](production-and-cutting.md#workpackagedepartmenttask_offsetfutureworkpackage) | ⚠️ refused | WorkPackageDepartmentTaskID - Value is required |
| [`WorkPackageDepartmentTask_Schedule`](production-and-cutting.md#workpackagedepartmenttask_schedule) | ⚠️ refused | WorkPackageDepartmentTaskID - Value is required |
| [`WorkPackageDepartmentTask_Split`](production-and-cutting.md#workpackagedepartmenttask_split) | ⚠️ refused | WorkPackageDepartmentTaskID - Value is required |
| [`WorkPackageDepartmentTask_Unschedule`](production-and-cutting.md#workpackagedepartmenttask_unschedule) | ⚠️ refused | WorkPackageDepartmentTaskID - Value is required |
| [`WorkPackageDepartmentTask_Update`](production-and-cutting.md#workpackagedepartmenttask_update) | ⚠️ refused | WorkPackageDepartmentTaskID - Value is required |
| [`WorkPackageDepartment_Delete`](production-and-cutting.md#workpackagedepartment_delete) | ⚠️ refused | WorkPackageDepartmentID - Value is required |
| [`WorkPackageDepartment_Insert`](production-and-cutting.md#workpackagedepartment_insert) | ⚠️ refused | WorkPackageID - Value is required |
| [`WorkPackageDepartment_Update`](production-and-cutting.md#workpackagedepartment_update) | ⚠️ refused | WorkPackageDepartmentID - Value is required |
| [`WorkPackage_Delete`](production-and-cutting.md#workpackage_delete) | ⚠️ refused | WorkPackageID - Value is required |
| [`WorkPackage_Insert`](production-and-cutting.md#workpackage_insert) | ⚠️ refused | Permission denied. |
| [`WorkPackage_OffsetFutureWorkPackage`](production-and-cutting.md#workpackage_offsetfutureworkpackage) | ⚠️ refused | WorkPackageID - Value is required |
| [`WorkPackage_ScheduleToWorkshop`](production-and-cutting.md#workpackage_scheduletoworkshop) | ⚠️ refused | WorkshopID - Value is required |
| [`WorkPackage_Unschedule`](production-and-cutting.md#workpackage_unschedule) | ⚠️ refused | WorkPackageID - Value is required |
| [`WorkPackage_Update`](production-and-cutting.md#workpackage_update) | ⚠️ refused | WorkPackageID - Value is required |

## Access of the API user

The PowerFab External User behind the service sees the two test jobs, EPM-001 and TESTTEST. It can read departments,
shifts, work-area schedules and work package departments and tasks, and it can write loads, load material, extra items,
drawings and revisions, exports, shop floor entries and instance locations. Still refused: inventory, purchasing and PO terms, inspections,
estimating, cost codes and types, labor rates, time tracking, remnants, the newer transmittal read, schedule
baselines, countries and Trimble Viewpoint settings.

## Not worked out

Parameter values that no attempt got past: `ProductionShippingProductivity_Get` StatusType,
`PurchaseOrderSummary_Get` SummaryType, the layout of the estimate summaries and of
`WorkPackageDepartmentTaskCompletion_Get`, a valid `ScheduleBaselineID`, a drawing `FileName` for
`DrawingFile_Get`, and any option that fills `GetAssemblies` weights or `GetBillOfMaterials` rows.
