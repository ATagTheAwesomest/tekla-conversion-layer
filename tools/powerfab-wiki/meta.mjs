// Hand-written part of the wiki. build.mjs adds results, field tables and samples from real replies.
// Keep every statement here to what a reply showed, or say plainly that it is inferred.
const w = s => s.trim().split(/\s+/);

export const groups = {
  'jobs-and-projects.md': {
    title: 'Jobs, projects and sequences',
    blurb: 'Find a job, its IDs, status, sequences, lots, filters and schedule.',
    intro: `Start here. Most commands take \`JobNumber\`, but the newer \`*_Get\` commands want PowerFab's internal IDs
instead. A job has two: **ProductionControlID** (production side; 13 for EPM-001) and **ProjectID** (project
side; 4 for EPM-001). \`GetProjectStatus\` returns both in one call, so call it first and keep them.`,
    reads: w(`GetProjectStatus ValJob GetProductionControlJobs ProductionControlJob_Get Project_Get
      GetProductionControlJobInformation GetProductionControlJobInformationTransactions GetSequences GetLots
      GetFilterSelections GetFilterSetDetails FilterSelections_PDC_Get FilterSelections_PRJ_Get FilterSetDetails_Get
      GetProjectSchedule GetProjectScheduleBaselinePlans GetProjectScheduleSnapshots`),
    writes: w('ExportProjectSchedule'),
  },
  'loads-and-shipping.md': {
    title: 'Loads and shipping',
    blurb: 'Trucks, what is on them, what is left to ship, shipping status and load settings.',
    intro: `The commands behind terra-loads-web. **EPM-001 has no loads at all** (\`MaxTruck\` is empty and
\`NextAvailableLoadNumber\` is 1), so the load samples here come from job 25-351, the only job on the server with
trucks. Those samples contain marks, quantities, weights and dates only; nothing in them names a customer or person.
There are two ways to read loads: the older \`GetLoads\` (by JobNumber, units on every value) and the newer
\`ProductionControlLoad_Get\` (by ProductionControlID, more fields, metric numbers with no unit).`,
    reads: w(`GetLoads ProductionControlLoad_Get ProductionControlLoadRemaining_Get MaxTruck
      ProductionControlLoad_InputOptions_Get ProductionControlLoad_IsDuplicateLoadNumber ValTruck
      GetProductionShippingStatus ProductionShippingProductivity_Get`),
    writes: w(`Load Ship Return ProductionControlLoad_Insert ProductionControlLoad_Update ProductionControlLoad_Delete
      ProductionControlLoad_Ship ProductionControlLoad_Unship ProductionControlLoad_AddAttachedFile
      ProductionControlLoadMaterial_Add ProductionControlLoadMaterial_Remove ProductionControlLoadMaterial_Load
      ProductionControlLoadMaterial_Unload ProductionControlLoadMaterial_Return ProductionControlLoadMaterial_Unreturn
      ProductionControlLoadAdditional_Insert ProductionControlLoadAdditional_Update ProductionControlLoadAdditional_Delete`),
  },
  'assemblies-and-drawings.md': {
    title: 'Assemblies, material and drawings',
    blurb: 'Main marks, quantities, weights, bill of materials, model IDs, drawings, revisions, RFIs and change orders.',
    intro: `What a job is made of. For a piece lookup by mark, \`ProductionControlLoadRemaining_Get\` on the loads page
is often better than anything here: it has shape, size, grade, finish, route, weight and drawing for every piece
still to ship, in one call. On EPM-001 the per-assembly weights in \`GetAssemblies\` and \`GetBillOfMaterials\` came
back empty; drawing weights in \`GetDrawings\` and \`Drawing_Get\` are filled.`,
    reads: w(`GetAssemblies GetBillOfMaterials GetCategories GetSubCategories GetModelObjectIDs ProductionControlFinish_Get
      GetDrawings Drawing_Get DrawingRevision_Get DrawingLog_Get DrawingInputOptions_Get DrawingFile_Get GetDocument
      GetTransmittalDetails Transmittal_Get GetRFIDetails GetChangeOrderDetails`),
    writes: w(`Drawing_Insert Drawing_Update Drawing_Delete DrawingRevision_Insert DrawingRevision_Update DrawingRevision_Delete
      DrawingLog_Insert DrawingLog_Update DrawingLog_Delete ProductionControlFinish_Insert ProductionControlFinish_Update
      ProductionControlFinish_Delete`),
  },
  'production-and-cutting.md': {
    title: 'Production, cutting and planning',
    blurb: 'Stations, routes, cut lists, pick lists, nests, CNC, work areas and work packages.',
    intro: `Shop-floor data. EPM-001 has four stations, routes, and one cut list ("Seq 1 WF", ID 1) with 125 cutting
details. Nests, machines and CNC data are empty, and the planning side (work packages, departments, schedules) is
refused for this API user.`,
    reads: w(`GetStations ValStation GetRouteDetails GetTFSDetails ProductionControlCutList_Get GetCutList PickList_Get
      ValCutListItem ProductionControlCutListItem_Swap_GetAvailable GetNestData GetNestImage GetNestStatus NestSolution_Get
      CNCData Machine_Get MachineGroup_Get Workshop_Get WorkArea_Get WorkAreaDepartment_Get WorkAreaDepartmentSchedule_Get
      WorkAreaDepartmentScheduleShift_Get WorkAreaDepartmentFutureTask_Get Department_Get DepartmentShift_Get
      WorkPackage_Get WorkPackageDepartment_Get WorkPackageDepartmentTask_Get WorkPackageDepartmentTaskCompletion_Get
      WorkPackageGroup1List_Get WorkPackageGroup2List_Get ProductionPlanningSettings_Get PlanningRuleWarning_Get
      GetTimeTrackingSubjects`),
    writes: w(`TFSCut TFSManual ShopFloorSave SaveTimeTrackingRecord SetAssemblyAssociation SetInstanceLocation
      SplicePackage_TFS SplitPackage_TFS SaveCNCFile SaveNest SetCutListItemNestID ProductionControlCutListItem_Swap
      ProductionControlCutList_ExportDSTVPlus Department_Upsert Department_Delete DepartmentShift_Upsert DepartmentShift_Delete
      WorkAreaDepartmentSchedule_Upsert WorkAreaDepartmentSchedule_Delete WorkAreaDepartmentSchedule_Move_Start_And_End_Dates
      WorkAreaDepartmentScheduleShift_Upsert WorkAreaDepartmentScheduleShift_Delete WorkAreaDepartmentFutureTask_Upsert
      WorkAreaDepartmentFutureTask_Delete WorkPackage_Insert WorkPackage_Update WorkPackage_Delete WorkPackage_ScheduleToWorkshop
      WorkPackage_Unschedule WorkPackage_OffsetFutureWorkPackage WorkPackageDepartment_Insert WorkPackageDepartment_Update
      WorkPackageDepartment_Delete WorkPackageDepartmentTask_Insert WorkPackageDepartmentTask_Update WorkPackageDepartmentTask_Delete
      WorkPackageDepartmentTask_Schedule WorkPackageDepartmentTask_Unschedule WorkPackageDepartmentTask_Split
      WorkPackageDepartmentTask_OffsetFutureWorkPackage WorkPackageDepartmentTaskCompletion_Insert
      WorkPackageDepartmentTaskCompletion_Update WorkPackageDepartmentTaskCompletion_Delete`),
  },
  'inventory-purchasing-costs.md': {
    title: 'Inventory, purchasing and costs',
    blurb: 'Stock, locations, price lists, purchase orders, receiving, estimates and cost codes.',
    intro: `Almost all of this area is **refused for the API user** ("Permission denied"). What does work: the inventory
location list, the location restriction, the last inventory transaction ID, currencies and the 4 MB price list.
Turning on Inventory and Purchasing permissions for the PowerFab External User would open the rest.`,
    reads: w(`GetInventoryLocations InventoryLocationRestriction_Get GetInventoryTransactions GetPricingInformation GetCurrencies
      GetInventory GetInventorySummary GetInventoryLocationSweeps InventoryTransaction_GetLastTransactionID
      InventoryJobCostingTransaction_Get ValInventory Remnant_Get GetPurchaseOrderInformation
      GetPurchaseOrderInformationTransactions PurchaseOrder_Get PurchaseOrderItem_Get PurchaseOrderSummary_Get
      PurchaseOrderItemReceiveTransaction_Get PurchaseOrderFOB_Get PurchaseOrderPaymentTerm_Get PurchaseOrderPOType_Get
      PurchaseOrderShippingMethod_Get PurchaseOrderSubcontractItem_Get EstimateSummary_Get EstimateJobCostSummary_Get
      EstimateJobCostGroupSummary_Get CostCode_Get CostType_Get LaborRate_Get GetCountries`),
    writes: w(`InventoryAdd InventoryMove InventoryRemnant_Upsert InventoryAuditScan InventoryAuditSave CreateInventoryLocationSweep
      InventoryLocationSweepScan InventoryLocationSweepComplete Receive ReceiveASN ReceiveChecklistScan
      PurchaseOrder_UpdateSyncStatus PurchaseOrderFOB_Insert PurchaseOrderFOB_Update PurchaseOrderFOB_Delete
      PurchaseOrderPaymentTerm_Insert PurchaseOrderPaymentTerm_Update PurchaseOrderPaymentTerm_Delete PurchaseOrderPOType_Insert
      PurchaseOrderPOType_Update PurchaseOrderPOType_Delete PurchaseOrderShippingMethod_Insert PurchaseOrderShippingMethod_Update
      PurchaseOrderShippingMethod_Delete PurchaseOrderSubcontractItem_Insert PurchaseOrderSubcontractItem_Update
      PurchaseOrderSubcontractItem_Delete EstimateSummary_Update CostCode_Upsert CostCode_Delete CostType_Upsert CostType_Delete
      LaborRate_Upsert LaborRate_Delete IntermediateCompanyCodes`),
  },
  'inspections-and-reports.md': {
    title: 'Inspections, reports and exports',
    blurb: 'QC inspections and test records, report types, and the export/report commands.',
    intro: `Inspection reads are all refused for the API user. \`GetReportTypes\` works and lists PowerFab's
report layouts, including shipping tickets. The report and export commands are classed as writes because they make
files or jobs on the server, so they were not run.`,
    reads: w(`GetReportTypes GetInspectionTests GetInspectionTestTypes GetInspectionTestSubjects GetInspectionTestRecords
      GetInspectionTestRecordsCondensed GetInspectionTestRecordSummary`),
    writes: w(`SaveInspectionTestRecord DeleteInspectionTestRecord InspectionDocumentAdd MakeReport PrepareReportData ExportJob
      ExportJobStatus ExtensionCommand`),
  },
  'firms-users-settings.md': {
    title: 'Firms, users and settings',
    blurb: 'Customers, addresses, contacts, users, hold rules and the connection itself.',
    intro: `Server-wide lists, not per job: the same firms and users come back whatever JobNumber is sent. In the
samples, people's names, usernames, phone numbers and street addresses are masked.`,
    reads: w(`Ping Firm_Get FirmAddress_Get FirmAddresses_Get FirmContact_Get UserPartial_Get ValUser HoldSettings_Get
      TrimbleViewpointSettings_Get`),
    writes: w(`Firm_Insert Firm_Update Firm_Delete FirmAddress_Insert FirmAddress_Update FirmAddress_Delete FirmContact_Insert
      FirmContact_Update FirmContact_Delete Lang Version TrimbleIdentityToken TrimbleIdentityAccessToken`),
  },
};

const DENIED = 'Refused with "Permission denied" for the API user. Grant the matching permission to the PowerFab External User and rerun.';

export const commands = {
  // ---- jobs and projects ----
  GetProjectStatus: {
    purpose: 'One-call job summary: both internal IDs, description, assembly/drawing/sequence/lot counts, whether a schedule exists, and the linked Trimble Connect project.',
    ask: 'What are a job\'s ProductionControlID and ProjectID, and how big is it?',
    gotchas: ['Call this first: most `*_Get` commands need `ProductionControlID` or `ProjectID`, not `JobNumber`.'],
    ideas: ['Job header in every app: description, piece count, drawing approval progress (386 of 1131 approved on EPM-001).', '`TrimbleConnect.ProjectID` could open the 3D model in Trimble Connect from the laydown or lookup app.'],
  },
  ValJob: {
    purpose: 'Checks that a job number exists. Reply is just `Successful`.',
    ask: 'Does this job number exist?',
    gotchas: ['Unknown jobs come back as HTTP 422 "The job \'X\' does not exist." (seen for EMP-001 and 26123).'],
    ideas: ['Validate the job field before starting a load in terra-loads-web.'],
  },
  GetProductionControlJobs: {
    purpose: 'Lists production-control jobs.',
    ask: 'Which open jobs are there?',
    gotchas: ['Lists **open jobs only**. EPM-001 is Closed and never appears, even with `JobStatus: "Closed"` (that field was ignored). Sending `JobNumber: "EPM-001"` returned no job at all.', 'With one job the `ProductionControlJob` is an object, not a list.'],
    ideas: ['Job picker for the apps (open jobs only); let users type a closed job and check it with `ValJob`.'],
  },
  ProductionControlJob_Get: {
    purpose: 'Newer-style job read. Returned no job for any input tried.',
    gotchas: ['Came back with only `LastLogID` and an empty `FilterSet` for `{}`, `JobNumber` and `ProductionControlID`. Probably needs a filled `GetOptions.FilterSet`; not worked out.'],
  },
  Project_Get: {
    purpose: 'Project records: job number, description, location, date, status, drawing logs and, with `IncludeFirms`, the firms on the project (client, detailer, billing).',
    ask: 'Who is the client and detailer on a job, and is it open or closed?',
    gotchas: ['`JobNumber` does **not** filter: the reply held both EPM-001 and 25-351. Filter the `Project` list yourself.', '`JobStatus` is an object (`Description`: "Open"/"Closed").'],
    ideas: ['Show the client and ship-to firm on shipping paperwork.'],
  },
  GetProductionControlJobInformation: {
    purpose: 'Job information block: ProductionControlID, job number, description, date, notes.',
    ideas: ['Show job notes to the yard crew.'],
  },
  GetProductionControlJobInformationTransactions: {
    purpose: 'Change history of the job information (old and new values per edit).',
    ideas: ['Audit trail: who changed job info and when (needs a sync loop using `LastLogID`).'],
  },
  GetSequences: {
    purpose: 'Every sequence on the job with assembly count, piece count and total weight.',
    ask: 'What sequences does a job have and how much does each weigh?',
    gotchas: ['Weight is `{"@UOM":"kg","#text":"77814.45…"}`: kilograms with long decimals, even though `InputDisplayUnits` says Imperial. Multiply by 2.20462 for lb.', 'EPM-001 sequences are `1`–`5`; 25-351 sequences are 4 digits (`5231`). Do not assume the sequence is the first 4 characters of a mark: EPM-001 marks look like `1B1`.'],
    ideas: ['Sequence filter and per-sequence progress bars in the shipping and laydown apps.'],
  },
  GetLots: {
    purpose: 'Lots on the job with assembly count, piece count and weight. EPM-001 has one unnamed lot.',
  },
  GetFilterSelections: { purpose: 'Saved filter selections.', unverified: true },
  GetFilterSetDetails: { purpose: 'Details of a filter set.', unverified: true, gotchas: ['Empty without a `FilterSetType`; the right values were not worked out.'] },
  FilterSelections_PDC_Get: {
    purpose: 'Values available for one production-control filter. With `FilterName: "Job #"` it lists the jobs (ProductionControlID + job number) the filter can pick.',
    gotchas: ['Listed only the open jobs (25-351), like `GetProductionControlJobs`.'],
  },
  FilterSelections_PRJ_Get: {
    purpose: 'Values available for one project filter.',
    gotchas: ['With `ProjectID: 4, FilterName: "Job #"` it returned the filter name but no items.'],
  },
  FilterSetDetails_Get: {
    purpose: 'Definitions of the filters PowerFab offers for a filter type (names and how they are selected).',
    unverified: true,
    gotchas: ['`Type: "PDC"` worked; other types were not tried.'],
    ideas: ['Discover which filters can be passed in `GetOptions.FilterSet` to the newer `*_Get` commands.'],
  },
  GetProjectSchedule: {
    purpose: 'The project schedule for a baseline plan.',
    gotchas: ['Needs `ScheduleBaselineID`. 0 and 1 gave "Baseline plan not found", and the command that lists baselines (`GetProjectScheduleBaselinePlans`) is refused, so the real ID is unknown. EPM-001 does have a schedule (`HasProjectSchedule` = 1).'],
  },
  GetProjectScheduleBaselinePlans: { purpose: 'Lists schedule baseline plans.', gotchas: [DENIED] },
  GetProjectScheduleSnapshots: { purpose: 'Schedule snapshots for a baseline plan.', gotchas: ['Needs a `ScheduleBaselineID`; see `GetProjectSchedule`.'] },

  // ---- loads and shipping ----
  GetLoads: {
    purpose: 'Loads (trucks) on a job with what is assigned and loaded on each, plus the material still to ship.',
    ask: 'What is on each truck, and what is left to ship?',
    sample: 'GetLoads__25-351_full',
    gotchas: [
      '**Send all four Include flags.** With only `JobNumber` the reply has the destination name and nothing else. On EPM-001 even the full request is empty because the job has no loads; the sample is from 25-351.',
      'Loads sit under `Destination.Load`, not at the top. Each has `LoadNumber` (the truck number), `AssignedQuantity` and `LoadedQuantity`; `DateShipped` is present **only on shipped loads**.',
      'Pieces are `Material[]` with `MainMark`, `PieceMark`, `Sequence`, `AssignedQuantity`, `LoadedQuantity`, `QuantityAtLocation`. Assigned = planned for this truck, Loaded = actually put on.',
      'Unshipped material is `Destination.Remaining.MaterialRemaining[]` with `TotalQuantity` and `Quantity` (still to ship).',
      'Weights, lengths and capacity are `{"@UOM":"kg","#text":"…"}` / `{"@UOM":"in",…}`. Weight is kg, length is inches, regardless of `InputDisplayUnits`. Read `#text`.',
      'Each `Material` row is one mark on one truck with a quantity, not one row per piece. A mark with quantity 5 is one row.',
    ],
    ideas: ['Truck view in terra-loads-web: assigned vs loaded per truck, with weight totals against `Capacity`.', '"What is left" list from `MaterialRemaining`, filterable by sequence.', 'Shipped history from `DateShipped`.'],
  },
  ProductionControlLoad_Get: {
    purpose: 'Newer load read: every load on a job with totals (quantity, length, weight, gross/model weight, surface area), ship status and, with `IncludeMaterial`, each piece with its item IDs, drawing IDs and load history.',
    ask: 'What are a truck\'s totals and who loaded what, when?',
    sample: 'ProductionControlLoad_Get__pc80',
    gotchas: [
      'Takes `ProductionControlID`, **not** `JobNumber`. Sending only `JobNumber` silently returned the loads of a different job (25-351), so always pass the ID.',
      'Numbers here have **no unit attribute** and are metric: weight in kg, length in mm, area in m². `Capacity` 19958.06 kg is 44,000 lb.',
      '`Shipped` is "1"/"0" and `ShippedDate` appears only when shipped.',
      'Material carries `ProductionControlItemID`, the stable piece ID, and `Loaded` entries with date and quantity: good for history, but `Loaded` is an object for one entry and a list for several.',
      'EPM-001 (ProductionControlID 13) has no loads; the sample is 25-351 (ProductionControlID 80).',
    ],
    ideas: ['Load ticket print: per-truck totals already summed by PowerFab.', 'Loaded-by/date audit per piece.', 'Use `ProductionControlItemID` as the key when the app writes loads back.'],
  },
  ProductionControlLoadRemaining_Get: {
    purpose: 'Every piece on the job that is not yet shipped, with mark, drawing, sequence, quantity remaining, shape, size, grade, finish, route, category, weight, length and surface area.',
    ask: 'What still has to ship, with full piece details?',
    gotchas: ['Needs `ProductionControlID`.', 'Large: 572 KB for EPM-001 (617 rows). Cache it, do not call per scan.', 'Numbers are metric with no unit (kg, mm, m²). `Shape`, `Grade`, `Finish`, `Route` and `ApprovalStatus` are `{"@ID":…,"#text":…}`.', 'Uses `MainMarkDisplay` / `SequenceDisplay`, not `MainMark` / `Sequence` as in GetLoads.'],
    ideas: ['Best single source for the piece lookup app: scan a mark, show size, grade, finish, weight and drawing.', 'Laydown: group remaining pieces by sequence and finish.', 'Weight per piece (`ShippingWeightEach`) for planning truck weights before loading.'],
  },
  MaxTruck: {
    purpose: 'Highest load number on the job, the next free load number, default capacity and which load fields (trailer, carrier, categories) are shown or required.',
    ask: 'What is the next load number, and which load fields are required?',
    gotchas: ['On EPM-001 `MaxTruck` is an empty string (no loads); on 25-351 it was "5" with next 6.', 'Show/Required/RestrictToList flags are "1"/"0" strings.'],
    ideas: ['Suggest the next truck number when creating a load.', 'Build the new-load form from the Show/Required flags.'],
  },
  ProductionControlLoad_InputOptions_Get: {
    purpose: 'Choices for a new load: next load number, default capacity and length, shipped-from firm/address and shipping destination groups.',
    gotchas: ['Needs `ProductionControlID`.'],
    ideas: ['Destination picker on the load form (e.g. galvanizer vs jobsite).'],
  },
  ProductionControlLoad_IsDuplicateLoadNumber: {
    purpose: 'Checks whether a load number is already used on a job.',
    ask: 'Is this truck number already taken?',
    gotchas: ['Needs `ProductionControlID` and `LoadNumber`. Reply `IsDuplicate` "0"/"1".'],
    ideas: ['Live check while typing a truck number.'],
  },
  ValTruck: {
    purpose: 'Validates a truck (load) number.',
    unverified: true,
    gotchas: ['Requires `ActionIfNotExist`, which suggests it can **create** the truck when it does not exist. Not sent, to stay read-only. Use `ProductionControlLoad_IsDuplicateLoadNumber` to check a number instead.'],
  },
  GetProductionShippingStatus: {
    purpose: 'Job-wide progress: total pieces and weight, completion per production station and per shipping destination, plus the list of load numbers.',
    ask: 'How far along is a job in production and shipping?',
    gotchas: ['Progress is in attributes: `@Total`, `@Completed`, `@TWt` (total weight), `@CWt` (completed weight), gross and model variants. Weights in kg.', 'EPM-001: 1230 pieces, 0 completed at every station and 0 shipped.'],
    ideas: ['Progress dashboard: % shipped by weight and count.', 'Station progress strip for the laydown view.'],
  },
  ProductionShippingProductivity_Get: {
    purpose: 'Shipping and production productivity over a date range.',
    gotchas: ['Needs `GetOptions` with `StatusType`, `StartDate`, `EndDate`. Tekla lists StatusType values `productionstation`, `shippingdestination` and others, but the server rejected every spelling tried (lower case, Pascal case, number). Not worked out.'],
  },

  // ---- assemblies and drawings ----
  GetAssemblies: {
    purpose: 'Every assembly (main mark) with drawing number, approval status, quantity per assembly, total quantity, weight and per-sequence quantities.',
    ask: 'What main marks are on a job and in which sequences?',
    gotchas: ['On EPM-001 every `Weight` was `{"@UOM":"kg"}` with no value (all 592). Weights were not tried with other options. Get weight from `GetDrawings` or `ProductionControlLoadRemaining_Get`.', '`AssemblySequence` is an object for one sequence and a list when a mark is in several.'],
    ideas: ['Mark master list for scan validation: an unknown mark gets flagged at once.'],
  },
  GetBillOfMaterials: {
    purpose: 'Same as GetAssemblies plus a `BillOfMaterials` entry per part.',
    gotchas: ['On EPM-001 the `BillOfMaterials` entries were all empty strings and weights empty. The options that fill them were not found.'],
  },
  GetCategories: {
    purpose: 'Totals by category (BEAM, COLUMN, BRACE…): main member count, piece count, weight.',
    ideas: ['Category breakdown on the shipping dashboard.'],
  },
  GetSubCategories: { purpose: 'Totals by sub-category (on EPM-001 these are phases: "Phase 1"…).' },
  GetModelObjectIDs: {
    purpose: 'Tekla model GUIDs for every assembly and its parts, by main mark and sequence.',
    ask: 'Which Tekla model objects belong to a mark?',
    gotchas: ['Slow-ish (about 1 s) and 338 KB on EPM-001.', '`Part.ModelObjectID` can itself be a list.'],
    ideas: ['Highlight a scanned piece in the Trimble Connect 3D model (project ID from `GetProjectStatus`).', 'Colour the model by shipped/loaded status for a yard or erection view.'],
  },
  ProductionControlFinish_Get: {
    purpose: 'Finish codes (PNT Painted, UNP Unpainted, GLV Galvanized…) with descriptions and import mappings.',
    ideas: ['Show the finish name next to the code on piece cards; group laydown by finish.'],
  },
  GetDrawings: {
    purpose: 'Every drawing with description, approval status, revision, quantities and weight.',
    ask: 'Which drawings are on a job and are they approved?',
    gotchas: ['`Revision` was empty on EPM-001 drawings.', 'Weight here is filled (unlike GetAssemblies).'],
    ideas: ['Show drawing approval status on the piece lookup; warn when a piece is not approved for fabrication.'],
  },
  Drawing_Get: {
    purpose: 'Full drawing records: DrawingID, drawing log, category, dates (detailed, shop issue), release number, approval status, and production totals per drawing. With `Revisions`/`Transmittals` set to "all" it adds transmittal history.',
    gotchas: ['Needs `ProjectID`, `ProductionControlID` or `DrawingID`. 485 KB for all 1131 drawings on EPM-001; pass `DrawingID` for one.', 'Approval is an `ApprovalStatusID`; the lookup table (A, P, IFF…) comes back in `ResultData.ApprovalStatus`.'],
    ideas: ['Drawing detail screen behind a scanned piece.'],
  },
  DrawingRevision_Get: { purpose: 'Drawing revisions.', gotchas: ['Empty for `ProjectID: 4`: EPM-001 has no revision records.'] },
  DrawingLog_Get: {
    purpose: 'Drawing logs (Design, Assembly, GA, Multi, Single part) with their folder paths.',
    gotchas: ['Ignores `JobNumber` and returns the logs of every project (155 rows). `Project_Get` gives the logs for one job.'],
  },
  DrawingInputOptions_Get: { purpose: 'Choices for drawing fields: approval statuses, categories, detailer and checker initials.', gotchas: ['Needs `ProjectID`.'] },
  DrawingFile_Get: {
    purpose: 'Fetches a drawing file.',
    gotchas: ['Needs `DrawingID` and `FileName`. No reply showed file names, so it was not completed. It returns file content, so expect a large reply.'],
    ideas: ['Open the shop drawing PDF from a scanned piece, once file names are known.'],
  },
  GetDocument: { purpose: 'Fetches a document from PowerFab\'s document index.', gotchas: ['Server says "Document index base directory has not been set." A PowerFab setting, not an API problem.'] },
  GetTransmittalDetails: {
    purpose: 'Drawing transmittals: number, date, recipient, title, items, purpose, print counts, return date.',
    gotchas: ['Recipient address and phone are in the reply; masked in the sample.'],
  },
  Transmittal_Get: { purpose: 'Newer transmittal read.', gotchas: [DENIED] },
  GetRFIDetails: {
    purpose: 'RFIs on the job: number, date, subject, body, status, overdue flag, originator and recipient.',
    ideas: ['Flag pieces affected by open RFIs (one piece on EPM-001 has `Remark` "GC RFI 27").'],
  },
  GetChangeOrderDetails: { purpose: 'Change orders: number, date, firm, subject, description, cost and days added, approval.' },

  // ---- production and cutting ----
  GetStations: {
    purpose: 'Production stations used on the job and their type.',
    ask: 'Which production stations does a job go through?',
    gotchas: ['Empty for 25-351 but four stations on EPM-001.'],
    ideas: ['Station picker for a future "mark complete at station" feature.'],
  },
  ValStation: { purpose: 'Checks a station name and returns its `StationID`.', gotchas: ['Station names include slashes, e.g. "Cut/Saw/Beamline/BurnTable".'] },
  GetRouteDetails: { purpose: 'A route (e.g. SP "Sample - Painted") and its stations in order.', gotchas: ['Needs `RouteID` or `Route`. Pieces carry their route in `ProductionControlLoadRemaining_Get`.'] },
  GetTFSDetails: {
    purpose: 'Production tracking (TFS) details for a job.',
    gotchas: ['Returned only the envelope for EPM-001, with and without `Station`. Nothing has been tracked through stations on this job (see `GetProductionShippingStatus`: 0 completed).'],
  },
  ProductionControlCutList_Get: { purpose: 'Cut lists on a job with totals (cutting details, cut, remaining, in stock, invalidated).', ask: 'What cut lists exist for a job?' },
  GetCutList: {
    purpose: 'One cut list with every cutting detail: stock size, length, weight, expected drop, status, PO, and the parts cut from it.',
    gotchas: ['Needs `CutListID` (from `ProductionControlCutList_Get`).'],
    ideas: ['Show which stock bar a piece is cut from.'],
  },
  PickList_Get: { purpose: 'The pick list for a cut list: stock to pull, quantity, size, length, weight, PO and supplier.', gotchas: ['Takes `CutListID`. `ProductionControlCutListID` gave "The cut list does not exist".'] },
  ValCutListItem: { purpose: 'Validates a cut list item for cutting.', gotchas: ['Item 37 is valid, but PowerFab answered "Cut list item material is not in stock."'] },
  ProductionControlCutListItem_Swap_GetAvailable: { purpose: 'Stock available to swap in for a cut list item.', gotchas: [DENIED] },
  GetNestData: { purpose: 'Nest data for a cut list item.', gotchas: ['"No nest results available." for item 37: nothing is nested on EPM-001.'] },
  GetNestImage: { purpose: 'Nest image for a cut list item.', gotchas: ['Successful but empty: no nests.'] },
  GetNestStatus: { purpose: 'Status of a nest.', gotchas: ['Needs `NestID`; no item on EPM-001 has one.'] },
  NestSolution_Get: { purpose: 'Nest solutions.', gotchas: ['Empty even with every Include option on.'] },
  CNCData: { purpose: 'CNC data. Tekla describes it as "Retrieves the CNC data".', gotchas: ['Only the envelope came back for `JobNumber`.'] },
  Machine_Get: { purpose: 'Machines.', gotchas: ['None set up.'] },
  MachineGroup_Get: { purpose: 'Machine groups.', gotchas: ['None set up.'] },
  Workshop_Get: { purpose: 'Workshops (one: "Main Workshop").' },
  WorkArea_Get: { purpose: 'Work areas (one: "Main").' },
  WorkAreaDepartment_Get: { purpose: 'Departments in a work area.', gotchas: [DENIED] },
  WorkAreaDepartmentSchedule_Get: { purpose: 'Department schedules.', gotchas: [DENIED] },
  WorkAreaDepartmentScheduleShift_Get: { purpose: 'Department schedule shifts.', gotchas: [DENIED] },
  WorkAreaDepartmentFutureTask_Get: { purpose: 'Future department tasks.', gotchas: [DENIED] },
  Department_Get: { purpose: 'Departments.', gotchas: [DENIED] },
  DepartmentShift_Get: { purpose: 'Department shifts.', gotchas: [DENIED] },
  WorkPackage_Get: { purpose: 'Work packages.', gotchas: [DENIED] },
  WorkPackageDepartment_Get: { purpose: 'Work package departments.', gotchas: [DENIED] },
  WorkPackageDepartmentTask_Get: { purpose: 'Work package department tasks.', gotchas: [DENIED] },
  WorkPackageDepartmentTaskCompletion_Get: { purpose: 'Work package task completions.', gotchas: [DENIED] },
  WorkPackageGroup1List_Get: { purpose: 'Work package group 1 list.', gotchas: [DENIED] },
  WorkPackageGroup2List_Get: { purpose: 'Work package group 2 list.', gotchas: [DENIED] },
  ProductionPlanningSettings_Get: { purpose: 'Production planning settings (week start day, default view).' },
  PlanningRuleWarning_Get: { purpose: 'Planning rule warnings for an item.', gotchas: ['Needs `Type` and `ID`, then refused: "Permission denied".'] },
  GetTimeTrackingSubjects: { purpose: 'Time tracking subjects.', gotchas: [DENIED] },

  // ---- inventory, purchasing, costs ----
  GetInventoryLocations: {
    purpose: 'Inventory location names and secondary locations.',
    ask: 'What yard/inventory locations exist?',
    gotchas: ['Plain list of strings; the first entry is an empty string.'],
    ideas: ['Location picker for the laydown app (where a bundle sits in the yard).'],
  },
  InventoryLocationRestriction_Get: { purpose: 'Whether inventory moves are restricted to certain locations (here: any location allowed).' },
  GetInventoryTransactions: {
    purpose: 'Inventory transactions since an ID.',
    gotchas: ['Returned only `LastTransactionID` (651), with no transactions, for `{}` and `LastTransactionID: 0`. Likely limited by the missing inventory permission.'],
  },
  GetPricingInformation: {
    purpose: 'The material price list: supplier, shape, grade, size, and prices by length.',
    gotchas: ['Huge: about 4 MB and 5 s (10,322 rows). Not job specific.', 'Price is `{"@Currency":"USD","@Units":"/CWT","#text":"25.6"}`.'],
  },
  GetCurrencies: { purpose: 'Currencies (USD only).' },
  GetInventory: { purpose: 'Inventory items.', gotchas: [DENIED] },
  GetInventorySummary: { purpose: 'Inventory summary grouped by a field.', gotchas: ['Needs `SummaryField`, then refused: "Permission denied".'] },
  GetInventoryLocationSweeps: { purpose: 'Inventory location sweeps.', gotchas: ['Needs `InventoryLocationSweepSerialNumber`; none known, not tried further.'] },
  InventoryTransaction_GetLastTransactionID: { purpose: 'Last inventory transaction ID.', gotchas: [DENIED + ' `GetInventoryTransactions` returns the same number.'] },
  InventoryJobCostingTransaction_Get: { purpose: 'Inventory job costing transactions.', gotchas: ['Needs `Workflow` (Tekla: consumed, reserved, Item) and `SinceInventoryTransactionID`, then refused: "Permission denied".'] },
  ValInventory: { purpose: 'Validates an inventory serial number.', gotchas: ['Needs `SerialNumber`; none known, not tried further.'] },
  Remnant_Get: { purpose: 'Remnants.', gotchas: [DENIED] },
  GetPurchaseOrderInformation: { purpose: 'Purchase orders.', gotchas: [DENIED] },
  GetPurchaseOrderInformationTransactions: { purpose: 'Purchase order changes.', gotchas: [DENIED] },
  PurchaseOrder_Get: { purpose: 'Purchase orders (newer read).', gotchas: [DENIED] },
  PurchaseOrderItem_Get: { purpose: 'Purchase order items.', gotchas: [DENIED] },
  PurchaseOrderSummary_Get: { purpose: 'Purchase order summary over a date range.', gotchas: ['Needs `GetOptions` with `SummaryType`, `StartDate`, `EndDate`; "Job" is not a valid SummaryType and the real values were not looked up.'] },
  PurchaseOrderItemReceiveTransaction_Get: { purpose: 'Receiving transactions on PO items.', gotchas: ['Needs `ExportedSinceUnixTime`, then refused: "Permission denied".'] },
  PurchaseOrderFOB_Get: { purpose: 'PO FOB terms.', gotchas: [DENIED] },
  PurchaseOrderPaymentTerm_Get: { purpose: 'PO payment terms.', gotchas: [DENIED] },
  PurchaseOrderPOType_Get: { purpose: 'PO types.', gotchas: [DENIED] },
  PurchaseOrderShippingMethod_Get: { purpose: 'PO shipping methods.', gotchas: [DENIED] },
  PurchaseOrderSubcontractItem_Get: { purpose: 'Subcontract PO items.', gotchas: [DENIED] },
  EstimateSummary_Get: { purpose: 'Estimate summary.', gotchas: ['Needs `EstimateID`, then refused: "Permission denied".'] },
  EstimateJobCostSummary_Get: { purpose: 'Estimate job cost summary by cost code or cost type.', gotchas: ['Asks for `SummaryBy` and `EstimateID` but rejects them both at the top level and nested; the expected layout was not found. Estimates are probably refused anyway (see `EstimateSummary_Get`).'] },
  EstimateJobCostGroupSummary_Get: { purpose: 'Estimate job cost group summary.', gotchas: ['Same layout problem as `EstimateJobCostSummary_Get`.'] },
  CostCode_Get: { purpose: 'Cost codes.', gotchas: [DENIED] },
  CostType_Get: { purpose: 'Cost types.', gotchas: [DENIED] },
  LaborRate_Get: { purpose: 'Labor rates.', gotchas: [DENIED] },
  GetCountries: { purpose: 'Countries.', gotchas: [DENIED] },

  // ---- inspections and reports ----
  GetReportTypes: {
    purpose: 'Report layouts PowerFab offers for a report group (`Inspection` or `ProductionControlShippingTicket`).',
    ask: 'Which shipping ticket layouts does PowerFab have?',
    gotchas: ['Needs `ReportGroup`.', 'Generating a report (`MakeReport`) is a write and was not run.'],
    ideas: ['Let the shipping app print PowerFab\'s own shipping ticket once report writes are allowed.'],
  },
  GetInspectionTests: { purpose: 'Inspection tests.', gotchas: [DENIED] },
  GetInspectionTestTypes: { purpose: 'Inspection test types.', gotchas: [DENIED] },
  GetInspectionTestSubjects: { purpose: 'Inspection test subjects.', gotchas: ['Needs `InspectionTestVersionID`, then refused: "Permission denied".'] },
  GetInspectionTestRecords: { purpose: 'Inspection test records.', gotchas: [DENIED] },
  GetInspectionTestRecordsCondensed: { purpose: 'Inspection test records, condensed.', gotchas: [DENIED] },
  GetInspectionTestRecordSummary: { purpose: 'Inspection test record summary.', gotchas: [DENIED] },

  // ---- firms, users, settings ----
  Ping: { purpose: 'Keeps the session alive; returns the idle timeout (43200 s = 12 h) and seconds left.', ask: 'Is the PowerFab connection up?', ideas: ['Connection indicator in the apps.'] },
  Firm_Get: {
    purpose: 'Firms (clients, detailers, coaters, suppliers…) and, with the Include options, their addresses and contacts.',
    ask: 'Who are the customers and ship-to addresses?',
    ideas: ['Ship-to address on the shipping ticket.'],
  },
  FirmAddress_Get: { purpose: 'Firms with their ship-to, bill-to and other addresses and main contact.' },
  FirmAddresses_Get: { purpose: 'Flat list of all firm addresses.' },
  FirmContact_Get: { purpose: 'Flat list of all firm contacts.' },
  UserPartial_Get: {
    purpose: 'PowerFab users: ID, username, name, whether they are production users.',
    ask: 'Which PowerFab users exist?',
    gotchas: ['Names and usernames are masked in the sample.'],
    ideas: ['"Loaded by" picker mapped to PowerFab users.'],
  },
  ValUser: { purpose: 'Checks a username and returns its `UserID`.' },
  HoldSettings_Get: {
    purpose: 'What PowerFab does when a piece is on hold, per step: purchasing, production, inspections, shipping assign/load/ship.',
    gotchas: ['Here `ShippingShip` is "Prevent" and the others "Prompt": a held piece cannot ship. The same block is repeated on many replies as `HoldSettings`.'],
    ideas: ['Warn on scan when a held piece is loaded, and block shipping it, matching PowerFab.'],
  },
  TrimbleViewpointSettings_Get: { purpose: 'Trimble viewpoint settings.', gotchas: [DENIED] },
};

// Write commands: what each does, from the name and Tekla's reference. None were called.
const inferred = '(from the name)';
export const writeNotes = {
  Load: 'Puts pieces on a truck (`CommitType` Save) or takes them off (Delete). Used by the service\'s `/trucks/{truck}/pieces` routes.',
  Ship: 'Marks a truck as shipped. Used by the service\'s `/trucks/{truck}/ship` route.',
  Return: `Returns shipped material ${inferred}.`,
  ProductionControlLoad_Insert: `Creates a load ${inferred}.`,
  ProductionControlLoad_Update: `Edits a load ${inferred}.`,
  ProductionControlLoad_Delete: `Deletes a load ${inferred}.`,
  ProductionControlLoad_Ship: `Ships a load ${inferred}.`,
  ProductionControlLoad_Unship: `Reverses shipping a load ${inferred}.`,
  ProductionControlLoad_AddAttachedFile: `Attaches a file (e.g. a photo or ticket) to a load ${inferred}.`,
  ProductionControlLoadMaterial_Add: `Assigns material to a load ${inferred}.`,
  ProductionControlLoadMaterial_Remove: `Removes assigned material from a load ${inferred}.`,
  ProductionControlLoadMaterial_Load: `Marks assigned material as loaded ${inferred}.`,
  ProductionControlLoadMaterial_Unload: `Marks loaded material as not loaded ${inferred}.`,
  ProductionControlLoadMaterial_Return: `Returns material from a shipped load ${inferred}.`,
  ProductionControlLoadMaterial_Unreturn: `Reverses a return ${inferred}.`,
  ProductionControlLoadAdditional_Insert: `Adds an additional (non-model) item to a load ${inferred}.`,
  ProductionControlLoadAdditional_Update: `Edits an additional load item ${inferred}.`,
  ProductionControlLoadAdditional_Delete: `Deletes an additional load item ${inferred}.`,
  ExportProjectSchedule: `Exports the project schedule ${inferred}.`,
  MakeReport: 'Generates a report on the server ' + inferred + '.',
  PrepareReportData: 'Prepares data for a report ' + inferred + '.',
  ExportJob: 'Starts a job export on the server ' + inferred + '.',
  ExportJobStatus: 'Status of a job export ' + inferred + '. Classed as a write because its effect is unclear; it may be a harmless read.',
  ExtensionCommand: 'Runs a PowerFab extension command. Effect unknown.',
  SaveInspectionTestRecord: `Saves an inspection test record ${inferred}.`,
  DeleteInspectionTestRecord: `Deletes an inspection test record ${inferred}.`,
  InspectionDocumentAdd: `Attaches a document to an inspection ${inferred}.`,
  Lang: 'Unclear from the reference; classed as a write until shown to be a read.',
  Version: 'Probably returns the PowerFab/API version, but classed as a write until shown to be a read.',
  TrimbleIdentityToken: 'Trimble Identity sign-in token. Not called: it deals in credentials.',
  TrimbleIdentityAccessToken: 'Trimble Identity access token. Not called: it deals in credentials.',
  TFSCut: `Records a cut in production tracking ${inferred}.`,
  TFSManual: `Records production tracking manually ${inferred}.`,
  ShopFloorSave: `Saves shop floor progress ${inferred}.`,
  SetInstanceLocation: `Sets where a piece instance is ${inferred}.`,
  IntermediateCompanyCodes: 'Unclear from the reference.',
  Receive: `Receives material, likely against a purchase order ${inferred}.`,
  ReceiveASN: `Receives an advance shipping notice ${inferred}.`,
  ReceiveChecklistScan: `Scans an item on a receiving checklist ${inferred}.`,
};
for (const g of Object.values(groups)) for (const n of g.writes ?? []) {
  if (writeNotes[n]) continue;
  const m = n.match(/^(.*?)_?(Insert|Update|Delete|Upsert)$/);
  writeNotes[n] = m ? `${{ Insert: 'Creates', Update: 'Edits', Delete: 'Deletes', Upsert: 'Creates or edits' }[m[2]]} a ${m[1].replace(/_/g, ' ')} record ${inferred}.` : `Changes data ${inferred}.`;
}

export const readme = {
  top: `# PowerFab API wiki

What every Tekla PowerFab command returns through this service, checked against a live PowerFab server on
2026-10-19/20. Written for people and for AI agents: each command has the same block (status, request that worked,
response fields, sample, gotchas, feature ideas), and every sample is real data, trimmed.

- **Test job:** \`EPM-001\` ("Tekla EPM Demo", Closed, ProductionControlID 13, ProjectID 4). Data rich in drawings,
  assemblies, cut lists, RFIs and transmittals, but it has **no loads**. Load samples come from job \`25-351\`, the
  only job with trucks; those samples carry marks, quantities, weights and dates only.
- **Read only:** only read commands were called. Writes are refused by the service (\`POWERFAB_ALLOW_WRITES=false\`).
- **Masked:** people's names, usernames, phone numbers and street addresses in samples are replaced with \`<redacted>\`.
- **Not invented:** everything below was observed in a reply unless it says "inferred" or "not worked out".`,
  middle: `## Quick start

Every call goes through the service with the bearer token:

\`\`\`bash
curl -s -X POST "https://terra-api.helpiminthe.icu/api/powerfab/GetProjectStatus" -H "Authorization: Bearer $PF_KEY" -H "Content-Type: application/json" -d '{"JobNumber":"EPM-001"}'
\`\`\`

1. **Find the job's IDs.** \`GetProjectStatus\` with \`JobNumber\` returns \`ProductionControlID\` and \`ProjectID\`.
   The older \`Get*\` commands take \`JobNumber\`; most newer \`*_Get\` commands need one of the IDs and either
   refuse \`JobNumber\` or **silently ignore it and return another job's data** (\`ProductionControlLoad_Get\` did).
2. **Read the reply as XML turned into JSON.** Every value is a string (\`"1"\`/\`"0"\` for booleans, numbers as text).
   An element seen once is an object, repeated is a list, so **normalise anything that can repeat to a list**.
   Attributes are \`@name\`; a value that carries attributes keeps its text in \`#text\`:
   \`"Weight": {"@UOM": "kg", "#text": "412.5"}\`. (Before PR #2 the \`#text\` was dropped and every weight was lost.)
3. **Units.** \`@UOM\` values were always kg for weight and in or mm for length, even though \`InputDisplayUnits\`
   says Imperial. The \`*_Get\` commands give bare metric numbers (kg, mm, m²) with no unit at all.
4. **Errors.** PowerFab refusing a command comes back as HTTP 422 with its message in \`detail\`, e.g.
   \`"ProductionControlID - Value is required"\` or \`"Permission denied."\`. The message names the missing field,
   which is the fastest way to find a command's parameters.

### Common blocks

Many replies repeat these; field tables point here instead of listing them each time.

| Block | What it holds |
|---|---|
| \`InputDisplayUnits\` | Display unit settings: \`SizeUOM\`, \`LengthUOM\`, \`WeightUOM\`, \`PriceUOM\` ("Imperial"), length type IDs. It does **not** describe the units of the numbers in the reply. |
| \`FilterSet\` / \`PRJFilterSet\` | The filter PowerFab applied, e.g. \`Filter.Name\` "Job #" with \`FilterItem\` \`@Field1\` = ProductionControlID (or ProjectID), \`@Field2\` / \`#text\` = job number. |
| \`HoldSettings\` | What happens to held pieces at each step (see \`HoldSettings_Get\`). |
| \`FieldSettings\` | Which load fields are shown/required (see \`MaxTruck\`). |
| \`LastLogID\` | A change-log position on \`*_Get\` replies, likely for incremental sync (not tested). |

## Shapes that differ from what the code assumed

The service's mock and README listed guesses about PowerFab's replies. What the real server does:

| Assumed (mock / README) | Real reply |
|---|---|
| Loads at the top of \`GetLoads\` as \`Load\` with \`TruckNumber\` | Under \`Destination.Load[]\`, numbered by \`LoadNumber\` |
| \`Shipped\` true/false and \`ShipDate\` | No flag in \`GetLoads\`: \`DateShipped\` is present only on shipped loads (\`ProductionControlLoad_Get\` has \`Shipped\` "1"/"0" and \`ShippedDate\`) |
| \`Material\` with \`MainMark\`, \`Sequence\`, \`Quantity\` | \`Material\` has \`MainMark\`, \`PieceMark\`, \`Sequence\`, \`AssignedQuantity\` (planned) and \`LoadedQuantity\` (on the truck), plus weight, length, shape, size, grade, finish |
| \`LoadNumber\` in \`GetLoads\` = \`TruckNumber\` in \`Load\` | Still unconfirmed (no write has been run), but \`LoadNumber\` is the only truck number in the reads |
| Weights as numbers | Objects \`{"@UOM":"kg","#text":"…"}\`, in kg |
| The first 4 characters of a mark are the sequence | True on 25-351 (mark \`52312005\`, sequence \`5231\`), **false on EPM-001** (mark \`1B1\`, sequence \`1\`). Use the \`Sequence\` field |
| \`GetProductionControlJobs\` lists the jobs | Lists **open** jobs only; closed jobs like EPM-001 are missing |

## Rerunning this

The wiki is generated, so it can be refreshed after a PowerFab permission change or on another job:

\`\`\`bash
# 1. call the commands (token only in the environment; replies are big, keep them out of the repo)
node tools/powerfab-wiki/probe.mjs tools/powerfab-wiki/calls.json ../powerfab-raw
# 2. rebuild docs/powerfab from the replies
node tools/powerfab-wiki/build.mjs ../powerfab-raw
\`\`\`

\`calls.json\` holds every request from this run. Edit it to change the job or add attempts, and put prose in
\`tools/powerfab-wiki/meta.mjs\`.`,
  bottom: `## Next steps that would fill the gaps

1. **Permissions.** Most refusals are "Permission denied" for the External User: inventory, purchasing, inspections,
   estimating, cost codes, labor rates, work packages and departments, time tracking, remnants, transmittals and
   Trimble Viewpoint. Granting those in PowerFab and rerunning would document them.
2. **A job with loads on it**, or a few test loads on EPM-001, to see load data on the test job itself.
3. **Parameter values still unknown:** \`ProductionShippingProductivity_Get\` StatusType, \`PurchaseOrderSummary_Get\`
   SummaryType, the estimate summaries' layout, a \`ScheduleBaselineID\`, a drawing \`FileName\` for \`DrawingFile_Get\`,
   and options that fill \`GetAssemblies\` weights and \`GetBillOfMaterials\` rows. Tekla's XSD files in the PowerFab
   Docs folder on the server would settle these.`,
};
