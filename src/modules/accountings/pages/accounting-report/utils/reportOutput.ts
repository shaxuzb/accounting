import dayjs from "dayjs";
import { numberSpacing } from "@/utils/utils";
import { exportForm } from "../../regulated-forms/shared";

/** A report as a table: its title lines, the column titles and the rows (numbers stay numbers for Excel). */
export interface ReportTable {
  fileName: string;
  title: string;
  headerLines: string[];
  columns: string[];
  rows: (string | number | null)[][];
  /** Rows shown bold (section and total lines), by index. */
  boldRows?: number[];
}

export const exportReportTable = (table: ReportTable) =>
  exportForm(table.fileName, [table.title, ...table.headerLines], table.columns, table.rows);

const escapeHtml = (value: string) =>
  value.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] ?? c);

/** Opens the report as a page of its own and the browser's print dialog on it. */
export const printReportTable = (table: ReportTable) => {
  const bold = new Set(table.boldRows ?? []);
  const cell = (value: string | number | null) =>
    typeof value === "number"
      ? `<td class="n">${value ? numberSpacing(value, undefined, true) : ""}</td>`
      : `<td>${escapeHtml(value ?? "")}</td>`;
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(table.title)}</title>
<style>body{font-family:Arial,sans-serif;font-size:12px;margin:24px}h2{text-align:center;margin:0 0 4px}p{margin:2px 0;text-align:center}table{border-collapse:collapse;width:100%;margin-top:10px}td,th{border:1px solid #000;padding:3px 5px}th{background:#eee}.n{text-align:right;white-space:nowrap}.b td{font-weight:bold;background:#f5f5f5}</style></head><body>
<h2>${escapeHtml(table.title)}</h2>${table.headerLines.filter(Boolean).map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
<table><thead><tr>${table.columns.map((c) => `<th>${escapeHtml(c)}</th>`).join("")}</tr></thead>
<tbody>${table.rows.map((row, index) => `<tr${bold.has(index) ? ' class="b"' : ""}>${row.map(cell).join("")}</tr>`).join("")}</tbody></table>
<script>window.onload=()=>window.print()</script></body></html>`;
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
};

/** The period a report covers, from what the server answered: «01.10.2026 — 31.10.2026», or up to a day. */
export const reportPeriodText = (dateFrom?: string | null, dateTo?: string | null) => {
  const f = (value?: string | null) => (value ? dayjs(value).format("DD.MM.YYYY") : "");
  if (dateFrom && dateTo) return `${f(dateFrom)} — ${f(dateTo)}`;
  return f(dateTo ?? dateFrom);
};
