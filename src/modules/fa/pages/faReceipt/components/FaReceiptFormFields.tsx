import { useState } from "react";
import { Button, Col, Collapse, Row } from "antd";
import type { CollapseProps } from "antd";
import type { FormikProps } from "formik";
import { useTranslation } from "react-i18next";
import { Copy, Plus, Trash2 } from "lucide-react";
import InputNumber from "@/components/fields/InputNumber";
import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import Card from "@/components/ui/card/Card";
import {
  chartAccountSelectDisplayConfig,
  selectListEndpoints,
} from "@/shared/constants/selectLists";
import type {
  FaReceiptAssetValues,
  FaReceiptFormValues,
  FaReceiptLineValues,
} from "../types/form";

const createEmptyAsset = (): FaReceiptAssetValues => ({
  inventoryNumber: "",
  name: "",
  initialCost: 0,
  faGroupId: null,
  okofId: null,
  assetAccountId: null,
});

const createEmptyLine = (): FaReceiptLineValues => ({
  name: "",
  quantity: 1,
  price: 0,
  vatRateId: null,
  capitalInvestmentAccountId: null,
  vatAccountId: null,
  assets: [createEmptyAsset()],
});

interface FaReceiptFormFieldsProps {
  formik: FormikProps<FaReceiptFormValues>;
  isDraft: boolean;
}

export default function FaReceiptFormFields({
  formik,
  isDraft,
}: FaReceiptFormFieldsProps) {
  const { t } = useTranslation();
  const [activeLineKeys, setActiveLineKeys] = useState<string[]>(["line-0"]);
  const [activeAssetKeys, setActiveAssetKeys] = useState<
    Record<number, string[]>
  >({ 0: ["asset-0"] });

  const handleAddLine = () => {
    const lineIndex = formik.values.lines.length;
    void formik.setFieldValue("lines", [
      ...formik.values.lines,
      createEmptyLine(),
    ]);
    setActiveLineKeys((keys) => [...keys, `line-${lineIndex}`]);
    setActiveAssetKeys((keys) => ({ ...keys, [lineIndex]: ["asset-0"] }));
  };

  const handleRemoveLine = (lineIndex: number) => {
    void formik.setFieldValue(
      "lines",
      formik.values.lines.filter((_, index) => index !== lineIndex),
    );
    setActiveLineKeys(["line-0"]);
    setActiveAssetKeys({ 0: ["asset-0"] });
  };

  const handleQuantityChange = (lineIndex: number, value: number | null) => {
    const quantity = Math.max(1, Math.trunc(Number(value || 1)));
    const currentAssets = formik.values.lines[lineIndex].assets;
    const assets = Array.from(
      { length: quantity },
      (_, index) => currentAssets[index] ?? createEmptyAsset(),
    );
    void formik.setFieldValue(`lines[${lineIndex}].quantity`, quantity, false);
    void formik.setFieldValue(`lines[${lineIndex}].assets`, assets, true);
  };

  const handleAddAsset = (lineIndex: number) => {
    const assets = [
      ...formik.values.lines[lineIndex].assets,
      createEmptyAsset(),
    ];
    void formik.setFieldValue(`lines[${lineIndex}].assets`, assets);
    void formik.setFieldValue(`lines[${lineIndex}].quantity`, assets.length);
    setActiveAssetKeys((keys) => ({
      ...keys,
      [lineIndex]: [
        ...(keys[lineIndex] ?? ["asset-0"]),
        `asset-${assets.length - 1}`,
      ],
    }));
  };

  const handleRemoveAsset = (lineIndex: number, assetIndex: number) => {
    const assets = formik.values.lines[lineIndex].assets.filter(
      (_, index) => index !== assetIndex,
    );
    void formik.setFieldValue(`lines[${lineIndex}].assets`, assets);
    void formik.setFieldValue(`lines[${lineIndex}].quantity`, assets.length);
    setActiveAssetKeys((keys) => ({ ...keys, [lineIndex]: ["asset-0"] }));
  };

  const handleApplyCommonAssetData = (lineIndex: number) => {
    const [sourceAsset, ...otherAssets] =
      formik.values.lines[lineIndex].assets;
    if (!sourceAsset || !otherAssets.length) return;
    const commonValues = {
      faGroupId: sourceAsset.faGroupId,
      okofId: sourceAsset.okofId,
      assetAccountId: sourceAsset.assetAccountId,
    };
    void formik.setFieldValue(`lines[${lineIndex}].assets`, [
      sourceAsset,
      ...otherAssets.map((asset) => ({ ...asset, ...commonValues })),
    ]);
  };

  const renderAssetFields = (lineIndex: number, assetIndex: number) => (
    <div>
      <div className="mb-4 text-sm font-semibold text-foreground">
        {t("fa.sections.assetInformation")}
      </div>
      <Row gutter={[12, 0]}>
        <Col span={6}>
          <InputText
            formik={formik}
            fieldName={`lines[${lineIndex}].assets[${assetIndex}].inventoryNumber`}
            label="fa.fields.inventoryNumber"
            required
          />
        </Col>
        <Col span={6}>
          <InputText
            formik={formik}
            fieldName={`lines[${lineIndex}].assets[${assetIndex}].name`}
            label="fa.fields.name"
            required
          />
        </Col>
        <Col span={6}>
          <InputNumber
            formik={formik}
            fieldName={`lines[${lineIndex}].assets[${assetIndex}].initialCost`}
            label="fa.fields.initialCost"
            min={0}
            required
          />
        </Col>
        <Col span={6}>
          <SelectCustom
            path={selectListEndpoints.faGroupsSelectList}
            formik={formik}
            fieldName={`lines[${lineIndex}].assets[${assetIndex}].faGroupId`}
            label="fa.fields.faGroupId"
            required
          />
        </Col>
        <Col span={6}>
          <SelectCustom
            path={selectListEndpoints.okofsSelectList}
            formik={formik}
            fieldName={`lines[${lineIndex}].assets[${assetIndex}].okofId`}
            label="fa.fields.okofId"
            search
            required
          />
        </Col>
        <Col span={6}>
          <SelectCustom
            path={selectListEndpoints.chartAccountsSelectList}
            displayConfig={chartAccountSelectDisplayConfig}
            formik={formik}
            fieldName={`lines[${lineIndex}].assets[${assetIndex}].assetAccountId`}
            label="fa.fields.assetAccount"
            search
            required
          />
        </Col>
      </Row>
    </div>
  );

  const lineItems: CollapseProps["items"] = formik.values.lines.map(
    (line, lineIndex) => {
      const assetItems: CollapseProps["items"] = line.assets.map(
        (asset, assetIndex) => ({
          key: `asset-${assetIndex}`,
          label: (
            <div className="flex min-w-0 items-center gap-3">
              <span className="shrink-0 font-semibold">
                {t("fa.sections.assetNumber", { number: assetIndex + 1 })}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {asset.name}
              </span>
            </div>
          ),
          extra:
            isDraft && line.assets.length > 1 ? (
              <Button
                type="text"
                danger
                size="small"
                icon={<Trash2 className="size-4" />}
                onClick={(event) => {
                  event.stopPropagation();
                  handleRemoveAsset(lineIndex, assetIndex);
                }}
              />
            ) : null,
          children: renderAssetFields(lineIndex, assetIndex),
        }),
      );

      return {
        key: `line-${lineIndex}`,
        label: (
          <div className="flex min-w-0 flex-1 items-center justify-between gap-4 pr-2">
            <span className="shrink-0 font-semibold">
              {t("fa.sections.lineNumber", { number: lineIndex + 1 })}
            </span>
            <div className="hidden min-w-0 flex-1 grid-cols-5 gap-5 text-xs text-muted-foreground lg:grid">
              <span className="truncate">{line.name}</span>
            </div>
          </div>
        ),
        extra:
          isDraft && formik.values.lines.length > 1 ? (
            <Button
              type="text"
              danger
              size="small"
              icon={<Trash2 className="size-4" />}
              onClick={(event) => {
                event.stopPropagation();
                handleRemoveLine(lineIndex);
              }}
            />
          ) : null,
        children: (
          <div className="space-y-2">
            <Row gutter={[16, 0]}>
              <Col span={6}>
                <InputText
                  formik={formik}
                  fieldName={`lines[${lineIndex}].name`}
                  label="fa.fields.name"
                  required
                />
              </Col>
              <Col span={6}>
                <InputNumber
                  value={line.quantity}
                  onValueChange={(value) =>
                    handleQuantityChange(lineIndex, value)
                  }
                  label="fa.fields.quantity"
                  min={1}
                  precision={0}
                  required
                />
              </Col>
              <Col span={6}>
                <InputNumber
                  formik={formik}
                  fieldName={`lines[${lineIndex}].price`}
                  label="fa.fields.price"
                  min={0}
                  required
                />
              </Col>
              <Col span={6}>
                <SelectCustom
                  path={selectListEndpoints.vatRatesSelectList}
                  formik={formik}
                  fieldName={`lines[${lineIndex}].vatRateId`}
                  label="fa.fields.vatRateId"
                  required
                />
              </Col>
              <Col span={6}>
                <SelectCustom
                  path={selectListEndpoints.chartAccountsSelectList}
                  displayConfig={chartAccountSelectDisplayConfig}
                  formik={formik}
                  fieldName={`lines[${lineIndex}].capitalInvestmentAccountId`}
                  label="fa.fields.capitalInvestmentAccount"
                  search
                  required
                />
              </Col>
              <Col span={6}>
                <SelectCustom
                  path={selectListEndpoints.chartAccountsSelectList}
                  displayConfig={chartAccountSelectDisplayConfig}
                  formik={formik}
                  fieldName={`lines[${lineIndex}].vatAccountId`}
                  label="fa.fields.vatAccount"
                  search
                  required
                />
              </Col>
            </Row>

            <div className="rounded-lg border border-border bg-background/40">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
                <div className="font-semibold">
                  {t("fa.entities.assets")}: {line.assets.length}
                </div>
                {isDraft && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      icon={<Plus className="size-4" />}
                      onClick={() => handleAddAsset(lineIndex)}
                    >
                      {t("fa.actions.addAsset")}
                    </Button>
                    <Button
                      icon={<Copy className="size-4" />}
                      disabled={line.assets.length < 2}
                      onClick={() => handleApplyCommonAssetData(lineIndex)}
                    >
                      {t("fa.actions.applyCommonData")}
                    </Button>
                  </div>
                )}
              </div>
              <Collapse
                ghost
                activeKey={activeAssetKeys[lineIndex] ?? ["asset-0"]}
                onChange={(keys) =>
                  setActiveAssetKeys((current) => ({
                    ...current,
                    [lineIndex]: Array.isArray(keys) ? keys : [keys],
                  }))
                }
                items={assetItems}
              />
            </div>
          </div>
        ),
      };
    },
  );

  return (
    <div className="space-y-2">
      <Card className="p-3">
        <Row gutter={[16, 0]}>
          <Col span={4}>
            <SelectDate
              formik={formik}
              fieldName="docDate"
              label="fa.fields.docDate"
              required
            />
          </Col>
          <Col span={5}>
            <SelectCustom
              path={selectListEndpoints.counterpartiesSelectList}
              formik={formik}
              fieldName="counterpartyId"
              label="fa.fields.counterpartyId"
              search
              required
            />
          </Col>
          <Col span={5}>
            <SelectCustom
              path={selectListEndpoints.faReceiptTypesSelectList}
              formik={formik}
              fieldName="receiptTypeId"
              label="fa.fields.receiptType"
              required
            />
          </Col>
          <Col span={4}>
            <SelectCustom
              path={selectListEndpoints.currenciesSelectList}
              formik={formik}
              fieldName="currencyId"
              label="fa.fields.currencyId"
              required
            />
          </Col>
          <Col span={6}>
            <SelectCustom
              path={selectListEndpoints.chartAccountsSelectList}
              displayConfig={chartAccountSelectDisplayConfig}
              formik={formik}
              fieldName="supplierAccountId"
              label="fa.fields.supplierAccount"
              search
              required
            />
          </Col>
        </Row>
      </Card>

      <Card className="border border-border p-3 sm:p-5">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-base font-semibold">
              {t("fa.sections.documentLines")}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {t("fa.sections.documentLinesDescription")}
            </div>
          </div>
          {isDraft && (
            <Button
              type="primary"
              ghost
              icon={<Plus className="size-4" />}
              onClick={handleAddLine}
            >
              {t("fa.actions.addLine")}
            </Button>
          )}
        </div>

        <Collapse
          activeKey={activeLineKeys}
          onChange={(keys) =>
            setActiveLineKeys(Array.isArray(keys) ? keys : [keys])
          }
          items={lineItems}
          className="bg-transparent"
        />

        {typeof formik.errors.lines === "string" && (
          <div className="mt-3 text-sm text-red-500">
            {formik.errors.lines}
          </div>
        )}
      </Card>
    </div>
  );
}
