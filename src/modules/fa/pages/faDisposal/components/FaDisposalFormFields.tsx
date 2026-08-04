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
import Card from "@/components/ui/card/Card";
import {
  chartAccountSelectDisplayConfig,
  selectListEndpoints,
} from "@/shared/constants/selectLists";
import { numberSpacing } from "@/utils/utils";
import type {
  FaDisposalFormValues,
  FaDisposalLineValues,
} from "../types/form";
import { faDisposalAssetDisplayConfig } from "./useFaDisposalLookups";

const emptyLine: FaDisposalLineValues = {
  faAssetId: null,
  saleAmount: 0,
  note: "",
  assetAccountId: null,
  accumulatedDepreciationAccountId: null,
};

interface DisposalLineRow extends FaDisposalLineValues {
  key: number;
  index: number;
}

interface FaDisposalFormFieldsProps {
  formik: FormikProps<FaDisposalFormValues>;
  isDraft: boolean;
}

export default function FaDisposalFormFields({
  formik,
  isDraft,
}: FaDisposalFormFieldsProps) {
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

  const rows = useMemo<DisposalLineRow[]>(
    () =>
      formik.values.lines.map((line, index) => ({
        ...line,
        key: index,
        index,
      })),
    [formik.values.lines],
  );

  const totalSaleAmount = useMemo(
    () =>
      formik.values.lines.reduce(
        (total, line) => total + Number(line.saleAmount || 0),
        0,
      ),
    [formik.values.lines],
  );

  const columns = useMemo<TableColumnsType<DisposalLineRow>>(
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
              displayConfig={faDisposalAssetDisplayConfig}
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
        title: t("fa.fields.saleAmount"),
        dataIndex: "saleAmount",
        minWidth: 170,
        render: (_, row) => (
          <div className="[&_.ant-form-item]:mb-0!">
            <InputNumber
              formik={formik}
              fieldName={`lines[${row.index}].saleAmount`}
              min={0}
              emptyZero
              required
            />
          </div>
        ),
      },
      {
        title: t("fa.fields.assetAccount"),
        dataIndex: "assetAccountId",
        minWidth: 250,
        render: (_, row) => (
          <div className="[&_.ant-form-item]:mb-0!">
            <SelectCustom
              path={selectListEndpoints.chartAccountsSelectList}
              displayConfig={chartAccountSelectDisplayConfig}
              formik={formik}
              fieldName={`lines[${row.index}].assetAccountId`}
              search
              required
              marginBottom="mb-0"
            />
          </div>
        ),
      },
      {
        title: t("fa.fields.accumulatedDepreciationAccount"),
        dataIndex: "accumulatedDepreciationAccountId",
        minWidth: 280,
        render: (_, row) => (
          <div className="[&_.ant-form-item]:mb-0!">
            <SelectCustom
              path={selectListEndpoints.chartAccountsSelectList}
              displayConfig={chartAccountSelectDisplayConfig}
              formik={formik}
              fieldName={`lines[${row.index}].accumulatedDepreciationAccountId`}
              search
              required
              marginBottom="mb-0"
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
          <Col span={6}>
            <SelectDate
              formik={formik}
              fieldName="disposalDate"
              label="fa.fields.disposalDate"
              required
            />
          </Col>
          <Col span={6}>
            <SelectCustom
              path={selectListEndpoints.faDisposalTypesSelectList}
              formik={formik}
              fieldName="disposalTypeId"
              label="fa.fields.disposalType"
              required
            />
          </Col>
          <Col span={6}>
            <InputText
              formik={formik}
              fieldName="reason"
              label="fa.fields.reason"
              required
            />
          </Col>

          {[
            ["disposalAccountId", "fa.fields.disposalAccount"],
            ["customerAccountId", "fa.fields.customerAccount"],
            ["vatAccountId", "fa.fields.vatAccount"],
            ["gainAccountId", "fa.fields.gainAccount"],
            ["lossAccountId", "fa.fields.lossAccount"],
          ].map(([fieldName, label]) => (
            <Col key={fieldName} span={6}>
              <SelectCustom
                path={selectListEndpoints.chartAccountsSelectList}
                displayConfig={chartAccountSelectDisplayConfig}
                formik={formik}
                fieldName={fieldName}
                label={label}
                search
                required
              />
            </Col>
          ))}
        </Row>
      </Card>

      <Card className="min-w-0 overflow-hidden border border-border">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
          <div>
            <div className="text-base font-semibold text-heading">
              {t("fa.disposal.assetsToDispose")}
            </div>
            <div className="mt-1 text-sm text-secondary-text">
              {t("fa.disposal.assetsDescription")}
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

        <Table<DisposalLineRow>
          columns={columns}
          dataSource={rows}
          pagination={false}
          size="middle"
          scroll={{ x: "max-content" }}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm sm:px-5">
          <span className="text-secondary-text">
            {t("fa.disposal.selectedAssets", {
              count: formik.values.lines.length,
            })}
          </span>
          <span className="font-semibold tabular-nums text-text">
            {t("fa.sections.totalSaleAmount")}: {numberSpacing(totalSaleAmount)}
          </span>
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
