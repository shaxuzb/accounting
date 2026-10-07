import { Form, Input } from "antd";
import { numberSpacing } from "@/utils/utils";
import { useTranslation } from "react-i18next";

interface OpeningInventorySummaryProps {
  comment: string;
  totals: {
    totalAmount: number;
  };
  onCommentChange: (value: string) => void;
}

export default function OpeningInventorySummary({
  comment,
  totals,
  onCommentChange,
}: OpeningInventorySummaryProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4 border-x border-b border-border bg-primary-bg p-4">
      <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-primary/5 px-4 py-3">
        <div className="text-xs text-secondary-text">
          {t("openingInventory.messages.costWithoutVat")}
        </div>
        <div className="text-right">
          <div className="text-xs text-secondary-text">{t("common.total")}</div>
          <div className="text-base font-bold text-primary">
            {numberSpacing(totals.totalAmount, undefined, true)}
          </div>
        </div>
      </div>
      <Form.Item label={t("openingInventory.fields.comment")} className="mb-0!">
        <Input.TextArea
          rows={2}
          value={comment}
          placeholder={t("openingInventory.messages.commentPlaceholder")}
          onChange={(event) => onCommentChange(event.target.value)}
        />
      </Form.Item>
    </div>
  );
}
