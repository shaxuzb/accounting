import { Button, Form, Segmented, Tooltip } from "antd";
import { useFormik } from "formik";
import { Check, ChevronDown, ChevronRight, Package } from "lucide-react";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import InputNumberFormat from "@/components/fields/InputNumber";
import SelectCustom from "@/components/fields/SelectCustom";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { numberSpacing } from "@/utils/utils";
import type { SaleProductGroupForm } from "../types/form";
import type { SaleProductGroupData } from "../types/type";
import { getLineTotal, getNetPrice } from "../utils/pricing";
import SaleProductLinesTable from "./SaleProductLinesTable";
import { useTranslation } from "react-i18next";

interface Props {
  group: SaleProductGroupData;
  currencyCode: string;
  onApplyMargin: (lineKeys: string[], margin: number) => void;
  onApplyMarginAmount: (lineKeys: string[], marginAmount: number) => void;
  onApplySalePrice: (lineKeys: string[], salePrice: number) => void;
  onApplyVat: (
    lineKeys: string[],
    vatRateId: number | null,
    vatRateName?: string | null,
  ) => void;
  onApplyDiscount: (lineKeys: string[], discountPercent: number) => void;
  onLineDiscountChange: (lineKey: string, discountPercent: number) => void;
  onLineMarginChange: (lineKey: string, margin: number) => void;
  onLineSalePriceChange: (lineKey: string, salePrice: number) => void;
  vatPayer?: boolean;
}

function SaleProductGroup({
  group,
  currencyCode,
  onApplyMargin,
  onApplyMarginAmount,
  onApplySalePrice,
  onApplyVat,
  onApplyDiscount,
  onLineDiscountChange,
  onLineMarginChange,
  onLineSalePriceChange,
  vatPayer = true,
}: Props) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(true);
  const lineKeys = useMemo(
    () => group.lines.map((line) => line.rowKey),
    [group.lines],
  );
  const groupTotalAmount = useMemo(
    () =>
      group.lines.reduce(
        (total, line) =>
          total +
          getLineTotal(getNetPrice(line.amount, line.discountPercent), line.quantity, line.vatRateName),
        0,
      ),
    [group.lines],
  );
  const productMxik = group.lines[0]?.productMxik;
  const initialVatRateId = group.lines.every(
    (line) => line.vatRateId === group.lines[0]?.vatRateId,
  )
    ? group.lines[0]?.vatRateId ?? null
    : null;
  const initialVatRateName = group.lines.every(
    (line) => line.vatRateName === group.lines[0]?.vatRateName,
  )
    ? group.lines[0]?.vatRateName ?? ""
    : "";
  const previousVatRateId = useRef(initialVatRateId);

  const formik = useFormik<SaleProductGroupForm>({
    initialValues: {
      vatRateId: initialVatRateId,
      vatRateName: initialVatRateName,
      priceMode: "marginPercent",
      margin: null,
      marginAmount: null,
      salePrice: null,
      discount: null,
    },
    onSubmit: (values, helpers) => {
      if (values.priceMode === "marginPercent" && values.margin !== null) {
        onApplyMargin(lineKeys, values.margin);
      } else if (
        values.priceMode === "marginAmount" &&
        values.marginAmount !== null
      ) {
        onApplyMarginAmount(lineKeys, values.marginAmount);
      } else if (values.priceMode === "salePrice" && values.salePrice !== null) {
        onApplySalePrice(lineKeys, values.salePrice);
      } else if (values.priceMode === "discount" && values.discount !== null) {
        onApplyDiscount(lineKeys, values.discount);
      }
      helpers.setValues({
        ...values,
        margin: null,
        marginAmount: null,
        salePrice: null,
        discount: null,
      });
    },
  });

  // the ways a group is priced: by margin, margin amount, price, or a discount off the price
  const modes = [
    { value: "marginPercent", field: "margin", label: "sale.fields.margin", min: -100, max: 100000 },
    { value: "marginAmount", field: "marginAmount", label: "sale.fields.marginAmount", min: 0, max: 100000 },
    { value: "salePrice", field: "salePrice", label: "sale.fields.salePrice", min: 0, max: 100000 },
    { value: "discount", field: "discount", label: "sale.fields.discount", min: 0, max: 99.99 },
  ] as const;
  const activeMode = modes.find((mode) => mode.value === formik.values.priceMode) ?? modes[0];

  useEffect(() => {
    if (previousVatRateId.current === formik.values.vatRateId) return;
    previousVatRateId.current = formik.values.vatRateId;
    onApplyVat(lineKeys, formik.values.vatRateId, formik.values.vatRateName);
  }, [formik.values.vatRateId, formik.values.vatRateName, lineKeys, onApplyVat]);

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-primary-bg">
      <div className="flex flex-col gap-3 border-b border-border px-3 py-3 2xl:flex-row 2xl:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Tooltip
            title={
              expanded
                ? t("sale.messages.collapseTable")
                : t("sale.messages.expandTable")
            }
          >
            <Button
              type="text"
              shape="circle"
              icon={
                expanded ? (
                  <ChevronDown size={18} />
                ) : (
                  <ChevronRight size={18} />
                )
              }
              onClick={() => setExpanded((value) => !value)}
            />
          </Tooltip>
          <Package size={22} className="shrink-0 text-primary" />
          <div className="min-w-0">
            <h3
              className="truncate text-sm font-semibold text-text"
              title={group.productName}
            >
              {group.productName}
            </h3>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-secondary-text">
              {/* <span>Product ID: {group.productId || "-"}</span> */}
              {productMxik && <span>MXIK: {productMxik}</span>}
              <span>{t("warehouse.lines.items")}: {group.lines.length}</span>
              <span>{t("app.fields.marking")}: {group.markingCount || 0}</span>
              <span>
                {t("sale.fields.totalAmount")}:{" "}
                {numberSpacing(groupTotalAmount, undefined, true)}{" "}
                {currencyCode}
              </span>
            </div>
          </div>
          <span className="ml-auto whitespace-nowrap rounded bg-primary/10 px-2 py-1 text-xs font-semibold text-primary xl:ml-2">
            {t("sale.fields.countSuffix", { count: group.totalQuantity })}
          </span>
         
        </div>

        <Form
          layout="vertical"
          className="grid w-full gap-3 sm:grid-cols-2 xl:grid-cols-[260px_330px_170px_120px] xl:items-end 2xl:w-235"
        >
          {vatPayer && (
            <div className="min-w-0 [&_.ant-form-item]:mb-0! [&_.ant-form-item-label]:pb-1! [&_.ant-select-selector]:h-9.5!">
              <SelectCustom
                label={t("sale.fields.allVat")}
                fieldName="vatRateId"
                getFieldName="vatRateName"
                path={selectListEndpoints.vatRatesSelectList}
                formik={formik}
                marginBottom="mb-0"
                clearable
              />
            </div>
          )}
          <div className="min-w-0">
            <Segmented
              block
              value={formik.values.priceMode}
              options={modes.map((mode) => ({ label: t(mode.label), value: mode.value }))}
              onChange={(value) => {
                formik.setFieldValue("priceMode", value);
                for (const mode of modes) formik.setFieldValue(mode.field, null);
              }}
            />
          </div>
          <div className="min-w-0 [&_.ant-form-item]:mb-0! [&_.ant-form-item-label]:pb-1!">
            <InputNumberFormat
              label={t(activeMode.label)}
              fieldName={activeMode.field}
              formik={formik}
              value={formik.values[activeMode.field]}
              min={activeMode.min}
              max={activeMode.max}
              precision={2}
              onValueChange={(value) => {
                // only the chosen way of pricing holds a value
                for (const mode of modes)
                  formik.setFieldValue(mode.field, mode.field === activeMode.field ? value : null);
              }}
              onPressEnter={formik.handleSubmit}
            />
          </div>
          <Button
            type="primary"
            size="large"
            icon={<Check size={16} />}
            disabled={modes.every((mode) => formik.values[mode.field] === null)}
            onClick={() => formik.handleSubmit()}
          >
            {t("sale.actions.apply")}
          </Button>
        </Form>
      </div>

      {expanded && (
        <SaleProductLinesTable
          lines={group.lines}
          currencyCode={currencyCode}
          vatRateName={formik.values.vatRateName}
          onMarginChange={onLineMarginChange}
          onSalePriceChange={onLineSalePriceChange}
          onDiscountChange={onLineDiscountChange}
          vatPayer={vatPayer}
        />
      )}
    </section>
  );
}

const sameProductGroup = (previous: Props, next: Props) =>
  previous.currencyCode === next.currencyCode &&
  previous.vatPayer === next.vatPayer &&
  previous.group.key === next.group.key &&
  previous.group.totalQuantity === next.group.totalQuantity &&
  previous.group.lines.length === next.group.lines.length &&
  previous.group.lines.every(
    (line, index) => line === next.group.lines[index],
  ) &&
  previous.onApplyMargin === next.onApplyMargin &&
  previous.onApplyMarginAmount === next.onApplyMarginAmount &&
  previous.onApplySalePrice === next.onApplySalePrice &&
  previous.onApplyVat === next.onApplyVat &&
  previous.onApplyDiscount === next.onApplyDiscount &&
  previous.onLineDiscountChange === next.onLineDiscountChange &&
  previous.onLineMarginChange === next.onLineMarginChange &&
  previous.onLineSalePriceChange === next.onLineSalePriceChange;

export default memo(SaleProductGroup, sameProductGroup);
