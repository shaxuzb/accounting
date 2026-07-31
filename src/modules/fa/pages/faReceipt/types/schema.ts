import * as yup from "yup";

const assetSchema = yup.object().shape({
  inventoryNumber: yup.string().required(),
  name: yup.string().required(),
  initialCost: yup.number().min(0).required(),
  salvageValue: yup.number().min(0).required(),
  usefulLifeMonths: yup.number().min(1).required(),
  depreciationMethodId: yup.number().required(),
  faGroupId: yup.number().required(),
  okofId: yup.number().required(),
  commissioningDate: yup.string().required(),
  deprStartDate: yup.string().required(),
  plannedUnitsTotal: yup.number().min(0).required(),
  departmentId: yup.number().required(),
  responsibleUserId: yup.number().required(),
});

const lineSchema = yup.object().shape({
  sourceProductId: yup.number().required(),
  name: yup.string().required(),
  quantity: yup.number().min(1).required(),
  price: yup.number().min(0).required(),
  vatRateId: yup.number().required(),
  assets: yup.array().of(assetSchema).min(1).required(),
});

export const faReceiptSchema = yup.object().shape({
  docDate: yup.string().required(),
  counterpartyId: yup.number().required(),
  warehouseId: yup.number().required(),
  currencyId: yup.number().required(),
  receiptType: yup.string().required(),
  lines: yup.array().of(lineSchema).min(1).required(),
});
