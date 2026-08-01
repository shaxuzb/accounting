import { useCallback, useMemo, useState } from "react";
import { Button, Empty, Upload, type UploadProps } from "antd";
import { Building2, Save, Trash2, UploadIcon, Users } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "@/config/dayjs";
import Card from "@/components/ui/card/Card";
import ContractAddEditPage from "@/modules/contract/screens/ContractAddEditPage";
import type { Contract } from "@/modules/contract/types/type";
import CounterpartyBankAccountAddEditPage from "@/modules/settings/pages/counterpartybankaccount/screens/CounterpartyBankAccountAddEditPage";
import type { Counterpartybankaccount } from "@/modules/settings/pages/counterpartybankaccount/types/type";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { invalidateSelectListQuery } from "@/shared/utils/invalidateSelectListQuery";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import BankStatementCard from "../components/BankStatementCard";
import MissingBankAccountModal, {
  type BankInfoAssignment,
} from "../components/MissingBankAccountModal";
import MissingCounterpartyModal from "../components/MissingCounterpartyModal";
import {
  useCreateBankOperations,
  useGetBankDocumentAccountOptions,
  useParseBankStatement,
} from "../hooks";
import type {
  BankStatementCardData,
  BankStatementTransaction,
} from "../types/type";
import { getMissingCounterpartyKey } from "../utils/missingCounterpartyKey";
import { normalizeBankStatements } from "../utils/normalizeBankStatement";
import type { BankStatementOperationCreatePayload } from "../types/form";

const toValidNumber = (value: unknown) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0
    ? numberValue
    : null;
};

const normalizeAccountNumber = (value: unknown) =>
  String(value ?? "").replace(/\s/g, "").trim();

const hasMissingBankInfo = (card: BankStatementCardData) => {
  const needsOperationType =
    !toValidNumber(card.operationTypeId) &&
    card.transactions.some(
      (transaction) => !toValidNumber(transaction.operationTypeId),
    );
  const needsCurrency =
    !toValidNumber(card.currencyId) &&
    card.transactions.some(
      (transaction) => !toValidNumber(transaction.currencyId),
    );

  return !toValidNumber(card.bankAccountId) || needsOperationType || needsCurrency;
};

interface ContractCreateTarget {
  cardId: string;
  transactionIndex: number;
  counterpartyId: number;
  contractTypeId: number;
  transactionDate?: string;
}

interface CounterpartyBankAccountCreateTarget {
  cardId: string;
  transactionIndex: number;
  counterpartyId: number;
  accountNumber?: string | null;
}

export default function BankStatementImportPage() {
  const { t } = useTranslation();
  const { Dragger } = Upload;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const parseMutation = useParseBankStatement();
  const createOperations = useCreateBankOperations();
  const [cards, setCards] = useState<BankStatementCardData[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [bankAssignOpen, setBankAssignOpen] = useState(false);
  const [counterpartyCreateOpen, setCounterpartyCreateOpen] = useState(false);
  const [contractCreateTarget, setContractCreateTarget] =
    useState<ContractCreateTarget | null>(null);
  const [counterpartyBankAccountCreateTarget, setCounterpartyBankAccountCreateTarget] =
    useState<CounterpartyBankAccountCreateTarget | null>(null);
  const {
    bankAccountOptionsByDocumentType,
    offsetAccountOptionsByDocumentType,
    isLoading: chartAccountLoading,
  } = useGetBankDocumentAccountOptions();
  const getTransactionOperationTypeId = useCallback(
    (card: BankStatementCardData, transaction: BankStatementTransaction) => {
      return (
        toValidNumber(transaction.operationTypeId) ??
        toValidNumber(card.operationTypeId)
      );
    },
    [],
  );
  const buildOperationPayload = useCallback(
    (
      card: BankStatementCardData,
      transaction: BankStatementTransaction,
    ): BankStatementOperationCreatePayload | null => {
      const bankAccountId = toValidNumber(card.bankAccountId);
      const operationTypeId = getTransactionOperationTypeId(card, transaction);
      const counterpartyId = toValidNumber(transaction.counterpartyId);
      const bankChartAccountId = toValidNumber(card.bankChartAccountId);
      const offsetAccountId = toValidNumber(transaction.offsetAccountId);
      const contractId = toValidNumber(transaction.contractId);
      const counterpartyBankAccountId = toValidNumber(
        transaction.counterpartyBankAccountId,
      );
      const currencyId =
        toValidNumber(transaction.currencyId) ?? toValidNumber(card.currencyId);
      const amount = toValidNumber(
        transaction.amount || transaction.credit || transaction.debit,
      );
      const rawDate = transaction.date;
      const docDate = rawDate ? dayjs(rawDate) : null;

      if (
        !bankAccountId ||
        !bankChartAccountId ||
        !offsetAccountId ||
        !contractId ||
        !counterpartyBankAccountId ||
        !operationTypeId ||
        !counterpartyId ||
        !currencyId ||
        !amount ||
        !docDate?.isValid()
      ) {
        return null;
      }

      return {
        bankAccountId,
        bankChartAccountId,
        offsetAccountId,
        operationTypeId,
        counterpartyId,
        counterpartyBankAccountId,
        docDate: docDate.toISOString(),
        currencyId,
        exchangeRate: 1,
        contractId,
        amount,
        comment: transaction.purpose || null,
      };
    },
    [getTransactionOperationTypeId],
  );

  const totalTransactions = useMemo(
    () => cards.reduce((sum, item) => sum + item.transactions.length, 0),
    [cards],
  );
  const validOperations = useMemo(
    () =>
      cards.flatMap((card) =>
        card.transactions
          .map((transaction) => buildOperationPayload(card, transaction))
          .filter(
            (item): item is BankStatementOperationCreatePayload => Boolean(item),
          ),
      ),
    [cards, buildOperationPayload],
  );
  const missingBankInfoCount = useMemo(
    () => cards.filter(hasMissingBankInfo).length,
    [cards],
  );
  const missingBankInfoCards = useMemo(
    () => cards.filter(hasMissingBankInfo),
    [cards],
  );
  const missingCounterpartyRows = useMemo(
    () =>
      cards.flatMap((card) =>
        card.transactions
          .map((transaction, transactionIndex) => ({
            cardId: card.id,
            transactionIndex,
            transaction,
          }))
          .filter((item) => !item.transaction.counterpartyId),
      ),
    [cards],
  );
  const missingBankChartAccountCount = useMemo(
    () => cards.filter((card) => !toValidNumber(card.bankChartAccountId)).length,
    [cards],
  );
  const missingOffsetAccountCount = useMemo(
    () =>
      cards.reduce((sum, card) => {
        return sum + card.transactions.filter(
          (transaction) => !toValidNumber(transaction.offsetAccountId),
        ).length;
      }, 0),
    [cards],
  );
  const missingContractCount = useMemo(
    () =>
      cards.reduce(
        (sum, card) =>
          sum +
          card.transactions.filter(
            (transaction) => !toValidNumber(transaction.contractId),
          ).length,
        0,
      ),
    [cards],
  );
  const missingCounterpartyBankAccountCount = useMemo(
    () =>
      cards.reduce(
        (sum, card) =>
          sum +
          card.transactions.filter(
            (transaction) =>
              !toValidNumber(transaction.counterpartyBankAccountId),
          ).length,
        0,
      ),
    [cards],
  );

  const uploadProps: UploadProps = {
    name: "file",
    multiple: false,
    accept: ".xlsx,.xls",
    showUploadList: false,
    beforeUpload: (file) => {
      parseMutation.mutate(file, {
        onSuccess: (response) => {
          const parsedCards = normalizeBankStatements(response, file.name);
          setCards((prev) => [...parsedCards, ...prev]);
          setExpandedIds((prev) => {
            const next = new Set(prev);
            parsedCards.forEach((item) => next.add(item.id));
            return next;
          });
          toast.success(t("bank.messages.imported"));
        },
        onError: (error) => errorHandlers(error),
      });
      return false;
    },
  };

  const handleDeleteCard = (id: string) => {
    setCards((prev) => prev.filter((item) => item.id !== id));
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleDeleteTransaction = (cardId: string, transactionIndex: number) => {
    setCards((prev) =>
      prev.map((item) =>
        item.id === cardId
          ? {
              ...item,
              transactions: item.transactions.filter(
                (_, index) => index !== transactionIndex,
              ),
            }
          : item,
      ),
    );
  };

  const handleToggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleBankChartAccountChange = (
    cardId: string,
    bankChartAccountId: number | null,
  ) => {
    setCards((prev) =>
      prev.map((card) =>
        card.id === cardId ? { ...card, bankChartAccountId } : card,
      ),
    );
  };

  const handleOffsetAccountChange = (
    cardId: string,
    transactionIndex: number,
    offsetAccountId: number | null,
  ) => {
    setCards((prev) =>
      prev.map((card) =>
        card.id === cardId
          ? {
              ...card,
              transactions: card.transactions.map((transaction, index) =>
                index === transactionIndex
                  ? { ...transaction, offsetAccountId }
                  : transaction,
              ),
            }
          : card,
      ),
    );
  };

  const handleContractChange = (
    cardId: string,
    transactionIndex: number,
    contractId: number | null,
  ) => {
    setCards((prev) =>
      prev.map((card) =>
        card.id === cardId
          ? {
              ...card,
              transactions: card.transactions.map((transaction, index) =>
                index === transactionIndex
                  ? { ...transaction, contractId }
                  : transaction,
              ),
            }
          : card,
      ),
    );
  };

  const handleCounterpartyBankAccountChange = (
    cardId: string,
    transactionIndex: number,
    accountId: number | null,
  ) => {
    setCards((prev) =>
      prev.map((card) =>
        card.id === cardId
          ? {
              ...card,
              transactions: card.transactions.map((transaction, index) =>
                index === transactionIndex
                  ? { ...transaction, counterpartyBankAccountId: accountId }
                  : transaction,
              ),
            }
          : card,
      ),
    );
  };

  const handleAddCounterpartyBankAccount = (
    card: BankStatementCardData,
    transactionIndex: number,
    transaction: BankStatementTransaction,
  ) => {
    const counterpartyId = toValidNumber(transaction.counterpartyId);
    if (!counterpartyId) return;

    setCounterpartyBankAccountCreateTarget({
      cardId: card.id,
      transactionIndex,
      counterpartyId,
      accountNumber: transaction.counterpartyAccount || null,
    });
  };

  const handleCounterpartyBankAccountCreated = (
    account: Counterpartybankaccount,
  ) => {
    const target = counterpartyBankAccountCreateTarget;
    if (!target) return;

    const createdAccountNumber = normalizeAccountNumber(account.accountNumber);
    setCards((prev) =>
      prev.map((card) => ({
        ...card,
        transactions: card.transactions.map((transaction, index) => {
          const sameCounterparty =
            Number(transaction.counterpartyId) === Number(account.counterpartyId);
          const sameAccountNumber =
            normalizeAccountNumber(transaction.counterpartyAccount) ===
            createdAccountNumber;

          return sameCounterparty && sameAccountNumber
            ? { ...transaction, counterpartyBankAccountId: account.id }
            : card.id === target.cardId && index === target.transactionIndex
              ? { ...transaction, counterpartyBankAccountId: account.id }
              : transaction;
        }),
      })),
    );
    invalidateSelectListQuery(
      queryClient,
      "counterpartyBankAccountId",
      selectListEndpoints.counterPartyBankAccounts,
    );
  };

  const handleAddContract = (
    card: BankStatementCardData,
    transactionIndex: number,
    transaction: BankStatementTransaction,
  ) => {
    const counterpartyId = toValidNumber(transaction.counterpartyId);
    const operationTypeId = getTransactionOperationTypeId(card, transaction);
    if (!counterpartyId || !operationTypeId) return;

    setContractCreateTarget({
      cardId: card.id,
      transactionIndex,
      counterpartyId,
      contractTypeId: operationTypeId === 2 ? 1 : 2,
      transactionDate:
        transaction.date && dayjs(transaction.date).isValid()
          ? dayjs(transaction.date).format("YYYY-MM-DD")
          : undefined,
    });
  };

  const handleContractCreated = (contract: Contract) => {
    if (!contractCreateTarget) return;

    handleContractChange(
      contractCreateTarget.cardId,
      contractCreateTarget.transactionIndex,
      contract.id,
    );
    invalidateSelectListQuery(
      queryClient,
      "contractId",
      selectListEndpoints.contractsSelectList,
    );
  };

  const applyBankAssignments = (
    assignments: Record<string, BankInfoAssignment>,
  ) => {
    setCards((prev) =>
      prev.map((card) => {
        const assignment = assignments[card.id];
        if (!assignment) return card;

        return {
          ...card,
          bankAccountId: assignment.bankAccountId ?? card.bankAccountId,
          operationTypeId: assignment.operationTypeId ?? card.operationTypeId,
          currencyId: assignment.currencyId ?? card.currencyId,
        };
      }),
    );
    setBankAssignOpen(false);
  };

  const applyCounterpartyAssignments = (assignments: Record<string, number>) => {
    setCards((prev) =>
      prev.map((card) => ({
        ...card,
        transactions: card.transactions.map((transaction, index) => {
          if (transaction.counterpartyId) return transaction;
          const nextId =
            assignments[
              getMissingCounterpartyKey({
                cardId: card.id,
                transactionIndex: index,
                transaction,
              })
            ];
          return nextId
            ? {
                ...transaction,
                counterpartyId: Number(nextId),
                contractId: null,
              }
            : transaction;
        }),
      })),
    );
    setCounterpartyCreateOpen(false);
  };

  const handleSave = async () => {
    if (missingBankChartAccountCount) {
      toast.error(t("bank.messages.selectAllBankAccounts"));
      return;
    }

    if (missingOffsetAccountCount) {
      toast.error(t("bank.messages.selectAllOffsetAccounts"));
      return;
    }

    if (missingContractCount) {
      toast.error(t("bank.messages.selectAllContracts"));
      return;
    }

    if (missingCounterpartyBankAccountCount) {
      toast.error(
        t("bank.messages.selectAllCounterpartyAccounts"),
      );
      return;
    }

    if (!validOperations.length) {
      toast.error(t("bank.messages.noValidTransactions"));
      return;
    }

    const skippedCount = totalTransactions - validOperations.length;
    await createOperations.mutateAsync(
      { operations: validOperations },
      {
        onSuccess: () => {
          if (skippedCount > 0) {
            toast.success(
              t("bank.messages.partialSaved", {
                saved: validOperations.length,
                skipped: skippedCount,
              }),
            );
          } else {
            toast.success(t("bank.messages.saved"));
          }
          setCards([]);
          setExpandedIds(new Set());
          navigate("/main/bank");
        },
        onError: (error) => errorHandlers(error),
      },
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-4">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {t("bank.import.title")}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {t("bank.import.description")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              icon={<Trash2 className="size-4" />}
              disabled={!cards.length}
              onClick={() => {
                setCards([]);
                setExpandedIds(new Set());
              }}
            >
              {t("common.clear")}
            </Button>
            <Button
              type="primary"
              icon={<Save className="size-4" />}
              disabled={!cards.length}
              loading={createOperations.isPending}
              onClick={() => handleSave()}
            >
              {t("common.save")}
            </Button>
          </div>
        </div>

        {!cards.length && (
          <Dragger {...uploadProps} disabled={parseMutation.isPending}>
            <div className="my-3 flex justify-center">
              <UploadIcon className="size-10" />
            </div>
            <p className="ant-upload-text">{t("bank.import.uploadText")}</p>
            <p className="ant-upload-hint">{t("bank.import.uploadHint")}</p>
          </Dragger>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Card className="border border-border p-4">
          <div className="text-sm text-gray-500">
            {t("bank.import.statements")}
          </div>
          <div className="mt-1 text-2xl font-semibold">{cards.length}</div>
        </Card>
        <Card className="border border-border p-4">
          <div className="text-sm text-gray-500">
            {t("bank.import.transactions")}
          </div>
          <div className="mt-1 text-2xl font-semibold">{totalTransactions}</div>
        </Card>
        <Card className="border border-border p-4">
          <div className="text-sm text-gray-500">{t("bank.import.status")}</div>
          <div className="mt-1 text-2xl font-semibold">
            {parseMutation.isPending ? t("common.loading") : t("common.ready")}
          </div>
        </Card>
        <Card className="border border-border p-4 md:col-span-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm text-gray-500">
                {t("bank.import.readyToSave")}
              </div>
              <div className="mt-1 text-2xl font-semibold">
                {validOperations.length}
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {t("bank.messages.missingRequired", {
                count: totalTransactions - validOperations.length,
              })}
            </div>
            {(missingBankChartAccountCount > 0 ||
              missingOffsetAccountCount > 0 ||
              missingContractCount > 0 ||
              missingCounterpartyBankAccountCount > 0) && (
              <div className="text-xs text-danger">
                {t("bank.import.missingSummary", {
                  bankAccounts: missingBankChartAccountCount,
                  offsetAccounts: missingOffsetAccountCount,
                  contracts: missingContractCount,
                  counterpartyAccounts: missingCounterpartyBankAccountCount,
                })}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                icon={<Building2 className="size-4" />}
                disabled={!missingBankInfoCount}
                onClick={() => setBankAssignOpen(true)}
              >
                {t("bank.import.assignMissingBankInfo")} ({missingBankInfoCount})
              </Button>
              <Button
                icon={<Users className="size-4" />}
                disabled={!missingCounterpartyRows.length}
                onClick={() => setCounterpartyCreateOpen(true)}
              >
                {t("bank.import.assignMissingCounterparties")} (
                {missingCounterpartyRows.length})
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {cards.length > 0 ? (
        <div className="flex flex-col gap-3">
          {cards.map((item) => (
            <BankStatementCard
              key={item.id}
              item={item}
              expanded={expandedIds.has(item.id)}
              onToggle={() => handleToggle(item.id)}
              onDelete={() => handleDeleteCard(item.id)}
              onDeleteTransaction={(transactionId) =>
                handleDeleteTransaction(item.id, transactionId)
              }
              chartAccountLoading={chartAccountLoading}
              bankAccountOptionsByDocumentType={bankAccountOptionsByDocumentType}
              offsetAccountOptionsByDocumentType={offsetAccountOptionsByDocumentType}
              onBankChartAccountChange={(bankChartAccountId) =>
                handleBankChartAccountChange(item.id, bankChartAccountId)
              }
              onOffsetAccountChange={(transactionId, offsetAccountId) =>
                handleOffsetAccountChange(
                  item.id,
                  transactionId,
                  offsetAccountId,
                )
              }
              onContractChange={(transactionId, contractId) =>
                handleContractChange(item.id, transactionId, contractId)
              }
              onAddContract={(transactionId, transaction) =>
                handleAddContract(item, transactionId, transaction)
              }
              onCounterpartyBankAccountChange={(transactionId, accountId) =>
                handleCounterpartyBankAccountChange(item.id, transactionId, accountId)
              }
              onAddCounterpartyBankAccount={(transactionId, transaction) =>
                handleAddCounterpartyBankAccount(item, transactionId, transaction)
              }
            />
          ))}
        </div>
      ) : (
        <Card className="border border-border p-10">
          <Empty description={t("bank.messages.noData")} />
        </Card>
      )}
      <MissingBankAccountModal
        open={bankAssignOpen}
        items={missingBankInfoCards}
        onClose={() => setBankAssignOpen(false)}
        onApply={applyBankAssignments}
      />

      <MissingCounterpartyModal
        open={counterpartyCreateOpen}
        items={missingCounterpartyRows}
        onClose={() => setCounterpartyCreateOpen(false)}
        onApply={applyCounterpartyAssignments}
      />

      <ContractAddEditPage
        open={Boolean(contractCreateTarget)}
        contractTypeId={contractCreateTarget?.contractTypeId}
        initialCounterpartyId={contractCreateTarget?.counterpartyId}
        initialContractDate={contractCreateTarget?.transactionDate}
        onCreated={handleContractCreated}
        onClose={() => setContractCreateTarget(null)}
      />

      <CounterpartyBankAccountAddEditPage
        open={Boolean(counterpartyBankAccountCreateTarget)}
        initialCounterpartyId={counterpartyBankAccountCreateTarget?.counterpartyId}
        initialAccountNumber={counterpartyBankAccountCreateTarget?.accountNumber}
        onCreated={handleCounterpartyBankAccountCreated}
        onClose={() => setCounterpartyBankAccountCreateTarget(null)}
      />
    </div>
  );
}
