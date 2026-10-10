/** The two production documents: 1C «Требование-накладная» and «Отчет производства за смену». */
export type ProductionDocKind = "requisition" | "report";

export const productionDocs = {
  requisition: {
    documentTypeId: 37,
    endpoint: "/material-requisitions",
    path: "/main/production/requisitions",
    titleKey: "production.requisition.title",
    newKey: "production.requisition.new",
    permissions: {
      view: "MATERIAL_REQUISITION_VIEW",
      create: "MATERIAL_REQUISITION_CREATE",
      delete: "MATERIAL_REQUISITION_DELETE",
      confirm: "MATERIAL_REQUISITION_CONFIRM",
      cancel: "MATERIAL_REQUISITION_CANCEL",
    },
  },
  report: {
    documentTypeId: 38,
    endpoint: "/production-reports",
    path: "/main/production/reports",
    titleKey: "production.report.title",
    newKey: "production.report.new",
    permissions: {
      view: "PRODUCTION_REPORT_VIEW",
      create: "PRODUCTION_REPORT_CREATE",
      delete: "PRODUCTION_REPORT_DELETE",
      confirm: "PRODUCTION_REPORT_CONFIRM",
      cancel: "PRODUCTION_REPORT_CANCEL",
    },
  },
} as const;

export const productionStatus = { draft: 1, posted: 2, cancelled: 3 } as const;

/** The analytics kind «Статьи затрат» (cost items), whose catalog the requisition picks from. */
export const costItemsSubkontoTypeId = 10;

export const money = (value: number) =>
  value.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
