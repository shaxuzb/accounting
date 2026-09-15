import AccountingEntriesButton from "@/modules/accounting/components/AccountingEntriesButton";
import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import ListToolbar from "@/components/ui/filters/ListToolbar";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import SelectFilter from "@/components/ui/filters/SelectFilter";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import PayrollPeriodFilter from "@/modules/payroll/components/PayrollPeriodFilter";
import {
  documentKindOptions,
  documentStatusFilterOptions,
} from "@/modules/payroll/constants/options";
import { payrollDocumentPermissions } from "@/modules/payroll/constants/permissions";
import { displayDate, money } from "@/modules/payroll/utils/format";
import ListPagination from "@/components/ui/table/ListPagination";
import { usePaginationParams } from "@/shared/hooks/usePaginationParams";
import { Button, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import { Calculator, ReceiptText } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useSearchParams } from "react-router";
import PayrollCalculateModal from "../components/PayrollCalculateModal";
import { payrollAccountingEntriesReportDocumentTypeId } from "../constants/endpoints";
import { useGetPayrollDocuments } from "../hooks";
import type { PayrollDocument } from "../types/type";

const LIST_PATH = "/main/payroll/documents";

export default function PayrollDocumentListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { withRowNumbers, paginationProps } = usePaginationParams();
  const { data, isLoading, isFetching, refetch } =
    useGetPayrollDocuments(searchParams);
  const [isCalculateOpen, setIsCalculateOpen] = useState(false);

  const columns: TableColumnsType<PayrollDocument> = [
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
      align: "center",
      width: 160,
      render: (_, record) =>
        record.periodMonth
          ? `${t(`payroll.months.${record.periodMonth}`, {
              defaultValue: record.periodName ?? "",
            })} ${record.periodYear ?? ""}`
          : (record.periodName ?? "—"),
    },
    {
      dataIndex: "documentKind",
      title: t("payroll.fields.documentKind"),
      align: "center",
      width: 140,
      render: (_, record) => (
        <Tag
          className="m-0!"
          color={record.documentKind === "CORRECTION" ? "purple" : "blue"}
        >
          {t(`payroll.enums.documentKind.${record.documentKind}`, {
            defaultValue: record.documentKind,
          })}
        </Tag>
      ),
    },
    {
      dataIndex: "employeeCount",
      title: t("payroll.fields.employeeCount"),
      align: "center",
      width: 120,
      render: (value: number | null) => value ?? "—",
    },
    {
      dataIndex: "grossAmount",
      title: t("payroll.fields.grossAmount"),
      align: "center",
      width: 150,
      render: (value: number | null) => money(value),
    },
    {
      dataIndex: "deductionAmount",
      title: t("payroll.fields.deductionAmount"),
      align: "center",
      width: 150,
      render: (value: number | null) => (
        <span className="text-red-500">−{money(value)}</span>
      ),
    },
    {
      dataIndex: "payableAmount",
      title: t("payroll.fields.payableAmount"),
      align: "center",
      width: 160,
      render: (value: number | null) => (
        <span className="font-semibold">{money(value)}</span>
      ),
    },
    {
      dataIndex: "outstandingAmount",
      title: t("payroll.fields.outstandingAmount"),
      align: "center",
      width: 160,
      render: (value: number | null) =>
        value == null ? (
          "—"
        ) : (
          <Tag className="m-0!" color={value > 0 ? "orange" : "green"}>
            {money(value)}
          </Tag>
        ),
    },
    {
      dataIndex: "accountingEntriesReport",
      title: t("common.accountingEntries"),
      align: "center",
      width: 120,
      render: (_, record) => (
        <AccountingEntriesButton
          documentTypeId={payrollAccountingEntriesReportDocumentTypeId}
          documentId={record.id}
          statusId={record.statusId}
          icon={<ReceiptText className="size-4" />}
        />
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
              paramKey="documentKind"
              placeholder="payroll.fields.documentKind"
              options={documentKindOptions.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
              width={170}
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
          <PermissionCard permission={payrollDocumentPermissions.calculate}>
            <Button
              type="primary"
              icon={<Calculator className="size-4" />}
              onClick={() => setIsCalculateOpen(true)}
            >
              {t("payroll.documents.calculate")}
            </Button>
          </PermissionCard>
        }
        onRefresh={() => void refetch()}
        refreshing={isFetching}
      />

      <Card className="overflow-hidden border border-border">
        <Table<PayrollDocument>
          loading={isLoading || isFetching}
          columns={columns}
          dataSource={withRowNumbers(data?.items)}
          scroll={{ x: "max-content", y: "calc(100vh - 330px)" }}
          pagination={false}
          size="middle"
          onRow={(record) => ({
            onDoubleClick: () => navigate(`${LIST_PATH}/${record.id}`),
          })}
        />
        <ListPagination {...paginationProps(data?.total)} />
      </Card>

      <PayrollCalculateModal
        open={isCalculateOpen}
        onClose={() => setIsCalculateOpen(false)}
        onCreated={(id) => navigate(`${LIST_PATH}/${id}`)}
      />
    </div>
  );
}
