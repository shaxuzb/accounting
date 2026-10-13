import SectionCard from "@/components/ui/card/SectionCard";
import { usePayrollComponentLookup } from "@/modules/payroll/hooks";
import { componentTypeColor, methodUsesAmount, methodUsesRate } from "@/modules/payroll/constants/options";
import { money } from "@/modules/payroll/utils/format";
import { Button, Empty, InputNumber, Select, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import { ListPlus, Plus, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { PayrollHrOrderComponentLine } from "../types/form";
import type { PayrollHrOrderComponent } from "../types/type";

/** Accrued only by the dismissal settlement — never a planned accrual. */
const SETTLEMENT_ONLY = ["LEAVE_COMPENSATION", "SEVERANCE_PAY"];

interface Props {
  orderType: string;
  lines: PayrollHrOrderComponentLine[];
  onChange: (lines: PayrollHrOrderComponentLine[]) => void;
  readOnly: boolean;
  /** what the saved order holds, with the names — shown once it can no longer be edited */
  saved?: PayrollHrOrderComponent[];
}

/**
 * The planned accruals of an HR order (1C «Плановые начисления» of «Прием на работу», «Кадровый
 * перевод», «Изменение оплаты труда»): what the employee is paid or has deducted from the order's
 * date. A dismissal ends them all by itself.
 */
export default function HrOrderComponentLines({ orderType, lines, onChange, readOnly, saved }: Props) {
  const { t } = useTranslation();
  const { data: components } = usePayrollComponentLookup();
  const planned = useMemo(
    () =>
      (components ?? []).filter(
        (component) =>
          (component.componentType === "EARNING" || component.componentType === "DEDUCTION") &&
          !component.isMandatory &&
          !SETTLEMENT_ONLY.includes(component.calculationMethod),
      ),
    [components],
  );
  const byId = useMemo(() => new Map((components ?? []).map((component) => [component.id, component])), [components]);
  const isHire = orderType === "HIRE";
  const isDismissal = orderType === "DISMISSAL";

  const update = (index: number, patch: Partial<PayrollHrOrderComponentLine>) =>
    onChange(lines.map((line, i) => (i === index ? { ...line, ...patch } : line)));

  type Row = PayrollHrOrderComponentLine & { key: number };
  const columns: TableColumnsType<Row> = [
    {
      dataIndex: "componentId",
      title: t("payroll.fields.component"),
      width: 320,
      render: (_, line, index) => {
        const component = line.componentId ? byId.get(line.componentId) : undefined;
        if (readOnly)
          return (
            <span className="flex items-center gap-2">
              {component && <Tag className="m-0!" color={componentTypeColor[component.componentType] ?? "default"}>{t(`payroll.enums.componentType.${component.componentType}`)}</Tag>}
              {component?.name ?? saved?.[index]?.componentName ?? "—"}
            </span>
          );
        const taken = new Set(lines.filter((_, i) => i !== index).map((x) => x.componentId));
        return (
          <Select
            className="w-full"
            showSearch
            optionFilterProp="label"
            placeholder={t("payroll.placeholders.selectComponent")}
            value={line.componentId ?? undefined}
            onChange={(value: number) => update(index, { componentId: value, amount: null, rate: null })}
            options={planned
              .filter((component) => !taken.has(component.id))
              .map((component) => ({
                value: component.id,
                label: `${component.name} (${t(`payroll.enums.componentType.${component.componentType}`)})`,
              }))}
          />
        );
      },
    },
    {
      dataIndex: "action",
      title: t("hr.orderLines.action"),
      width: 170,
      render: (_, line, index) =>
        readOnly || isHire ? (
          <Tag className="m-0!" color={line.action === "END" ? "red" : "green"}>{t(`hr.orderLines.actions.${line.action}`)}</Tag>
        ) : (
          <Select
            className="w-full"
            value={line.action}
            onChange={(value: "ASSIGN" | "END") => update(index, { action: value, amount: null, rate: null })}
            options={[
              { value: "ASSIGN", label: t("hr.orderLines.actions.ASSIGN") },
              { value: "END", label: t("hr.orderLines.actions.END") },
            ]}
          />
        ),
    },
    {
      dataIndex: "amount",
      title: t("payroll.fields.value"),
      width: 200,
      render: (_, line, index) => {
        const method = line.componentId ? byId.get(line.componentId)?.calculationMethod : undefined;
        if (line.action === "END") return "—";
        const usesAmount = methodUsesAmount(method);
        const usesRate = methodUsesRate(method);
        if (readOnly) return usesRate ? (line.rate ?? "—") : usesAmount ? money(line.amount) : "—";
        if (usesAmount)
          return <InputNumber className="w-full!" min={0} precision={2} value={line.amount ?? undefined} onChange={(value) => update(index, { amount: value ?? null })} placeholder={t("payroll.fields.amount")} />;
        if (usesRate)
          return <InputNumber className="w-full!" min={0} precision={2} value={line.rate ?? undefined} onChange={(value) => update(index, { rate: value ?? null })} placeholder={t("payroll.fields.rate")} />;
        return <span className="text-xs text-secondary-text">{t("hr.orderLines.byMethod")}</span>;
      },
    },
  ];
  if (!readOnly)
    columns.push({
      dataIndex: "remove",
      width: 60,
      align: "center",
      render: (_, __, index) => (
        <Button type="text" danger icon={<Trash2 className="size-4" />} onClick={() => onChange(lines.filter((_, i) => i !== index))} />
      ),
    });

  return (
    <SectionCard
      title="hr.orderLines.title"
      description={isDismissal ? "hr.orderLines.dismissalHint" : "hr.orderLines.hint"}
      icon={<ListPlus className="size-4" />}
      bodyClassName="p-0!"
      extra={
        !readOnly && !isDismissal ? (
          <Button type="dashed" icon={<Plus className="size-4" />} onClick={() => onChange([...lines, { componentId: null, action: "ASSIGN", amount: null, rate: null }])}>
            {t("hr.orderLines.add")}
          </Button>
        ) : undefined
      }
    >
      <Table<Row>
        columns={columns}
        dataSource={lines.map((line, index) => ({ ...line, key: index }))}
        pagination={false}
        size="middle"
        scroll={{ x: "max-content" }}
        locale={{ emptyText: <Empty description={t("hr.orderLines.empty")} /> }}
      />
    </SectionCard>
  );
}
