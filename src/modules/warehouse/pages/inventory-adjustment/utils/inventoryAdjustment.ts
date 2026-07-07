import dayjs from "@/config/dayjs";
import type { InventoryAdjustmentDocument } from "../types/type";
import type {
  InventoryAdjustmentForm,
  InventoryAdjustmentItemForm,
  InventoryAdjustmentLineForm,
} from "../types/form";

export const createDefaultAdjustmentItem = (): InventoryAdjustmentItemForm => ({
  productTableId: null,
  costPrice: null,
  markingNumber: null,
  serialNumber: null,
});

export const createDefaultAdjustmentLine = (): InventoryAdjustmentLineForm => ({
  productId: null,
  productName: "",
  unitId: null,
  unitName: "",
  quantity: null,
  comment: "",
  items: [createDefaultAdjustmentItem()],
});

export const createDefaultAdjustmentForm = (): InventoryAdjustmentForm => ({
  docDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
  warehouseId: null,
  adjustmentType: "Decrease",
  comment: "",
  lines: [createDefaultAdjustmentLine()],
});

export const mapAdjustmentDetailToForm = (
  record?: InventoryAdjustmentDocument | null,
): InventoryAdjustmentForm => ({
  docDate: record?.docDate ?? dayjs().format("YYYY-MM-DDTHH:mm:ss"),
  warehouseId: record?.warehouseId ?? null,
  adjustmentType: record?.adjustmentType ?? "Decrease",
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
        })) ?? [createDefaultAdjustmentItem()],
    })) ?? [createDefaultAdjustmentLine()],
});

export const toMarkingList = (items: InventoryAdjustmentItemForm[]) =>
  items
    .map((item) => item.markingNumber?.trim())
    .filter((item): item is string => Boolean(item));

export const toInventoryAdjustmentPayload = (form: InventoryAdjustmentForm) => ({
  docDate: form.docDate,
  warehouseId: form.warehouseId,
  adjustmentType: form.adjustmentType,
  comment: form.comment,
  lines: form.lines.map((line) => ({
    productId: line.productId,
    unitId: line.unitId,
    quantity: line.quantity,
    comment: line.comment,
    items: line.items.map((item) => ({
      productTableId: item.productTableId,
      costPrice: item.costPrice,
    })),
  })),
});
