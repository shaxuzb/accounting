import { Button, Table, Popconfirm, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Delete, Plus } from "lucide-react";
import InputNumber from "@/components/fields/InputNumber";
import InputText from "@/components/fields/InputText";
import SelectStatic from "@/components/fields/SelectStatic";
import SelectCustom from "@/components/fields/SelectCustom";
import type { FormikProps } from "formik";
import type {
  FaDisposalFormValues,
  FaDisposalLineValues,
} from "../types/form";
import { useTranslation } from "react-i18next";
import {
  chartAccountSelectDisplayConfig,
  selectListEndpoints,
} from "@/shared/constants/selectLists";

interface FaDisposalLinesTableProps {
  formik: FormikProps<FaDisposalFormValues>;
  isDraft: boolean;
  faAssetsOptions: { label: string; value: number }[];
}

export default function FaDisposalLinesTable({
  formik,
  isDraft,
  faAssetsOptions,
}: FaDisposalLinesTableProps) {
  const { t } = useTranslation();

  const handleAddLine = () => {
    formik.setFieldValue("lines", [
      ...formik.values.lines,
      {
        faAssetId: null as unknown as number,
        saleAmount: 0,
        note: "",
        assetAccountId: null,
        accumulatedDepreciationAccountId: null,
      },
    ]);
  };

  const handleRemoveLine = (index: number) => {
    const newLines = formik.values.lines.filter((_, i) => i !== index);
    formik.setFieldValue("lines", newLines);
  };

  const lineColumns: ColumnsType<FaDisposalLineValues> = [
    {
      title: t("common.rowNumber"),
      width: 50,
      render: (_, __, index) => index + 1,
    },
    {
      title: t("fa.fields.faAssetId"),
      render: (_, __, index) => (
        <SelectStatic
          formik={formik}
          fieldName={`lines[${index}].faAssetId`}
          options={faAssetsOptions}
          disabled={!isDraft}
        />
      ),
    },
    {
      title: t("fa.fields.saleAmount"),
      width: 250,
      render: (_, __, index) => (
        <InputNumber
          formik={formik}
          fieldName={`lines[${index}].saleAmount`}
          disabled={!isDraft}
          min={0}
        />
      ),
    },
    {
      title: t("fa.fields.note"),
      render: (_, __, index) => (
        <InputText
          formik={formik}
          fieldName={`lines[${index}].note`}
          disabled={!isDraft}
        />
      ),
    },
    {
      title: t("fa.fields.assetAccount"),
      width: 220,
      render: (_, __, index) => (
        <SelectCustom
          path={selectListEndpoints.chartAccountsSelectList}
          displayConfig={chartAccountSelectDisplayConfig}
          formik={formik}
          fieldName={`lines[${index}].assetAccountId`}
          disabled={!isDraft}
          search
          required
        />
      ),
    },
    {
      title: t("fa.fields.accumulatedDepreciationAccount"),
      width: 240,
      render: (_, __, index) => (
        <SelectCustom
          path={selectListEndpoints.chartAccountsSelectList}
          displayConfig={chartAccountSelectDisplayConfig}
          formik={formik}
          fieldName={`lines[${index}].accumulatedDepreciationAccountId`}
          disabled={!isDraft}
          search
          required
        />
      ),
    },
    {
      title: "",
      width: 60,
      render: (_, __, index) => (
        <Popconfirm
          title={t("common.deleteConfirm")}
          onConfirm={() => handleRemoveLine(index)}
          disabled={!isDraft}
        >
          <Button type="text" danger icon={<Delete className="size-4" />} disabled={!isDraft} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-2 relative">
      <Table
        columns={lineColumns}
        dataSource={formik.values.lines.map((l, i) => ({ ...l, key: i }))}
        pagination={false}
        scroll={{ x: "max-content" }}
        size="middle"
        className="rounded-md border border-border overflow-hidden"
      />
      {isDraft && (
        <div className="sticky bottom-0 z-10 flex justify-center py-2 bg-primary-bg/95 backdrop-blur border-t border-border rounded-b-md">
          <Tooltip title={t("common.add")}>
            <Button
              type="primary"
              shape="circle"
              size="large"
              icon={<Plus className="size-5" />}
              onClick={handleAddLine}
              className="shadow-md"
            />
          </Tooltip>
        </div>
      )}
    </div>
  );
}
