import * as yup from "yup";
import type { TFunction } from "i18next";
import dayjs from "@/config/dayjs";

const assetSchema = (t: TFunction) => yup.object().shape({
  inventoryNumber: yup.string().required(t("fa.validation.inventoryNumberRequired")),
  name: yup.string().required(t("fa.validation.nameRequired")),
  initialCost: yup.number().min(0, t("fa.validation.initialCostNonNegative")).required(t("fa.validation.initialCostRequired")),
  salvageValue: yup.number()
    .min(0, t("fa.validation.salvageValueNonNegative"))
    .max(
      yup.ref("initialCost"),
      t("fa.validation.salvageValueExceedsInitialCost"),
    )
    .required(t("fa.validation.salvageValueRequired")),
  usefulLifeMonths: yup.number().min(1, t("fa.validation.usefulLifeMin")).required(t("fa.validation.usefulLifeRequired")),
  depreciationMethodId: yup.number().required(t("fa.validation.depreciationMethodRequired")),
  faGroupId: yup.number().required(t("fa.validation.groupRequired")),
  okofId: yup.number().required(t("fa.validation.okofRequired")),
  commissioningDate: yup.string().required(t("fa.validation.commissioningDateRequired")),
  deprStartDate: yup.string()
    .test(
      "not-before-commissioning-date",
      t("fa.validation.depreciationStartBeforeCommissioning"),
      function validateDepreciationStart(value) {
        const commissioningDate = this.parent.commissioningDate as
          | string
          | undefined;
        if (!value || !commissioningDate) return true;
        return !dayjs(value).isBefore(dayjs(commissioningDate));
      },
    )
    .required(t("fa.validation.depreciationStartRequired")),
  plannedUnitsTotal: yup.number().min(0, t("fa.validation.plannedUnitsNonNegative")).required(t("fa.validation.plannedUnitsRequired")),
  departmentId: yup.number().required(t("fa.validation.departmentRequired")),
  responsibleUserId: yup.number().required(t("fa.validation.responsibleUserRequired")),
  assetAccountId: yup.number().nullable().required(t("fa.validation.assetAccountRequired")),
  accumulatedDepreciationAccountId: yup.number().nullable().required(t("fa.validation.accumulatedDepreciationAccountRequired")),
  depreciationExpenseAccountId: yup.number().nullable().required(t("fa.validation.depreciationExpenseAccountRequired")),
});

const lineSchema = (t: TFunction) => yup.object().shape({
  sourceProductId: yup.number().required(t("fa.validation.sourceProductRequired")),
  name: yup.string().required(t("fa.validation.nameRequired")),
  quantity: yup.number().min(1, t("fa.validation.quantityMin")).required(t("fa.validation.quantityRequired")),
  price: yup.number().min(0, t("fa.validation.nonNegative")).required(t("fa.validation.priceRequired")),
  vatRateId: yup.number().required(t("fa.validation.vatRateRequired")),
  capitalInvestmentAccountId: yup.number().nullable().required(t("fa.validation.capitalInvestmentAccountRequired")),
  vatAccountId: yup.number().nullable().required(t("fa.validation.vatAccountRequired")),
  assets: yup.array().of(assetSchema(t)).min(1, t("fa.validation.atLeastOneAsset")).required(t("fa.validation.atLeastOneAsset")),
});

export const faReceiptSchema = (t: TFunction) => yup.object().shape({
  docDate: yup.string().required(t("fa.validation.dateRequired")),
  counterpartyId: yup.number().required(t("fa.validation.counterpartyRequired")),
  warehouseId: yup.number().required(t("fa.validation.warehouseRequired")),
  currencyId: yup.number().required(t("fa.validation.currencyRequired")),
  receiptTypeId: yup
    .number()
    .nullable()
    .required(t("fa.validation.receiptTypeRequired")),
  supplierAccountId: yup.number().nullable().required(t("fa.validation.supplierAccountRequired")),
  lines: yup.array().of(lineSchema(t)).min(1, t("fa.validation.atLeastOneLine")).required(t("fa.validation.atLeastOneLine")),
});
