import {
  ArrowRight,
  CheckCircle2,
  PackageCheck,
  ReceiptText,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Card from "@/components/ui/card/Card";

export default function FaCommissioningLifecycle() {
  const { t } = useTranslation();
  const steps = [
    { icon: ReceiptText, label: t("fa.commissioning.lifecycleReceipt") },
    { icon: PackageCheck, label: t("fa.commissioning.lifecycleCommissioning") },
    { icon: CheckCircle2, label: t("fa.commissioning.lifecycleActive") },
  ];
  return (
    <Card className="border border-border px-4 py-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="mr-2 font-semibold text-heading">
          {t("fa.commissioning.lifecycleTitle")}
        </span>
        {steps.map((step, index) => (
          <div key={step.label} className="flex items-center gap-2">
            {index > 0 && <ArrowRight className="size-4 text-secondary-text" />}
            <span
              className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 ${index === 1 ? "bg-primary/10 font-semibold text-primary" : "bg-surface-muted text-secondary-text"}`}
            >
              <step.icon className="size-4" />
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
