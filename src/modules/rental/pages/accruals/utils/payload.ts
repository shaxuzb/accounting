import type {
  RentalAccrualDetail,
  RentalAccrualUpdatePayload,
} from "../types/type";

export const buildAccrualUpdatePayload = (
  detail: Pick<
    RentalAccrualDetail,
    | "exchangeRate"
    | "lessorPayableAccountId"
    | "taxPayableAccountId"
    | "comment"
    | "items"
  >,
): RentalAccrualUpdatePayload => ({
  exchangeRate: detail.exchangeRate,
  lessorPayableAccountId: detail.lessorPayableAccountId,
  taxPayableAccountId: detail.taxPayableAccountId,
  comment: detail.comment ?? null,
  items: detail.items.map((item) => ({
    itemId: item.id,
    expenseAccountId: item.expenseAccountId,
  })),
});
