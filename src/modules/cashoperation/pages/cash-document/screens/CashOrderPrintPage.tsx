import { Button, Spin } from "antd";
import { Printer } from "lucide-react";
import type { ReactNode } from "react";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";
import dayjs from "@/config/dayjs";
import { numberSpacing } from "@/utils/utils";
import { useCashOrderPrint } from "../hooks/useCashOrderPrint";
import type { CashOrderPrint } from "../types/type";
import { resolveCashDocumentKind } from "../utils/kind";

const money = (value: number) => numberSpacing(value, undefined, true);

/** A labelled line of the form, the value underlined as on the printed blank. */
function Line({ label, children }: { label: string; children?: ReactNode }) {
  return (
    <div className="flex items-end gap-2 py-0.5">
      <span className="whitespace-nowrap">{label}</span>
      <span className="min-h-5 flex-1 border-b border-black">{children}</span>
    </div>
  );
}

function Signature({ label, name }: { label: string; name?: string | null }) {
  return (
    <div className="flex items-end gap-2 py-1">
      <span className="whitespace-nowrap">{label}</span>
      <span className="w-28 border-b border-black" />
      <span className="min-w-40 flex-1 border-b border-black text-center">
        {name ?? ""}
      </span>
    </div>
  );
}

function SumInWords({ data }: { data: CashOrderPrint }) {
  const { t } = useTranslation();
  return (
    <Line label={t("cashPrint.amountInWords")}>
      {data.amountInWords || `${money(data.amount)} ${data.currencyCode}`}
    </Line>
  );
}

/**
 * The cash orders as 1C prints them: the receipt order (form KO-1) with its tear-off receipt and
 * the expense order (form KO-2) — the correspondent accounts with their sums from the order's
 * entries, the person, the basis, the sum in words and the signers of the order's date.
 */
export default function CashOrderPrintPage() {
  const { t } = useTranslation();
  const { id = "", kind: rawKind } = useParams();
  const kind = resolveCashDocumentKind(rawKind);
  const { data, isLoading } = useCashOrderPrint(kind, id);
  if (isLoading) return <Spin />;
  if (!data) return null;
  const isOut = kind === "rko";
  const date = dayjs(data.docDate).format("DD.MM.YYYY");
  const draft = data.statusId !== 2;

  const header = (
    <div className="mb-3 flex items-start justify-between gap-4">
      <div>
        <div className="font-bold">{data.organizationName}</div>
        {data.organizationInn && (
          <div>
            {t("cashPrint.inn")}: {data.organizationInn}
          </div>
        )}
      </div>
      <div className="text-right text-[11px]">
        {t(isOut ? "cashPrint.formKo2" : "cashPrint.formKo1")}
      </div>
    </div>
  );

  // the order's table: the number and date, then the cash and correspondent accounts
  const accountsTable = (
    <table className="mb-3 w-full border-collapse text-center">
      <thead>
        <tr>
          <th className="border border-black p-1">{t("cashPrint.docNumber")}</th>
          <th className="border border-black p-1">{t("cashPrint.date")}</th>
          <th className="border border-black p-1">{t("cashPrint.debit")}</th>
          <th className="border border-black p-1">{t("cashPrint.credit")}</th>
          <th className="border border-black p-1">
            {t("cashPrint.amount")}, {data.currencyCode}
          </th>
        </tr>
      </thead>
      <tbody>
        {(data.accounts.length
          ? data.accounts
          : [{ accountNumber: "", amount: data.amount }]
        ).map((account, index) => (
          <tr key={account.accountNumber + index}>
            <td className="border border-black p-1">{index === 0 ? data.docNumber : ""}</td>
            <td className="border border-black p-1">{index === 0 ? date : ""}</td>
            <td className="border border-black p-1">
              {isOut ? account.accountNumber : data.cashAccountNumber}
            </td>
            <td className="border border-black p-1">
              {isOut ? data.cashAccountNumber : account.accountNumber}
            </td>
            <td className="border border-black p-1 text-right">{money(account.amount)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 print:hidden">
        <Button
          type="primary"
          icon={<Printer className="size-4" />}
          onClick={() => window.print()}
        >
          {t("cashPrint.print")}
        </Button>
        {draft && <span className="text-orange-500">{t("cashPrint.draft")}</span>}
      </div>
      {/* only the order goes to paper, not the app around it */}
      <style>{`@media print {
        body * { visibility: hidden; }
        .cash-order-print, .cash-order-print * { visibility: visible; }
        .cash-order-print { position: absolute; left: 0; top: 0; width: 100%; max-width: none; box-shadow: none; }
      }`}</style>
      <div className="cash-order-print mx-auto max-w-5xl bg-white p-6 text-[12px] leading-snug text-black shadow">
        {isOut ? (
          <div>
            {header}
            <h1 className="mb-2 text-center text-base font-bold">
              {t("cashPrint.expenseOrder")}
            </h1>
            {accountsTable}
            <Line label={t("cashPrint.issueTo")}>{data.personName}</Line>
            <Line label={t("cashPrint.basis")}>{data.basis}</Line>
            <Line label={t("cashPrint.sum")}>
              {money(data.amount)} {data.currencyCode}
            </Line>
            <SumInWords data={data} />
            <Line label={t("cashPrint.attachment")}>{data.attachment}</Line>
            <div className="mt-2 grid grid-cols-2 gap-x-8">
              <Signature label={t("cashPrint.director")} name={data.director} />
              <Signature label={t("cashPrint.chiefAccountant")} name={data.chiefAccountant} />
            </div>
            <div className="mt-3">
              <Line label={t("cashPrint.received")}>
                {data.amountInWords || ""}
              </Line>
              <div className="grid grid-cols-2 gap-x-8">
                <Line label={t("cashPrint.date")}>«____» ____________ 20___</Line>
                <Line label={t("cashPrint.signature")} />
              </div>
              <Line label={t("cashPrint.byDocument")}>{data.idDocument}</Line>
              <Signature label={t("cashPrint.issuedByCashier")} name={data.cashier} />
            </div>
          </div>
        ) : (
          <div className="flex gap-4">
            <div className="flex-[3]">
              {header}
              <h1 className="mb-2 text-center text-base font-bold">
                {t("cashPrint.receiptOrder")}
              </h1>
              {accountsTable}
              <Line label={t("cashPrint.receivedFrom")}>{data.personName}</Line>
              <Line label={t("cashPrint.basis")}>{data.basis}</Line>
              <Line label={t("cashPrint.sum")}>
                {money(data.amount)} {data.currencyCode}
              </Line>
              <SumInWords data={data} />
              <Line label={t("cashPrint.attachment")}>{data.attachment}</Line>
              <div className="mt-2">
                <Signature label={t("cashPrint.chiefAccountant")} name={data.chiefAccountant} />
                <Signature label={t("cashPrint.receivedByCashier")} name={data.cashier} />
              </div>
            </div>
            {/* the receipt (1C «Квитанция»), torn off and given to the payer */}
            <div className="flex-[2] border-l border-dashed border-black pl-4">
              <div className="font-bold">{data.organizationName}</div>
              <h2 className="my-2 text-center font-bold">{t("cashPrint.receipt")}</h2>
              <Line label={t("cashPrint.toOrder")}>№ {data.docNumber}</Line>
              <Line label={t("cashPrint.date")}>{date}</Line>
              <Line label={t("cashPrint.receivedFrom")}>{data.personName}</Line>
              <Line label={t("cashPrint.basis")}>{data.basis}</Line>
              <Line label={t("cashPrint.sum")}>
                {money(data.amount)} {data.currencyCode}
              </Line>
              <SumInWords data={data} />
              <div className="mt-2 text-[11px]">{t("cashPrint.stamp")}</div>
              <Signature label={t("cashPrint.chiefAccountant")} name={data.chiefAccountant} />
              <Signature label={t("cashPrint.cashier")} name={data.cashier} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
