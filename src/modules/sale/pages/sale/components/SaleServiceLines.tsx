import { Button, InputNumber, Select, Table } from "antd";
import type { TableColumnsType } from "antd";
import { Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import Card from "@/components/ui/card/Card";
import { numberSpacing } from "@/utils/utils";
import { roundMoney } from "../utils/pricing";
import {
  newServiceLine,
  serviceNet,
  serviceVat,
  useSaleServiceOptions,
  type SaleServiceLine,
} from "../utils/serviceLines";

interface Props {
  lines: SaleServiceLine[];
  onChange: (lines: SaleServiceLine[]) => void;
  vatPayer?: boolean;
  disabled?: boolean;
}

/**
 * The services of a sale: chosen from the service catalog with quantity, price and VAT; they
 * leave no stock and post their income to the services account (sale_service, 9030).
 */
export default function SaleServiceLines({ lines, onChange, vatPayer = true, disabled }: Props) {
  const { t } = useTranslation();
  const { services, vatRates, loading } = useSaleServiceOptions();

  const update = (rowKey: string, patch: Partial<SaleServiceLine>) =>
    onChange(lines.map((line) => (line.rowKey === rowKey ? { ...line, ...patch } : line)));

  const columns: TableColumnsType<SaleServiceLine> = [
    {
      title: t("saleServices.service"),
      dataIndex: "productId",
      render: (value: number | null, line) => (
        <Select
          className="w-full min-w-56"
          showSearch
          optionFilterProp="label"
          loading={loading}
          disabled={disabled}
          value={value ?? undefined}
          placeholder={t("saleServices.choose")}
          options={services.map((service) => ({ value: service.id, label: service.name }))}
          onChange={(id: number) => {
            const service = services.find((item) => item.id === id);
            update(line.rowKey, {
              productId: id,
              productName: service?.name,
              unitId: service?.unitId ?? null,
              vatRateId: line.vatRateId ?? service?.defaultVatRateId ?? null,
            });
          }}
        />
      ),
    },
    {
      title: t("saleServices.quantity"),
      dataIndex: "quantity",
      width: 110,
      render: (value: number, line) => (
        <InputNumber
          className="w-full"
          min={0.001}
          disabled={disabled}
          value={value}
          onChange={(next) => update(line.rowKey, { quantity: Number(next ?? 0) })}
        />
      ),
    },
    {
      title: t("saleServices.price"),
      dataIndex: "unitPrice",
      width: 150,
      render: (value: number, line) => (
        <InputNumber
          className="w-full"
          min={0}
          disabled={disabled}
          value={value}
          formatter={(next) => String(numberSpacing(Number(next ?? 0)))}
          parser={(next) => Number(String(next ?? "").replace(/[^\d.,]/g, "").replace(",", "."))}
          onChange={(next) => update(line.rowKey, { unitPrice: Number(next ?? 0) })}
        />
      ),
    },
    ...(vatPayer
      ? [
          {
            title: t("saleServices.vat"),
            dataIndex: "vatRateId",
            width: 140,
            render: (value: number | null, line: SaleServiceLine) => (
              <Select
                className="w-full"
                disabled={disabled}
                value={value ?? undefined}
                options={vatRates.map((rate) => ({ value: rate.id, label: rate.name }))}
                onChange={(id: number) => update(line.rowKey, { vatRateId: id })}
              />
            ),
          },
        ]
      : []),
    {
      title: t("saleServices.total"),
      key: "total",
      width: 150,
      align: "right" as const,
      render: (_: unknown, line: SaleServiceLine) =>
        numberSpacing(roundMoney(serviceNet(line) + serviceVat(line, vatRates, vatPayer))),
    },
    {
      key: "remove",
      width: 50,
      render: (_: unknown, line: SaleServiceLine) => (
        <Button
          type="text"
          danger
          disabled={disabled}
          icon={<Trash2 className="size-4" />}
          onClick={() => onChange(lines.filter((item) => item.rowKey !== line.rowKey))}
        />
      ),
    },
  ];

  return (
    <Card className="space-y-3 border border-border p-4">
      <div className="flex items-center justify-between">
        <div className="font-semibold">{t("saleServices.title")}</div>
        <Button
          icon={<Plus className="size-4" />}
          disabled={disabled}
          onClick={() => onChange([...lines, newServiceLine()])}
        >
          {t("saleServices.add")}
        </Button>
      </div>
      {lines.length > 0 && (
        <Table<SaleServiceLine>
          rowKey="rowKey"
          size="small"
          columns={columns}
          dataSource={lines}
          pagination={false}
          scroll={{ x: "max-content" }}
        />
      )}
    </Card>
  );
}
