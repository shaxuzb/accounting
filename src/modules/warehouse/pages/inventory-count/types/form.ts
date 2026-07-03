import type {
  InventoryCountItemForm,
  InventoryCountLineForm,
} from "@/modules/warehouse/shared/components/InventoryCountLinesEditor";

export interface InventoryCountForm {
  docDate: string;
  warehouseId: number | null;
  comment: string;
  isCountCompleted: boolean;
  lines: InventoryCountDocumentLineForm[];
}

export interface InventoryCountDocumentLineForm extends InventoryCountLineForm {}
export interface InventoryCountDocumentItemForm extends InventoryCountItemForm {}
