import dayjs from "@/config/dayjs";
import type { InventoryAdjustmentDocument } from "../types/type";
import type {
  InventoryAdjustmentForm,
  InventoryAdjustmentItemForm,
  InventoryAdjustmentLineForm,
} from "../types/form";

/**
 * Whether the document takes stock onto the books rather than off it.
 *
 * Booking stock in creates units that never existed before, so their markings are
 * typed in; writing stock off names units the warehouse already holds, so they are
 * picked from stock. The codes mirror the backend's direction resolver.
 */
export const isIncreaseAdjustment = (adjustmentType?: string | null) =>
  ["POSITIVE_ADJUSTMENT", "FOUND_STOCK", "CORRECTION"].includes(
    (adjustmentType ?? "").trim().toUpperCase(),
  );

/** Marking codes may contain any character, so only Excel-paste line breaks and tabs split them. */
export const parseAdjustmentMarkingInput = (value: string) =>
  value
    .split(/[\r\n\t]+/)
    .map((item) => item.trim())
    .filter(Boolean);

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
  // Ma'lumotnomadagi kodlardan biri tanlanadi; "Decrease" backendda yo'q edi.
  adjustmentType: "",
  comment: "",
  lines: [createDefaultAdjustmentLine()],
});

export const mapAdjustmentDetailToForm = (
  record?: InventoryAdjustmentDocument | null,
): InventoryAdjustmentForm => ({
  docDate: record?.docDate ?? dayjs().format("YYYY-MM-DDTHH:mm:ss"),
  warehouseId: record?.warehouseId ?? null,
  adjustmentType: record?.adjustmentType ?? "",
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

/**
 * Tanlangan birliklarning tannarxini partiyalardan oladi.
 *
 * Partiyalar kelib tushgan sana bo'yicha tartiblanadi va har biridan mavjud
 * miqdorcha olinadi — ya'ni FIFO. Bitta mahsulotning partiyalari har xil
 * tannarxda bo'lishi mumkin (1 403 248, 1 249 416, ...), shuning uchun
 * o'rtachasini olish qoldiqni noto'g'ri baholaydi.
 *
 * Partiya topilmasa bo'sh qaytadi: chaqiruvchi 0 ga tushiradi va hujjat
 * provodkasiz qolmasligi uchun foydalanuvchi buni ko'radi.
 */
export const takeBatchUnitCosts = (
  stock: { batches?: { receivedDate?: string; availableQuantity: number; unitCost: number }[] } | undefined,
  count: number,
): number[] => {
  const batches = [...(stock?.batches ?? [])].sort((a, b) =>
    (a.receivedDate ?? "").localeCompare(b.receivedDate ?? ""),
  );

  const costs: number[] = [];
  for (const batch of batches) {
    const take = Math.min(Math.max(0, Math.floor(batch.availableQuantity)), count - costs.length);
    for (let i = 0; i < take; i += 1) costs.push(batch.unitCost);
    if (costs.length >= count) break;
  }

  // Partiyalar yetmasa, oxirgi ma'lum tannarx bilan to'ldiriladi.
  const last = costs[costs.length - 1];
  while (costs.length < count && last !== undefined) costs.push(last);

  return costs;
};

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
      // Backendda CostPrice — decimal, null emas: null yuborilsa so'rov
      // butunlay rad etilardi.
      costPrice: item.costPrice ?? 0,
      // Kirim tuzatishida har bir dona o'z markirovkasi bilan hisobga olinadi.
      markingNumber: item.markingNumber?.trim() || null,
      serialNumber: item.serialNumber?.trim() || null,
    })),
  })),
});
