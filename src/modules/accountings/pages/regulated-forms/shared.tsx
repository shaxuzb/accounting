import { Segmented } from "antd";
import { useTranslation } from "react-i18next";
import * as XLSX from "xlsx";
import { numberSpacing } from "@/utils/utils";
import type { RegulatedFormHeader } from "./api";

/** An amount of a form line: empty when the line has none, brackets for a negative one. */
export const formAmount = (value: number | null | undefined, unit: number) => {
  if (value === null || value === undefined) return "";
  if (value === 0) return "—";
  const text = numberSpacing(Math.abs(value), undefined, unit === 1);
  return value < 0 ? `(${text})` : text;
};

export function UnitSwitch({ value, onChange }: { value: number; onChange: (unit: number) => void }) {
  const { t } = useTranslation();
  return (
    <Segmented
      value={value}
      onChange={(next) => onChange(Number(next))}
      options={[
        { value: 1000, label: t("app.regulatedForms.unitThousand") },
        { value: 1, label: t("app.regulatedForms.unitSum") },
      ]}
    />
  );
}

export function FormHeader({ header, title, subtitle }: { header?: RegulatedFormHeader; title: string; subtitle: string }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-center text-base font-semibold text-text">{title}</div>
      <div className="text-center text-sm text-secondary-text">{subtitle}</div>
      {header && (
        <div className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
          <span>
            <span className="text-secondary-text">{t("app.regulatedForms.organization")}: </span>
            <b>{header.organizationName}</b>
          </span>
          <span>
            <span className="text-secondary-text">{t("app.regulatedForms.inn")}: </span>
            <b>{header.inn ?? "—"}</b>
          </span>
          {header.oked && (
            <span>
              <span className="text-secondary-text">{t("app.regulatedForms.oked")}: </span>
              {header.oked}
            </span>
          )}
          {header.address && (
            <span>
              <span className="text-secondary-text">{t("app.regulatedForms.address")}: </span>
              {header.address}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/** Writes the rows of a form to an Excel file, the header lines first. */
export const exportForm = (fileName: string, headerLines: string[], columns: string[], rows: (string | number | null)[][]) => {
  const sheet = XLSX.utils.aoa_to_sheet([...headerLines.map((line) => [line]), [], columns, ...rows]);
  sheet["!cols"] = columns.map((_, index) => ({ wch: index === 0 ? 70 : 16 }));
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Form");
  XLSX.writeFile(book, fileName);
};
