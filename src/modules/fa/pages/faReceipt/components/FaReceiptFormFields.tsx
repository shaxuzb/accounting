import { useState } from "react";
import { Button, Col, Collapse, Row } from "antd";
import type { CollapseProps } from "antd";
import type { FormikProps } from "formik";
import { useTranslation } from "react-i18next";
import { Copy, Plus, Trash2 } from "lucide-react";
import dayjs from "@/config/dayjs";
import InputNumber from "@/components/fields/InputNumber";
import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import Card from "@/components/ui/card/Card";
import {
  chartAccountSelectDisplayConfig,
  selectListEndpoints,
} from "@/shared/constants/selectLists";
import type { FaReceiptAssetValues, FaReceiptFormValues } from "../types/form";

const createEmptyAsset = (
  responsibleUserId: number | null,
): FaReceiptAssetValues => ({
  inventoryNumber: "",
  name: "",
  initialCost: 0,
  salvageValue: 0,
  usefulLifeMonths: 1,
  depreciationMethodId: null,
  faGroupId: null,
  okofId: null,
  commissioningDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
  deprStartDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
  plannedUnitsTotal: 0,
  departmentId: null,
  responsibleUserId,
  assetAccountId: null,
  accumulatedDepreciationAccountId: null,
  depreciationExpenseAccountId: null,
});

const createEmptyLine = (responsibleUserId: number | null) => ({
  sourceProductId: null,
  name: "",
  quantity: 1,
  price: 0,
  vatRateId: null,
  capitalInvestmentAccountId: null,
  vatAccountId: null,
  assets: [createEmptyAsset(responsibleUserId)],
});

interface FaReceiptFormFieldsProps {
  formik: FormikProps<FaReceiptFormValues>;
  isDraft: boolean;
  currentUserId: number | null;
}

export default function FaReceiptFormFields({
  formik,
  isDraft,
  currentUserId,
}: FaReceiptFormFieldsProps) {
  const { t } = useTranslation();
  const [activeLineKeys, setActiveLineKeys] = useState<string[]>(["line-0"]);
  const [activeAssetKeys, setActiveAssetKeys] = useState<
    Record<number, string[]>
  >({ 0: ["asset-0"] });

  // const documentTotal = useMemo(
  //   () =>
  //     formik.values.lines.reduce(
  //       (total, line) =>
  //         total + Number(line.quantity || 0) * Number(line.price || 0),
  //       0,
  //     ),
  //   [formik.values.lines],
  // );

  const handleAddLine = () => {
    const lineIndex = formik.values.lines.length;
    formik.setFieldValue("lines", [
      ...formik.values.lines,
      createEmptyLine(currentUserId),
    ]);
    setActiveLineKeys((keys) => [...keys, `line-${lineIndex}`]);
    setActiveAssetKeys((keys) => ({
      ...keys,
      [lineIndex]: ["asset-0"],
    }));
  };

  const handleRemoveLine = (lineIndex: number) => {
    formik.setFieldValue(
      "lines",
      formik.values.lines.filter((_, index) => index !== lineIndex),
    );
    setActiveLineKeys(["line-0"]);
    setActiveAssetKeys({ 0: ["asset-0"] });
  };

  const handleAddAsset = (lineIndex: number) => {
    const assetIndex = formik.values.lines[lineIndex].assets.length;
    formik.setFieldValue(`lines[${lineIndex}].assets`, [
      ...formik.values.lines[lineIndex].assets,
      createEmptyAsset(currentUserId),
    ]);
    setActiveAssetKeys((keys) => ({
      ...keys,
      [lineIndex]: [...(keys[lineIndex] ?? ["asset-0"]), `asset-${assetIndex}`],
    }));
  };

  const handleRemoveAsset = (lineIndex: number, assetIndex: number) => {
    formik.setFieldValue(
      `lines[${lineIndex}].assets`,
      formik.values.lines[lineIndex].assets.filter(
        (_, index) => index !== assetIndex,
      ),
    );
    setActiveAssetKeys((keys) => ({
      ...keys,
      [lineIndex]: ["asset-0"],
    }));
  };

  const handleApplyCommonAssetData = (lineIndex: number) => {
    const [sourceAsset, ...otherAssets] = formik.values.lines[lineIndex].assets;
    if (!sourceAsset || !otherAssets.length) return;

    const commonValues = {
      usefulLifeMonths: sourceAsset.usefulLifeMonths,
      depreciationMethodId: sourceAsset.depreciationMethodId,
      faGroupId: sourceAsset.faGroupId,
      okofId: sourceAsset.okofId,
      commissioningDate: sourceAsset.commissioningDate,
      deprStartDate: sourceAsset.deprStartDate,
      plannedUnitsTotal: sourceAsset.plannedUnitsTotal,
      departmentId: sourceAsset.departmentId,
      responsibleUserId: sourceAsset.responsibleUserId,
      assetAccountId: sourceAsset.assetAccountId,
      accumulatedDepreciationAccountId:
        sourceAsset.accumulatedDepreciationAccountId,
      depreciationExpenseAccountId: sourceAsset.depreciationExpenseAccountId,
    };

    formik.setFieldValue(`lines[${lineIndex}].assets`, [
      sourceAsset,
      ...otherAssets.map((asset) => ({ ...asset, ...commonValues })),
    ]);
  };

  const renderAssetFields = (lineIndex: number, assetIndex: number) => (
    <div className="space-y-5">
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
            <InputNumber
              formik={formik}
              fieldName={`lines[${lineIndex}].assets[${assetIndex}].salvageValue`}
              label="fa.fields.salvageValue"
              min={0}
            />
          </Col>
          <Col span={6}>
            <InputNumber
              formik={formik}
              fieldName={`lines[${lineIndex}].assets[${assetIndex}].usefulLifeMonths`}
              label="fa.fields.usefulLifeMonths"
              min={1}
              required
            />
          </Col>
          <Col span={6}>
            <SelectCustom
              path={selectListEndpoints.depreciationMethodsSelectList}
              formik={formik}
              fieldName={`lines[${lineIndex}].assets[${assetIndex}].depreciationMethodId`}
              label="fa.fields.depreciationMethodId"
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
            <SelectDate
              formik={formik}
              fieldName={`lines[${lineIndex}].assets[${assetIndex}].commissioningDate`}
              label="fa.fields.commissioningDate"
              required
            />
          </Col>
          <Col span={6}>
            <SelectDate
              formik={formik}
              fieldName={`lines[${lineIndex}].assets[${assetIndex}].deprStartDate`}
              label="fa.fields.deprStartDate"
              required
            />
          </Col>
          <Col span={6}>
            <InputNumber
              formik={formik}
              fieldName={`lines[${lineIndex}].assets[${assetIndex}].plannedUnitsTotal`}
              label="fa.fields.plannedUnitsTotal"
              min={0}
            />
          </Col>
          <Col span={6}>
            <SelectCustom
              path={selectListEndpoints.departmentsSelectList}
              formik={formik}
              fieldName={`lines[${lineIndex}].assets[${assetIndex}].departmentId`}
              label="fa.fields.departmentId"
              search
              required
            />
          </Col>
          <Col span={6}>
            <SelectCustom
              path={selectListEndpoints.usersSelectList}
              formik={formik}
              fieldName={`lines[${lineIndex}].assets[${assetIndex}].responsibleUserId`}
              label="fa.fields.responsibleUserId"
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
          <Col span={6}>
            <SelectCustom
              path={selectListEndpoints.chartAccountsSelectList}
              displayConfig={chartAccountSelectDisplayConfig}
              formik={formik}
              fieldName={`lines[${lineIndex}].assets[${assetIndex}].accumulatedDepreciationAccountId`}
              label="fa.fields.accumulatedDepreciationAccount"
              search
              required
            />
          </Col>
          <Col span={6}>
            <SelectCustom
              path={selectListEndpoints.chartAccountsSelectList}
              displayConfig={chartAccountSelectDisplayConfig}
              formik={formik}
              fieldName={`lines[${lineIndex}].assets[${assetIndex}].depreciationExpenseAccountId`}
              label="fa.fields.depreciationExpenseAccount"
              search
              required
            />
          </Col>
        </Row>
      </div>

      {/* <div className="border-t border-border pt-5">
        <div className="mb-4 text-sm font-semibold text-foreground">
          {t("fa.sections.accounts")}
        </div>
        <Row gutter={[16, 0]}>
        
        </Row>
      </div> */}
    </div>
  );

  const lineItems: CollapseProps["items"] = formik.values.lines.map(
    (line, lineIndex) => {
      // const lineTotal = Number(line.quantity || 0) * Number(line.price || 0);
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
                <SelectCustom
                  path={selectListEndpoints.productsSelectList}
                  formik={formik}
                  fieldName={`lines[${lineIndex}].sourceProductId`}
                  label="fa.fields.sourceProductId"
                  search
                  required
                />
              </Col>
              <Col span={6}>
                <InputNumber
                  formik={formik}
                  fieldName={`lines[${lineIndex}].quantity`}
                  label="fa.fields.quantity"
                  min={1}
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

            {/* <div className="flex justify-end border-t border-dashed border-border pt-2 text-sm">
              <span className="text-muted-foreground">
                {t("fa.sections.lineTotal")}:{" "}
                <strong className="text-foreground">
                  {numberSpacing(lineTotal)}
                </strong>
              </span>
            </div> */}

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
      <Card className=" p-3">
      
        <Row gutter={[16, 0]}>
          <Col span={4}>
            <SelectDate
              formik={formik}
              fieldName="docDate"
              label="fa.fields.docDate"
              required
            />
          </Col>
          <Col span={4}>
            <SelectCustom
              path={selectListEndpoints.counterpartiesSelectList}
              formik={formik}
              fieldName="counterpartyId"
              label="fa.fields.counterpartyId"
              search
              required
            />
          </Col>
          <Col span={4}>
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
              path={selectListEndpoints.warehousesSelectList}
              formik={formik}
              fieldName="warehouseId"
              label="fa.fields.warehouseId"
              search
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
          <Col span={4}>
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
          <div className="mt-3 text-sm text-red-500">{formik.errors.lines}</div>
        )}
        {/* <div className="flex justify-end text-sm">
          <span className="text-muted-foreground">
            {t("fa.sections.documentTotal")}:{" "}
            <strong className="text-lg text-foreground">
              {numberSpacing(documentTotal)}
            </strong>
          </span>
        </div> */}
      </Card>
    </div>
  );
}
