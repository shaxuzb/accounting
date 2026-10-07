import dayjs from "dayjs";
import type { PayrollTaxRegimeRate } from "../types/type";

/** The rates a regime gives on a date: one per tax kind, the one in force then. */
export const ratesOn = (rates: PayrollTaxRegimeRate[], date: string) =>
  rates.filter(
    (rate) =>
      !dayjs(rate.effectiveFrom).isAfter(date, "day") &&
      (!rate.effectiveTo || !dayjs(rate.effectiveTo).isBefore(date, "day")),
  );
