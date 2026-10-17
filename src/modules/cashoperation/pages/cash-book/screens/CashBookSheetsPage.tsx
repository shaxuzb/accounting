import { Alert, Button, Empty, Spin } from "antd";
import { Printer } from "lucide-react";
import { useParams, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import dayjs from "@/config/dayjs";
import DateRangeFilter from "@/components/ui/filters/DateRangeFilter";
import { numberSpacing } from "@/utils/utils";
import { useGetCashBookSheets } from "../hooks";

const money = (value: number) => (value ? numberSpacing(value, undefined, true) : "");

/**
 * The cash book as 1C prints it (1C «Кассовая книга»): a sheet a day with movements, numbered from
 * the start of the year — the day's opening balance, each order with its person and correspondent
 * account, the day's totals and closing balance, and the cashier's report with the count of
 * receipt and expense orders handed to the accountant.
 */
export default function CashBookSheetsPage() {
  const { t } = useTranslation();
  const { cashBoxId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const { data, isLoading, isFetching } = useGetCashBookSheets(cashBoxId, searchParams);
  const overLimit = (data?.sheets ?? []).filter(
    (sheet) => data?.cashLimit && sheet.closingBalance > data.cashLimit,
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3 print:hidden">
        <DateRangeFilter placeholderKeys={["currency.dateFrom", "currency.dateTo"]} />
        <Button
          type="primary"
          icon={<Printer className="size-4" />}
          disabled={!data?.sheets.length}
          onClick={() => window.print()}
        >
          {t("cashPrint.print")}
        </Button>
        {data?.cashLimit ? (
          <span className="text-muted-foreground">
            {t("cash.book.cashLimit")}: {numberSpacing(data.cashLimit)}
          </span>
        ) : null}
      </div>
      {overLimit.length > 0 && (
        <Alert
          className="print:hidden"
          type="warning"
          showIcon
          message={t("cash.book.overLimit", {
            dates: overLimit.map((x) => dayjs(x.date).format("DD.MM.YYYY")).join(", "),
          })}
        />
      )}
      {(isLoading || isFetching) && <Spin />}
      {data && data.sheets.length === 0 && <Empty description={t("cash.book.noSheets")} />}
      <style>{`@media print {
        body * { visibility: hidden; }
        .cash-book-print, .cash-book-print * { visibility: visible; }
        .cash-book-print { position: absolute; left: 0; top: 0; width: 100%; max-width: none; }
        .cash-book-sheet { break-after: page; box-shadow: none; }
      }`}</style>
      <div className="cash-book-print space-y-4">
        {data?.sheets.map((sheet) => (
          <div
            key={sheet.date}
            className="cash-book-sheet mx-auto max-w-4xl bg-white p-6 text-[12px] leading-snug text-black shadow"
          >
            <div className="mb-1 flex justify-between">
              <span className="font-bold">{data.organizationName}</span>
              <span>{data.cashBoxName}</span>
            </div>
            <div className="mb-2 flex justify-between font-bold">
              <span>
                {t("cashPrint.cashFor", { date: dayjs(sheet.date).format("DD.MM.YYYY") })}
              </span>
              <span>{t("cashPrint.sheet", { number: sheet.sheetNumber })}</span>
            </div>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-black p-1">{t("cashPrint.docNumber")}</th>
                  <th className="border border-black p-1">{t("cashPrint.fromOrTo")}</th>
                  <th className="border border-black p-1">{t("cashPrint.corrAccount")}</th>
                  <th className="border border-black p-1">
                    {t("cashPrint.receiptCol")}, {data.currencyCode ?? ""}
                  </th>
                  <th className="border border-black p-1">
                    {t("cashPrint.paymentCol")}, {data.currencyCode ?? ""}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black p-1" />
                  <td className="border border-black p-1 font-semibold" colSpan={2}>
                    {t("cashPrint.openingOfDay")}
                  </td>
                  <td className="border border-black p-1 text-right font-semibold">
                    {numberSpacing(sheet.openingBalance, undefined, true)}
                  </td>
                  <td className="border border-black p-1" />
                </tr>
                {sheet.items.map((item) => (
                  <tr key={item.moneyRegisterEntryId}>
                    <td className="border border-black p-1 text-center">
                      {item.docNumber ?? ""}
                    </td>
                    <td className="border border-black p-1">
                      {[item.personName ?? item.counterpartyName, item.comment]
                        .filter(Boolean)
                        .join(" — ")}
                    </td>
                    <td className="border border-black p-1 text-center">
                      {item.correspondentAccount ?? ""}
                    </td>
                    <td className="border border-black p-1 text-right">{money(item.receipt)}</td>
                    <td className="border border-black p-1 text-right">{money(item.payment)}</td>
                  </tr>
                ))}
                <tr>
                  <td className="border border-black p-1" />
                  <td className="border border-black p-1 font-semibold" colSpan={2}>
                    {t("cashPrint.dayTotal")}
                  </td>
                  <td className="border border-black p-1 text-right font-semibold">
                    {numberSpacing(sheet.totalReceipt, undefined, true)}
                  </td>
                  <td className="border border-black p-1 text-right font-semibold">
                    {numberSpacing(sheet.totalPayment, undefined, true)}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-1" />
                  <td className="border border-black p-1 font-semibold" colSpan={2}>
                    {t("cashPrint.closingOfDay")}
                  </td>
                  <td className="border border-black p-1 text-right font-semibold">
                    {numberSpacing(sheet.closingBalance, undefined, true)}
                  </td>
                  <td className="border border-black p-1" />
                </tr>
              </tbody>
            </table>
            <div className="mt-3 flex items-end gap-2">
              <span>{t("cashPrint.cashier")}</span>
              <span className="w-28 border-b border-black" />
              <span className="min-w-40 border-b border-black text-center">
                {data.cashier ?? ""}
              </span>
            </div>
            <p className="mt-2">
              {t("cashPrint.checkedBy", {
                receipts: sheet.receiptCount,
                payments: sheet.paymentCount,
              })}
            </p>
            <div className="mt-1 flex items-end gap-2">
              <span>{t("cashPrint.accountant")}</span>
              <span className="w-28 border-b border-black" />
              <span className="min-w-40 border-b border-black text-center">
                {data.chiefAccountant ?? ""}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
