import type {
  WarehouseDocumentItemForm,
  WarehouseDocumentLineForm,
} from "@/modules/warehouse/shared/components/WarehouseDocumentLinesEditor";

export interface InventoryAdjustmentForm {
  docDate: string;
  warehouseId: number | null;
  adjustmentType: string;
  comment: string;
  lines: InventoryAdjustmentLineForm[];
}

export interface InventoryAdjustmentLineForm extends WarehouseDocumentLineForm {}
export interface InventoryAdjustmentItemForm extends WarehouseDocumentItemForm {}
