import { useCallback, useMemo, useState } from "react";
import { Button, Empty, Upload, type UploadProps } from "antd";
import { Building2, Save, Trash2, UploadIcon, Users } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import dayjs from "@/config/dayjs";
import { $axiosPrivate } from "@/services/AxiosService";
import Card from "@/components/ui/card/Card";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { useAppSelector } from "@/store/hooks";
import BankStatementCard from "../components/BankStatementCard";
import MissingBankAccountModal, {
  type BankInfoAssignment,
} from "../components/MissingBankAccountModal";
import MissingCounterpartyModal from "../components/MissingCounterpartyModal";
import { useCreateBankOperations, useParseBankStatement } from "../hooks";
import type {
  BankStatementCardData,
  BankStatementTransaction,
} from "../types/type";
import { getMissingCounterpartyKey } from "../utils/missingCounterpartyKey";
import { normalizeBankStatements } from "../utils/normalizeBankStatement";
import type { BankOperationCreatePayload } from "../types/form";
import {
  selectListEndpoints,
  selectListKeys,
} from "@/shared/constants/selectLists";

interface PaymentPurposeOption {
  id: number;
  name: string;
  operationTypeId?: unknown;
  operationType?: unknown;
  operationTypes?: unknown;
  typeId?: unknown;
  languageId?: unknown;
  langId?: unknown;
  languageCode?: unknown;
  locale?: unknown;
  code?: unknown;
  language?: {
    id?: unknown;
    code?: unknown;
  };
  [key: string]: unknown;
}

interface LanguageOption {
  id: number;
  code?: unknown;
  locale?: unknown;
  [key: string]: unknown;
}

const toValidNumber = (value: unknown) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0
    ? numberValue
    : null;
};

const toPositiveNumberList = (value: unknown): number[] => {
  if (value === null || value === undefined) return [];

  if (typeof value === "number") {
    return value > 0 ? [value] : [];
  }

  if (typeof value === "string") {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) && numberValue > 0 ? [numberValue] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => toPositiveNumberList(item));
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    return [
      ...toPositiveNumberList(record.id),
      ...toPositiveNumberList(record.typeId),
      ...toPositiveNumberList(record.operationTypeId),
      ...toPositiveNumberList(record.operationType),
      ...toPositiveNumberList(record.operationTypes),
      ...toPositiveNumberList(record.languageId),
      ...toPositiveNumberList(record.langId),
      ...toPositiveNumberList(record.code),
    ];
  }

  return [];
};

const normalizeLanguageCode = (value: unknown) => {
  if (typeof value !== "string") return "";
  return value.trim().toLowerCase().replace(/_/g, "-");
};

const languageMatches = (optionCode: string, langCode: string) => {
  const normalizedOption = normalizeLanguageCode(optionCode);
  const normalizedLang = normalizeLanguageCode(langCode);

  if (!normalizedOption || !normalizedLang) return false;
  if (normalizedOption === normalizedLang) return true;
  if (normalizedOption.startsWith(`${normalizedLang}-`)) return true;
  if (normalizedLang.startsWith(`${normalizedOption}-`)) return true;
  return false;
};

const getOptionLanguageId = (option: PaymentPurposeOption): number | null =>
  toPositiveNumberList(
    option.languageId ??
      option.langId ??
      option.language?.id ??
      option.tenantLanguageId,
  )[0] ?? null;

const getOptionLanguageCode = (option: PaymentPurposeOption): string | null => {
  const langCode =
    option.languageCode ??
    option.locale ??
    option.code ??
    option.language?.code ??
    (typeof option.language === "object" ? option.language?.code : null);

  const normalized = normalizeLanguageCode(
    typeof langCode === "string" ? langCode : null,
  );
  return normalized || null;
};

const resolveLanguageIdByCode = (
  languageOptions: LanguageOption[],
  languageCode: string,
) => {
  const normalized = normalizeLanguageCode(languageCode);
  const matchedLanguage = languageOptions.find(
    (language) =>
      languageMatches(String(language.code), normalized) ||
      languageMatches(String(language.locale), normalized),
  );

  return matchedLanguage ? toPositiveNumberList(matchedLanguage.id)[0] ?? null : null;
};

const isLanguageMatch = (
  option: PaymentPurposeOption,
  languageId: number | null,
  languageCode: string,
) => {
  if (!languageId && !languageCode) return true;

  const optionLanguageId = getOptionLanguageId(option);
  if (optionLanguageId && languageId) {
    return optionLanguageId === languageId;
  }

  const optionLanguageCode = getOptionLanguageCode(option);
  if (!optionLanguageCode) return true;
  return languageMatches(optionLanguageCode, languageCode);
};

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

export default function BankStatementImportPage() {
  const { t } = useTranslation();
  const { Dragger } = Upload;
  const navigate = useNavigate();
  const parseMutation = useParseBankStatement();
  const createOperations = useCreateBankOperations();
  const appLang = useAppSelector((state) => state.lang.lang);
  const [cards, setCards] = useState<BankStatementCardData[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [bankAssignOpen, setBankAssignOpen] = useState(false);
  const [counterpartyCreateOpen, setCounterpartyCreateOpen] = useState(false);
  const { data: paymentPurposeDebitOptions = [], isLoading: isPaymentPurposeDebitLoading } =
    useQuery<PaymentPurposeOption[]>({
      queryKey: ["selectlist", selectListKeys.paymentPurpose, "operationType", 1],
      queryFn: async () => {
        const { data } = await $axiosPrivate.get<PaymentPurposeOption[]>(
          `${selectListEndpoints.paymentPurposesSelectList}?operationTypeId=1`,
        );
        return data ?? [];
      },
      enabled: true,
    });
  const { data: paymentPurposeCreditOptions = [], isLoading: isPaymentPurposeCreditLoading } =
    useQuery<PaymentPurposeOption[]>({
      queryKey: ["selectlist", selectListKeys.paymentPurpose, "operationType", 2],
      queryFn: async () => {
        const { data } = await $axiosPrivate.get<PaymentPurposeOption[]>(
          `${selectListEndpoints.paymentPurposesSelectList}?operationTypeId=2`,
        );
        return data ?? [];
      },
      enabled: true,
    });
  const isPaymentPurposeLoading =
    isPaymentPurposeDebitLoading || isPaymentPurposeCreditLoading;
  const { data: languageOptions = [] } = useQuery<LanguageOption[]>({
    queryKey: ["selectlist", selectListKeys.language],
    queryFn: async () => {
      const { data } = await $axiosPrivate.get<LanguageOption[]>(
        selectListEndpoints.languagesSelectList,
      );
      return data ?? [];
    },
    enabled: true,
  });
  const currentLanguageId = useMemo(() => {
    return resolveLanguageIdByCode(languageOptions, appLang);
  }, [languageOptions, appLang]);
  const allPaymentPurposeOptions = useMemo(
    () => [
      ...paymentPurposeDebitOptions,
      ...paymentPurposeCreditOptions.filter(
        (option) =>
          !paymentPurposeDebitOptions.some((item) => item.id === option.id),
      ),
    ],
    [paymentPurposeCreditOptions, paymentPurposeDebitOptions],
  );
  const getTransactionOperationTypeId = useCallback(
    (card: BankStatementCardData, transaction: BankStatementTransaction) => {
      return (
        toValidNumber(transaction.operationTypeId) ??
        toValidNumber(card.operationTypeId)
      );
    },
    [],
  );
  const getPaymentPurposeOptionsForTransaction = useCallback(
    (card: BankStatementCardData, transaction: BankStatementTransaction) => {
      const operationTypeId = getTransactionOperationTypeId(card, transaction);
      const optionsByType =
        operationTypeId === 2
          ? paymentPurposeCreditOptions
          : operationTypeId === 1
            ? paymentPurposeDebitOptions
            : [...paymentPurposeDebitOptions, ...paymentPurposeCreditOptions];

      return allPaymentPurposeOptions.filter(
        (option) =>
          (optionsByType.length === 0 ||
            optionsByType.some((target) => target.id === option.id)) &&
          isLanguageMatch(option, currentLanguageId, appLang),
      );
    },
    [
      allPaymentPurposeOptions,
      paymentPurposeDebitOptions,
      paymentPurposeCreditOptions,
      currentLanguageId,
      appLang,
      getTransactionOperationTypeId,
    ],
  );
  const isPaymentPurposeAllowedForTransaction = useCallback(
    (
      card: BankStatementCardData,
      transaction: BankStatementTransaction,
      paymentPurposeId: number | null,
    ) => {
      if (!paymentPurposeId) return false;
      const options = getPaymentPurposeOptionsForTransaction(card, transaction);
      return options.some((option) => option.id === paymentPurposeId);
    },
    [getPaymentPurposeOptionsForTransaction],
  );
  const buildOperationPayload = useCallback(
    (
      card: BankStatementCardData,
      transaction: BankStatementTransaction,
    ): BankOperationCreatePayload | null => {
      const bankAccountId = toValidNumber(card.bankAccountId);
      const operationTypeId = getTransactionOperationTypeId(card, transaction);
      const counterpartyId = toValidNumber(transaction.counterpartyId);
      const currencyId =
        toValidNumber(transaction.currencyId) ?? toValidNumber(card.currencyId);
      const amount = toValidNumber(
        transaction.amount || transaction.credit || transaction.debit,
      );
      const paymentPurposeId = toValidNumber(transaction.paymentPurposeId);
      const rawDate = transaction.date;
      const docDate = rawDate ? dayjs(rawDate) : null;

      if (
        !bankAccountId ||
        !operationTypeId ||
        !counterpartyId ||
        !currencyId ||
        !paymentPurposeId ||
        !amount ||
        !docDate?.isValid()
      ) {
        return null;
      }

      if (
        !isPaymentPurposeAllowedForTransaction(card, transaction, paymentPurposeId)
      ) {
        return null;
      }

      return {
        bankAccountId,
        operationTypeId,
        paymentPurposeId,
        counterpartyId,
        counterpartyBankAccountId: 0,
        docDate: docDate.toISOString(),
        currencyId,
        exchangeRate: 1,
        contractId: 0,
        amount,
        comment: transaction.purpose || null,
      };
    },
    [getTransactionOperationTypeId, isPaymentPurposeAllowedForTransaction],
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
          .filter((item): item is BankOperationCreatePayload => Boolean(item)),
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
  const missingPaymentPurposeCount = useMemo(
    () =>
      cards.reduce((sum, card) => {
        const missing = card.transactions.filter((transaction) => {
          const paymentPurposeId = toValidNumber(transaction.paymentPurposeId);
          return (
            !paymentPurposeId ||
            !isPaymentPurposeAllowedForTransaction(card, transaction, paymentPurposeId)
          );
        }).length;
        return sum + missing;
      }, 0),
    [cards, isPaymentPurposeAllowedForTransaction],
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

  const handlePaymentPurposeChange = (
    cardId: string,
    transactionIndex: number,
    paymentPurposeId: number | null,
  ) => {
    setCards((prev) =>
      prev.map((card) =>
        card.id === cardId
          ? {
              ...card,
              transactions: card.transactions.map((transaction, index) =>
                index === transactionIndex
                  ? {
                      ...transaction,
                      paymentPurposeId,
                    }
                  : transaction,
              ),
            }
          : card,
      ),
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
            ? { ...transaction, counterpartyId: Number(nextId) }
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

    if (missingPaymentPurposeCount) {
      toast.error("Barcha tranzaksiyalar uchun to'lov maqsadini tanlang");
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
            {missingPaymentPurposeCount > 0 && (
              <div className="text-xs text-red-600">
                To'lov maqsadi tanlanmagan: {missingPaymentPurposeCount} ta
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                icon={<Building2 className="size-4" />}
                disabled={!missingBankInfoCount}
                onClick={() => setBankAssignOpen(true)}
              >
                Topilmagan bank ma'lumotlarini belgilash ({missingBankInfoCount})
              </Button>
              <Button
                icon={<Users className="size-4" />}
                disabled={!missingCounterpartyRows.length}
                onClick={() => setCounterpartyCreateOpen(true)}
              >
                Topilmagan counterpartyIdlarni belgilash (
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
              paymentPurposeLoading={isPaymentPurposeLoading}
              getPaymentPurposeOptions={(transaction) =>
                getPaymentPurposeOptionsForTransaction(item, transaction)
              }
              onPaymentPurposeChange={(transactionId, paymentPurposeId) =>
                handlePaymentPurposeChange(
                  item.id,
                  transactionId,
                  paymentPurposeId,
                )
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
    </div>
  );
}
