import type { MoneyOperationKind } from "@/shared/moneyOperationKinds";
import { kindAllowsAccount } from "@/shared/moneyOperationKinds";
import type {
  BankChartAccountOption,
  BankStatementCardData,
  BankStatementTransaction,
} from "../types/type";
import { canMapBankCounterparty, isExistingBankOperation } from "./bankImportRules";

/**
 * 1C fills a statement row's settlement account from its «Вид операции»: a receipt from a
 * counterparty is a customer's payment (4010), a payment to one a supplier's (6010), a bank's fee
 * goes to expenses (9430), a founder's money to the charter capital (4610), cash handed in to the
 * transfers in transit (5710). The kind comes from the row's classification and direction.
 */
const KIND_BY_CLASSIFICATION: Record<string, { in?: string; out?: string }> = {
  COUNTERPARTY: { in: "CUSTOMER_PAYMENT", out: "SUPPLIER_PAYMENT" },
  BANK_COMMISSION: { out: "BANK_COMMISSION" },
  BANK_SERVICE: { out: "BANK_COMMISSION" },
  CAPITAL_CONTRIBUTION: { in: "CAPITAL_CONTRIBUTION" },
  CASH_COLLECTION: { in: "CASH_DEPOSIT" },
  // the money a terminal's acquirer passes on comes off the transfers in transit (5710), as cash handed in
  ACQUIRING: { in: "CASH_DEPOSIT" },
};

/** Rows whose classification fixes the account but no kind (none now: every row gets a kind). */
const ACCOUNT_BY_CLASSIFICATION: Record<string, { in?: string; out?: string }> = {};

/** A payment to the budget carries the tax payer's id in its purpose. */
const TAX_PAYMENT_MARKER = "$TAX_ID$";

/**
 * The tax a budget payment settles, read from its purpose, and the account the organization keeps
 * that tax on (the chart's own subaccounts; payroll uses the same 6420.1, 6510.1, 6530.1).
 * The order matters: «НДФЛ от сдачи имущества» is the income tax, not the property tax.
 * A purpose that names no known tax (a penalty, say) is left for the user.
 */
const TAX_ACCOUNT_BY_PURPOSE: [string, RegExp][] = [
  ["6420", /ндфл|доходы с физ|жисмоний шахслар даромад|jismoniy shaxslar daromad/i],
  ["6530", /пенси|pensiya|инпс|inps/i],
  ["6430", /налог на прибыль|фойда солиғ|фойда солиг|foyda solig/i],
  ["6410", /ндс|добавленн|қўшилган қиймат|кушилган киймат|qo.shilgan qiymat/i],
  ["6460", /земельн|ер солиғ|ер солиг|yer solig/i],
  ["6450", /на имущество|мол-мулк|мол мулк|mol-mulk/i],
  ["6510", /социальн|ижтимоий|ijtimoiy/i],
];

/** The account of a number among the choosable ones: itself, else its first subaccount (6420 → 6420.1). */
const pickAccount = (options: readonly BankChartAccountOption[], number: string) => {
  const numbered = options.map((option) => ({ option, number: String(option.number ?? "") }));
  return (
    numbered.find((item) => item.number === number) ??
    numbered
      .filter((item) => item.number.startsWith(`${number}.`))
      .sort((a, b) => a.number.localeCompare(b.number))[0]
  )?.option;
};

const taxAccountId = (purpose: string, options: readonly BankChartAccountOption[]) => {
  const match = TAX_ACCOUNT_BY_PURPOSE.find(([, pattern]) => pattern.test(purpose));
  return match ? (pickAccount(options, match[0])?.id ?? null) : null;
};

const directionOf = (transaction: BankStatementTransaction) => {
  const directionId = Number(transaction.directionId);
  if (directionId === 1 || directionId === -1) return directionId;
  if (transaction.debit > 0 && !transaction.credit) return 1;
  if (transaction.credit > 0 && !transaction.debit) return -1;
  return null;
};

const kindCodeOf = (transaction: BankStatementTransaction) => {
  const code = String(transaction.classificationCode ?? "").toUpperCase();
  const direction = directionOf(transaction);
  if (!direction) return null;
  if (code === "COUNTERPARTY" && direction === -1 && transaction.purpose?.includes(TAX_PAYMENT_MARKER))
    return "TAX_PAYMENT";
  const byDirection = KIND_BY_CLASSIFICATION[code];
  return (direction === 1 ? byDirection?.in : byDirection?.out) ?? null;
};

/** 1C «Прочее поступление» / «Прочее списание»: the kind of a row no other kind fits. */
export const otherKindId = (kinds: readonly MoneyOperationKind[], direction: number | null) =>
  direction ? kinds.find((item) => item.code === (direction === 1 ? "OTHER_IN" : "OTHER_OUT"))?.id : undefined;

/** The kind and the account a row gets by default; none when its classification gives none. */
export const resolveDefaultOffset = (
  transaction: BankStatementTransaction,
  kinds: readonly MoneyOperationKind[],
  offsetOptions: { income: readonly BankChartAccountOption[]; expense: readonly BankChartAccountOption[] },
) => {
  const direction = directionOf(transaction);
  const accountOnly =
    ACCOUNT_BY_CLASSIFICATION[String(transaction.classificationCode ?? "").toUpperCase()];
  const accountNumber = direction === 1 ? accountOnly?.in : accountOnly?.out;
  if (accountNumber) {
    const options = direction === 1 ? offsetOptions.income : offsetOptions.expense;
    return { operationKindId: null, offsetAccountId: pickAccount(options, accountNumber)?.id ?? null };
  }
  const code = kindCodeOf(transaction);
  const kind = code ? kinds.find((item) => item.code === code) : undefined;
  if (!kind) return null;
  // a kind that needs a counterparty is kept only where the row can carry one, else its account
  // goes as an other receipt / payment (1C «Прочее поступление / списание»)
  const keepsKind = kind.counterpartyMode !== 2 || canMapBankCounterparty(transaction.classificationCode);
  return {
    operationKindId: keepsKind ? kind.id : (otherKindId(kinds, direction) ?? null),
    offsetAccountId:
      kind.defaultOffsetAccount?.id ??
      (kind.code === "TAX_PAYMENT" ? taxAccountId(transaction.purpose ?? "", offsetOptions.expense) : null),
  };
};

/**
 * Fills the rows whose account nobody has chosen yet. Returns the same array when nothing changes,
 * so it can run on every change of the cards.
 */
const UZS_CURRENCY_ID = 1;
/** The bank's own account by the statement's currency: the sum one 5110, a currency one 5210. */
const bankChartAccountNumber = (currencyId: number | null | undefined) =>
  !currencyId || currencyId === UZS_CURRENCY_ID ? "5110" : "5210";

export const applyDefaultOffsets = (
  cards: BankStatementCardData[],
  kinds: readonly MoneyOperationKind[],
  offsetOptions: { income: readonly BankChartAccountOption[]; expense: readonly BankChartAccountOption[] },
  bankAccountOptions: readonly BankChartAccountOption[],
) => {
  if (kinds.length === 0 || offsetOptions.expense.length === 0 || offsetOptions.income.length === 0)
    return cards;
  let changed = false;
  const next = cards.map((card) => {
    let cardChanged = false;
    const bankChartFill =
      card.bankChartAutoFilled === undefined && !card.bankChartAccountId
        ? {
            bankChartAccountId:
              pickAccount(bankAccountOptions, bankChartAccountNumber(card.currencyId))?.id ?? null,
            bankChartAutoFilled: true,
          }
        : null;
    if (bankChartFill) cardChanged = true;
    const transactions = card.transactions.map((transaction) => {
      if (
        transaction.offsetAutoFilled !== undefined ||
        transaction.offsetAccountId ||
        isExistingBankOperation(transaction)
      )
        return transaction;
      const defaults = resolveDefaultOffset(transaction, kinds, offsetOptions);
      cardChanged = true;
      return {
        ...transaction,
        operationKindId: defaults?.operationKindId ?? null,
        offsetAccountId: defaults?.offsetAccountId ?? null,
        offsetAutoFilled: true,
      };
    });
    if (!cardChanged) return card;
    changed = true;
    return { ...card, ...bankChartFill, transactions };
  });
  return changed ? next : cards;
};

/** A kind stays on a row only while the chosen account fits it (an account outside it drops the kind). */
export const kindForChosenAccount = (
  operationKindId: number | null | undefined,
  accountNumber: string | null | undefined,
  kinds: readonly MoneyOperationKind[],
) => {
  if (!operationKindId) return null;
  const kind = kinds.find((item) => item.id === operationKindId);
  return kind && kindAllowsAccount(kind, accountNumber) ? operationKindId : null;
};
