import { Button, Empty } from "antd";
import { useQuery } from "@tanstack/react-query";
import { Printer } from "lucide-react";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";
import dayjs from "@/config/dayjs";
import { $axiosPrivate } from "@/services/AxiosService";
import { numberSpacing } from "@/utils/utils";

/** waybill — the goods of a sale (накладная), act — its services (акт), receipt — a purchase (приходная накладная). */
export type TradePrintForm = "waybill" | "act" | "receipt";

interface Party {
  name: string;
  inn: string | null;
  vatCode: string | null;
  address: string | null;
  phone: string | null;
  bankAccount: string | null;
  bankName: string | null;
  bankCode: string | null;
}

interface Line {
  no: number;
  productName: string;
  mxik: string | null;
  unitName: string | null;
  isService: boolean;
  quantity: number;
  price: number;
  amount: number;
  vatRate: number | null;
  vatAmount: number;
  total: number;
}

interface TradePrint {
  documentTypeId: number;
  docNumber: string;
  docDate: string;
  externalDocNumber: string | null;
  contractNumber: string | null;
  contractDate: string | null;
  supplier: Party;
  customer: Party;
  warehouseName: string | null;
  warehouseAddress: string | null;
  warehouseKeeper: string | null;
  director: string | null;
  chiefAccountant: string | null;
  agentName: string | null;
  powerOfAttorneyNumber: string | null;
  powerOfAttorneyDate: string | null;
  currencyCode: string | null;
  comment: string | null;
  lines: Line[];
  goodsInWords: string | null;
  servicesInWords: string | null;
  totalInWords: string | null;
}

const money = (value: number) => numberSpacing(value, undefined, true);
const date = (value: string | null) => (value ? dayjs(value).format("DD.MM.YYYY") : "");

function PartyBlock({ title, party }: { title: string; party: Party }) {
  const { t } = useTranslation();
  return (
    <td className="w-1/2 border border-black p-2 align-top">
      <div className="text-xs text-gray-600">{title}</div>
      <b>{party.name}</b>
      <div>
        {t("tradePrint.inn")}: {party.inn ?? "—"}
        {party.vatCode ? ` · ${t("tradePrint.vatCode")}: ${party.vatCode}` : ""}
      </div>
      {party.address && <div>{party.address}</div>}
      {party.bankAccount && (
        <div>
          {t("tradePrint.account")}: {party.bankAccount}
          {party.bankName ? `, ${party.bankName}` : ""}
          {party.bankCode ? `, ${t("tradePrint.mfo")}: ${party.bankCode}` : ""}
        </div>
      )}
      {party.phone && <div>{party.phone}</div>}
    </td>
  );
}

/**
 * A sale's or a purchase's print form, as 1C prints «Реализация» / «Поступление»: the waybill of
 * the goods, the act of the services rendered, the receipt of the goods — the two parties with
 * their details, the basis, the lines with VAT, the total in words, the signatures (the
 * warehouse keeper who released or received the goods, the person who took them by a power of
 * attorney). Printed by the browser.
 */
export default function TradeDocumentPrintPage({ source }: { source: "sale" | "purchase" }) {
  const { t } = useTranslation();
  const params = useParams();
  const id = Number(params.id) || null;
  const form = ((params.form as TradePrintForm | undefined) ?? (source === "purchase" ? "receipt" : "waybill")) as TradePrintForm;
  const { data, isLoading } = useQuery({
    queryKey: ["trade-print", source, id],
    queryFn: async () => (await $axiosPrivate.get<TradePrint>(`${source === "sale" ? "sale-docs" : "purchase-docs"}/${id}/print`)).data,
    enabled: Boolean(id),
  });
  if (isLoading || !data) return null;

  // a waybill lists the goods, an act the services; a receipt everything that came in
  const lines = data.lines.filter((line) => (form === "waybill" ? !line.isService : form === "act" ? line.isService : true));
  const withVat = lines.some((line) => line.vatAmount !== 0);
  const total = lines.reduce((sum, line) => sum + line.total, 0);
  const vat = lines.reduce((sum, line) => sum + line.vatAmount, 0);
  const inWords = form === "waybill" ? data.goodsInWords : form === "act" ? data.servicesInWords : data.totalInWords;
  const title = t(`tradePrint.title.${form}`, { number: data.externalDocNumber && form === "receipt" ? `${data.docNumber} (${data.externalDocNumber})` : data.docNumber, date: date(data.docDate) });

  return (
    <div className="space-y-3">
      <div className="print:hidden">
        <Button type="primary" icon={<Printer className="size-4" />} disabled={!lines.length} onClick={() => window.print()}>
          {t("tradePrint.print")}
        </Button>
      </div>
      <style>{`@media print {
        body * { visibility: hidden; }
        .trade-print, .trade-print * { visibility: visible; }
        .trade-print { position: absolute; left: 0; top: 0; width: 100%; max-width: none; }
      }`}</style>
      {!lines.length ? (
        <Empty description={t(form === "act" ? "tradePrint.noServices" : "tradePrint.noGoods")} />
      ) : (
        <div className="trade-print mx-auto max-w-5xl bg-white p-8 text-[12px] leading-relaxed text-black shadow print:shadow-none">
          <h1 className="mb-1 text-center text-base font-bold">{title}</h1>
          {data.contractNumber && (
            <p className="mb-3 text-center">
              {t("tradePrint.basis", { number: data.contractNumber, date: date(data.contractDate) })}
            </p>
          )}

          <table className="mb-3 w-full border-collapse">
            <tbody>
              <tr>
                <PartyBlock title={t(form === "act" ? "tradePrint.performer" : "tradePrint.supplier")} party={data.supplier} />
                <PartyBlock title={t(form === "act" ? "tradePrint.client" : "tradePrint.customer")} party={data.customer} />
              </tr>
            </tbody>
          </table>

          {form !== "act" && data.warehouseName && (
            <p className="mb-2">
              {t(form === "receipt" ? "tradePrint.warehouseTo" : "tradePrint.warehouseFrom")}: <b>{data.warehouseName}</b>
              {data.warehouseAddress ? `, ${data.warehouseAddress}` : ""}
            </p>
          )}
          {form === "act" && <p className="mb-2">{t("tradePrint.actText")}</p>}

          <table className="mb-3 w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-black p-1">№</th>
                <th className="border border-black p-1 text-left">{t(form === "act" ? "tradePrint.service" : "tradePrint.product")}</th>
                <th className="border border-black p-1">{t("tradePrint.mxik")}</th>
                <th className="border border-black p-1">{t("tradePrint.unit")}</th>
                <th className="border border-black p-1">{t("tradePrint.quantity")}</th>
                <th className="border border-black p-1">{t("tradePrint.price")}</th>
                <th className="border border-black p-1">{t("tradePrint.amount")}</th>
                {withVat && <th className="border border-black p-1">{t("tradePrint.vatRate")}</th>}
                {withVat && <th className="border border-black p-1">{t("tradePrint.vatAmount")}</th>}
                <th className="border border-black p-1">{t("tradePrint.total")}</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line, index) => (
                <tr key={line.no}>
                  <td className="border border-black p-1 text-center">{index + 1}</td>
                  <td className="border border-black p-1">{line.productName}</td>
                  <td className="border border-black p-1 text-center">{line.mxik ?? ""}</td>
                  <td className="border border-black p-1 text-center">{line.unitName ?? ""}</td>
                  <td className="border border-black p-1 text-right">{Number(line.quantity)}</td>
                  <td className="border border-black p-1 text-right">{money(line.price)}</td>
                  <td className="border border-black p-1 text-right">{money(line.amount)}</td>
                  {withVat && <td className="border border-black p-1 text-center">{line.vatRate != null ? `${Number(line.vatRate)}%` : "—"}</td>}
                  {withVat && <td className="border border-black p-1 text-right">{money(line.vatAmount)}</td>}
                  <td className="border border-black p-1 text-right">{money(line.total)}</td>
                </tr>
              ))}
              <tr className="font-bold">
                <td className="border border-black p-1 text-right" colSpan={6}>
                  {t("tradePrint.totalRow")}
                </td>
                <td className="border border-black p-1 text-right">{money(total - vat)}</td>
                {withVat && <td className="border border-black p-1" />}
                {withVat && <td className="border border-black p-1 text-right">{money(vat)}</td>}
                <td className="border border-black p-1 text-right">{money(total)}</td>
              </tr>
            </tbody>
          </table>

          <p className="mb-1">
            {t("tradePrint.totalCount", { count: lines.length })}, {t("tradePrint.totalSum")}: <b>{money(total)} {data.currencyCode}</b>
            {withVat ? `, ${t("tradePrint.includingVat")} ${money(vat)}` : ""}
          </p>
          {inWords && (
            <p className="mb-4">
              {t("tradePrint.inWords")}: <b>{inWords}</b>
            </p>
          )}
          {form === "act" && <p className="mb-4">{t("tradePrint.actNoClaims")}</p>}

          <div className="grid grid-cols-2 gap-x-10 gap-y-6 pt-4">
            {form === "act" ? (
              <>
                <div>
                  <div>{t("tradePrint.performerSign")}</div>
                  <div className="mt-6">____________ {data.documentTypeId === 2 ? (data.director ?? "") : ""}</div>
                </div>
                <div>
                  <div>{t("tradePrint.clientSign")}</div>
                  <div className="mt-6">____________ {data.documentTypeId === 1 ? (data.director ?? "") : ""}</div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <div>{t("tradePrint.released")}</div>
                  <div className="mt-6">
                    ____________ {form === "waybill" ? (data.warehouseKeeper ?? "") : ""}
                  </div>
                  {form === "waybill" && (
                    <div className="mt-4">
                      {t("tradePrint.director")} ____________ {data.director ?? ""}
                    </div>
                  )}
                  {form === "waybill" && data.chiefAccountant && (
                    <div className="mt-4">
                      {t("tradePrint.chiefAccountant")} ____________ {data.chiefAccountant}
                    </div>
                  )}
                </div>
                <div>
                  <div>{t("tradePrint.received")}</div>
                  <div className="mt-6">
                    ____________ {form === "receipt" ? (data.warehouseKeeper ?? "") : (data.agentName ?? "")}
                  </div>
                  {form === "waybill" && data.powerOfAttorneyNumber && (
                    <div className="mt-2 text-xs">
                      {t("tradePrint.byPowerOfAttorney", { number: data.powerOfAttorneyNumber, date: date(data.powerOfAttorneyDate) })}
                    </div>
                  )}
                  {form === "receipt" && data.agentName && (
                    <div className="mt-2 text-xs">
                      {t("tradePrint.agent")}: {data.agentName}
                      {data.powerOfAttorneyNumber
                        ? `, ${t("tradePrint.byPowerOfAttorney", { number: data.powerOfAttorneyNumber, date: date(data.powerOfAttorneyDate) })}`
                        : ""}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          <p className="mt-6 text-center text-xs">{t("tradePrint.stamp")}</p>
        </div>
      )}
    </div>
  );
}
