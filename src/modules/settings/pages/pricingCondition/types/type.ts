// Swagger DTO — PricingConditionCreateDto base shape
export interface PricingCondition {
  id: number;
  pricingMethodId: number;
  pricingMethodName?: string;
  pricingValue: number;
  roundingMethodId: number;
  roundingMethodName?: string;
  roundingPrecision: number;
  startDate: string;
  endDate: string | null;
  stateId?: number;
  stateName?: string;
  createdDate?: string;
}
