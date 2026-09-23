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

/**
 * Strips the placeholder item rows the form carries for its own editing before the
 * document is sent.
 *
 * A line always holds at least one item so the marking editor has somewhere to write,
 * but goods that are not tracked one unit at a time never fill it in. Sending it
 * anyway put `productTableId: null` on the wire, which the API cannot read as an int —
 * transfers of ordinary goods were rejected outright with a bare 400.
 */
export const toWarehouseTransferPayload = (
  values: WarehouseTransferForm,
): WarehouseTransferForm => ({
  ...values,
  lines: values.lines.map((line) => ({
    ...line,
    items: line.items.filter((item) => Boolean(item.productTableId)),
  })),
});

export const toMarkingList = (items: WarehouseTransferItemForm[]) =>
  items
    .map((item) => item.markingNumber?.trim())
    .filter((item): item is string => Boolean(item));
