import { useCallback, useMemo } from "react";
import { Button, Col, Row, Table } from "antd";
import type { TableColumnsType } from "antd";
import type { FormikProps } from "formik";
import { Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import InputNumber from "@/components/fields/InputNumber";
import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import DocumentAccountSelect from "@/components/fields/DocumentAccountSelect";
import Card from "@/components/ui/card/Card";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { faAssetStatusIds } from "../../../shared/constants/statuses";
import { faDocumentAccountRoleCodes } from "../../../shared/constants/documentAccounts";
import type {
  FaRevaluationFormValues,
  FaRevaluationLineValues,
} from "../types/form";
import { faRevaluationAssetDisplayConfig } from "./useFaRevaluationLookups";

const emptyLine: FaRevaluationLineValues = {
  faAssetId: null,
  newValue: 0,
  note: "",
};

interface RevaluationLineRow extends FaRevaluationLineValues {
  key: number;
  index: number;
}

interface FaRevaluationFormFieldsProps {
  formik: FormikProps<FaRevaluationFormValues>;
  isDraft: boolean;
  documentTypeId?: number;
}

export default function FaRevaluationFormFields({
  formik,
  isDraft,
  documentTypeId,
}: FaRevaluationFormFieldsProps) {
  const { t } = useTranslation();

  const handleAddLine = useCallback(() => {
    void formik.setFieldValue("lines", [
      ...formik.values.lines,
      { ...emptyLine },
    ]);
  }, [formik]);

  const handleRemoveLine = useCallback(
    (index: number) => {
      void formik.setFieldValue(
        "lines",
        formik.values.lines.filter((_, lineIndex) => lineIndex !== index),
      );
    },
    [formik],
  );

  const rows = useMemo<RevaluationLineRow[]>(
    () =>
      formik.values.lines.map((line, index) => ({
        ...line,
        key: index,
        index,
      })),
    [formik.values.lines],
  );

  const columns = useMemo<TableColumnsType<RevaluationLineRow>>(
    () => [
      {
        title: t("common.rowNumber"),
        dataIndex: "index",
        align: "center",
        render: (index: number) => index + 1,
      },
      {
        title: t("fa.fields.faAssetId"),
        dataIndex: "faAssetId",
        minWidth: 300,
        render: (_, row) => (
          <div className="[&_.ant-form-item]:mb-0!">
            <SelectCustom
              path={selectListEndpoints.faAssetsSelectList}
              queryParams={{ statusId: faAssetStatusIds.active }}
              displayConfig={faRevaluationAssetDisplayConfig}
              formik={formik}
              fieldName={`lines[${row.index}].faAssetId`}
              search
              required
              marginBottom="mb-0"
            />
          </div>
        ),
      },
      {
        title: t("fa.fields.newValue"),
        dataIndex: "newValue",
        minWidth: 170,
        render: (_, row) => (
          <div className="[&_.ant-form-item]:mb-0!">
            <InputNumber
              formik={formik}
              fieldName={`lines[${row.index}].newValue`}
              min={0}
              emptyZero
              required
            />
          </div>
        ),
      },
      {
        title: t("fa.fields.note"),
        dataIndex: "note",
        minWidth: 220,
        render: (_, row) => (
          <div className="[&_.ant-form-item]:mb-0!">
            <InputText formik={formik} fieldName={`lines[${row.index}].note`} />
          </div>
        ),
      },
      {
        dataIndex: "actions",
        align: "center",
        width: 64,
        render: (_, row) =>
          isDraft && formik.values.lines.length > 1 ? (
            <Button
              type="text"
              danger
              icon={<Trash2 className="size-4" />}
              aria-label={t("common.delete")}
              onClick={() => handleRemoveLine(row.index)}
            />
          ) : null,
      },
    ],
    [formik, handleRemoveLine, isDraft, t],
  );

  return (
    <div className="min-w-0 space-y-2">
      <Card className="p-3">
        <Row gutter={[16, 0]}>
          <Col span={5}>
            <SelectDate
              formik={formik}
              fieldName="revaluationDate"
              label="fa.fields.revaluationDate"
              required
            />
          </Col>

          <Col span={5}>
            <DocumentAccountSelect
              documentTypeId={documentTypeId ?? 0}
              documentRoleCode={faDocumentAccountRoleCodes.revaluationReserve}
              formik={formik}
              fieldName="revaluationReserveAccountId"
              label="fa.fields.revaluationReserveAccount"
              search
              required
              enabled={Boolean(documentTypeId)}
            />
          </Col>
          <Col span={5}>
            <DocumentAccountSelect
              documentTypeId={documentTypeId ?? 0}
              documentRoleCode={faDocumentAccountRoleCodes.revaluationLoss}
              formik={formik}
              fieldName="revaluationLossAccountId"
              label="fa.fields.revaluationLossAccount"
              search
              required
              enabled={Boolean(documentTypeId)}
            />
          </Col>
          <Col span={8}>
            <InputText
              formik={formik}
              fieldName="reason"
              label="fa.fields.reason"
            />
          </Col>
        </Row>
      </Card>

      <Card className="min-w-0 overflow-hidden border border-border">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
          <div>
            <div className="text-base font-semibold text-heading">
              {t("fa.revaluation.assetsToRevalue")}
            </div>
            <div className="mt-1 text-sm text-secondary-text">
              {t("fa.revaluation.assetsDescription")}
            </div>
          </div>
          {isDraft && (
            <Button
              type="primary"
              ghost
              icon={<Plus className="size-4" />}
              onClick={handleAddLine}
            >
              {t("fa.actions.addAsset")}
            </Button>
          )}
        </div>

        <Table<RevaluationLineRow>
          columns={columns}
          dataSource={rows}
          pagination={false}
          size="middle"
          scroll={{ x: "max-content" }}
        />

        <div className="border-t border-border px-4 py-3 text-sm text-secondary-text sm:px-5">
          {t("fa.revaluation.selectedAssets", {
            count: formik.values.lines.length,
          })}
        </div>

        {typeof formik.errors.lines === "string" && (
          <div className="border-t border-border px-4 py-3 text-sm text-red-500">
            {formik.errors.lines}
          </div>
        )}
      </Card>
    </div>
  );
}
