import dayjs from "@/config/dayjs";
import type { WarehouseTransferDocument } from "../types/type";
import type {
  WarehouseTransferForm,
  WarehouseTransferLineForm,
  WarehouseTransferItemForm,
} from "../types/form";

export const createDefaultTransferItem = (): WarehouseTransferItemForm => ({
  productTableId: null,
  costPrice: null,
  markingNumber: null,
  serialNumber: null,
});

export const createDefaultTransferLine = (): WarehouseTransferLineForm => ({
  productId: null,
  productName: "",
  unitId: null,
  unitName: "",
  quantity: null,
  comment: "",
  items: [createDefaultTransferItem()],
});

export const createDefaultTransferForm = (): WarehouseTransferForm => ({
  docDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
  sourceWarehouseId: null,
  destinationWarehouseId: null,
  comment: "",
  lines: [createDefaultTransferLine()],
});

export const mapTransferDetailToForm = (
  record?: WarehouseTransferDocument | null,
): WarehouseTransferForm => ({
  docDate: record?.docDate ?? dayjs().format("YYYY-MM-DDTHH:mm:ss"),
  sourceWarehouseId: record?.sourceWarehouseId ?? null,
  destinationWarehouseId: record?.destinationWarehouseId ?? null,
  comment: record?.comment ?? "",
  lines:
    record?.lines?.map((line) => ({
      productId: line.productId ?? null,
      productName: line.productName ?? "",
      unitId: line.unitId ?? null,
      unitName: line.unitName ?? "",
      quantity: line.quantity ?? null,
      comment: line.comment ?? "",
      items:
        line.items?.map((item) => ({
          productTableId: item.productTableId ?? null,
          costPrice: item.costPrice ?? null,
          markingNumber: item.markingNumber ?? null,
          serialNumber: item.serialNumber ?? null,
        })) ?? [createDefaultTransferItem()],
    })) ?? [createDefaultTransferLine()],
});

export const toMarkingList = (items: WarehouseTransferItemForm[]) =>
  items
    .map((item) => item.markingNumber?.trim())
    .filter((item): item is string => Boolean(item));
