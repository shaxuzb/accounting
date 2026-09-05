import { useCallback, useMemo, useState } from "react";
import {
  Button,
  Empty,
  Modal,
  Segmented,
  Upload,
  type UploadProps,
} from "antd";
import { Building2, Save, Trash2, UploadIcon, Users } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "@/config/dayjs";
import Card from "@/components/ui/card/Card";
import SelectCustom from "@/components/fields/SelectCustom";
import DateRangeFilter from "@/components/ui/filters/DateRangeFilter";
import SelectFilter from "@/components/ui/filters/SelectFilter";
import ContractAddEditPage from "@/modules/contract/screens/ContractAddEditPage";
import type { Contract } from "@/modules/contract/types/type";
import CounterpartyBankAccountAddEditPage from "@/modules/settings/pages/counterpartybankaccount/screens/CounterpartyBankAccountAddEditPage";
import type { Counterpartybankaccount } from "@/modules/settings/pages/counterpartybankaccount/types/type";
import { useGetListOrgBankAccounts } from "@/modules/settings/pages/orgBankAccounts/hooks";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { invalidateSelectListQuery } from "@/shared/utils/invalidateSelectListQuery";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { useAppSelector } from "@/store/hooks";
import {
  usePersistedState,
  useScopedStorageKey,
} from "@/shared/persistence/usePersistedState";
import BankStatementCard from "../components/BankStatementCard";
import MissingBankAccountModal, {
  type BankInfoAssignment,
} from "../components/MissingBankAccountModal";
import MissingCounterpartyModal from "../components/MissingCounterpartyModal";
import {
  useCreateBankOperations,
  useGetBankOperationCategories,
  useGetBankDocumentAccountOptions,
  useParseBankStatement,
} from "../hooks";
import type {
  BankStatementCardData,
  BankStatementTransaction,
} from "../types/type";
import { getMissingCounterpartyKey } from "../utils/missingCounterpartyKey";
import { normalizeBankStatements } from "../utils/normalizeBankStatement";
import {
  createBankStatementImportDraft,
  createEmptyBankStatementImportDraft,
  type BankStatementImportDraft,
} from "../utils/bankImportDraft";
import {
  canMapBankCounterparty,
  findMatchingOrgBankAccount,
  formatBankOperationDate,
  getBankClassificationMetadata,
  isExistingBankOperation,
  isImportableBankOperation,
  isBankStatementDateInRange,
} from "../utils/bankImportRules";
import type { BankStatementOperationCreatePayload } from "../types/form";

const toValidNumber = (value: unknown) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : null;
};

const normalizeAccountNumber = (value: unknown) =>
  String(value ?? "")
    .replace(/\s/g, "")
    .trim();

type OperationFilter = "new" | "existing" | "all";

const hasMissingBankInfo = (card: BankStatementCardData) => {
  const importableTransactions = card.transactions.filter(
    isImportableBankOperation,
  );
  const needsCurrency =
    !toValidNumber(card.currencyId) &&
    importableTransactions.some(
      (transaction) => !toValidNumber(transaction.currencyId),
    );

  return (
    importableTransactions.length > 0 &&
    (!toValidNumber(card.bankAccountId) || needsCurrency)
  );
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
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const organizationId = useAppSelector((state) => state.organization.id);
  const parseMutation = useParseBankStatement();
  const createOperations = useCreateBankOperations();
  const { data: classificationOptions = [] } = useGetBankOperationCategories();
  const bankImportDraftKey = useScopedStorageKey(
    "form-draft",
    "bank-statement-import",
  );
  const [bankImportDraft, setBankImportDraft, clearBankImportDraft] =
    usePersistedState<BankStatementImportDraft>(
      bankImportDraftKey,
      createEmptyBankStatementImportDraft(),
      { storage: "local", debounceMs: 300 },
    );
  const cards = bankImportDraft.cards;
  const selectedBankId = bankImportDraft.selectedBankId;
  const setCards = useCallback(
    (
      nextCards:
        | BankStatementCardData[]
        | ((previous: BankStatementCardData[]) => BankStatementCardData[]),
    ) => {
      setBankImportDraft((previous) => {
        const cards =
          typeof nextCards === "function"
            ? nextCards(previous.cards)
            : nextCards;
        return createBankStatementImportDraft(previous.selectedBankId, cards);
      });
    },
    [setBankImportDraft],
  );
  const setSelectedBankId = useCallback(
    (nextBankId: number | null) => {
      setBankImportDraft((previous) => ({
        ...previous,
        selectedBankId: nextBankId,
      }));
    },
    [setBankImportDraft],
  );
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [operationFilter, setOperationFilter] =
    useState<OperationFilter>("new");
  const bankAccountLookupParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("pageSize", "1000");
    if (organizationId) {
      params.set("organizationId", String(organizationId));
    }
    return params;
  }, [organizationId]);
  const {
    data: organizationBankAccounts,
    isFetched: areOrganizationBankAccountsFetched,
    refetch: refetchOrganizationBankAccounts,
  } = useGetListOrgBankAccounts(bankAccountLookupParams);
  const dateFrom = searchParams.get("dateFrom") ?? "";
  const dateTo = searchParams.get("dateTo") ?? "";
  const classificationCategoryId =
    searchParams.get("classificationCategoryId") ?? "";
  const [bankAssignOpen, setBankAssignOpen] = useState(false);
  const [counterpartyCreateOpen, setCounterpartyCreateOpen] = useState(false);
  const [contractCreateTarget, setContractCreateTarget] =
    useState<ContractCreateTarget | null>(null);
  const [
    counterpartyBankAccountCreateTarget,
    setCounterpartyBankAccountCreateTarget,
  ] = useState<CounterpartyBankAccountCreateTarget | null>(null);
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
  const dateFilteredCardViews = useMemo(
    () =>
      cards
        .map((card) => {
          const transactionIndices = card.transactions.reduce<number[]>(
            (indices, transaction, index) => {
              const matchesDate = isBankStatementDateInRange(
                transaction.date,
                dateFrom,
                dateTo,
              );
              const matchesClassification =
                !classificationCategoryId ||
                String(transaction.classificationCategoryId ?? "") ===
                  classificationCategoryId;

              if (matchesDate && matchesClassification) {
                indices.push(index);
              }
              return indices;
            },
            [],
          );

          return {
            item: {
              ...card,
              transactions: transactionIndices.map(
                (index) => card.transactions[index],
              ),
            },
            transactionIndices,
          };
        })
        .filter(({ item }) =>
          !dateFrom && !dateTo && !classificationCategoryId
            ? true
            : item.transactions.length > 0,
        ),
    [cards, classificationCategoryId, dateFrom, dateTo],
  );
  const filteredCardViews = useMemo(
    () =>
      dateFilteredCardViews
        .map(({ item, transactionIndices }) => {
          const visibleTransactions = item.transactions.reduce<
            { transaction: BankStatementTransaction; sourceIndex: number }[]
          >((rows, transaction, index) => {
            const matchesOperation =
              operationFilter === "all" ||
              (operationFilter === "existing"
                ? isExistingBankOperation(transaction)
                : isImportableBankOperation(transaction));

            if (matchesOperation) {
              rows.push({
                transaction,
                sourceIndex: transactionIndices[index] ?? index,
              });
            }
            return rows;
          }, []);

          return {
            item: {
              ...item,
              transactions: visibleTransactions.map((row) => row.transaction),
            },
            transactionIndices: visibleTransactions.map(
              (row) => row.sourceIndex,
            ),
          };
        })
        .filter(({ item }) => item.transactions.length > 0),
    [dateFilteredCardViews, operationFilter],
  );
  const filteredTransactions = useMemo(
    () => dateFilteredCardViews.flatMap(({ item }) => item.transactions),
    [dateFilteredCardViews],
  );
  const newOperationCount = useMemo(
    () => filteredTransactions.filter(isImportableBankOperation).length,
    [filteredTransactions],
  );
  const existingOperationCount = useMemo(
    () => filteredTransactions.filter(isExistingBankOperation).length,
    [filteredTransactions],
  );
  const importableCardViews = useMemo(
    () =>
      dateFilteredCardViews
        .map(({ item, transactionIndices }) => {
          const importableTransactions = item.transactions.reduce<
            { transaction: BankStatementTransaction; sourceIndex: number }[]
          >((rows, transaction, index) => {
            if (isImportableBankOperation(transaction)) {
              rows.push({
                transaction,
                sourceIndex: transactionIndices[index] ?? index,
              });
            }
            return rows;
          }, []);

          return {
            item: {
              ...item,
              transactions: importableTransactions.map(
                (row) => row.transaction,
              ),
            },
            transactionIndices: importableTransactions.map(
              (row) => row.sourceIndex,
            ),
          };
        })
        .filter(({ item }) => item.transactions.length > 0),
    [dateFilteredCardViews],
  );
  const importableCards = useMemo(
    () => importableCardViews.map(({ item }) => item),
    [importableCardViews],
  );
  const buildOperationPayload = useCallback(
    (
      card: BankStatementCardData,
      transaction: BankStatementTransaction,
    ): BankStatementOperationCreatePayload | null => {
      const bankAccountId = toValidNumber(card.bankAccountId);
      const operationTypeId = getTransactionOperationTypeId(card, transaction);
      const parsedDirectionId = Number(transaction.directionId);
      const directionId =
        (parsedDirectionId === 1 || parsedDirectionId === -1
          ? parsedDirectionId
          : null) ??
        (operationTypeId === 2 ? -1 : operationTypeId === 1 ? 1 : null);
      const canMapCounterparty = canMapBankCounterparty(
        transaction.classificationCode,
      );
      const counterpartyId = canMapCounterparty
        ? toValidNumber(transaction.counterpartyId)
        : null;
      const bankChartAccountId = toValidNumber(card.bankChartAccountId);
      const offsetAccountId = toValidNumber(transaction.offsetAccountId);
      const contractId = canMapCounterparty
        ? toValidNumber(transaction.contractId)
        : null;
      const counterpartyBankAccountId = toValidNumber(
        canMapCounterparty ? transaction.counterpartyBankAccountId : null,
      );
      const currencyId =
        toValidNumber(transaction.currencyId) ?? toValidNumber(card.currencyId);
      const differenceAmount = Math.abs(
        (transaction.debit ?? 0) - (transaction.credit ?? 0),
      );
      const amount =
        toValidNumber(transaction.amount) ?? toValidNumber(differenceAmount);
      const rawDate = transaction.date;
      const docDate = formatBankOperationDate(rawDate);

      if (
        !bankAccountId ||
        !directionId ||
        !currencyId ||
        !amount ||
        !docDate ||
        !toValidNumber(card.bankChartAccountId) ||
        !toValidNumber(transaction.offsetAccountId) ||
        !toValidNumber(transaction.classificationCategoryId) ||
        (canMapCounterparty &&
          (!counterpartyId || !counterpartyBankAccountId || !contractId))
      ) {
        return null;
      }

      return {
        bankAccountId,
        directionId,
        bankChartAccountId,
        offsetAccountId,
        counterpartyId,
        counterpartyBankAccountId,
        bankDocumentNumber: transaction.bankDocumentNumber ?? null,
        classificationCategoryId: transaction.classificationCategoryId ?? null,
        classificationRuleId: transaction.classificationRuleId ?? null,
        docDate,
        currencyId,
        exchangeRate: 1,
        contractId,
        relatedDocumentId: toValidNumber(transaction.relatedDocumentId),
        amount,
        comment: transaction.purpose || null,
      };
    },
    [getTransactionOperationTypeId],
  );

  const totalTransactions = useMemo(
    () => filteredTransactions.length,
    [filteredTransactions],
  );
  const validOperations = useMemo(
    () =>
      importableCards.flatMap((card) =>
        card.transactions
          .map((transaction) => buildOperationPayload(card, transaction))
          .filter((item): item is BankStatementOperationCreatePayload =>
            Boolean(item),
          ),
      ),
    [importableCards, buildOperationPayload],
  );
  const missingBankInfoCount = useMemo(
    () => importableCards.filter(hasMissingBankInfo).length,
    [importableCards],
  );
  const missingBankInfoCards = useMemo(
    () => importableCards.filter(hasMissingBankInfo),
    [importableCards],
  );
  const missingCounterpartyRows = useMemo(
    () =>
      importableCardViews.flatMap(({ item, transactionIndices }) =>
        item.transactions
          .map((transaction, index) => ({
            cardId: item.id,
            transactionIndex: transactionIndices[index] ?? index,
            transaction,
          }))
          .filter(
            (item) =>
              isImportableBankOperation(item.transaction) &&
              canMapBankCounterparty(item.transaction.classificationCode) &&
              !item.transaction.counterpartyId,
          ),
      ),
    [importableCardViews],
  );
  const missingBankChartAccountCount = useMemo(
    () =>
      importableCards.filter((card) => !toValidNumber(card.bankChartAccountId))
        .length,
    [importableCards],
  );
  const missingOffsetAccountCount = useMemo(
    () =>
      importableCards.reduce((sum, card) => {
        return (
          sum +
          card.transactions.filter(
            (transaction) => !toValidNumber(transaction.offsetAccountId),
          ).length
        );
      }, 0),
    [importableCards],
  );
  const missingContractCount = useMemo(
    () =>
      importableCards.reduce(
        (sum, card) =>
          sum +
          card.transactions.filter(
            (transaction) =>
              canMapBankCounterparty(transaction.classificationCode) &&
              Boolean(transaction.counterpartyId) &&
              !toValidNumber(transaction.contractId),
          ).length,
        0,
      ),
    [importableCards],
  );
  const missingCounterpartyBankAccountCount = useMemo(
    () =>
      importableCards.reduce(
        (sum, card) =>
          sum +
          card.transactions.filter(
            (transaction) =>
              canMapBankCounterparty(transaction.classificationCode) &&
              Boolean(transaction.counterpartyId) &&
              !toValidNumber(transaction.counterpartyBankAccountId),
          ).length,
        0,
      ),
    [importableCards],
  );

  const uploadProps: UploadProps = {
    name: "file",
    multiple: false,
    accept: ".xlsx,.xls",
    showUploadList: false,
    beforeUpload: (file) => {
      if (!selectedBankId) return false;
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Excel fayl hajmi 5 MB dan oshmasligi kerak");
        return false;
      }

      parseMutation.mutate(
        { file, bankId: selectedBankId },
        {
          onSuccess: async (response) => {
            const parsedCards = normalizeBankStatements(response, file.name);
            let bankAccounts = organizationBankAccounts?.items ?? [];

            if (!areOrganizationBankAccountsFetched) {
              try {
                const result = await refetchOrganizationBankAccounts();
                bankAccounts = result.data?.items ?? bankAccounts;
              } catch (error) {
                errorHandlers(error);
              }
            }

            const reconciledCards = parsedCards.map((card) => {
              const parserBankAccountId = toValidNumber(card.bankAccountId);
              const accountById = parserBankAccountId
                ? bankAccounts.find(
                    (account) => account.id === parserBankAccountId,
                  )
                : undefined;
              const matchedAccount =
                accountById ??
                findMatchingOrgBankAccount(
                  card,
                  bankAccounts,
                  organizationId,
                  selectedBankId,
                );

              if (!matchedAccount) return card;

              return {
                ...card,
                bankAccountId: matchedAccount.id,
                currencyId:
                  toValidNumber(card.currencyId) ??
                  toValidNumber(matchedAccount.currencyId),
              };
            });

            setCards((prev) => [...reconciledCards, ...prev]);
            setExpandedIds((prev) => {
              const next = new Set(prev);
              reconciledCards.forEach((item) => next.add(item.id));
              return next;
            });
            toast.success(t("bank.messages.imported"));
          },
          onError: (error) => errorHandlers(error),
        },
      );
      return false;
    },
  };

  const handleClearImport = () => {
    clearBankImportDraft();
    setExpandedIds(new Set());
    setOperationFilter("new");
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("dateFrom");
    nextParams.delete("dateTo");
    nextParams.delete("classificationCategoryId");
    setSearchParams(nextParams, { replace: true });
  };

  const handleDeleteCard = (id: string) => {
    setCards((prev) => prev.filter((item) => item.id !== id));
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleDeleteTransaction = (
    cardId: string,
    transactionIndex: number,
  ) => {
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

  const handleRelatedDocumentChange = (
    cardId: string,
    transactionIndex: number,
    documentId: number | null,
  ) => {
    setCards((prev) =>
      prev.map((card) =>
        card.id === cardId
          ? {
              ...card,
              transactions: card.transactions.map((transaction, index) =>
                index === transactionIndex
                  ? { ...transaction, relatedDocumentId: documentId }
                  : transaction,
              ),
            }
          : card,
      ),
    );
  };

  const handleClassificationChange = (
    cardId: string,
    transactionIndex: number,
    classificationCategoryId: number | null,
  ) => {
    const classification = getBankClassificationMetadata(
      classificationOptions,
      classificationCategoryId,
    );

    setCards((prev) =>
      prev.map((card) =>
        card.id === cardId
          ? {
              ...card,
              transactions: card.transactions.map((transaction, index) =>
                index === transactionIndex
                  ? {
                      ...transaction,
                      classificationCategoryId,
                      classificationCode: classification.code,
                      classificationName: classification.name,
                      classificationRuleId: null,
                      classificationRuleCode: null,
                      relatedDocumentId: null,
                      ...(canMapBankCounterparty(classification.code)
                        ? {}
                        : {
                            counterpartyId: null,
                            counterpartyBankAccountId: null,
                            contractId: null,
                          }),
                    }
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
    if (!canMapBankCounterparty(transaction.classificationCode)) return;
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
          if (!canMapBankCounterparty(transaction.classificationCode)) {
            return transaction;
          }
          const sameCounterparty =
            Number(transaction.counterpartyId) ===
            Number(account.counterpartyId);
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
    if (!canMapBankCounterparty(transaction.classificationCode)) return;
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

  const applyCounterpartyAssignments = (
    assignments: Record<string, number>,
  ) => {
    setCards((prev) =>
      prev.map((card) => ({
        ...card,
        transactions: card.transactions.map((transaction, index) => {
          if (
            transaction.counterpartyId ||
            !canMapBankCounterparty(transaction.classificationCode)
          ) {
            return transaction;
          }
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
    if (!validOperations.length) {
      toast.error(t("bank.messages.noValidTransactions"));
      return;
    }

    const invalidNewOperationCount = newOperationCount - validOperations.length;
    const persistOperations = async () => {
      await createOperations.mutateAsync(
        { operations: validOperations },
        {
          onSuccess: () => {
            if (invalidNewOperationCount > 0) {
              toast.success(
                t("bank.messages.partialSaved", {
                  saved: validOperations.length,
                  skipped: invalidNewOperationCount,
                }),
              );
            } else {
              toast.success(t("bank.messages.saved"));
            }
            if (existingOperationCount > 0) {
              toast.success(
                t("bank.messages.existingSkipped", {
                  count: existingOperationCount,
                }),
              );
            }
            handleClearImport();
            navigate("/main/bank");
          },
          onError: (error) => errorHandlers(error),
        },
      );
    };

    Modal.confirm({
      title: t("bank.messages.saveConfirmTitle"),
      content: t("bank.messages.saveConfirmDescription", {
        saved: validOperations.length,
        skipped: invalidNewOperationCount,
        existing: existingOperationCount,
      }),
      okText: t("common.confirm"),
      cancelText: t("common.cancel"),
      onOk: persistOperations,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-4">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold text-gray-900">
              {t("bank.import.title")}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {t("bank.import.description")}
            </p>
          </div>
          <div className="flex w-full flex-wrap  justify-end gap-2 lg:w-auto lg:flex-nowrap">
            {cards.length > 0 ? (
              <>
                <Segmented<OperationFilter>
                  value={operationFilter}
                  onChange={(value) => setOperationFilter(value)}
                  options={[
                    {
                      value: "new",
                      label: t("bank.import.newOperations", {
                        count: newOperationCount,
                      }),
                    },
                    {
                      value: "existing",
                      label: t("bank.import.existingOperations", {
                        count: existingOperationCount,
                      }),
                    },
                    {
                      value: "all",
                      label: t("bank.import.allOperations", {
                        count: totalTransactions,
                      }),
                    },
                  ]}
                />
                <DateRangeFilter
                  paramKeys={["dateFrom", "dateTo"]}
                  placeholderKeys={[
                    "bank.fields.dateFrom",
                    "bank.fields.dateTo",
                  ]}
                  width={220}
                />
                <SelectFilter
                  paramKey="classificationCategoryId"
                  placeholder="bank.fields.classification"
                  options={classificationOptions.map((option) => ({
                    value: option.id,
                    label: option.name ?? option.code ?? String(option.id),
                  }))}
                  search
                  width={200}
                />
              </>
            ) : (
              <div className="w-full sm:w-70 [&_.ant-select]:w-full">
                <SelectCustom
                  // label="bank.import.bankTypeLabel"
                  placeholder="bank.import.bankTypePlaceholder"
                  path={selectListEndpoints.banksSelectList}
                  value={selectedBankId}
                  onChange={(value) => setSelectedBankId(toValidNumber(value))}
                  search
                  clearable
                  disabled={parseMutation.isPending}
                  marginBottom="mb-0"
                />
              </div>
            )}
            <Button
              className="shrink-0"
              icon={<Trash2 className="size-4" />}
              disabled={!cards.length}
              onClick={handleClearImport}
            >
              {t("common.clear")}
            </Button>
            <Button
              className="shrink-0"
              type="primary"
              icon={<Save className="size-4" />}
              disabled={!validOperations.length}
              loading={createOperations.isPending}
              onClick={() => handleSave()}
            >
              {t("common.save")}
            </Button>
          </div>
        </div>

        {!cards.length && (
          <div className="space-y-2">
            <Dragger
              {...uploadProps}
              disabled={!selectedBankId || parseMutation.isPending}
            >
              <div className="my-3 flex justify-center">
                <UploadIcon className="size-10" />
              </div>
              <p className="ant-upload-text">{t("bank.import.uploadText")}</p>
              <p className="ant-upload-hint">
                {selectedBankId
                  ? t("bank.import.uploadHint")
                  : t("bank.import.bankTypeHint")}
              </p>
            </Dragger>
          </div>
        )}
      </Card>

      {cards.length > 0 && (
        <>
          <div className="space-y-3">
            <Card className="border border-border p-4">
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
                    count: newOperationCount - validOperations.length,
                  })}
                </div>
                {existingOperationCount > 0 && (
                  <div className="text-xs text-gray-500">
                    {t("bank.import.existingOperations", {
                      count: existingOperationCount,
                    })}
                  </div>
                )}
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
                    {t("bank.import.assignMissingBankInfo")} (
                    {missingBankInfoCount})
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

          {filteredCardViews.length > 0 ? (
            <div className="flex flex-col gap-3">
              {filteredCardViews.map(({ item, transactionIndices }) => (
                <BankStatementCard
                  key={item.id}
                  item={item}
                  transactionIndices={transactionIndices}
                  expanded={expandedIds.has(item.id)}
                  onToggle={() => handleToggle(item.id)}
                  onDelete={() => handleDeleteCard(item.id)}
                  onDeleteTransaction={(transactionId) =>
                    handleDeleteTransaction(item.id, transactionId)
                  }
                  chartAccountLoading={chartAccountLoading}
                  bankAccountOptionsByDocumentType={
                    bankAccountOptionsByDocumentType
                  }
                  offsetAccountOptionsByDocumentType={
                    offsetAccountOptionsByDocumentType
                  }
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
                    handleCounterpartyBankAccountChange(
                      item.id,
                      transactionId,
                      accountId,
                    )
                  }
                  onAddCounterpartyBankAccount={(transactionId, transaction) =>
                    handleAddCounterpartyBankAccount(
                      item,
                      transactionId,
                      transaction,
                    )
                  }
                  onClassificationChange={(transactionId, categoryId) =>
                    handleClassificationChange(
                      item.id,
                      transactionId,
                      categoryId,
                    )
                  }
                  onRelatedDocumentChange={(transactionId, documentId) =>
                    handleRelatedDocumentChange(
                      item.id,
                      transactionId,
                      documentId,
                    )
                  }
                  classificationOptions={classificationOptions}
                />
              ))}
            </div>
          ) : (
            <Card className="border border-border p-10">
              <Empty
                description={
                  operationFilter === "new"
                    ? t("bank.messages.noNewOperations")
                    : operationFilter === "existing"
                      ? t("bank.messages.noExistingOperations")
                      : t("bank.messages.noTransactions")
                }
              />
            </Card>
          )}
        </>
      )}
      <MissingBankAccountModal
        open={bankAssignOpen}
        items={missingBankInfoCards}
        bankIdFallback={selectedBankId}
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
        initialCounterpartyId={
          counterpartyBankAccountCreateTarget?.counterpartyId
        }
        initialAccountNumber={
          counterpartyBankAccountCreateTarget?.accountNumber
        }
        onCreated={handleCounterpartyBankAccountCreated}
        onClose={() => setCounterpartyBankAccountCreateTarget(null)}
      />
    </div>
  );
}
