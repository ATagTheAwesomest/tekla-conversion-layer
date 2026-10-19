namespace TeklaConversionLayer;

public enum CommandAccess { Read, Write }

public sealed record PowerFabCommand(string Name, CommandAccess Access)
{
    public bool IsWrite => Access == CommandAccess.Write;
}

/// <summary>
/// Every command in PowerFab's FabSuiteXMLRequest, taken from the property list of
/// fsreqFabSuiteXMLRequest in Tekla's PowerFab 2026 API reference
/// (https://developer.tekla.com/doc/tekla-powerfab/2026/fsreq-fab-suite-xml-request-properties-78439).
/// The Tekla.PowerFab.API package itself only carries the transport (ExecuteRemote), not the command
/// classes, so the reference is the source. The session commands (Connect, ConnectRemote, Close,
/// CloseRemote) and the ConnectionGUID envelope field are left out: PowerFabClient owns the session.
/// </summary>
public static class PowerFabCommands
{
    // One line per area of PowerFab, to keep the list easy to check against Tekla's reference.
    const string Names = """
        CostCode_Delete CostCode_Get CostCode_Upsert CostType_Delete CostType_Get CostType_Upsert
        Department_Delete Department_Get Department_Upsert DepartmentShift_Delete DepartmentShift_Get DepartmentShift_Upsert
        Drawing_Delete Drawing_Get Drawing_Insert Drawing_Update DrawingFile_Get DrawingInputOptions_Get
        DrawingLog_Delete DrawingLog_Get DrawingLog_Insert DrawingLog_Update
        DrawingRevision_Delete DrawingRevision_Get DrawingRevision_Insert DrawingRevision_Update
        EstimateJobCostGroupSummary_Get EstimateJobCostSummary_Get EstimateSummary_Get EstimateSummary_Update
        ExportJob ExportJobStatus ExportProjectSchedule ExtensionCommand
        FilterSelections_PDC_Get FilterSelections_PRJ_Get FilterSetDetails_Get
        Firm_Delete Firm_Get Firm_Insert Firm_Update
        FirmAddress_Delete FirmAddress_Get FirmAddress_Insert FirmAddress_Update FirmAddresses_Get
        FirmContact_Delete FirmContact_Get FirmContact_Insert FirmContact_Update
        GetAssemblies GetBillOfMaterials GetCategories GetChangeOrderDetails GetCountries GetCurrencies GetCutList
        GetDocument GetDrawings GetFilterSelections GetFilterSetDetails
        GetInspectionTestRecords GetInspectionTestRecordsCondensed GetInspectionTestRecordSummary GetInspectionTests
        GetInspectionTestSubjects GetInspectionTestTypes
        GetInventory GetInventoryLocations GetInventoryLocationSweeps GetInventorySummary GetInventoryTransactions
        GetLoads GetLots GetModelObjectIDs GetNestData GetNestImage GetNestStatus GetPricingInformation
        GetProductionControlJobInformation GetProductionControlJobInformationTransactions GetProductionControlJobs
        GetProductionShippingStatus GetProjectSchedule GetProjectScheduleBaselinePlans GetProjectScheduleSnapshots
        GetProjectStatus GetPurchaseOrderInformation GetPurchaseOrderInformationTransactions GetReportTypes
        GetRFIDetails GetRouteDetails GetSequences GetStations GetSubCategories GetTFSDetails
        GetTimeTrackingSubjects GetTransmittalDetails
        HoldSettings_Get IntermediateCompanyCodes Lang Version Ping CNCData MaxTruck
        CreateInventoryLocationSweep InventoryLocationSweepComplete InventoryLocationSweepScan
        InventoryAdd InventoryAuditSave InventoryAuditScan InventoryJobCostingTransaction_Get
        InventoryLocationRestriction_Get InventoryMove InventoryRemnant_Upsert InventoryTransaction_GetLastTransactionID
        DeleteInspectionTestRecord InspectionDocumentAdd SaveInspectionTestRecord
        LaborRate_Delete LaborRate_Get LaborRate_Upsert
        Load Ship Receive ReceiveASN ReceiveChecklistScan Return
        Machine_Get MachineGroup_Get MakeReport PrepareReportData NestSolution_Get PickList_Get
        PlanningRuleWarning_Get ProductionPlanningSettings_Get ProductionShippingProductivity_Get
        ProductionControlCutList_ExportDSTVPlus ProductionControlCutList_Get
        ProductionControlCutListItem_Swap ProductionControlCutListItem_Swap_GetAvailable
        ProductionControlFinish_Delete ProductionControlFinish_Get ProductionControlFinish_Insert ProductionControlFinish_Update
        ProductionControlJob_Get
        ProductionControlLoad_AddAttachedFile ProductionControlLoad_Delete ProductionControlLoad_Get
        ProductionControlLoad_InputOptions_Get ProductionControlLoad_Insert ProductionControlLoad_IsDuplicateLoadNumber
        ProductionControlLoad_Ship ProductionControlLoad_Unship ProductionControlLoad_Update
        ProductionControlLoadAdditional_Delete ProductionControlLoadAdditional_Insert ProductionControlLoadAdditional_Update
        ProductionControlLoadMaterial_Add ProductionControlLoadMaterial_Load ProductionControlLoadMaterial_Remove
        ProductionControlLoadMaterial_Return ProductionControlLoadMaterial_Unload ProductionControlLoadMaterial_Unreturn
        ProductionControlLoadRemaining_Get
        Project_Get Remnant_Get
        PurchaseOrder_Get PurchaseOrder_UpdateSyncStatus PurchaseOrderItem_Get PurchaseOrderItemReceiveTransaction_Get
        PurchaseOrderSummary_Get
        PurchaseOrderFOB_Delete PurchaseOrderFOB_Get PurchaseOrderFOB_Insert PurchaseOrderFOB_Update
        PurchaseOrderPaymentTerm_Delete PurchaseOrderPaymentTerm_Get PurchaseOrderPaymentTerm_Insert PurchaseOrderPaymentTerm_Update
        PurchaseOrderPOType_Delete PurchaseOrderPOType_Get PurchaseOrderPOType_Insert PurchaseOrderPOType_Update
        PurchaseOrderShippingMethod_Delete PurchaseOrderShippingMethod_Get PurchaseOrderShippingMethod_Insert PurchaseOrderShippingMethod_Update
        PurchaseOrderSubcontractItem_Delete PurchaseOrderSubcontractItem_Get PurchaseOrderSubcontractItem_Insert PurchaseOrderSubcontractItem_Update
        SaveCNCFile SaveNest SaveTimeTrackingRecord SetAssemblyAssociation SetCutListItemNestID SetInstanceLocation
        ShopFloorSave SplicePackage_TFS SplitPackage_TFS TFSCut TFSManual
        Transmittal_Get TrimbleIdentityAccessToken TrimbleIdentityToken TrimbleViewpointSettings_Get UserPartial_Get
        ValCutListItem ValInventory ValJob ValStation ValTruck ValUser
        WorkArea_Get WorkAreaDepartment_Get
        WorkAreaDepartmentFutureTask_Delete WorkAreaDepartmentFutureTask_Get WorkAreaDepartmentFutureTask_Upsert
        WorkAreaDepartmentSchedule_Delete WorkAreaDepartmentSchedule_Get WorkAreaDepartmentSchedule_Move_Start_And_End_Dates
        WorkAreaDepartmentSchedule_Upsert
        WorkAreaDepartmentScheduleShift_Delete WorkAreaDepartmentScheduleShift_Get WorkAreaDepartmentScheduleShift_Upsert
        WorkPackage_Delete WorkPackage_Get WorkPackage_Insert WorkPackage_OffsetFutureWorkPackage
        WorkPackage_ScheduleToWorkshop WorkPackage_Unschedule WorkPackage_Update
        WorkPackageDepartment_Delete WorkPackageDepartment_Get WorkPackageDepartment_Insert WorkPackageDepartment_Update
        WorkPackageDepartmentTask_Delete WorkPackageDepartmentTask_Get WorkPackageDepartmentTask_Insert
        WorkPackageDepartmentTask_OffsetFutureWorkPackage WorkPackageDepartmentTask_Schedule WorkPackageDepartmentTask_Split
        WorkPackageDepartmentTask_Unschedule WorkPackageDepartmentTask_Update
        WorkPackageDepartmentTaskCompletion_Delete WorkPackageDepartmentTaskCompletion_Get
        WorkPackageDepartmentTaskCompletion_Insert WorkPackageDepartmentTaskCompletion_Update
        WorkPackageGroup1List_Get WorkPackageGroup2List_Get Workshop_Get
        """;

    /// <summary>
    /// Commands that only look things up, beyond the Get/_Get naming rule. Tekla's reference describes
    /// CNCData ("Retrieves the CNC data") and MaxTruck ("Retrieves the largest truck/load #"); the Val*
    /// commands look like validation lookups by name (the reference has no description). Anything not
    /// shown to be a read counts as a write, so an unclear command (ExportJob, MakeReport,
    /// TrimbleIdentityToken...) stays behind POWERFAB_ALLOW_WRITES.
    /// </summary>
    static readonly HashSet<string> ExtraReads =
    [
        "CNCData", "MaxTruck", "Ping",
        "InventoryTransaction_GetLastTransactionID", "ProductionControlCutListItem_Swap_GetAvailable",
        "ProductionControlLoad_IsDuplicateLoadNumber",
        "ValCutListItem", "ValInventory", "ValJob", "ValStation", "ValTruck", "ValUser",
    ];

    public static IReadOnlyList<PowerFabCommand> All { get; } = Names
        .Split((char[])[' ', '\r', '\n'], StringSplitOptions.RemoveEmptyEntries)
        .Order(StringComparer.Ordinal)
        .Select(name => new PowerFabCommand(name, Classify(name)))
        .ToList();

    static readonly Dictionary<string, PowerFabCommand> ByName = All.ToDictionary(c => c.Name, StringComparer.Ordinal);

    /// <summary>Commands the service runs itself and never forwards.</summary>
    public static readonly HashSet<string> SessionCommands = ["Connect", "ConnectRemote", "Close", "CloseRemote", "ConnectionGUID"];

    public static PowerFabCommand? Find(string name) => ByName.GetValueOrDefault(name);

    static CommandAccess Classify(string name) =>
        name.StartsWith("Get", StringComparison.Ordinal) || name.EndsWith("_Get", StringComparison.Ordinal) || ExtraReads.Contains(name)
            ? CommandAccess.Read
            : CommandAccess.Write;
}
