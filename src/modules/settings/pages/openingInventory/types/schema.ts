import * as Yup from "yup";
import type { OpeningInventoryForm } from "./form";
import type { OpeningInventoryRow } from "./type";

export const isCompleteOpeningInventoryLine = (
  line: OpeningInventoryRow,
) => {
  const price = Number(line.price ?? line.pricePerUom ?? 0);
  const qty = Number(line.qty ?? 0);

  return Boolean(line.productId && line.unitId && qty > 0 && price > 0);
};

export const isCompleteOpeningInventoryLineWithAccounts = (
  line: OpeningInventoryRow,
) =>
  isCompleteOpeningInventoryLine(line) &&
  Boolean(line.debitAccountId);

export const openingInventorySchema = Yup.object<OpeningInventoryForm>({
  docDate: Yup.string().trim().required("Sanani tanlang"),
  counterpartyId: Yup.number().required("Kontragentni tanlang"),
  contractId: Yup.number().required("Shartnomani tanlang"),
  warehouseId: Yup.number().required("Omborni tanlang"),
  comment: Yup.string().trim().notRequired(),
  lines: Yup.array()
    .of(
      Yup.object({
        productId: Yup.number().nullable(),
        qty: Yup.number().nullable(),
        unitId: Yup.number().nullable(),
        price: Yup.number().nullable(),
        debitAccountId: Yup.number().nullable(),
      }),
    )
    .required("Kamida bitta mahsulot kiriting"),
}).test(
  "has-lines",
  "Kamida bitta mahsulot kiriting",
  (value: unknown) => {
    const form = value as OpeningInventoryForm | undefined;
    return Boolean(
      form?.lines?.some(isCompleteOpeningInventoryLineWithAccounts),
    );
  },
);
