import { Form, Input } from "antd";
import { numberSpacing } from "@/utils/utils";

interface PurchaseImportSummaryProps {
  comment: string;
  totals: {
    amount: number;
    vatAmount: number;
    totalAmount: number;
  };
  onCommentChange: (value: string) => void;
}

export default function PurchaseImportSummary({
  comment,
  totals,
  onCommentChange,
}: PurchaseImportSummaryProps) {
  return (
    <div className="flex flex-col gap-3 border-x border-b border-border bg-primary-bg px-4 py-3">
      <div className="flex flex-wrap justify-end gap-6 text-sm">
        <div className="min-w-36 text-right">
          <div className="text-muted-second">Jami summa:</div>
          <div className="font-semibold">
            {numberSpacing(totals.amount)}
          </div>
        </div>
        <div className="min-w-36 border-l border-border pl-6 text-right">
          <div className="text-muted-second">Jami QQS:</div>
          <div className="font-semibold">
            {numberSpacing(totals.vatAmount)}
          </div>
        </div>
        <div className="min-w-40 border-l border-border pl-6 text-right">
          <div className="text-muted-second">To'lovga jami:</div>
          <div className="text-base font-bold">
            {numberSpacing(totals.totalAmount)}
          </div>
        </div>
      </div>
      <Form.Item label="Kommentariya" className="mb-0!">
        <Input.TextArea
          rows={2}
          value={comment}
          placeholder="Kommentariya kiriting..."
          onChange={(event) => onCommentChange(event.target.value)}
        />
      </Form.Item>
    </div>
  );
}
