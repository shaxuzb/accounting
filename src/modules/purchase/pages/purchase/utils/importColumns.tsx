import type { ReactNode } from "react";
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
  _productWithCount: boolean,
  withDiscount: boolean,
): ImportColumnConfig[] => {
  const baseColumns: ImportColumnConfig[] = [
    {
      dataIndex: "indexId",
      title: "T/r",
      width: 50,
      align: "center",
      code: "indexId",
      render: renderClamp,
    },
    {
      dataIndex: "product",
      title: "Mahsulot nomi",
      ellipsis: true,
      width: 220,
      code: "product",
      render: renderClamp,
    },
  ];

  const modeColumns: ImportColumnConfig[] = [
    {
      dataIndex: "sapCode",
      title: "MXIK kod",
      align: "center",
      width: 160,
      code: "sapCode",
    },
    {
      dataIndex: "qty",
      title: "Miqdori",
      align: "center",
      width: 120,
      code: "qty",
    },
    {
      dataIndex: "price",
      title: "Narxi",
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
          title: "Chegirma",
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
