import Card from "@/components/ui/card/Card";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import { Button } from "antd";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { displayDate } from "../utils/format";

interface Props {
  /** Hujjat turi sarlavhasi, i18n kalit */
  title: string;
  docNumber?: string | null;
  docDate?: string | null;
  statusId?: number | null;
  statusName?: string | null;
  isCreate?: boolean;
  onBack?: () => void;
  extra?: ReactNode;
}

/** Barcha oylik maosh hujjatlari uchun umumiy sarlavha paneli. */
export default function PayrollDocumentHeader({
  title,
  docNumber,
  docDate,
  statusId,
  statusName,
  isCreate = false,
  onBack,
  extra,
}: Props) {
  const { t } = useTranslation();

  return (
    <Card className="border border-border p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wide text-secondary-text">
            {t(title, { defaultValue: title })}
          </div>
          <div className="mt-0.5 flex flex-wrap items-baseline gap-3">
            <span className="text-lg font-semibold text-text">
              {isCreate
                ? t("payroll.common.newDocument")
                : (docNumber ?? t("payroll.common.noNumber"))}
            </span>
            {!isCreate && docDate && (
              <span className="text-sm text-secondary-text">
                {displayDate(docDate)}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {extra}
          {!isCreate && (
            <ProcessStatusBadge statusId={statusId} statusName={statusName} />
          )}
          {onBack && (
            <Button icon={<ArrowLeft className="size-4" />} onClick={onBack}>
              {t("common.back")}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
