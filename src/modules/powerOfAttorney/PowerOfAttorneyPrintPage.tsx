import { Button } from "antd";
import { Printer } from "lucide-react";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";
import dayjs from "@/config/dayjs";
import { usePowerOfAttorneyPrint } from "./api";

const day = (value?: string | null) => (value ? dayjs(value).format("DD.MM.YYYY") : "________");

/**
 * The printed power of attorney (NSBU 4 app. 2): the organization and its account, the number,
 * date and term, the agent's position, name and passport, the supplier and the document the goods
 * come by, the goods (name, unit, quantity), the agent's specimen signature and the head's and
 * chief accountant's signatures. Printed by the browser.
 */
export default function PowerOfAttorneyPrintPage() {
  const { t } = useTranslation();
  const id = Number(useParams().id) || null;
  const { data } = usePowerOfAttorneyPrint(id);
  if (!data) return null;
  const doc = data.document;
  const passport = [doc.passportSeries, doc.passportNumber].filter(Boolean).join(" ");
  const basis = [
    doc.contractNumber && t("powerOfAttorney.printContract", { number: doc.contractNumber, date: day(doc.contractDate) }),
    doc.basisDocument,
  ]
    .filter(Boolean)
    .join("; ");

  return (
    <div className="space-y-3">
      <div className="print:hidden">
        <Button type="primary" icon={<Printer className="size-4" />} onClick={() => window.print()}>
          {t("powerOfAttorney.printNow")}
        </Button>
      </div>
      {/* only the power goes to paper, not the app around it */}
      <style>{`@media print {
        body * { visibility: hidden; }
        .poa-print, .poa-print * { visibility: visible; }
        .poa-print { position: absolute; left: 0; top: 0; width: 100%; max-width: none; }
      }`}</style>
      <div className="poa-print mx-auto max-w-4xl space-y-3 bg-white p-8 text-[13px] leading-relaxed text-black shadow print:shadow-none">
        <div>
          <b>{data.organizationName}</b>
          {data.organizationInn ? `, ${t("powerOfAttorney.printInn")}: ${data.organizationInn}` : ""}
          {data.organizationAddress && <div>{data.organizationAddress}</div>}
          <div>
            {t("powerOfAttorney.printAccount")}: {data.bankAccountNumber ?? "—"}
            {data.bankName ? `, ${data.bankName}` : ""}
            {data.bankCode ? `, ${t("powerOfAttorney.printMfo")}: ${data.bankCode}` : ""}
          </div>
        </div>

        <h1 className="text-center text-lg font-bold">
          {t("powerOfAttorney.printTitle", { number: doc.docNumber })}
        </h1>
        <p className="text-center">
          {t("powerOfAttorney.printIssued", { date: day(doc.docDate) })} · {t("powerOfAttorney.printValid", { date: day(doc.validUntil) })}
        </p>

        <p>
          {t("powerOfAttorney.printGivenTo")}: <b>{doc.agentPosition ? `${doc.agentPosition}, ` : ""}{doc.agentName}</b>
        </p>
        <p>
          {t("powerOfAttorney.printPassport")}: {passport || "________"}, {t("powerOfAttorney.printIssuedBy")}{" "}
          {doc.passportIssuedBy || "________"}, {day(doc.passportIssuedDate)}
          {doc.agentPinfl ? `; ${t("powerOfAttorney.printPinfl")}: ${doc.agentPinfl}` : ""}
        </p>
        <p>
          {t("powerOfAttorney.printFrom")}: <b>{doc.counterpartyName}</b>
        </p>
        <p>
          {t("powerOfAttorney.printBy")}: {basis || "________"}
        </p>

        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="w-12 border border-black p-1">№</th>
              <th className="border border-black p-1 text-left">{t("powerOfAttorney.goods")}</th>
              <th className="w-32 border border-black p-1">{t("powerOfAttorney.unit")}</th>
              <th className="w-40 border border-black p-1">{t("powerOfAttorney.printQuantityWords")}</th>
            </tr>
          </thead>
          <tbody>
            {doc.lines.map((line, index) => (
              <tr key={line.id ?? index}>
                <td className="border border-black p-1 text-center">{index + 1}</td>
                <td className="border border-black p-1">{line.name}</td>
                <td className="border border-black p-1 text-center">{line.unitName ?? ""}</td>
                <td className="border border-black p-1 text-right">{line.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="pt-4">{t("powerOfAttorney.printSpecimen")} ______________ {t("powerOfAttorney.printCertify")}</p>
        <div className="grid grid-cols-2 gap-8 pt-6">
          <div>
            {t("powerOfAttorney.printDirector")} ______________ {data.director ?? ""}
          </div>
          <div>
            {t("powerOfAttorney.printAccountant")} ______________ {data.chiefAccountant ?? ""}
          </div>
        </div>
      </div>
    </div>
  );
}
