import { Button, Table, Tooltip, Popconfirm } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Delete, Plus } from "lucide-react";
import InputNumber from "@/components/fields/InputNumber";
import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import type { FormikProps } from "formik";
import type { FaReceiptFormValues, FaReceiptLineValues, FaReceiptAssetValues } from "../types/form";
import { useTranslation } from "react-i18next";
import dayjs from "@/config/dayjs";

interface FaReceiptLinesTableProps {
  formik: FormikProps<FaReceiptFormValues>;
  isDraft: boolean;
}

export default function FaReceiptLinesTable({ formik, isDraft }: FaReceiptLinesTableProps) {
  const { t } = useTranslation();

  const handleAddLine = () => {
    formik.setFieldValue("lines", [
      ...formik.values.lines,
      {
        sourceProductId: null as unknown as number,
        name: "",
        quantity: 1,
        price: 0,
        vatRateId: null as unknown as number,
        assets: [
          {
            inventoryNumber: "",
            name: "",
            initialCost: 0,
            salvageValue: 0,
            usefulLifeMonths: 1,
            depreciationMethodId: null as unknown as number,
            faGroupId: null as unknown as number,
            okofId: null as unknown as number,
            commissioningDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
            deprStartDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
            plannedUnitsTotal: 0,
            departmentId: null as unknown as number,
            responsibleUserId: null as unknown as number,
          },
        ],
      },
    ]);
  };

  const handleRemoveLine = (index: number) => {
    const newLines = formik.values.lines.filter((_, i) => i !== index);
    formik.setFieldValue("lines", newLines);
  };

  const handleAddAsset = (lineIndex: number) => {
    const currentLines = [...formik.values.lines];
    currentLines[lineIndex].assets.push({
      inventoryNumber: "",
      name: "",
      initialCost: 0,
      salvageValue: 0,
      usefulLifeMonths: 1,
      depreciationMethodId: null as unknown as number,
      faGroupId: null as unknown as number,
      okofId: null as unknown as number,
      commissioningDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
      deprStartDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
      plannedUnitsTotal: 0,
      departmentId: null as unknown as number,
      responsibleUserId: null as unknown as number,
    });
    formik.setFieldValue("lines", currentLines);
  };

  const handleRemoveAsset = (lineIndex: number, assetIndex: number) => {
    const currentLines = [...formik.values.lines];
    currentLines[lineIndex].assets = currentLines[lineIndex].assets.filter((_, i) => i !== assetIndex);
    formik.setFieldValue("lines", currentLines);
  };

  const lineColumns: ColumnsType<FaReceiptLineValues> = [
    {
      title: "№",
      width: 50,
      render: (_, __, index) => index + 1,
    },
    {
      title: t("fa.fields.sourceProductId"),
      width: 250,
      render: (_, __, index) => (
        <SelectCustom
          path={selectListEndpoints.sourceProductTablesSelectList}
          formik={formik}
          fieldName={`lines[${index}].sourceProductId`}
          disabled={!isDraft}
        />
      ),
    },
    {
      title: t("fa.fields.name"),
      render: (_, __, index) => (
        <InputText
          formik={formik}
          fieldName={`lines[${index}].name`}
          disabled={!isDraft}
        />
      ),
    },
    {
      title: t("fa.fields.quantity"),
      width: 150,
      render: (_, __, index) => (
        <InputNumber
          formik={formik}
          fieldName={`lines[${index}].quantity`}
          disabled={!isDraft}
          min={1}
        />
      ),
    },
    {
      title: t("fa.fields.price"),
      width: 150,
      render: (_, __, index) => (
        <InputNumber
          formik={formik}
          fieldName={`lines[${index}].price`}
          disabled={!isDraft}
          min={0}
        />
      ),
    },
    {
      title: t("fa.fields.vatRateId"),
      width: 150,
      render: (_, __, index) => (
        <SelectCustom
          path={selectListEndpoints.vatRatesSelectList}
          formik={formik}
          fieldName={`lines[${index}].vatRateId`}
          disabled={!isDraft}
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

  const expandedRowRender = (line: FaReceiptLineValues, lineIndex: number) => {
    const assetColumns: ColumnsType<FaReceiptAssetValues> = [
      {
        title: "№",
        width: 40,
        render: (_, __, index) => index + 1,
      },
      {
        title: t("fa.fields.inventoryNumber"),
        width: 150,
        render: (_, __, index) => (
          <InputText
            formik={formik}
            fieldName={`lines[${lineIndex}].assets[${index}].inventoryNumber`}
            disabled={!isDraft}
          />
        ),
      },
      {
        title: t("fa.fields.name"),
        width: 150,
        render: (_, __, index) => (
          <InputText
            formik={formik}
            fieldName={`lines[${lineIndex}].assets[${index}].name`}
            disabled={!isDraft}
          />
        ),
      },
      {
        title: t("fa.fields.initialCost"),
        width: 120,
        render: (_, __, index) => (
          <InputNumber
            formik={formik}
            fieldName={`lines[${lineIndex}].assets[${index}].initialCost`}
            disabled={!isDraft}
          />
        ),
      },
      {
        title: t("fa.fields.salvageValue"),
        width: 120,
        render: (_, __, index) => (
          <InputNumber
            formik={formik}
            fieldName={`lines[${lineIndex}].assets[${index}].salvageValue`}
            disabled={!isDraft}
          />
        ),
      },
      {
        title: t("fa.fields.usefulLifeMonths"),
        width: 100,
        render: (_, __, index) => (
          <InputNumber
            formik={formik}
            fieldName={`lines[${lineIndex}].assets[${index}].usefulLifeMonths`}
            disabled={!isDraft}
          />
        ),
      },
      {
        title: t("fa.fields.faGroupId"),
        width: 150,
        render: (_, __, index) => (
          <SelectCustom
            path={selectListEndpoints.faGroupsSelectList}
            formik={formik}
            fieldName={`lines[${lineIndex}].assets[${index}].faGroupId`}
            disabled={!isDraft}
          />
        ),
      },
      {
        title: t("fa.fields.okofId"),
        width: 150,
        render: (_, __, index) => (
          <SelectCustom
            path={selectListEndpoints.okofsSelectList}
            formik={formik}
            fieldName={`lines[${lineIndex}].assets[${index}].okofId`}
            disabled={!isDraft}
          />
        ),
      },
      {
        title: t("fa.fields.depreciationMethodId"),
        width: 180,
        render: (_, __, index) => (
          <SelectCustom
            path={selectListEndpoints.depreciationMethodsSelectList}
            formik={formik}
            fieldName={`lines[${lineIndex}].assets[${index}].depreciationMethodId`}
            disabled={!isDraft}
          />
        ),
      },
      {
        title: t("fa.fields.commissioningDate"),
        width: 160,
        render: (_, __, index) => (
          <SelectDate
            formik={formik}
            fieldName={`lines[${lineIndex}].assets[${index}].commissioningDate`}
            disabled={!isDraft}
          />
        ),
      },
      {
        title: t("fa.fields.deprStartDate"),
        width: 160,
        render: (_, __, index) => (
          <SelectDate
            formik={formik}
            fieldName={`lines[${lineIndex}].assets[${index}].deprStartDate`}
            disabled={!isDraft}
          />
        ),
      },
      {
        title: t("fa.fields.departmentId"),
        width: 150,
        render: (_, __, index) => (
          <SelectCustom
            path={selectListEndpoints.departmentsSelectList}
            formik={formik}
            fieldName={`lines[${lineIndex}].assets[${index}].departmentId`}
            disabled={!isDraft}
          />
        ),
      },
      {
        title: t("fa.fields.responsibleUserId"),
        width: 150,
        render: (_, __, index) => (
          <SelectCustom
            path={selectListEndpoints.usersSelectList}
            formik={formik}
            fieldName={`lines[${lineIndex}].assets[${index}].responsibleUserId`}
            disabled={!isDraft}
          />
        ),
      },
      {
        title: "",
        width: 50,
        render: (_, __, index) => (
          <Popconfirm
            title={t("common.deleteConfirm")}
            onConfirm={() => handleRemoveAsset(lineIndex, index)}
            disabled={!isDraft}
          >
            <Button type="text" danger icon={<Delete className="size-4" />} disabled={!isDraft} />
          </Popconfirm>
        ),
      },
    ];

    return (
      <div className="bg-muted p-4 rounded-md shadow-inner">
        <div className="flex items-center justify-between mb-3">
          <span className="font-semibold text-primary">{t("fa.fields.assets")}</span>
          {isDraft && (
            <Button
              type="dashed"
              size="small"
              icon={<Plus className="size-4" />}
              onClick={() => handleAddAsset(lineIndex)}
            >
              {t("common.add")}
            </Button>
          )}
        </div>
        <Table
          columns={assetColumns}
          dataSource={line.assets.map((a, i) => ({ ...a, key: i }))}
          pagination={false}
          size="small"
          scroll={{ x: "max-content" }}
        />
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-2 relative">
      <Table
        columns={lineColumns}
        dataSource={formik.values.lines.map((l, i) => ({ ...l, key: i }))}
        pagination={false}
        scroll={{ x: "max-content" }}
        expandable={{
          expandedRowRender,
          defaultExpandAllRows: true,
        }}
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
