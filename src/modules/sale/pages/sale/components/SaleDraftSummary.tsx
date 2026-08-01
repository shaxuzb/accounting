import { Button } from "antd";
import { Boxes, CheckCircle2, Coins, PackageCheck } from "lucide-react";
import { numberSpacing } from "@/utils/utils";
import { useTranslation } from "react-i18next";

interface Props {
  positionCount: number;
  totalQuantity: number;
  totalAmount: number;
  pendingCount: number;
  loading: boolean;
  isEdit?: boolean;
}

export default function SaleDraftSummary({
  positionCount,
  totalQuantity,
  totalAmount,
  pendingCount,
  loading,
  isEdit = false,
}: Props) {
  const { t } = useTranslation();
  const items = [
    {
      label: t("sale.fields.totalPositions"),
      value: positionCount,
      icon: PackageCheck,
      className: "bg-blue-50 text-blue-600",
    },
    {
      label: t("sale.fields.totalQuantity"),
      value: totalQuantity,
      icon: Boxes,
      className: "bg-emerald-50 text-emerald-600",
    },
    {
      label: t("sale.fields.totalAmount"),
      value: numberSpacing(totalAmount),
      icon: Coins,
      className: "bg-violet-50 text-violet-600",
    },
  ];

  return (
    <aside className="h-fit overflow-hidden rounded-md border border-border bg-primary-bg">
      <div className="divide-y divide-border px-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-center gap-3 py-4">
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-md ${item.className}`}
              >
                <Icon className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-slate-500">{item.label}</div>
                <div className="truncate text-lg font-semibold">
                  {item.value}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="border-t border-border p-3">
        <Button
          type="primary"
          htmlType="submit"
          size="large"
          block
          icon={<CheckCircle2 className="size-4" />}
          loading={loading}
          disabled={pendingCount > 0 || (!isEdit && positionCount === 0)}
        >
         {isEdit ? t("common.save") : t("common.submit")}
        </Button>
      </div>
    </aside>
  );
}
