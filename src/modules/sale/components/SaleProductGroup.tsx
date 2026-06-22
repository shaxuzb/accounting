import { Button, Select, Table, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Check, ChevronDown, ChevronRight, Package } from "lucide-react";
import { memo, useMemo, useState } from "react";
import InputNumberFormat from "@/components/fields/InputNumber";
import LineClampCell from "@/components/widget/text/LineClampCell";
import { numberSpacing } from "@/utils/utils";
import type { SaleAccountingLine, VatRateOption } from "../types/type";
import { vatAmountFromSale, vatPercentFromOption } from "../utils/pricing";

export interface SaleProductGroupData {
  key: string;
  productId?: number;
  productName: string;
  lines: SaleAccountingLine[];
  totalQuantity: number;
}

interface Props {
  group: SaleProductGroupData;
  currency: string;
  vatRates: VatRateOption[];
  vatLoading: boolean;
  onApplyMargin: (lineIds: number[], margin: number) => void;
  onApplyAmount: (lineIds: number[], amount: number) => void;
  onApplyVat: (lineIds: number[], vatRateId: number | null) => void;
  onLineMarginChange: (lineId: number, margin: number) => void;
  onLineAmountChange: (lineId: number, amount: number) => void;
}

function SaleProductGroup({
  group,
  currency,
  vatRates,
  vatLoading,
  onApplyMargin,
  onApplyAmount,
  onApplyVat,
  onLineMarginChange,
  onLineAmountChange,
}: Props) {
  const [expanded, setExpanded] = useState(true);
  const [margin, setMargin] = useState<number | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [applyMode, setApplyMode] = useState<"margin" | "amount" | null>(null);
  const lineIds = useMemo(() => group.lines.map((line) => line.id), [group.lines]);
  const vatRateId = group.lines.every(
    (line) => line.vatRateId === group.lines[0]?.vatRateId,
  )
    ? group.lines[0]?.vatRateId
    : undefined;
  const applyGroupValue = () => {
    if (applyMode === "margin" && margin !== null) {
      onApplyMargin(lineIds, margin);
      setMargin(null);
      setApplyMode(null);
      return;
    }
    if (applyMode === "amount" && amount !== null) {
      onApplyAmount(lineIds, amount);
      setAmount(null);
      setApplyMode(null);
    }
  };

  const columns = useMemo<ColumnsType<SaleAccountingLine>>(
    () => [
      {
        title: "ID",
        dataIndex: "id",
        width: 74,
      },
      {
        title: "Markirovka",
        width: 190,
        render: (_, line) => (
          <LineClampCell
            text={line.markingNumber}
          />
        ),
      },
      {
        title: "Tannarx",
        dataIndex: "costPrice",
        width: 140,
        align: "right",
        render: (value: number) => `${numberSpacing(value, undefined, true)} ${currency}`,
      },
      {
        title: "Marja, %",
        width: 130,
        render: (_, line) => (
          <InputNumberFormat
            standalone
            min={-100}
            max={100000}
            precision={2}
            value={line.marginPercent}
            onValueChange={(value) =>
              onLineMarginChange(line.id, Number(value ?? 0))
            }
          />
        ),
      },
      {
        title: "Sotuv narxi",
        width: 160,
        render: (_, line) => (
          <InputNumberFormat
            standalone
            min={0}
            precision={2}
            value={line.amount}
            onValueChange={(value) =>
              onLineAmountChange(line.id, Number(value ?? 0))
            }
          />
        ),
      },
      {
        title: "Miqdor",
        dataIndex: "quantity",
        width: 100,
        align: "center",
        render: (value: number, line) => `${value} ${line.unitName || "dona"}`,
      },
      {
        title: "QQS",
        dataIndex: "vatRateName",
        width: 120,
        render: (value: string, line) =>
          vatRates.find((item) => item.id === line.vatRateId)?.name || value || "-",
      },
      {
        title: "QQS summasi",
        width: 140,
        align: "right",
        render: (_, line) => {
          const selectedRate = vatRates.find(
            (item) => item.id === line.vatRateId,
          );
          const fallbackRate = line.vatRateName
            ? { id: line.vatRateId ?? 0, name: line.vatRateName }
            : undefined;
          const vatAmount = vatAmountFromSale(
            line.amount,
            line.quantity,
            vatPercentFromOption(selectedRate ?? fallbackRate),
          );
          return numberSpacing(vatAmount, undefined, true);
        },
      },
      {
        title: "Jami",
        width: 150,
        align: "right",
        render: (_, line) => (
          <span className="font-semibold">
            {numberSpacing(line.amount * line.quantity, undefined, true)} {currency}
          </span>
        ),
      },
    ],
    [currency, onLineAmountChange, onLineMarginChange, vatRates],
  );

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-primary-bg">
      <div className="flex flex-col gap-3 border-b border-border px-3 py-3 xl:flex-row xl:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Tooltip title={expanded ? "Jadvalni yopish" : "Jadvalni ochish"}>
            <Button
              type="text"
              shape="circle"
              icon={expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              onClick={() => setExpanded((value) => !value)}
            />
          </Tooltip>
          <Package size={22} className="shrink-0 text-primary" />
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-text" title={group.productName}>
              {group.productName}
            </h3>
            <p className="text-xs text-secondary-text">
              Product ID: {group.productId ?? "-"}
            </p>
          </div>
          <span className="ml-auto whitespace-nowrap rounded bg-primary/10 px-2 py-1 text-xs font-semibold text-primary xl:ml-2">
            {group.totalQuantity} ta
          </span>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 xl:flex xl:items-end">
          <label className="min-w-0 xl:w-44">
            <span className="mb-1 block text-xs text-secondary-text">Barchasi uchun QQS</span>
            <Select
              className="w-full"
              size="large"
              allowClear
              loading={vatLoading}
              placeholder="QQS tanlang"
              value={vatRateId}
              options={vatRates.map((item) => ({ value: item.id, label: item.name }))}
              onChange={(value) => onApplyVat(lineIds, value ?? null)}
            />
          </label>
          <label className="min-w-0 xl:w-36">
            <span className="mb-1 block text-xs text-secondary-text">Marja, %</span>
            <InputNumberFormat
              standalone
              min={-100}
              max={100000}
              precision={2}
              height={40}
              value={margin}
              placeholder="Marjani kiriting"
              onValueChange={(value) => {
                setMargin(value);
                setAmount(null);
                setApplyMode(value === null ? null : "margin");
              }}
              onPressEnter={applyGroupValue}
            />
          </label>
          <label className="min-w-0 xl:w-40">
            <span className="mb-1 block text-xs text-secondary-text">Sotuv narxi</span>
            <InputNumberFormat
              standalone
              min={0}
              precision={2}
              height={40}
              value={amount}
              placeholder="Narxni kiriting"
              onValueChange={(value) => {
                setAmount(value);
                setMargin(null);
                setApplyMode(value === null ? null : "amount");
              }}
              onPressEnter={applyGroupValue}
            />
          </label>
          <Button
            type="primary"
            size="large"
            icon={<Check size={16} />}
            disabled={applyMode === null}
            onClick={applyGroupValue}
          >
            Qo‘llash
          </Button>
        </div>
      </div>

      {expanded && (
        <Table<SaleAccountingLine>
          rowKey="id"
          size="small"
          columns={columns}
          dataSource={group.lines}
          pagination={false}
          scroll={{ x: 1250 }}
        />
      )}
    </section>
  );
}

export default memo(SaleProductGroup);
