import type { TFunction } from "i18next";
import dayjs from "@/config/dayjs";
import type { FaInventoryDocument, FaInventoryLine } from "./api";

const escape = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const amount = (value: number) =>
  Number(value ?? 0).toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const date = (value?: string | null) => (value ? dayjs(value).format("DD.MM.YYYY") : "");

const styles = `
  body { font-family: "Times New Roman", serif; font-size: 12px; margin: 24px; color: #000; }
  h1 { font-size: 16px; text-align: center; margin: 4px 0; }
  h2 { font-size: 13px; text-align: center; margin: 2px 0 12px; font-weight: normal; }
  .head { display: grid; grid-template-columns: 1fr 1fr; gap: 2px 24px; margin-bottom: 12px; }
  table { width: 100%; border-collapse: collapse; margin-top: 6px; }
  th, td { border: 1px solid #000; padding: 3px 5px; vertical-align: top; }
  th { background: #f2f2f2; font-weight: bold; text-align: center; }
  td.n { text-align: right; white-space: nowrap; }
  td.c { text-align: center; }
  tr.total td { font-weight: bold; }
  .signs { margin-top: 24px; display: grid; gap: 14px; }
  .sign { display: grid; grid-template-columns: 220px 1fr 160px; gap: 12px; align-items: end; }
  .line { border-bottom: 1px solid #000; height: 16px; }
  .note { margin-top: 14px; }
  @media print { body { margin: 10mm; } }
`;

function header(t: TFunction, doc: FaInventoryDocument, organizationName: string) {
  const kind = t(doc.assetKindId === 2 ? "fa.kinds.intangible" : "fa.kinds.fixed");
  const rows = [
    [t("app.fields.organization"), organizationName],
    [t("fa.inventory.kind"), kind],
    [t("fa.inventory.department"), doc.departmentName ?? t("fa.inventory.allPlaces")],
    [t("fa.inventory.responsible"), doc.responsibleUserName ?? t("fa.inventory.allPersons")],
    [t("fa.inventory.basis"), doc.basis ?? ""],
    [t("fa.inventory.reason"), doc.reason ?? ""],
    [
      t("fa.inventory.period"),
      [date(doc.startDate), date(doc.endDate)].filter(Boolean).join(" — "),
    ],
    [t("fa.inventory.asOf"), date(doc.docDate)],
  ];
  return `<div class="head">${rows
    .map(([label, value]) => `<div>${escape(label)}: <b>${escape(value)}</b></div>`)
    .join("")}</div>`;
}

function signatures(t: TFunction, doc: FaInventoryDocument) {
  const members = doc.members.length
    ? doc.members
    : [
        { fullName: "", position: "", isChairman: true },
        { fullName: "", position: "", isChairman: false },
      ];
  return `<div class="signs">${members
    .map(
      (member) => `<div class="sign">
        <div>${escape(member.isChairman ? t("fa.inventory.chairman") : t("fa.inventory.member"))}${
          member.position ? `, ${escape(member.position)}` : ""
        }</div>
        <div class="line"></div>
        <div>${escape(member.fullName)}</div>
      </div>`,
    )
    .join("")}</div>`;
}

function open(title: string, body: string) {
  const win = window.open("", "_blank", "width=1100,height=800");
  if (!win) return;
  win.document.write(
    `<!doctype html><html><head><meta charset="utf-8"><title>${escape(title)}</title><style>${styles}</style></head><body>${body}</body></html>`,
  );
  win.document.close();
  win.focus();
  win.print();
}

/** INV-1 / INV-1a: the inventory list of what was counted, by fact and by the books. */
export function printInventoryList(t: TFunction, doc: FaInventoryDocument, organizationName: string) {
  const onBooks = doc.lines.filter((line) => line.isOnBooks);
  const surplus = doc.lines.filter((line) => !line.isOnBooks);
  const all: FaInventoryLine[] = [...onBooks, ...surplus];
  const total = (pick: (line: FaInventoryLine) => number) => all.reduce((sum, line) => sum + pick(line), 0);
  const rows = all
    .map(
      (line, index) => `<tr>
        <td class="c">${index + 1}</td>
        <td>${escape(line.inventoryNumber ?? "")}</td>
        <td>${escape(line.name)}</td>
        <td class="c">${line.isFound ? 1 : 0}</td>
        <td class="n">${line.isFound ? amount(line.actualValue) : ""}</td>
        <td class="c">${line.isOnBooks ? 1 : 0}</td>
        <td class="n">${line.isOnBooks ? amount(line.bookCost) : ""}</td>
        <td class="n">${line.isOnBooks ? amount(line.bookValue) : ""}</td>
        <td>${escape(line.note ?? "")}</td>
      </tr>`,
    )
    .join("");
  const body = `
    <h1>${escape(t("fa.inventory.printList"))}</h1>
    <h2>№ ${escape(doc.docNumber)} — ${escape(date(doc.docDate))}</h2>
    ${header(t, doc, organizationName)}
    <div class="note">${escape(t("fa.inventory.receiptStatement"))}</div>
    <div class="sign" style="margin:8px 0 4px"><div>${escape(t("fa.inventory.responsible"))}</div><div class="line"></div><div>${escape(doc.responsibleUserName ?? "")}</div></div>
    <table>
      <thead>
        <tr>
          <th rowspan="2">№</th>
          <th rowspan="2">${escape(t("fa.fields.inventoryNumber"))}</th>
          <th rowspan="2">${escape(t("fa.inventory.name"))}</th>
          <th colspan="2">${escape(t("fa.inventory.byFact"))}</th>
          <th colspan="3">${escape(t("fa.inventory.byBooks"))}</th>
          <th rowspan="2">${escape(t("fa.fields.note"))}</th>
        </tr>
        <tr>
          <th>${escape(t("fa.inventory.quantity"))}</th>
          <th>${escape(t("fa.inventory.actualValue"))}</th>
          <th>${escape(t("fa.inventory.quantity"))}</th>
          <th>${escape(t("fa.inventory.bookCost"))}</th>
          <th>${escape(t("fa.inventory.bookValue"))}</th>
        </tr>
      </thead>
      <tbody>${rows}
        <tr class="total">
          <td colspan="3">${escape(t("fa.inventory.total"))}</td>
          <td class="c">${all.filter((line) => line.isFound).length}</td>
          <td class="n">${amount(total((line) => (line.isFound ? line.actualValue : 0)))}</td>
          <td class="c">${onBooks.length}</td>
          <td class="n">${amount(total((line) => (line.isOnBooks ? line.bookCost : 0)))}</td>
          <td class="n">${amount(total((line) => (line.isOnBooks ? line.bookValue : 0)))}</td>
          <td></td>
        </tr>
      </tbody>
    </table>
    ${signatures(t, doc)}
    <div class="note">${escape(t("fa.inventory.checkedStatement"))}</div>
    <div class="sign" style="margin-top:8px"><div>${escape(t("fa.inventory.responsible"))}</div><div class="line"></div><div>${escape(doc.responsibleUserName ?? "")}</div></div>`;
  open(`${t("fa.inventory.printList")} ${doc.docNumber}`, body);
}

/** INV-18: the comparison sheet of the differences, the shortages and the surpluses. */
export function printComparisonSheet(t: TFunction, doc: FaInventoryDocument, organizationName: string) {
  const differences = doc.lines.filter((line) => !line.isOnBooks || !line.isFound);
  const surplus = differences.filter((line) => !line.isOnBooks);
  const shortage = differences.filter((line) => line.isOnBooks);
  const rows = differences
    .map(
      (line, index) => `<tr>
        <td class="c">${index + 1}</td>
        <td>${escape(line.inventoryNumber ?? "")}</td>
        <td>${escape(line.name)}</td>
        <td class="c">${line.isOnBooks ? "" : 1}</td>
        <td class="n">${line.isOnBooks ? "" : amount(line.actualValue)}</td>
        <td class="c">${line.isOnBooks ? 1 : ""}</td>
        <td class="n">${line.isOnBooks ? amount(line.bookCost) : ""}</td>
        <td class="n">${line.isOnBooks ? amount(line.bookValue) : ""}</td>
        <td>${escape(line.note ?? "")}</td>
      </tr>`,
    )
    .join("");
  const body = `
    <h1>${escape(t("fa.inventory.printComparison"))}</h1>
    <h2>№ ${escape(doc.docNumber)} — ${escape(date(doc.docDate))}</h2>
    ${header(t, doc, organizationName)}
    <table>
      <thead>
        <tr>
          <th rowspan="2">№</th>
          <th rowspan="2">${escape(t("fa.fields.inventoryNumber"))}</th>
          <th rowspan="2">${escape(t("fa.inventory.name"))}</th>
          <th colspan="2">${escape(t("fa.inventory.surplus"))}</th>
          <th colspan="3">${escape(t("fa.inventory.shortage"))}</th>
          <th rowspan="2">${escape(t("fa.fields.note"))}</th>
        </tr>
        <tr>
          <th>${escape(t("fa.inventory.quantity"))}</th>
          <th>${escape(t("fa.inventory.actualValue"))}</th>
          <th>${escape(t("fa.inventory.quantity"))}</th>
          <th>${escape(t("fa.inventory.bookCost"))}</th>
          <th>${escape(t("fa.inventory.bookValue"))}</th>
        </tr>
      </thead>
      <tbody>${rows || `<tr><td colspan="9" class="c">${escape(t("fa.inventory.noDifferences"))}</td></tr>`}
        <tr class="total">
          <td colspan="3">${escape(t("fa.inventory.total"))}</td>
          <td class="c">${surplus.length}</td>
          <td class="n">${amount(surplus.reduce((sum, line) => sum + line.actualValue, 0))}</td>
          <td class="c">${shortage.length}</td>
          <td class="n">${amount(shortage.reduce((sum, line) => sum + line.bookCost, 0))}</td>
          <td class="n">${amount(shortage.reduce((sum, line) => sum + line.bookValue, 0))}</td>
          <td></td>
        </tr>
      </tbody>
    </table>
    <div class="sign" style="margin-top:20px"><div>${escape(t("fa.inventory.accountant"))}</div><div class="line"></div><div></div></div>
    <div class="sign" style="margin-top:14px"><div>${escape(t("fa.inventory.responsible"))}</div><div class="line"></div><div>${escape(doc.responsibleUserName ?? "")}</div></div>`;
  open(`${t("fa.inventory.printComparison")} ${doc.docNumber}`, body);
}
