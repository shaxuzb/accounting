import { Button, Spin } from "antd";
import { Printer } from "lucide-react";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";
import dayjs from "@/config/dayjs";
import { numberSpacing } from "@/utils/utils";
import { usePaymentOrder } from "./api";

const money = (value: number) => numberSpacing(value, undefined, true);

function Party({
  title,
  name,
  inn,
  account,
  bank,
  mfo,
}: {
  title: string;
  name?: string | null;
  inn?: string | null;
  account?: string | null;
  bank?: string | null;
  mfo?: string | null;
}) {
  const { t } = useTranslation();
  return (
    <table className="mb-3 w-full border-collapse">
      <tbody>
        <tr>
          <td className="w-44 border border-black p-1 align-top font-semibold">{title}</td>
          <td className="border border-black p-1" colSpan={3}>
            {name ?? ""}
          </td>
        </tr>
        <tr>
          <td className="border border-black p-1">{t("paymentOrder.account")}</td>
          <td className="border border-black p-1 font-semibold">{account ?? ""}</td>
          <td className="w-24 border border-black p-1">{t("paymentOrder.inn")}</td>
          <td className="w-40 border border-black p-1">{inn ?? ""}</td>
        </tr>
        <tr>
          <td className="border border-black p-1">{t("paymentOrder.bank")}</td>
          <td className="border border-black p-1">{bank ?? ""}</td>
          <td className="border border-black p-1">{t("paymentOrder.mfo")}</td>
          <td className="border border-black p-1">{mfo ?? ""}</td>
        </tr>
      </tbody>
    </table>
  );
}

/**
 * The payment order as 1C prints it (1C «Платежное поручение»): the payer (the organization's
 * account and bank), the sum and the sum in words, the payee (the counterparty's account and
 * bank), the purpose, and the signers of its date.
 */
export default function PaymentOrderPrintPage() {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const { data, isLoading } = usePaymentOrder(id);
  if (isLoading) return <Spin />;
  if (!data) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 print:hidden">
        <Button type="primary" icon={<Printer className="size-4" />} onClick={() => window.print()}>
          {t("cashPrint.print")}
        </Button>
        {data.statusId !== 2 && <span className="text-orange-500">{t("cashPrint.draft")}</span>}
      </div>
      <style>{`@media print {
        body * { visibility: hidden; }
        .payment-order-print, .payment-order-print * { visibility: visible; }
        .payment-order-print { position: absolute; left: 0; top: 0; width: 100%; max-width: none; box-shadow: none; }
      }`}</style>
      <div className="payment-order-print mx-auto max-w-4xl bg-white p-6 text-[12px] leading-snug text-black shadow">
        <div className="mb-3 flex items-end justify-between">
          <h1 className="text-base font-bold">
            {t("paymentOrder.title", { number: data.docNumber })}
          </h1>
          <div>
            {t("cashPrint.date")}: <b>{dayjs(data.docDate).format("DD.MM.YYYY")}</b>
          </div>
        </div>
        <Party
          title={t("paymentOrder.payer")}
          name={data.payerName}
          inn={data.payerInn}
          account={data.payerAccount}
          bank={data.payerBankName}
          mfo={data.payerBankMfo}
        />
        <table className="mb-3 w-full border-collapse">
          <tbody>
            <tr>
              <td className="w-44 border border-black p-1 font-semibold">{t("cashPrint.amount")}</td>
              <td className="border border-black p-1 text-right text-sm font-bold">
                {money(data.amount)} {data.currencyCode}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-1">{t("cashPrint.amountInWords")}</td>
              <td className="border border-black p-1">{data.amountInWords}</td>
            </tr>
          </tbody>
        </table>
        <Party
          title={t("paymentOrder.payee")}
          name={data.payeeName}
          inn={data.payeeInn}
          account={data.payeeAccount}
          bank={data.payeeBankName}
          mfo={data.payeeBankMfo}
        />
        <table className="mb-4 w-full border-collapse">
          <tbody>
            <tr>
              <td className="w-44 border border-black p-1 align-top font-semibold">
                {t("paymentOrder.purpose")}
              </td>
              <td className="min-h-12 border border-black p-1">{data.purpose ?? ""}</td>
            </tr>
          </tbody>
        </table>
        <div className="grid grid-cols-2 gap-x-10 gap-y-3">
          <div className="flex items-end gap-2">
            <span>{t("cashPrint.director")}</span>
            <span className="w-24 border-b border-black" />
            <span className="flex-1 border-b border-black text-center">{data.director ?? ""}</span>
          </div>
          <div className="row-span-2 flex items-start justify-center border border-dashed border-black p-2 text-[11px]">
            {t("paymentOrder.bankMark")}
          </div>
          <div className="flex items-end gap-2">
            <span>{t("cashPrint.chiefAccountant")}</span>
            <span className="w-24 border-b border-black" />
            <span className="flex-1 border-b border-black text-center">
              {data.chiefAccountant ?? ""}
            </span>
          </div>
          <div className="text-[11px]">{t("cashPrint.stamp")}</div>
        </div>
      </div>
    </div>
  );
}
