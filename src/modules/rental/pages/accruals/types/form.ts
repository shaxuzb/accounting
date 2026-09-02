export interface RentalAccrualForm {
  exchangeRate: number;
  lessorPayableAccountId: number | null;
  taxPayableAccountId: number | null;
  comment: string;
  items: Array<{ itemId: number; expenseAccountId: number | null }>;
}
