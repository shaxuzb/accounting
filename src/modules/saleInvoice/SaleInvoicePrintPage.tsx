import { Button } from "antd";
import { Printer } from "lucide-react";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";
import dayjs from "@/config/dayjs";
import { numberSpacing } from "@/utils/utils";
import { useSaleInvoicePrint } from "./api";

const money = (value: number) => numberSpacing(value, undefined, true);

/**
 * The printed invoice for payment (1C «Счет на оплату», print form): the payee with its bank
 * details, the payer, the lines, the totals and the sum in words. Printed by the browser.
 */
export default function SaleInvoicePrintPage() {
  const { t } = useTranslation();
  const id = Number(useParams().id) || null;
  const { data } = useSaleInvoicePrint(id);
  if (!data) return null;
  const invoice = data.invoice;
  const withVat = invoice.vatAmount > 0;

  return (
    <div className="space-y-3">
      <div className="print:hidden">
        <Button type="primary" icon={<Printer className="size-4" />} onClick={() => window.print()}>
          {t("saleInvoice.printNow")}
        </Button>
      </div>
      {/* only the invoice goes to paper, not the app around it */}
      <style>{`@media print {
        body * { visibility: hidden; }
        .sale-invoice-print, .sale-invoice-print * { visibility: visible; }
        .sale-invoice-print { position: absolute; left: 0; top: 0; width: 100%; max-width: none; }
      }`}</style>
      <div className="sale-invoice-print mx-auto max-w-4xl bg-white p-8 text-[13px] leading-relaxed text-black shadow print:shadow-none">
        <table className="mb-6 w-full border-collapse">
          <tbody>
            <tr>
              <td className="w-40 border border-black p-2 align-top">{t("saleInvoice.printPayee")}</td>
              <td className="border border-black p-2">
                <b>{data.organizationName}</b>
                <div>
                  {t("saleInvoice.printInn")}: {data.organizationInn ?? "—"}
                  {data.organizationVatCode ? ` · ${t("saleInvoice.printVatCode")}: ${data.organizationVatCode}` : ""}
                </div>
                {data.organizationAddress && <div>{data.organizationAddress}</div>}
                {data.organizationPhone && <div>{data.organizationPhone}</div>}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2 align-top">{t("saleInvoice.printBank")}</td>
              <td className="border border-black p-2">
                {t("saleInvoice.printAccount")}: <b>{data.bankAccountNumber ?? "—"}</b>
                <div>
                  {data.bankName ?? "—"}
                  {data.bankCode ? ` · ${t("saleInvoice.printMfo")}: ${data.bankCode}` : ""}
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <h1 className="mb-1 text-center text-lg font-bold">
          {t("saleInvoice.printTitle", { number: invoice.docNumber, date: dayjs(invoice.docDate).format("DD.MM.YYYY") })}
        </h1>
        {invoice.dueDate && (
          <p className="mb-4 text-center">
            {t("saleInvoice.printDue", { date: dayjs(invoice.dueDate).format("DD.MM.YYYY") })}
          </p>
        )}

        <p className="mb-1">
          {t("saleInvoice.printPayer")}: <b>{data.customerName}</b>
          {data.customerInn ? `, ${t("saleInvoice.printInn")}: ${data.customerInn}` : ""}
          {data.customerAddress ? `, ${data.customerAddress}` : ""}
        </p>
        {invoice.contractNumber && (
          <p className="mb-3">
            {t("saleInvoice.printBasis")}: {t("saleInvoice.printContract", { number: invoice.contractNumber })}
          </p>
        )}

        <table className="mb-3 w-full border-collapse">
          <thead>
            <tr>
              <th className="border border-black p-1">№</th>
              <th className="border border-black p-1 text-left">{t("saleInvoice.product")}</th>
              <th className="border border-black p-1">{t("saleInvoice.unit")}</th>
              <th className="border border-black p-1">{t("saleInvoice.quantity")}</th>
              <th className="border border-black p-1">{withVat ? t("saleInvoice.priceNet") : t("saleInvoice.price")}</th>
              <th className="border border-black p-1">{t("saleInvoice.amountNet")}</th>
              {withVat && <th className="border border-black p-1">{t("saleInvoice.vatRate")}</th>}
              {withVat && <th className="border border-black p-1">{t("saleInvoice.vatAmount")}</th>}
              <th className="border border-black p-1">{t("saleInvoice.total")}</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lines.map((line, index) => (
              <tr key={line.id ?? index}>
                <td className="border border-black p-1 text-center">{index + 1}</td>
                <td className="border border-black p-1">{line.productName}</td>
                <td className="border border-black p-1 text-center">{line.unitName}</td>
                <td className="border border-black p-1 text-right">{line.quantity}</td>
                <td className="border border-black p-1 text-right">{money(line.price)}</td>
                <td className="border border-black p-1 text-right">{money(line.amount ?? 0)}</td>
                {withVat && <td className="border border-black p-1 text-center">{line.vatRate ? `${line.vatRate}%` : "—"}</td>}
                {withVat && <td className="border border-black p-1 text-right">{money(line.vatAmount ?? 0)}</td>}
                <td className="border border-black p-1 text-right">{money(line.totalAmount ?? 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mb-3 text-right">
          {withVat && (
            <div>
              {t("saleInvoice.vatAmount")}: <b>{money(invoice.vatAmount)}</b>
            </div>
          )}
          <div className="text-base">
            {t("saleInvoice.printToPay")}: <b>{money(invoice.totalAmount)} {data.currencyCode}</b>
          </div>
        </div>
        {data.amountInWords && (
          <p className="mb-8">
            {t("saleInvoice.printInWords")}: <b>{data.amountInWords}</b>
          </p>
        )}

        <div className="grid grid-cols-2 gap-8 pt-6">
          <div>
            {t("saleInvoice.printDirector")} ____________ {data.director ?? ""}
          </div>
          <div>{t("saleInvoice.printAccountant")} ____________</div>
        </div>
      </div>
    </div>
  );
}
