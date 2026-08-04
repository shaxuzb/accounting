import type { ReactNode } from "react";
import { Scale, TrendingDown, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import Card from "@/components/ui/card/Card";

interface FaRevaluationAccountFlowProps {
  reserveContent: ReactNode;
  lossContent: ReactNode;
}

export default function FaRevaluationAccountFlow({
  reserveContent,
  lossContent,
}: FaRevaluationAccountFlowProps) {
  const { t } = useTranslation();

  return (
    <div className="grid items-stretch gap-3 md:grid-cols-[1fr_auto_1fr]">
      <Card className="border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900 dark:bg-emerald-950/25">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
          <TrendingUp className="size-4" />
          {t("fa.revaluation.increase")}
        </div>
        {reserveContent}
      </Card>

      <div className="flex items-center justify-center px-2 text-primary">
        <Scale className="size-6" />
      </div>

      <Card className="border border-red-200 bg-red-50/60 p-4 dark:border-red-900 dark:bg-red-950/25">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-red-600 dark:text-red-400">
          <TrendingDown className="size-4" />
          {t("fa.revaluation.decrease")}
        </div>
        {lossContent}
      </Card>
    </div>
  );
}
