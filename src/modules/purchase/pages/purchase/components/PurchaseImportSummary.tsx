import { Form, Input } from "antd";
import { numberSpacing } from "@/utils/utils";
import { useTranslation } from "react-i18next";

interface PurchaseImportSummaryProps {
  comment: string;
  totals: {
    amount: number;
    vatAmount: number;
    totalAmount: number;
  };
  onCommentChange: (value: string) => void;
  showComment?: boolean;
}

export default function PurchaseImportSummary({
  comment,
  totals,
  onCommentChange,
  showComment = true,
}: PurchaseImportSummaryProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4 border-x border-b border-border bg-primary-bg p-4">
      <div className="grid overflow-hidden rounded-lg border border-border bg-primary-bg sm:grid-cols-3">
        <div className="border-b border-border px-4 py-3 text-center sm:border-b-0 sm:border-r">
          <div className="text-xs text-secondary-text">{t("purchase.fields.amountWithoutVat")}</div>
          <div className="mt-1 text-base font-semibold">
            {numberSpacing(totals.amount)}
          </div>
        </div>
        <div className="border-b border-border px-4 py-3 text-center sm:border-b-0 sm:border-r">
          <div className="text-xs text-secondary-text">{t("purchase.fields.vatAmount")}</div>
          <div className="mt-1 text-base font-semibold">
            {numberSpacing(totals.vatAmount)}
          </div>
        </div>
        <div className="bg-primary/5 px-4 py-3 text-center">
          <div className="text-xs text-secondary-text">{t("common.total")}</div>
          <div className="mt-1 text-base font-bold text-primary">
            {numberSpacing(totals.totalAmount)}
          </div>
        </div>
      </div>
      {showComment ? (
        <Form.Item label={t("purchase.fields.comment")} className="mb-0!">
          <Input.TextArea
            rows={2}
            value={comment}
            placeholder={t("purchase.messages.commentPlaceholder")}
            onChange={(event) => onCommentChange(event.target.value)}
          />
        </Form.Item>
      ) : null}
    </div>
  );
}
