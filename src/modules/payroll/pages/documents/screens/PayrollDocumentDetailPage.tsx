import Card from "@/components/ui/card/Card";
import DocumentActionsCard from "@/components/ui/card/DocumentActionsCard";
import {
  DocumentSummary,
  DocumentSummaryItem,
} from "@/components/ui/card/DocumentSummary";
import SectionCard from "@/components/ui/card/SectionCard";
import PayrollDocumentHeader from "@/modules/payroll/components/PayrollDocumentHeader";
import { isDraftStatus } from "@/modules/payroll/constants/options";
import { payrollDocumentPermissions } from "@/modules/payroll/constants/permissions";
import { displayDate, money } from "@/modules/payroll/utils/format";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { Alert, Empty, Input, Spin, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import {
  Banknote,
  CheckCircle2,
  CircleX,
  HandCoins,
  Landmark,
  Receipt,
  Trash2,
  TrendingDown,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import PayrollCalcLinesTable from "../components/PayrollCalcLinesTable";
import {
  useCancelPayrollDocument,
  useConfirmPayrollDocument,
  useDeletePayrollDocument,
  useGetDetailPayrollDocument,
} from "../hooks";
import type { PayrollDocumentEmployee } from "../types/type";

const LIST_PATH = "/main/payroll/documents";

export default function PayrollDocumentDetailPage() {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const detailQuery = useGetDetailPayrollDocument(id);
  const confirmMutation = useConfirmPayrollDocument(id);
  const cancelMutation = useCancelPayrollDocument(id);
  const deleteMutation = useDeletePayrollDocument();

  const record = detailQuery.data;
  const statusId = record?.statusId ?? 1;
  const isDraft = isDraftStatus(statusId);
  const currency = record?.currencyName ?? "";

  const employees = useMemo(() => {
    const list = record?.employees ?? [];
    if (!search.trim()) return list;
    const query = search.trim().toLowerCase();
    return list.filter((employee) =>
      [employee.employeeName, employee.employeeNumber, employee.departmentName]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [record?.employees, search]);

  const runMutation = async (
    action: () => Promise<unknown>,
    successKey: string,
    redirect = false,
  ) => {
    try {
      await action();
      toast.success(t(successKey));
      if (redirect) navigate(LIST_PATH, { replace: true });
    } catch (error) {
      errorHandlers(error);
    }
  };

  const columns: TableColumnsType<PayrollDocumentEmployee> = [
    {
      dataIndex: "employeeName",
      title: t("payroll.fields.employee"),
      minWidth: 230,
      fixed: "left",
      render: (value: string | null, employee) => (
        <div className="flex flex-col">
          <span className="font-medium">{value ?? employee.employeeId}</span>
          <span className="text-xs text-secondary-text">
            {[employee.employeeNumber, employee.departmentName]
              .filter(Boolean)
              .join(" • ")}
          </span>
        </div>
      ),
    },
    {
      dataIndex: "workedDays",
      title: t("payroll.fields.workedDays"),
      align: "center",
      width: 110,
      render: (value: number | null) => value ?? "—",
    },
    {
      dataIndex: "workedHours",
      title: t("payroll.fields.workedHours"),
      align: "center",
      width: 120,
      render: (value: number | null) => value ?? "—",
    },
    {
      dataIndex: "grossAmount",
      title: t("payroll.fields.grossAmount"),
      align: "right",
      width: 150,
      render: (value: number) => money(value),
    },
    {
      dataIndex: "deductionAmount",
      title: t("payroll.fields.deductionAmount"),
      align: "right",
      width: 150,
      render: (value: number) => (
        <span className="text-red-500">−{money(value)}</span>
      ),
    },
    {
      dataIndex: "employerTaxAmount",
      title: t("payroll.fields.employerTaxAmount"),
      align: "right",
      width: 160,
      render: (value: number) => money(value),
    },
    {
      dataIndex: "advanceAmount",
      title: t("payroll.fields.advanceAmount"),
      align: "right",
      width: 140,
      render: (value: number | null) => money(value),
    },
    {
      dataIndex: "netAmount",
      title: t("payroll.fields.netAmount"),
      align: "right",
      width: 150,
      render: (value: number) => (
        <span className="font-semibold">{money(value)}</span>
      ),
    },
    {
      dataIndex: "payableAmount",
      title: t("payroll.fields.payableAmount"),
      align: "right",
      width: 160,
      render: (value: number) => (
        <span className="font-semibold text-primary">{money(value)}</span>
      ),
    },
    {
      dataIndex: "outstandingAmount",
      title: t("payroll.fields.outstandingAmount"),
      align: "right",
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
  ];

  if (detailQuery.isLoading) {
    return (
      <div className="flex justify-center p-10">
        <Spin />
      </div>
    );
  }

  if (!record) {
    return (
      <Card className="border border-border p-10">
        <Empty description={t("payroll.documents.notFound")} />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <PayrollDocumentHeader
        title="payroll.documents.title"
        docNumber={record.docNumber}
        docDate={record.docDate}
        statusId={record.statusId}
        statusName={record.statusName}
        onBack={() => navigate(LIST_PATH)}
        extra={
          <Tag
            className="m-0!"
            color={record.documentKind === "CORRECTION" ? "purple" : "blue"}
          >
            {t(`payroll.enums.documentKind.${record.documentKind}`, {
              defaultValue: record.documentKind,
            })}
          </Tag>
        }
      />

      {record.documentKind === "CORRECTION" && record.correctionOfDocNumber && (
        <Alert
          type="info"
          showIcon
          message={t("payroll.documents.correctionOf", {
            docNumber: record.correctionOfDocNumber,
          })}
        />
      )}

      {isDraft && (
        <Alert
          type="warning"
          showIcon
          message={t("payroll.documents.draftWarning")}
        />
      )}

      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <DocumentSummary>
            <DocumentSummaryItem
              icon={<Users className="size-5" />}
              label={t("payroll.fields.employeeCount")}
              value={record.employeeCount ?? record.employees?.length ?? "—"}
            />
            <DocumentSummaryItem
              icon={<Banknote className="size-5" />}
              label={t("payroll.fields.grossAmount")}
              value={`${money(record.grossAmount)} ${currency}`}
            />
            <DocumentSummaryItem
              icon={<TrendingDown className="size-5" />}
              label={t("payroll.fields.deductionAmount")}
              value={`${money(record.deductionAmount)} ${currency}`}
              iconClassName="text-red-500"
            />
            <DocumentSummaryItem
              icon={<Landmark className="size-5" />}
              label={t("payroll.fields.employerTaxAmount")}
              value={`${money(record.employerTaxAmount)} ${currency}`}
            />
            <DocumentSummaryItem
              icon={<HandCoins className="size-5" />}
              label={t("payroll.fields.payableAmount")}
              value={`${money(record.payableAmount)} ${currency}`}
              emphasized
            />
          </DocumentSummary>

          <SectionCard
            title="payroll.documents.employeesTitle"
            description="payroll.documents.employeesHint"
            icon={<Receipt className="size-4" />}
            bodyClassName="p-0!"
            extra={
              <Input.Search
                allowClear
                placeholder={t("payroll.placeholders.searchEmployee")}
                onChange={(event) => setSearch(event.target.value)}
                style={{ width: 240 }}
              />
            }
          >
            <Table<PayrollDocumentEmployee>
              columns={columns}
              dataSource={employees.map((employee, index) => ({
                ...employee,
                key: employee.id ?? employee.employeeId ?? index,
              }))}
              pagination={false}
              size="small"
              scroll={{ x: "max-content", y: 520 }}
              expandable={{
                expandedRowRender: (employee) => (
                  <div className="rounded-lg border border-border p-2">
                    <PayrollCalcLinesTable lines={employee.calcLines} />
                  </div>
                ),
                rowExpandable: (employee) =>
                  Boolean(employee.calcLines?.length),
              }}
              locale={{
                emptyText: (
                  <Empty description={t("payroll.documents.noEmployees")} />
                ),
              }}
            />
          </SectionCard>
        </div>

        <div className="space-y-4">
          <DocumentActionsCard
            actions={[
              {
                key: "confirm",
                label: "payroll.actions.confirmAndPost",
                icon: <CheckCircle2 className="size-4" />,
                type: "primary",
                onClick: () =>
                  runMutation(
                    () => confirmMutation.mutateAsync(),
                    "payroll.messages.documentConfirmed",
                  ),
                loading: confirmMutation.isPending,
                hidden: !isDraft,
                permission: payrollDocumentPermissions.confirm,
                confirm: {
                  title: "payroll.documents.confirmTitle",
                  content: "payroll.documents.confirmText",
                  okText: "payroll.actions.confirm",
                },
                hint: "payroll.documents.confirmHint",
              },
              {
                key: "cancel",
                label: "payroll.actions.cancel",
                icon: <CircleX className="size-4" />,
                danger: true,
                onClick: () =>
                  runMutation(
                    () => cancelMutation.mutateAsync(),
                    "payroll.messages.documentCancelled",
                  ),
                loading: cancelMutation.isPending,
                hidden: statusId === 3,
                permission: payrollDocumentPermissions.cancel,
                confirm: {
                  title: "payroll.documents.cancelTitle",
                  content: "payroll.documents.cancelText",
                  okText: "payroll.actions.cancel",
                  danger: true,
                },
              },
              {
                key: "delete",
                label: "common.delete",
                icon: <Trash2 className="size-4" />,
                danger: true,
                onClick: () =>
                  runMutation(
                    () => deleteMutation.mutateAsync(record.id),
                    "payroll.messages.documentDeleted",
                    true,
                  ),
                loading: deleteMutation.isPending,
                hidden: !isDraft,
                permission: payrollDocumentPermissions.delete,
                confirm: {
                  title: "payroll.documents.deleteTitle",
                  content: "payroll.documents.deleteText",
                  okText: "common.delete",
                  danger: true,
                },
              },
            ]}
          />

          <SectionCard title="payroll.common.info">
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-secondary-text">
                  {t("payroll.fields.period")}
                </dt>
                <dd className="font-medium">
                  {record.periodMonth
                    ? `${t(`payroll.months.${record.periodMonth}`, {
                        defaultValue: record.periodName ?? "",
                      })} ${record.periodYear ?? ""}`
                    : (record.periodName ?? "—")}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-secondary-text">
                  {t("payroll.fields.docDate")}
                </dt>
                <dd className="font-medium">{displayDate(record.docDate)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-secondary-text">
                  {t("payroll.fields.netAmount")}
                </dt>
                <dd className="font-medium">{money(record.netAmount)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-secondary-text">
                  {t("payroll.fields.paidAmount")}
                </dt>
                <dd className="font-medium">{money(record.paidAmount)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-secondary-text">
                  {t("payroll.fields.outstandingAmount")}
                </dt>
                <dd className="font-semibold text-primary">
                  {money(record.outstandingAmount)}
                </dd>
              </div>
              {record.note && (
                <div className="border-t border-border pt-2">
                  <dt className="text-secondary-text">
                    {t("payroll.fields.note")}
                  </dt>
                  <dd className="mt-1">{record.note}</dd>
                </div>
              )}
            </dl>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
