import { useMemo, useState } from "react";
import { Button, Empty, Upload, type UploadProps } from "antd";
import { Save, Trash2, UploadIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import dayjs from "@/config/dayjs";
import Card from "@/components/ui/card/Card";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import BankStatementCard from "../components/BankStatementCard";
import {
  useCreateBankOperations,
  useParseBankStatement,
} from "../hooks";
import type {
  BankOperationCreatePayload,
  BankStatementCardData,
  BankStatementTransaction,
} from "../types/type";
import { normalizeBankStatements } from "../utils/normalizeBankStatement";

const toValidNumber = (value: number | null | undefined) =>
  typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : null;

const buildOperationPayload = (
  card: BankStatementCardData,
  transaction: BankStatementTransaction,
): BankOperationCreatePayload | null => {
  const bankAccountId = toValidNumber(
    transaction.bankAccountId ?? card.bankAccountId,
  );
  const operationTypeId = toValidNumber(
    transaction.operationTypeId ?? card.operationTypeId,
  );
  const counterpartyId = toValidNumber(transaction.counterpartyId);
  const currencyId = toValidNumber(transaction.currencyId ?? card.currencyId);
  const amount = toValidNumber(
    transaction.amount ?? transaction.credit ?? transaction.debit,
  );
  const rawDate = transaction.docDate ?? transaction.date;
  const docDate = rawDate ? dayjs(rawDate) : null;

  if (
    !bankAccountId ||
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
    operationTypeId,
    counterpartyId,
    docDate: docDate.toISOString(),
    currencyId,
    amount,
    comment: transaction.comment ?? transaction.purpose ?? null,
  };
};

export default function BankStatementImportPage() {
  const { t } = useTranslation();
  const { Dragger } = Upload;
  const navigate = useNavigate();
  const parseMutation = useParseBankStatement();
  const createOperations = useCreateBankOperations();
  const [cards, setCards] = useState<BankStatementCardData[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

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

  const handleDeleteTransaction = (cardId: string, transactionId: string) => {
    setCards((prev) =>
      prev.map((item) =>
        item.id === cardId
          ? {
              ...item,
              transactions: item.transactions.filter(
                (transaction) => transaction.id !== transactionId,
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

  const handleSave = async () => {
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
              onClick={() => void handleSave()}
            >
              {t("common.save")}
            </Button>
          </div>
        </div>

        <Dragger {...uploadProps} disabled={parseMutation.isPending}>
          <div className="my-3 flex justify-center">
            <UploadIcon className="size-10" />
          </div>
          <p className="ant-upload-text">
            {t("bank.import.uploadText")}
          </p>
          <p className="ant-upload-hint">
            {t("bank.import.uploadHint")}
          </p>
        </Dragger>
      </Card>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Card className="border border-border p-4">
          <div className="text-sm text-gray-500">{t("bank.import.statements")}</div>
          <div className="mt-1 text-2xl font-semibold">{cards.length}</div>
        </Card>
        <Card className="border border-border p-4">
          <div className="text-sm text-gray-500">{t("bank.import.transactions")}</div>
          <div className="mt-1 text-2xl font-semibold">{totalTransactions}</div>
        </Card>
        <Card className="border border-border p-4">
          <div className="text-sm text-gray-500">{t("bank.import.status")}</div>
          <div className="mt-1 text-2xl font-semibold">
            {parseMutation.isPending ? t("common.loading") : t("common.ready")}
          </div>
        </Card>
        <Card className="border border-border p-4 md:col-span-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-sm text-gray-500">{t("bank.import.readyToSave")}</div>
              <div className="mt-1 text-2xl font-semibold">
                {validOperations.length}
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {t("bank.messages.missingRequired", {
                count: totalTransactions - validOperations.length,
              })}
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
            />
          ))}
        </div>
      ) : (
        <Card className="border border-border p-10">
          <Empty description={t("bank.messages.noData")} />
        </Card>
      )}
    </div>
  );
}
