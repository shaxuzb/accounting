import type {
  RentalAccrualDetail,
  RentalGenerateDuePayload,
  RentalAccrualUpdatePayload,
} from "../types/type";

export const buildGenerateDuePayload = (
  date: string,
): RentalGenerateDuePayload => {
  const [year, month] = date.slice(0, 7).split("-").map(Number);
  return { year, month };
};

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
