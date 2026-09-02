import { customDate2, numberSpacing } from "@/utils/utils";

export const formatRentalDate = (value?: string | null) =>
  value ? customDate2(value) : "-";

export const formatRentalAmount = (value?: number | null) =>
  numberSpacing(value ?? 0, " ", true);
