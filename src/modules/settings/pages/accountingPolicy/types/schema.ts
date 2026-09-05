import * as Yup from "yup";
import dayjs from "dayjs";

export const accountingPolicySchema = Yup.object({
    inventoryValuationMethod: Yup.mixed<"FIFO">()
      .oneOf(["FIFO"])
      .required(),
    baseCurrencyId: Yup.number().oneOf([1]).required(),
    vatPayer: Yup.boolean().oneOf([true]).required(),
    taxTypeId: Yup.number().nullable(),
    vatTaxPeriod: Yup.mixed<"MONTH">().oneOf(["MONTH"]).required(),
    vatBaseMoment: Yup.mixed<"SHIPMENT">().oneOf(["SHIPMENT"]).required(),
    effectiveFrom: Yup.string().required("Effective from is required"),
    effectiveTo: Yup.string()
      .nullable()
      .test(
        "effective-range",
        "Effective to cannot be earlier than effective from",
        function (value) {
          const from = this.parent.effectiveFrom as string;
          if (!value || !from) return true;
          return !dayjs(value).isBefore(dayjs(from), "day");
        },
      ),
    productionEnabled: Yup.boolean().nullable(),
    foreignCurrencyEnabled: Yup.boolean().nullable(),
    costAllocationMethod: Yup.string().nullable(),
    closedPeriodPolicy: Yup.mixed<"PROTECT_CLOSED_PERIOD">()
      .oneOf(["PROTECT_CLOSED_PERIOD"])
      .required(),
  });
