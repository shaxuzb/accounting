import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import ListToolbar from "@/components/ui/filters/ListToolbar";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import SelectFilter from "@/components/ui/filters/SelectFilter";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import PayrollPeriodFilter from "@/modules/payroll/components/PayrollPeriodFilter";
import {
  documentStatusFilterOptions,
  paymentKindOptions,
  sourceTypeOptions,
} from "@/modules/payroll/constants/options";
import { payrollPaymentPermissions } from "@/modules/payroll/constants/permissions";
import { displayDate, money } from "@/modules/payroll/utils/format";
import { usePaginationParams } from "@/shared/hooks/usePaginationParams";
import { Button, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router";
import { useGetPayrollPayments } from "../hooks";
import type { PayrollPayment } from "../types/type";

const LIST_PATH = "/main/payroll/payments";

export default function PayrollPaymentListPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { withRowNumbers, paginationProps } = usePaginationParams();
  const { data, isLoading, isFetching, refetch } =
    useGetPayrollPayments(searchParams);

  const columns: TableColumnsType<PayrollPayment> = [
    {
      dataIndex: "indexId",
      title: t("common.rowNumber"),
      align: "center",
      width: 70,
    },
    {
      dataIndex: "docNumber",
      title: t("payroll.fields.docNumber"),
      render: (value: string | null, record) => (
        <Link to={`${LIST_PATH}/${record.id}`} className="font-medium">
          {value ?? record.id}
        </Link>
      ),
    },
    {
      dataIndex: "docDate",
      title: t("payroll.fields.docDate"),
      align: "center",
      width: 130,
      render: (value: string) => displayDate(value),
    },
    {
      dataIndex: "periodId",
      title: t("payroll.fields.period"),
      width: 160,
      align: "center",
      render: (_, record) =>
        record.periodMonth
          ? `${t(`payroll.months.${record.periodMonth}`, {
              defaultValue: record.periodName ?? "",
            })} ${record.periodYear ?? ""}`
          : (record.periodName ?? "—"),
    },
    {
      dataIndex: "paymentKind",
      title: t("payroll.fields.paymentKind"),
      align: "center",
      width: 130,
      render: (_, record) => (
        <Tag
          className="m-0!"
          color={record.paymentKind === "ADVANCE" ? "gold" : "blue"}
        >
          {t(`payroll.enums.paymentKind.${record.paymentKind}`, {
            defaultValue: record.paymentKind,
          })}
        </Tag>
      ),
    },
    {
      dataIndex: "sourceType",
      title: t("payroll.fields.source"),
      width: 200,
      align: "center",
      render: (_, record) => (
        <div className="flex flex-col">
          <span>
            {t(`payroll.enums.sourceType.${record.sourceType}`, {
              defaultValue: record.sourceType,
            })}
          </span>
          <span className="text-xs text-secondary-text">
            {record.bankAccountName ?? record.cashBoxName ?? "—"}
          </span>
        </div>
      ),
    },
    {
      dataIndex: "payrollDocNumber",
      title: t("payroll.fields.payrollDocument"),
      width: 150,
      align: "center",
      render: (value: string | null, record) =>
        record.payrollDocId ? (
          <Link to={`/main/payroll/documents/${record.payrollDocId}`}>
            {value ?? record.payrollDocId}
          </Link>
        ) : (
          "—"
        ),
    },
    {
      dataIndex: "employeeCount",
      title: t("payroll.fields.employeeCount"),
      align: "center",
      width: 120,
      render: (value: number | null, record) =>
        value ?? record.lines?.length ?? "—",
    },
    {
      dataIndex: "totalAmount",
      title: t("payroll.fields.totalAmount"),
      align: "center",
      width: 170,
      render: (value: number | null, record) => (
        <span className="font-semibold">
          {money(value)}{" "}
          <span className="text-xs font-normal text-secondary-text">
            {record.currencyName ?? ""}
          </span>
        </span>
      ),
    },
    {
      dataIndex: "statusId",
      title: t("settings.fields.status"),
      align: "center",
      width: 150,
      fixed: "right",
      render: (_, record) => (
        <ProcessStatusBadge
          statusId={record.statusId}
          statusName={record.statusName}
        />
      ),
    },
  ];

  return (
    <div className="w-full">
      <ListToolbar
        filters={
          <>
            <SearchFilter />
            <PayrollPeriodFilter />
            <SelectFilter
              paramKey="paymentKind"
              placeholder="payroll.fields.paymentKind"
              options={paymentKindOptions.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
              width={160}
            />
            <SelectFilter
              paramKey="sourceType"
              placeholder="payroll.fields.sourceType"
              options={sourceTypeOptions.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
              width={150}
            />
            <SelectFilter
              paramKey="statusId"
              placeholder="settings.fields.status"
              options={documentStatusFilterOptions}
              width={170}
            />
          </>
        }
        actions={
          <PermissionCard permission={payrollPaymentPermissions.create}>
            <Link to={`${LIST_PATH}/add`}>
              <Button type="primary" icon={<Plus className="size-4" />}>
                {t("payroll.payments.create")}
              </Button>
            </Link>
          </PermissionCard>
        }
        onRefresh={() => void refetch()}
        refreshing={isFetching}
      />

      <Card className="overflow-hidden border border-border">
        <Table<PayrollPayment>
          loading={isLoading || isFetching}
          columns={columns}
          dataSource={withRowNumbers(data?.items)}
          scroll={{ x: "max-content", y: "calc(100vh - 330px)" }}
          pagination={paginationProps(data?.total)}
          size="middle"
        />
      </Card>
    </div>
  );
}
