# Shipping rules

What PowerFab accepts and refuses when loads are created, assigned, loaded, shipped, unshipped and returned.
Every rule below was observed on the test jobs EPM-001 and TESTTEST (2026-10-20). The quoted text is PowerFab's own
message. Tekla's reference lists the commands and fields but states no rules, so nothing here comes from it.

[← Back to the index](README.md) · commands on [Loads and shipping](loads-and-shipping.md)

## Words

| Term | Meaning in the replies |
|---|---|
| Load, truck | One `ProductionControlLoad`. `LoadNumber` is free text (`1`, `WIKI-T1` were both accepted). `ProductionControlLoadID` is the stable ID. |
| Assigned | A piece is planned onto the load (`QuantityAssigned`, `Material[].Quantity`). |
| Loaded | A piece is physically on the truck (`QuantityLoaded`, `Material[].QuantityLoaded`, one `Loaded` entry per load action with its own `ID`, date and quantity). |
| Shipped | The whole load is shipped (`Shipped` "1", `ShippedDate`; `GetLoads` shows `DateShipped`). Shipping is per load, never per piece. |
| Extra item | A non-model item on a load (`ProductionControlLoadAdditional_*`) with description, quantity and weight each. It counts in the load's assigned and loaded quantity. |
| Destination | `ShippingDestinationGroupID` empty = jobsite. `1` = "Galvanizer" (firm 6, address 10 on both test jobs). |

## Order of steps

1. **Create the load**: `ProductionControlLoad_Insert`. Needs `ProductionControlID`, `LoadNumber`, `Capacity` and `ShippingDestinationGroupID` (empty string for the jobsite).
2. **Assign pieces**: `ProductionControlLoadMaterial_Add` with `LoadItemsOnAssign` (0 or 1) and `AddItem` rows of `ProductionControlItemID`, `SequenceID`, `Quantity`. Take the IDs from `ProductionControlLoadRemaining_Get`.
3. **Load pieces**: `ProductionControlLoadMaterial_Load` with `DateLoaded` and `LoadItem` rows of `ProductionControlItemTruckID` (from `ProductionControlLoad_Get` with `IncludeMaterial`) and `Quantity`.
4. **Ship**: `ProductionControlLoad_Ship` with `ProductionControlLoadID` and `ShippedDate`.
5. **Undo, in reverse**: `ProductionControlLoad_Unship`, then `ProductionControlLoadMaterial_Unload` (needs the `Loaded.ID` as `ProductionControlItemTrucksLoadID`), then `ProductionControlLoadMaterial_Remove`, then `ProductionControlLoad_Delete`.

On TESTTEST this whole sequence, with three pieces and an extra item, succeeded and left the job as it was.

## What PowerFab refuses

| Action | PowerFab's message | Seen on |
|---|---|---|
| Ship while an assigned piece is not loaded | `There are items assigned to the load that are not yet loaded, it cannot be shipped.` | EPM-001, TESTTEST |
| Ship a load with nothing assigned | `There are no items assigned to the load, it cannot be shipped.` | EPM-001, TESTTEST |
| Unload a piece from a shipped load | `The load has already been shipped.` | TESTTEST |
| Delete a load that has assigned pieces | `There are items assigned to the load, it cannot be deleted.` | TESTTEST |
| Delete a load that has extra items | `There are additional items assigned to the load, it cannot be deleted.` | EPM-001 |
| Return pieces from a load shipped to the jobsite | `Unable to return items from the jobsite.` (`Return` command: `Cannot return a load shipped to the jobsite.`) | EPM-001, TESTTEST |
| Return on a load that is not shipped (`Return` command) | `The load 'WIKI-2' has not been shipped.` | EPM-001 |
| Assign a quantity PowerFab will not allow | `Invalid quantity (1).  0 Max.` | see below |
| Create a galvanizer load without a ship-to firm | `Invalid ship to firm.` | EPM-001 |
| Create a load without `Capacity` | `Capacity - Value is required` | EPM-001 |
| `ValTruck` with `Nothing` for a load that does not exist | `The load 'WIKI-2' does not exist in job 'EPM-001'.` | EPM-001, TESTTEST |

### "Invalid quantity (1).  0 Max."

Seen when assigning or loading a piece that was already on another load, and when assigning any piece to a galvanizer
load (`ShippingDestinationGroupID` 1) on both test jobs. Pieces that were on no load were accepted on jobsite loads. PowerFab
does not say why the maximum is 0 for the galvanizer destination.

## The two command families

| | Older commands | `ProductionControlLoad_*` commands |
|---|---|---|
| Identify the job by | `JobNumber` | `ProductionControlID` |
| Identify the load by | `TruckNumber` (the load number) | `ProductionControlLoadID` |
| Identify a piece by | `MainMark` + `Sequence` | `ProductionControlItemID` + `SequenceID` |
| Create a load | `ValTruck` with `ActionIfNotExist` `Add` (reply `TruckAdded` "1") | `ProductionControlLoad_Insert` |
| Assign and load | `Load` with `CommitType` `Save` does both in one step; `Delete` takes the piece off | `Material_Add` then `Material_Load` |
| Ship | `Ship` with `CommitType` `Ship` | `ProductionControlLoad_Ship` |
| Unship | none: `CommitType` `UnShip`, `Save` and `Delete` were all answered `CommitType is invalid` | `ProductionControlLoad_Unship` |
| Return | `Return` (`CommitType` `Save`/`Delete`) | `Material_Return`, `Material_Unreturn` |
| Delete a load | none | `ProductionControlLoad_Delete` |

A load made with `ValTruck` and filled with `Load` shows up in `ProductionControlLoad_Get`, and the reverse, so both
families act on the same loads. An older-command `Load` `Delete` on a shipped load answers `The load 'WIKI-T2' has been shipped.`

## Counters

- `QuantityAssigned` and `QuantityLoaded` on a load include extra items (3 pieces + an extra item of quantity 2 showed 5 and 5).
- `GetProductionShippingStatus` counts pieces in `ShipStatus` `@Completed` (with `@CWt`, `@CGWt`, `@CMWt` for weights) against `@Total`. Shipping a load of 3 pieces and an extra item of 2 moved TESTTEST from 55 to 58 completed, and unshipping moved it back to 55: extra items are not counted there.
- `ProductionControlLoadRemaining_Get` lists pieces by `QuantityRemaining`; on EPM-001 it went from 617 rows to 582 once other loads had pieces assigned.
- `MaxTruck` gives `MaxTruck` (highest load number) and `NextAvailableLoadNumber`. Both assume numeric load numbers.

## Holds

`HoldSettings_Get` returns `ShippingAssign`, `ShippingLoad` and `ShippingShip`. On both test jobs they were
"Prompt", "Prompt" and "Prevent". No hold was encountered in any test, so the effect of "Prevent" on shipping is not
observed.

## Not observed

Returning pieces (every destination that allows assigning also blocks returns, and the galvanizer destination did not
accept pieces), `Receive`, `ReceiveASN`, attaching a file to a load, and editing a load after it shipped.
