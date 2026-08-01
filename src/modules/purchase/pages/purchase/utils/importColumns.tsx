import type { ReactNode } from "react";
import type { TFunction } from "i18next";
import LineClampCell from "@/components/widget/text/LineClampCell";
import type { SelectBoxOptions } from "@/modules/purchase/pages/purchase/types/type";

export interface ImportColumnConfig {
  dataIndex: string;
  title: string;
  width?: number;
  align?: "left" | "center" | "right";
  ellipsis?: boolean;
  code: string;
  render?: (value: unknown) => ReactNode;
}

const renderClamp = (value: unknown) => (
  <LineClampCell text={value == null ? null : String(value)} />
);

export const getBaseColumnConfig = (
  productWithCount: boolean,
  withDiscount: boolean,
  t: TFunction,
): ImportColumnConfig[] => {
  const baseColumns: ImportColumnConfig[] = [
    {
      dataIndex: "indexId",
      title: t("common.rowNumber"),
      width: 50,
      align: "center",
      code: "indexId",
      render: renderClamp,
    },
    {
      dataIndex: "product",
      title: t("purchase.fields.productName"),
      ellipsis: true,
      width: 220,
      code: "product",
      render: renderClamp,
    },
  ];

  const mxikColumns: ImportColumnConfig[] = productWithCount
    ? []
    : [
        {
          dataIndex: "mxik",
          title: t("purchase.fields.mxik"),
          align: "center",
          width: 160,
          code: "mxik",
        },
      ];

  const quantityOrMarkingColumns: ImportColumnConfig[] = productWithCount
    ? [
        {
          dataIndex: "qty",
          title: t("purchase.fields.quantity"),
          align: "center",
          width: 120,
          code: "qty",
        },
      ]
    : [
        {
          dataIndex: "markingNumber",
          title: t("app.fields.marking"),
          align: "center",
          width: 180,
          code: "markingNumber",
        },
      ];

  const modeColumns: ImportColumnConfig[] = [
    ...mxikColumns,
    ...quantityOrMarkingColumns,
    {
      dataIndex: "price",
      title: t("purchase.fields.price"),
      align: "center",
      width: 140,
      code: "price",
      render: renderClamp,
    },
  ];

  const discountColumn: ImportColumnConfig[] = withDiscount
    ? [
        {
          dataIndex: "discount",
          title: t("purchase.fields.discount"),
          width: 140,
          align: "center",
          code: "discount",
          render: renderClamp,
        },
      ]
    : [];

  return [...baseColumns, ...modeColumns, ...discountColumn];
};

export const toSelectBoxOptions = (
  columns: ImportColumnConfig[],
): SelectBoxOptions[] =>
  columns
    .filter((column) => column.code !== "indexId")
    .map((column) => ({
      label: column.title,
      code: column.code,
      disabled: false,
    }));

export const buildColumnConfig = (
  baseColumns: ImportColumnConfig[],
  selectBoxOptions: SelectBoxOptions[],
): ImportColumnConfig[] => {
  const dynamicColumns = selectBoxOptions
    .filter((option) => !baseColumns.some((column) => column.code === option.code))
    .map<ImportColumnConfig>((option) => ({
      dataIndex: option.code,
      title: option.label,
      align: "center",
      code: option.code,
      render: renderClamp,
    }));

  return [...baseColumns, ...dynamicColumns];
};

export const numericImportColumns = new Set([
  "qty",
  "price",
  "pricePerUom",
  "discount",
  "vatRates",
]);
