import { Button, Spin } from "antd";
import { Printer } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";
import dayjs from "@/config/dayjs";
import { numberSpacing } from "@/utils/utils";
import { getJson } from "@/modules/accountings/services/request";
import { useManualEntry } from "@/modules/accountings/pages/manual-entries/hooks";
import { manualEntryStatus } from "@/modules/accountings/pages/manual-entries/types";
import { usePayrollEmployeeLookup } from "@/modules/payroll/hooks/usePayrollEmployeeLookup";

const money = (value: number) => numberSpacing(Math.round(value * 100) / 100, undefined, true);

/**
 * The expense report as 1C prints it (1C «Авансовый отчет»): the accountable person, what they
 * held of the advances before the report, what the report spends (each line with its account),
 * and the remainder to return or the overspend to pay out; signed by the accountable person, the
 * accountant and the chief accountant.
 */
export default function ExpenseReportPrintPage() {
  const { t } = useTranslation();
  const id = Number(useParams().id) || null;
  const { data } = useManualEntry(id);
  const { data: employees } = usePayrollEmployeeLookup();
  // what the employee held just before the report (the report itself not yet in it)
  const before = data ? dayjs(data.docDate).subtract(1, "second") : null;
  const { data: balance, isLoading } = useQuery({
    queryKey: ["accountable-balance", data?.employeeId, data?.advanceAccountId, before?.format()],
    queryFn: () =>
      getJson<{ balance: number }>("/manual-entries/accountable-balance", {
        employeeId: data?.employeeId,
        accountId: data?.advanceAccountId,
        date: before?.format("YYYY-MM-DDTHH:mm:ss"),
      }),
    enabled: Boolean(data?.employeeId && data?.advanceAccountId),
  });
  if (!data || isLoading) return <Spin />;

  const employee = employees?.find((x) => x.id === data.employeeId);
  const held = balance?.balance ?? 0;
  const spent = data.lines.reduce((sum, line) => sum + (Number(line.amount) || 0), 0);
  const left = held - spent;
  const advanceNumber = data.lines[0]?.creditAccountNumber ?? "";

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 print:hidden">
        <Button type="primary" icon={<Printer className="size-4" />} onClick={() => window.print()}>
          {t("cashPrint.print")}
        </Button>
        {data.statusId !== manualEntryStatus.posted && (
          <span className="text-orange-500">{t("cashPrint.draft")}</span>
        )}
      </div>
      <style>{`@media print {
        body * { visibility: hidden; }
        .expense-report-print, .expense-report-print * { visibility: visible; }
        .expense-report-print { position: absolute; left: 0; top: 0; width: 100%; max-width: none; box-shadow: none; }
      }`}</style>
      <div className="expense-report-print mx-auto max-w-4xl bg-white p-6 text-[12px] leading-snug text-black shadow">
        <h1 className="mb-1 text-center text-base font-bold">
          {t("expenseReport.printTitle", { number: data.docNumber })}
        </h1>
        <p className="mb-3 text-center">{dayjs(data.docDate).format("DD.MM.YYYY")}</p>
        <table className="mb-3 w-full border-collapse">
          <tbody>
            <tr>
              <td className="w-56 border border-black p-1">{t("expenseReport.accountablePerson")}</td>
              <td className="border border-black p-1 font-semibold">
                {employee?.label ?? ""}
                {employee?.positionName ? `, ${employee.positionName}` : ""}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-1">{t("expenseReport.purposeOfAdvance")}</td>
              <td className="border border-black p-1">{data.comment ?? ""}</td>
            </tr>
          </tbody>
        </table>

        <table className="mb-3 w-full border-collapse">
          <tbody>
            <tr>
              <td className="border border-black p-1">{t("expenseReport.heldBefore")}</td>
              <td className="w-40 border border-black p-1 text-right">{money(held)}</td>
            </tr>
            <tr>
              <td className="border border-black p-1">{t("expenseReport.spentTotal")}</td>
              <td className="border border-black p-1 text-right">{money(spent)}</td>
            </tr>
            <tr>
              <td className="border border-black p-1 font-semibold">
                {left >= 0 ? t("expenseReport.remainder") : t("expenseReport.overspend")}
              </td>
              <td className="border border-black p-1 text-right font-semibold">
                {money(Math.abs(left))}
              </td>
            </tr>
          </tbody>
        </table>

        <table className="mb-4 w-full border-collapse">
          <thead>
            <tr>
              <th className="w-10 border border-black p-1">№</th>
              <th className="border border-black p-1">{t("expenseReport.document")}</th>
              <th className="w-24 border border-black p-1">{t("cashPrint.debit")}</th>
              <th className="w-24 border border-black p-1">{t("cashPrint.credit")}</th>
              <th className="w-36 border border-black p-1">{t("cashPrint.amount")}, UZS</th>
            </tr>
          </thead>
          <tbody>
            {data.lines.map((line, index) => (
              <tr key={line.id ?? index}>
                <td className="border border-black p-1 text-center">{index + 1}</td>
                <td className="border border-black p-1">
                  {[line.content, line.debitAccountName].filter(Boolean).join(" — ")}
                </td>
                <td className="border border-black p-1 text-center">{line.debitAccountNumber ?? ""}</td>
                <td className="border border-black p-1 text-center">
                  {line.creditAccountNumber ?? advanceNumber}
                </td>
                <td className="border border-black p-1 text-right">{money(Number(line.amount) || 0)}</td>
              </tr>
            ))}
            <tr>
              <td className="border border-black p-1 font-semibold" colSpan={4}>
                {t("manualEntries.total")}
              </td>
              <td className="border border-black p-1 text-right font-semibold">{money(spent)}</td>
            </tr>
          </tbody>
        </table>

        <div className="grid grid-cols-2 gap-x-10 gap-y-3">
          {[
            [t("expenseReport.accountablePerson"), employee?.label ?? ""],
            [t("expenseReport.checkedBy"), ""],
            [t("cashPrint.chiefAccountant"), ""],
          ].map(([label, name]) => (
            <div key={label} className="flex items-end gap-2">
              <span className="whitespace-nowrap">{label}</span>
              <span className="w-24 border-b border-black" />
              <span className="flex-1 border-b border-black text-center">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
