import * as Yup from "yup";
import type { TFunction } from "i18next";
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

export const createOpeningInventorySchema = (t: TFunction) => Yup.object<OpeningInventoryForm>({
  docDate: Yup.string().trim().required(t("openingInventory.messages.selectDate")),
  counterpartyId: Yup.number().required(t("openingInventory.messages.selectCounterparty")),
  contractId: Yup.number().required(t("openingInventory.messages.selectContract")),
  warehouseId: Yup.number().required(t("openingInventory.messages.selectWarehouse")),
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
    .required(t("openingInventory.messages.addAtLeastOneProduct")),
}).test(
  "has-lines",
  t("openingInventory.messages.addAtLeastOneProduct"),
  (value: unknown) => {
    const form = value as OpeningInventoryForm | undefined;
    return Boolean(
      form?.lines?.some(isCompleteOpeningInventoryLineWithAccounts),
    );
  },
);
