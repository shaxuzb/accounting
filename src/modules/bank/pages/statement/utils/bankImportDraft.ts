import type { BankStatementCardData } from "../types/type";

export interface BankStatementImportDraft {
  selectedBankId: number | null;
  cards: BankStatementCardData[];
}

export const createEmptyBankStatementImportDraft = (): BankStatementImportDraft => ({
  selectedBankId: null,
  cards: [],
});

export const createBankStatementImportDraft = (
  selectedBankId: number | null,
  cards: BankStatementCardData[],
): BankStatementImportDraft => ({
  selectedBankId,
  cards: cards.map(({ raw: _raw, ...card }) => ({
    ...card,
    raw: null,
  })),
});
