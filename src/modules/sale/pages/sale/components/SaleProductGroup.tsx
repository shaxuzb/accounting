import { Button, Form, Segmented, Tooltip } from "antd";
import { useFormik } from "formik";
import { Check, ChevronDown, ChevronRight, Package } from "lucide-react";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import InputNumberFormat from "@/components/fields/InputNumber";
import SelectCustom from "@/components/fields/SelectCustom";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import type { SaleProductGroupForm } from "../types/form";
import type { SaleProductGroupData } from "../types/type";
import SaleProductLinesTable from "./SaleProductLinesTable";

interface Props {
  group: SaleProductGroupData;
  currencyCode: string;
  onApplyMargin: (lineKeys: string[], margin: number) => void;
  onApplyMarginAmount: (lineKeys: string[], marginAmount: number) => void;
  onApplySalePrice: (lineKeys: string[], salePrice: number) => void;
  onApplyVat: (lineKeys: string[], vatRateId: number | null) => void;
  onLineMarginChange: (lineKey: string, margin: number) => void;
  onLineSalePriceChange: (lineKey: string, salePrice: number) => void;
}

function SaleProductGroup({
  group,
  currencyCode,
  onApplyMargin,
  onApplyMarginAmount,
  onApplySalePrice,
  onApplyVat,
  onLineMarginChange,
  onLineSalePriceChange,
}: Props) {
  const [expanded, setExpanded] = useState(true);
  const lineKeys = useMemo(
    () => group.lines.map((line) => line.rowKey),
    [group.lines],
  );
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
      }
      helpers.setValues({
        ...values,
        margin: null,
        marginAmount: null,
        salePrice: null,
      });
    },
  });

  useEffect(() => {
    if (previousVatRateId.current === formik.values.vatRateId) return;
    previousVatRateId.current = formik.values.vatRateId;
    onApplyVat(lineKeys, formik.values.vatRateId);
  }, [formik.values.vatRateId, lineKeys, onApplyVat]);

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-primary-bg">
      <div className="flex flex-col gap-3 border-b border-border px-3 py-3 2xl:flex-row 2xl:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Tooltip title={expanded ? "Jadvalni yopish" : "Jadvalni ochish"}>
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
            <p className="text-xs text-secondary-text">
              Product ID: {group.productId || "-"}
            </p>
          </div>
          <span className="ml-auto whitespace-nowrap rounded bg-primary/10 px-2 py-1 text-xs font-semibold text-primary xl:ml-2">
            {group.totalQuantity} ta
          </span>
        </div>

        <Form
          layout="vertical"
          className="grid w-full gap-3 sm:grid-cols-2 xl:grid-cols-[280px_240px_190px_120px] xl:items-end 2xl:w-[860px]"
        >
          <div className="min-w-0 [&_.ant-form-item]:mb-0! [&_.ant-form-item-label]:pb-1! [&_.ant-select-selector]:h-9.5!">
            <SelectCustom
              label="Barchasi uchun QQS"
              fieldName="vatRateId"
              getFieldName="vatRateName"
              path={selectListEndpoints.vatRatesSelectList}
              formik={formik}
              marginBottom="mb-0"
              clearable
            />
          </div>
          <div className="min-w-0">
            <Segmented
              block
              value={formik.values.priceMode}
              options={[
                { label: "Marja, %", value: "marginPercent" },
                { label: "Marja summa", value: "marginAmount" },
                { label: "Sotuv narxi", value: "salePrice" },
              ]}
              onChange={(value) => {
                formik.setFieldValue("priceMode", value);
                formik.setFieldValue("margin", null);
                formik.setFieldValue("marginAmount", null);
                formik.setFieldValue("salePrice", null);
              }}
            />
          </div>
          <div className="min-w-0 [&_.ant-form-item]:mb-0! [&_.ant-form-item-label]:pb-1!">
            <InputNumberFormat
              label={
                formik.values.priceMode === "marginPercent"
                  ? "Marja, %"
                  : formik.values.priceMode === "marginAmount"
                    ? "Marja summa"
                    : "Sotuv narxi"
              }
              fieldName={
                formik.values.priceMode === "marginPercent"
                  ? "margin"
                  : formik.values.priceMode === "marginAmount"
                    ? "marginAmount"
                    : "salePrice"
              }
              formik={formik}
              value={
                formik.values.priceMode === "marginPercent"
                  ? formik.values.margin
                  : formik.values.priceMode === "marginAmount"
                    ? formik.values.marginAmount
                    : formik.values.salePrice
              }
              min={formik.values.priceMode === "marginPercent" ? -100 : 0}
              max={100000}
              precision={2}
              onValueChange={(value) => {
                if (formik.values.priceMode === "marginPercent") {
                  formik.setFieldValue("margin", value);
                } else if (formik.values.priceMode === "marginAmount") {
                  formik.setFieldValue("marginAmount", value);
                } else {
                  formik.setFieldValue("salePrice", value);
                }
                if (formik.values.priceMode !== "marginPercent") {
                  formik.setFieldValue("margin", null);
                }
                if (formik.values.priceMode !== "marginAmount") {
                  formik.setFieldValue("marginAmount", null);
                }
                if (formik.values.priceMode !== "salePrice") {
                  formik.setFieldValue("salePrice", null);
                }
              }}
              onPressEnter={formik.handleSubmit}
            />
          </div>
          <Button
            type="primary"
            size="large"
            icon={<Check size={16} />}
            disabled={
              formik.values.margin === null &&
              formik.values.marginAmount === null &&
              formik.values.salePrice === null
            }
            onClick={() => formik.handleSubmit()}
          >
            Qo'llash
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
        />
      )}
    </section>
  );
}

const sameProductGroup = (previous: Props, next: Props) =>
  previous.currencyCode === next.currencyCode &&
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
  previous.onLineMarginChange === next.onLineMarginChange &&
  previous.onLineSalePriceChange === next.onLineSalePriceChange;

export default memo(SaleProductGroup, sameProductGroup);
