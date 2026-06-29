// Swagger DTO — PricingConditionCreateDto
export interface PricingConditionForm {
  pricingMethodId: number | null;
  pricingValue: number | null;
  roundingMethodId: number | null;
  roundingPrecision: number | null;
  startDate: string;
  endDate: string | null;
}
