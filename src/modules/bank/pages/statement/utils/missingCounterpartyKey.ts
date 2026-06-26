import type { BankStatementTransaction } from "../types/type";

export interface MissingCounterpartyKeySource {
  cardId: string;
  transactionIndex: number;
  transaction: BankStatementTransaction;
}

const normalizeKeyPart = (value?: string | null) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

export const getMissingCounterpartyKey = (
  item: MissingCounterpartyKeySource,
) => {
  const transaction = item.transaction;
  const inn = normalizeKeyPart(transaction.counterpartyInn);
  const account = normalizeKeyPart(transaction.counterpartyAccount);
  const name = normalizeKeyPart(transaction.counterpartyName);

  if (inn) return `inn:${inn}`;
  if (account) return `account:${account}`;
  if (name) return `name:${name}`;

  return `row:${item.cardId}-${item.transactionIndex}`;
};
