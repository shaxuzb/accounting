import InputNumber from "@/components/fields/InputNumber";
import SectionCard from "@/components/ui/card/SectionCard";
import PayrollEmployeeSelect from "@/modules/payroll/components/PayrollEmployeeSelect";
import { usePayrollEmployeeLookup } from "@/modules/payroll/hooks";
import { money } from "@/modules/payroll/utils/format";
import { App, Button, Empty, Input, Table, Tag, Tooltip } from "antd";
import type { TableColumnsType } from "antd";
import type { FormikProps } from "formik";
import { Trash2, UserPlus, Wallet } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { PayrollDocument } from "../../documents/types/type";
import type {
  PayrollPaymentForm,
  PayrollPaymentLineForm,
} from "../types/form";
import { createPaymentLine, paymentTotal } from "../utils/payment";

interface Props {
  formik: FormikProps<PayrollPaymentForm>;
  disabled?: boolean;
  /** FINAL to'lovda tanlangan maosh hujjati. */
  payrollDocument?: PayrollDocument | null;
  currencyName?: string | null;
}

type LineRow = PayrollPaymentLineForm & { key: number; rowIndex: number };

export default function PaymentLinesEditor({
  formik,
  disabled = false,
  payrollDocument,
  currencyName,
}: Props) {
  const { t } = useTranslation();
  const { modal } = App.useApp();
  const { data: employees } = usePayrollEmployeeLookup();

  const lines = formik.values.lines;
  const total = useMemo(() => paymentTotal(lines), [lines]);
  const selectedIds = useMemo(
    () => lines.map((line) => line.employeeId),
    [lines],
  );

  const setLines = (next: PayrollPaymentLineForm[]) =>
    formik.setFieldValue("lines", next, true);

  const patchLine = (index: number, patch: Partial<PayrollPaymentLineForm>) =>
    setLines(
      lines.map((line, current) =>
        current === index ? { ...line, ...patch } : line,
      ),
    );

  const addLine = () => setLines([...lines, createPaymentLine()]);

  const removeLine = (index: number) =>
    setLines(lines.filter((_, current) => current !== index));

  /** Maosh hujjatidagi qolgan summalar bilan to'ldiradi. */
  const fillFromDocument = () => {
    const documentEmployees = payrollDocument?.lines ?? [];
    if (!documentEmployees.length) return;

    modal.confirm({
      title: t("payroll.payments.fillFromDocumentTitle"),
      content: t("payroll.payments.fillFromDocumentText", {
        count: documentEmployees.length,
      }),
      okText: t("common.submit"),
      cancelText: t("common.cancel"),
      onOk: () =>
        setLines(
          documentEmployees
            .map((employee) =>
              createPaymentLine({
                employeeId: employee.employeeId,
                employeeName: employee.employeeName,
                employeeNumber: employee.employeeNumber,
                departmentName: employee.departmentName,
                payableAmount:
                  employee.outstandingAmount ?? employee.payableAmount ?? null,
                amount:
                  employee.outstandingAmount ?? employee.payableAmount ?? null,
              }),
            )
            .filter((line) => (line.amount ?? 0) > 0),
        ),
    });
  };

  const columns: TableColumnsType<LineRow> = [
    {
      dataIndex: "rowIndex",
      title: t("common.rowNumber"),
      align: "center",
      width: 60,
      render: (_, record) => record.rowIndex + 1,
    },
    {
      dataIndex: "employeeId",
      title: t("payroll.fields.employee"),
      minWidth: 280,
      render: (_, record) => (
        <div className="py-1">
          <PayrollEmployeeSelect
            standalone
            value={record.employeeId}
            excludeIds={selectedIds}
            disabled={disabled}
            onChange={(value) => {
              const employee = (employees ?? []).find(
                (item) => item.id === value,
              );
              patchLine(record.rowIndex, {
                employeeId: value,
                employeeName: employee?.label ?? null,
                employeeNumber: employee?.employeeNumber ?? null,
                departmentName: employee?.departmentName ?? null,
              });
            }}
          />
          {record.departmentName && (
            <div className="mt-1 text-xs text-secondary-text">
              {record.departmentName}
            </div>
          )}
        </div>
      ),
    },
    {
      dataIndex: "payableAmount",
      title: t("payroll.fields.outstandingAmount"),
      align: "right",
      width: 160,
      render: (value: number | null) =>
        value == null ? (
          "—"
        ) : (
          <span className="text-secondary-text">{money(value)}</span>
        ),
    },
    {
      dataIndex: "amount",
      title: t("payroll.fields.amount"),
      align: "right",
      width: 190,
      render: (_, record) => {
        const overLimit =
          record.payableAmount != null &&
          (record.amount ?? 0) > record.payableAmount;
        return (
          <div>
            <InputNumber
              standalone
              height={32}
              min={0}
              precision={2}
              emptyZero
              placeholder="0"
              disabled={disabled}
              value={record.amount}
              onValueChange={(value) =>
                patchLine(record.rowIndex, { amount: value })
              }
            />
            {overLimit && (
              <div className="mt-1 text-xs text-red-500">
                {t("payroll.messages.amountOverPayable")}
              </div>
            )}
          </div>
        );
      },
    },
    {
      dataIndex: "note",
      title: t("payroll.fields.note"),
      minWidth: 180,
      render: (_, record) => (
        <Input
          value={record.note ?? ""}
          disabled={disabled}
          placeholder={t("payroll.fields.note")}
          onChange={(event) =>
            patchLine(record.rowIndex, { note: event.target.value })
          }
          style={{ height: 32, backgroundColor: "transparent" }}
        />
      ),
    },
  ];

  if (!disabled) {
    columns.push({
      dataIndex: "actions",
      title: "",
      align: "center",
      width: 56,
      fixed: "right",
      render: (_, record) => (
        <Tooltip title={t("common.delete")}>
          <Button
            type="text"
            danger
            icon={<Trash2 className="size-4" />}
            onClick={() => removeLine(record.rowIndex)}
          />
        </Tooltip>
      ),
    });
  }

  const dataSource: LineRow[] = lines.map((line, index) => ({
    ...line,
    key: index,
    rowIndex: index,
  }));

  return (
    <SectionCard
      className="min-w-0 overflow-hidden"
      title="payroll.payments.linesTitle"
      description="payroll.payments.linesHint"
      icon={<Wallet className="size-4" />}
      bodyClassName="min-w-0 overflow-hidden p-0!"
      extra={
        !disabled && (
          <>
            {Boolean(payrollDocument?.lines?.length) && (
              <Button
                icon={<Wallet className="size-4" />}
                onClick={fillFromDocument}
              >
                {t("payroll.payments.fillFromDocument")}
              </Button>
            )}
            <Button
              type="dashed"
              icon={<UserPlus className="size-4" />}
              onClick={addLine}
            >
              {t("payroll.payments.addLine")}
            </Button>
          </>
        )
      }
    >
      <Table<LineRow>
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        size="small"
        scroll={{ x: 980, y: 460 }}
        locale={{
          emptyText: <Empty description={t("payroll.payments.noLines")} />,
        }}
        summary={() =>
          lines.length ? (
            <Table.Summary fixed>
              <Table.Summary.Row className="bg-primary-bg font-semibold">
                <Table.Summary.Cell index={0} colSpan={3}>
                  {t("payroll.fields.totalAmount")}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3} align="right">
                  <Tag className="m-0!" color="blue">
                    {money(total)} {currencyName ?? ""}
                  </Tag>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4} colSpan={disabled ? 1 : 2} />
              </Table.Summary.Row>
            </Table.Summary>
          ) : null
        }
      />
      {typeof formik.errors.lines === "string" && (
        <div className="px-4 py-2 text-sm text-red-500">
          {formik.errors.lines}
        </div>
      )}
    </SectionCard>
  );
}
