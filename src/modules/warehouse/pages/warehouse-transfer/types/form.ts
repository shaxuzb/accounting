import type {
  WarehouseDocumentItemForm,
  WarehouseDocumentLineForm,
} from "@/modules/warehouse/shared/components/WarehouseDocumentLinesEditor";

export interface WarehouseTransferForm {
  docDate: string;
  sourceWarehouseId: number | null;
  destinationWarehouseId: number | null;
  comment: string;
  lines: WarehouseTransferLineForm[];
}

export interface WarehouseTransferLineForm extends WarehouseDocumentLineForm {}
export interface WarehouseTransferItemForm extends WarehouseDocumentItemForm {}
