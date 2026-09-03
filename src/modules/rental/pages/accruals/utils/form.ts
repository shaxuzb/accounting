import type { RentalAccrualForm } from "../types/form";
import type { RentalAccrualDetail } from "../types/type";

export const mapRentalAccrualToForm = (
  data: RentalAccrualDetail,
): RentalAccrualForm => ({
  exchangeRate: data.exchangeRate ?? 1,
  lessorPayableAccountId: data.lessorPayableAccountId ?? null,
  taxPayableAccountId: data.taxPayableAccountId ?? null,
  comment: data.comment ?? "",
  items: data.items.map((item) => ({
    itemId: item.id,
    expenseAccountId: item.expenseAccountId ?? null,
  })),
});
