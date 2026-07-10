import * as Yup from "yup";

export const faAssetSchema = Yup.object({
  inventoryNumber: Yup.string().trim().required("Inventory number is required"),
  name: Yup.string().trim().required("Name is required"),
  faGroupId: Yup.number().nullable().required("FA group is required"),
  okofId: Yup.number().nullable().required("OKOF is required"),
  depreciationMethodId: Yup.number()
    .nullable()
    .required("Depreciation method is required"),
  usefulLifeMonths: Yup.number()
    .nullable()
    .min(1, "Useful life must be at least 1 month")
    .required("Useful life is required"),
  initialCost: Yup.number()
    .nullable()
    .min(0, "Initial cost cannot be negative")
    .required("Initial cost is required"),
  salvageValue: Yup.number()
    .nullable()
    .min(0, "Salvage value cannot be negative")
    .required("Salvage value is required"),
  commissioningDate: Yup.string()
    .trim()
    .required("Commissioning date is required"),
  deprStartDate: Yup.string()
    .trim()
    .required("Depreciation start date is required"),
  plannedUnitsTotal: Yup.number()
    .nullable()
    .min(0, "Planned units total cannot be negative")
    .required("Planned units total is required"),
  sourceProductTableId: Yup.number()
    .nullable()
    .required("Source product table is required"),
  departmentId: Yup.number().nullable().required("Department is required"),
  responsibleUserId: Yup.number()
    .nullable()
    .required("Responsible user is required"),
});

