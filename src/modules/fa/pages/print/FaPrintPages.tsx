import { Button, Spin } from "antd";
import { Printer } from "lucide-react";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";
import dayjs from "@/config/dayjs";
import { $axiosPrivate } from "@/services/AxiosService";
import { numberSpacing } from "@/utils/utils";

interface Header {
  organizationName: string;
  organizationInn?: string | null;
  director?: string | null;
  chiefAccountant?: string | null;
}

interface PrintAsset {
  id: number;
  inventoryNumber: string;
  name: string;
  groupName?: string | null;
  okofCode?: string | null;
  okofName?: string | null;
  departmentName?: string | null;
  responsibleName?: string | null;
  assetAccountNumber?: string | null;
  initialCost: number;
  accumulatedDepreciation: number;
  bookValue: number;
  usefulLifeMonths?: number | null;
  depreciationMethodName?: string | null;
  deprStartDate?: string | null;
  commissionedDate?: string | null;
}

interface CommissioningAct extends Header {
  docNumber: string;
  docDate: string;
  note?: string | null;
  assets: PrintAsset[];
}

interface DisposalAct extends Header {
  docNumber: string;
  disposalDate: string;
  disposalTypeName: string;
  reason?: string | null;
  counterpartyName?: string | null;
  lines: {
    asset: PrintAsset;
    partPercent?: number | null;
    cost: number;
    depreciation: number;
    bookValue: number;
    saleAmount: number;
    vatAmount: number;
    gainLoss: number;
  }[];
}

interface AssetCard extends Header {
  asset: PrintAsset;
  movements: {
    date: string;
    documentName: string;
    docNumber?: string | null;
    content?: string | null;
    costChange: number;
    depreciationChange: number;
  }[];
}

const money = (value: number) => numberSpacing(Math.round(value * 100) / 100, undefined, true);
const date = (value?: string | null) => (value ? dayjs(value).format("DD.MM.YYYY") : "");
const cell = "border border-black p-1";

const usePrint = <T,>(path: string) =>
  useQuery({
    queryKey: ["fa-print", path],
    queryFn: () => $axiosPrivate.get<T>(path).then((res) => res.data),
  });

/** The page around a form: the print button, and only the form goes to paper. */
function PrintFrame({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-3">
      <div className="print:hidden">
        <Button type="primary" icon={<Printer className="size-4" />} onClick={() => window.print()}>
          {t("cashPrint.print")}
        </Button>
      </div>
      <style>{`@media print {
        body * { visibility: hidden; }
        .fa-print, .fa-print * { visibility: visible; }
        .fa-print { position: absolute; left: 0; top: 0; width: 100%; max-width: none; box-shadow: none; }
      }`}</style>
      <div className="fa-print mx-auto max-w-5xl bg-white p-6 text-[12px] leading-snug text-black shadow">{children}</div>
    </div>
  );
}

function OrgLine({ header, form }: { header: Header; form: string }) {
  const { t } = useTranslation();
  return (
    <div className="mb-3 flex items-start justify-between gap-4">
      <div>
        <div className="font-bold">{header.organizationName}</div>
        {header.organizationInn && (
          <div>
            {t("cashPrint.inn")}: {header.organizationInn}
          </div>
        )}
      </div>
      <div className="text-right text-[11px]">{form}</div>
    </div>
  );
}

function Signatures({ rows }: { rows: [string, string | null | undefined][] }) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-x-10 gap-y-3">
      {rows.map(([label, name], index) => (
        <div key={index} className="flex items-end gap-2">
          <span className="whitespace-nowrap">{label}</span>
          <span className="w-24 border-b border-black" />
          <span className="flex-1 border-b border-black text-center">{name ?? ""}</span>
        </div>
      ))}
    </div>
  );
}

function AssetTable({ asset }: { asset: PrintAsset }) {
  const { t } = useTranslation();
  const rows: [string, ReactNode][] = [
    [t("faPrint.inventoryNumber"), asset.inventoryNumber],
    [t("faPrint.name"), asset.name],
    [t("faPrint.group"), asset.groupName],
    [t("faPrint.okof"), [asset.okofCode, asset.okofName].filter(Boolean).join(" ")],
    [t("faPrint.account"), asset.assetAccountNumber],
    [t("faPrint.department"), asset.departmentName],
    [t("faPrint.responsible"), asset.responsibleName],
    [t("faPrint.initialCost"), money(asset.initialCost)],
    [t("faPrint.depreciationMethod"), asset.depreciationMethodName],
    [t("faPrint.usefulLife"), asset.usefulLifeMonths],
    [t("faPrint.deprStart"), date(asset.deprStartDate)],
  ];
  return (
    <table className="mb-3 w-full border-collapse">
      <tbody>
        {rows.map(([label, value]) => (
          <tr key={label}>
            <td className={`${cell} w-64`}>{label}</td>
            <td className={`${cell} font-semibold`}>{value ?? ""}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** OS-1: the acceptance act of the assets a commissioning put into use (1C «Акт о приеме-передаче ОС»). */
export function FaCommissioningActPage() {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const { data, isLoading } = usePrint<CommissioningAct>(`fa-assets/print/commissioning/${id}`);
  if (isLoading) return <Spin />;
  if (!data) return null;
  return (
    <PrintFrame>
      {data.assets.map((asset, index) => (
        <div key={asset.id} className={index > 0 ? "mt-8 break-before-page" : undefined}>
          <OrgLine header={data} form={t("faPrint.formOs1")} />
          <h1 className="mb-1 text-center text-base font-bold">
            {t("faPrint.os1Title", { number: data.docNumber })}
          </h1>
          <p className="mb-3 text-center">{date(data.docDate)}</p>
          <AssetTable asset={asset} />
          {data.note && <p className="mb-2">{data.note}</p>}
          <p className="mb-1">{t("faPrint.os1Conclusion")}</p>
          <Signatures
            rows={[
              [t("faPrint.commissionChair"), data.director],
              [t("faPrint.commissionMember"), ""],
              [t("faPrint.commissionMember"), ""],
              [t("faPrint.received"), asset.responsibleName],
              [t("cashPrint.chiefAccountant"), data.chiefAccountant],
            ]}
          />
        </div>
      ))}
    </PrintFrame>
  );
}

/** OS-4: the write-off act (1C «Акт о списании ОС»): cost, depreciation and residual value of each asset. */
export function FaDisposalActPage() {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const { data, isLoading } = usePrint<DisposalAct>(`fa-assets/print/disposal/${id}`);
  if (isLoading) return <Spin />;
  if (!data) return null;
  return (
    <PrintFrame>
      <OrgLine header={data} form={t("faPrint.formOs4")} />
      <h1 className="mb-1 text-center text-base font-bold">{t("faPrint.os4Title", { number: data.docNumber })}</h1>
      <p className="mb-3 text-center">{date(data.disposalDate)}</p>
      <p>
        {t("faPrint.disposalType")}: <b>{data.disposalTypeName}</b>
        {data.counterpartyName ? ` — ${data.counterpartyName}` : ""}
      </p>
      <p className="mb-3">
        {t("faPrint.reason")}: {data.reason ?? ""}
      </p>
      <table className="mb-3 w-full border-collapse">
        <thead>
          <tr>
            <th className={cell}>№</th>
            <th className={cell}>{t("faPrint.inventoryNumber")}</th>
            <th className={cell}>{t("faPrint.name")}</th>
            <th className={cell}>{t("faPrint.commissioned")}</th>
            <th className={cell}>{t("faPrint.part")}</th>
            <th className={cell}>{t("faPrint.initialCost")}</th>
            <th className={cell}>{t("faPrint.depreciation")}</th>
            <th className={cell}>{t("faPrint.bookValue")}</th>
          </tr>
        </thead>
        <tbody>
          {data.lines.map((line, index) => (
            <tr key={index}>
              <td className={`${cell} text-center`}>{index + 1}</td>
              <td className={cell}>{line.asset.inventoryNumber}</td>
              <td className={cell}>{line.asset.name}</td>
              <td className={`${cell} text-center`}>{date(line.asset.deprStartDate)}</td>
              <td className={`${cell} text-center`}>{line.partPercent ? `${line.partPercent}%` : "100%"}</td>
              <td className={`${cell} text-right`}>{money(line.cost)}</td>
              <td className={`${cell} text-right`}>{money(line.depreciation)}</td>
              <td className={`${cell} text-right`}>{money(line.bookValue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mb-1">{t("faPrint.os4Conclusion")}</p>
      <Signatures
        rows={[
          [t("faPrint.commissionChair"), data.director],
          [t("faPrint.commissionMember"), ""],
          [t("faPrint.commissionMember"), ""],
          [t("cashPrint.chiefAccountant"), data.chiefAccountant],
        ]}
      />
    </PrintFrame>
  );
}

/** OS-6: the inventory card of an asset (1C «Инвентарная карточка учета ОС») with its movements. */
export function FaAssetCardPage() {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const { data, isLoading } = usePrint<AssetCard>(`fa-assets/${id}/card`);
  if (isLoading) return <Spin />;
  if (!data) return null;
  const { asset } = data;
  return (
    <PrintFrame>
      <OrgLine header={data} form={t("faPrint.formOs6")} />
      <h1 className="mb-3 text-center text-base font-bold">{t("faPrint.os6Title", { number: asset.inventoryNumber })}</h1>
      <AssetTable asset={asset} />
      <table className="mb-3 w-full border-collapse">
        <tbody>
          <tr>
            <td className={`${cell} w-64`}>{t("faPrint.depreciation")}</td>
            <td className={`${cell} font-semibold`}>{money(asset.accumulatedDepreciation)}</td>
          </tr>
          <tr>
            <td className={cell}>{t("faPrint.bookValue")}</td>
            <td className={`${cell} font-semibold`}>{money(asset.bookValue)}</td>
          </tr>
        </tbody>
      </table>
      <h2 className="mb-1 font-semibold">{t("faPrint.movements")}</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className={cell}>{t("cashPrint.date")}</th>
            <th className={cell}>{t("faPrint.document")}</th>
            <th className={cell}>{t("faPrint.costChange")}</th>
            <th className={cell}>{t("faPrint.depreciationChange")}</th>
          </tr>
        </thead>
        <tbody>
          {data.movements.map((movement, index) => (
            <tr key={index}>
              <td className={`${cell} text-center`}>{date(movement.date)}</td>
              <td className={cell}>
                {movement.documentName} {movement.docNumber ? `№${movement.docNumber}` : ""}
              </td>
              <td className={`${cell} text-right`}>{movement.costChange ? money(movement.costChange) : ""}</td>
              <td className={`${cell} text-right`}>
                {movement.depreciationChange ? money(movement.depreciationChange) : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Signatures rows={[[t("cashPrint.chiefAccountant"), data.chiefAccountant]]} />
    </PrintFrame>
  );
}
