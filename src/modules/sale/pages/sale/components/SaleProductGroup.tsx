import { Button, Form, Tooltip } from "antd";
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
  onApplyMargin: (lineIds: number[], margin: number) => void;
  onApplySalePrice: (lineIds: number[], salePrice: number) => void;
  onApplyVat: (lineIds: number[], vatRateId: number | null) => void;
  onLineMarginChange: (lineId: number, margin: number) => void;
  onLineSalePriceChange: (lineId: number, salePrice: number) => void;
}

function SaleProductGroup({
  group,
  currencyCode,
  onApplyMargin,
  onApplySalePrice,
  onApplyVat,
  onLineMarginChange,
  onLineSalePriceChange,
}: Props) {
  const [expanded, setExpanded] = useState(true);
  const lineIds = useMemo(
    () => group.lines.map((line) => line.id),
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
      margin: null,
      salePrice: null,
    },
    onSubmit: (values, helpers) => {
      if (values.margin !== null) {
        onApplyMargin(lineIds, values.margin);
      } else if (values.salePrice !== null) {
        onApplySalePrice(lineIds, values.salePrice);
      }
      helpers.setValues({ ...values, margin: null, salePrice: null });
    },
  });

  useEffect(() => {
    if (previousVatRateId.current === formik.values.vatRateId) return;
    previousVatRateId.current = formik.values.vatRateId;
    onApplyVat(lineIds, formik.values.vatRateId);
  }, [formik.values.vatRateId, lineIds, onApplyVat]);

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
          className="grid w-full gap-3 sm:grid-cols-2 xl:grid-cols-[280px_190px_190px_120px] xl:items-end 2xl:w-205"
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
          <div className="min-w-0 [&_.ant-form-item]:mb-0! [&_.ant-form-item-label]:pb-1!">
            <InputNumberFormat
              label="Marja, %"
              fieldName="margin"
              formik={formik}
              value={formik.values.margin}
              min={-100}
              max={100000}
              precision={2}
              onValueChange={(value) => {
                formik.setFieldValue("margin", value);
                formik.setFieldValue("salePrice", null);
              }}
              onPressEnter={formik.handleSubmit}
            />
          </div>
          <div className="min-w-0 [&_.ant-form-item]:mb-0! [&_.ant-form-item-label]:pb-1!">
            <InputNumberFormat
              label="Sotuv narxi"
              fieldName="salePrice"
              formik={formik}
              value={formik.values.salePrice}
              min={0}
              precision={2}
              onValueChange={(value) => {
                formik.setFieldValue("salePrice", value);
                formik.setFieldValue("margin", null);
              }}
              onPressEnter={formik.handleSubmit}
            />
          </div>
          <Button
            type="primary"
            size="large"
            icon={<Check size={16} />}
            disabled={
              formik.values.margin === null && formik.values.salePrice === null
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
  previous.onApplySalePrice === next.onApplySalePrice &&
  previous.onApplyVat === next.onApplyVat &&
  previous.onLineMarginChange === next.onLineMarginChange &&
  previous.onLineSalePriceChange === next.onLineSalePriceChange;

export default memo(SaleProductGroup, sameProductGroup);
