/** fa_disposal_type ids (SALE / WRITEOFF / BREAKDOWN / SHORTAGE). */
export const faDisposalTypeIds = {
  sale: 1,
  writeOff: 2,
  breakdown: 3,
  /** Not found at an inventory: the residual value goes to 5910 (1C «Недостача в результате инвентаризации»). */
  shortage: 4,
  /** Given away free (NSBU 5, 53): the residual value is a loss, output VAT only where a rate is named. */
  gratuitous: 5,
} as const;
