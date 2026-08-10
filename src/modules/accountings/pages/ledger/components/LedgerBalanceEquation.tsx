import {
  ArrowDownRight,
  ArrowUpRight,
  BookOpenText,
  Scale,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import AccountingReportSummaryGrid from "@/modules/accountings/pages/accounting-report/components/AccountingReportSummaryGrid";
import { numberSpacing } from "@/utils/utils";

interface Props {
  openingBalance: number;
  totalDebit: number;
  totalCredit: number;
  closingBalance: number;
}

const money = (value: number) => numberSpacing(value, undefined, true);

export default function LedgerBalanceEquation({
  openingBalance,
  totalDebit,
  totalCredit,
  closingBalance,
}: Props) {
  const { t } = useTranslation();

  return (
    <AccountingReportSummaryGrid
      items={[
        {
          label: t("app.reports.summary.openingBalance"),
          value: money(openingBalance),
          icon: <BookOpenText className="size-4" />,
          tone: "primary",
        },
        {
          label: t("app.reports.summary.totalDebit"),
          value: money(totalDebit),
          icon: <ArrowDownRight className="size-4" />,
          tone: "primary",
        },
        {
          label: t("app.reports.summary.totalCredit"),
          value: money(totalCredit),
          icon: <ArrowUpRight className="size-4" />,
          tone: "warning",
        },
        {
          label: t("app.reports.summary.closingBalance"),
          value: money(closingBalance),
          icon: <Scale className="size-4" />,
          tone: "success",
        },
      ]}
    />
  );
}
