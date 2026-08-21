import Card from "@/components/ui/card/Card";
import {
  DocumentSummary,
  DocumentSummaryItem,
} from "@/components/ui/card/DocumentSummary";
import SectionCard from "@/components/ui/card/SectionCard";
import { isDraftStatus } from "@/modules/payroll/constants/options";
import { payrollDocumentPermissions } from "@/modules/payroll/constants/permissions";
import { displayDate, money } from "@/modules/payroll/utils/format";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import { useAppSelector } from "@/store/hooks";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { Alert, Button, Empty, Input, Popconfirm, Spin, Table, Tag } from "antd";
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
import type { PayrollDocumentLine } from "../types/type";

const LIST_PATH = "/main/payroll/documents";

export default function PayrollDocumentDetailPage() {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const permissions = useAppSelector(
    (state) => state.auth.user?.user.permissions ?? [],
  );

  const detailQuery = useGetDetailPayrollDocument(id);
  const confirmMutation = useConfirmPayrollDocument(id);
  const cancelMutation = useCancelPayrollDocument(id);
  const deleteMutation = useDeletePayrollDocument();

  const record = detailQuery.data;
  const statusId = record?.statusId ?? 1;
  const isDraft = isDraftStatus(statusId);
  const currency = record?.currencyName ?? "";
  const canConfirm =
    isDraft && permissions.includes(payrollDocumentPermissions.confirm);
  const canCancel =
    statusId !== 3 && permissions.includes(payrollDocumentPermissions.cancel);
  const canDelete =
    isDraft && permissions.includes(payrollDocumentPermissions.delete);

  const employees = useMemo(() => {
    const list = record?.lines ?? [];
    if (!search.trim()) return list;
    const query = search.trim().toLowerCase();
    return list.filter((employee) =>
      [employee.employeeName, employee.employeeNumber, employee.departmentName]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [record?.lines, search]);

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

  const columns: TableColumnsType<PayrollDocumentLine> = [
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
      align: "center",
      width: 150,
      render: (value: number) => money(value),
    },
    {
      dataIndex: "deductionAmount",
      title: t("payroll.fields.deductionAmount"),
      align: "center",
      width: 150,
      render: (value: number) => (
        <span className="text-red-500">−{money(value)}</span>
      ),
    },
    {
      dataIndex: "employerTaxAmount",
      title: t("payroll.fields.employerTaxAmount"),
      align: "center",
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
    <div className="min-w-0 space-y-4">
      <SectionCard
        title="payroll.documents.detailTitle"
        description={record.docNumber ?? t("payroll.common.noNumber")}
        icon={<Receipt className="size-4" />}
        extra={
          <ProcessStatusBadge
            statusId={record.statusId}
            statusName={record.statusName}
          />
        }
      >
        <dl className="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-secondary-text">
              {t("payroll.fields.docNumber")}
            </dt>
            <dd className="mt-1 font-medium">
              {record.docNumber ?? t("payroll.common.noNumber")}
            </dd>
          </div>
          <div>
            <dt className="text-secondary-text">
              {t("payroll.fields.docDate")}
            </dt>
            <dd className="mt-1 font-medium">{displayDate(record.docDate)}</dd>
          </div>
          <div>
            <dt className="text-secondary-text">
              {t("payroll.fields.period")}
            </dt>
            <dd className="mt-1 font-medium">
              {record.periodMonth
                ? `${t(`payroll.months.${record.periodMonth}`, {
                    defaultValue: record.periodName ?? "",
                  })} ${record.periodYear ?? ""}`
                : (record.periodName ?? "—")}
            </dd>
          </div>
          <div>
            <dt className="text-secondary-text">
              {t("payroll.fields.documentKind")}
            </dt>
            <dd className="mt-1">
              <Tag
                className="m-0!"
                color={record.documentKind === "CORRECTION" ? "purple" : "blue"}
              >
                {t(`payroll.enums.documentKind.${record.documentKind}`, {
                  defaultValue: record.documentKind,
                })}
              </Tag>
            </dd>
          </div>
          <div>
            <dt className="text-secondary-text">
              {t("payroll.fields.netAmount")}
            </dt>
            <dd className="mt-1 font-medium">{money(record.netAmount)} {currency}</dd>
          </div>
          <div>
            <dt className="text-secondary-text">
              {t("payroll.fields.paidAmount")}
            </dt>
            <dd className="mt-1 font-medium">{money(record.paidAmount)} {currency}</dd>
          </div>
          <div>
            <dt className="text-secondary-text">
              {t("payroll.fields.outstandingAmount")}
            </dt>
            <dd className="mt-1 font-semibold text-primary">
              {money(record.outstandingAmount)} {currency}
            </dd>
          </div>
          {record.note && (
            <div className="sm:col-span-2 lg:col-span-4">
              <dt className="text-secondary-text">{t("payroll.fields.note")}</dt>
              <dd className="mt-1">{record.note}</dd>
            </div>
          )}
        </dl>
      </SectionCard>

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

      <DocumentSummary>
        <DocumentSummaryItem
          icon={<Users className="size-5" />}
          label={t("payroll.fields.employeeCount")}
          value={record.employeeCount ?? record.lines?.length ?? "—"}
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
        className="min-w-0 overflow-hidden"
        title="payroll.documents.employeesTitle"
        description="payroll.documents.employeesHint"
        icon={<Users className="size-4" />}
        bodyClassName="min-w-0 overflow-hidden p-0!"
        extra={
          <Input.Search
            allowClear
            placeholder={t("payroll.placeholders.searchEmployee")}
            onChange={(event) => setSearch(event.target.value)}
            style={{ width: 240 }}
          />
        }
      >
        <Table<PayrollDocumentLine>
          columns={columns}
          dataSource={employees.map((employee, index) => ({
            ...employee,
            key: employee.id ?? employee.employeeId ?? index,
          }))}
          pagination={false}
          size="small"
          scroll={{ x: 1500, y: 520 }}
          expandable={{
            expandedRowRender: (employee) => (
              <div className="min-w-0 overflow-hidden rounded-lg border border-border p-2">
                <PayrollCalcLinesTable lines={employee.calcLines} />
              </div>
            ),
            rowExpandable: (employee) => Boolean(employee.calcLines?.length),
          }}
          locale={{
            emptyText: (
              <Empty description={t("payroll.documents.noEmployees")} />
            ),
          }}
        />
      </SectionCard>

      {(canConfirm || canCancel || canDelete) && (
        <Card className="sticky bottom-0 z-20 border border-border bg-primary-bg/95 px-4 py-3 shadow-sm backdrop-blur sm:px-5">
          <div className="flex flex-wrap justify-end gap-3">
            {canCancel && (
              <Popconfirm
                title={t("payroll.documents.cancelTitle")}
                description={t("payroll.documents.cancelText")}
                okText={t("payroll.actions.cancel")}
                cancelText={t("common.cancel")}
                okButtonProps={{ danger: true }}
                onConfirm={() =>
                  runMutation(
                    () => cancelMutation.mutateAsync(),
                    "payroll.messages.documentCancelled",
                  )
                }
              >
                <Button
                  danger
                  icon={<CircleX className="size-4" />}
                  loading={cancelMutation.isPending}
                  disabled={confirmMutation.isPending || deleteMutation.isPending}
                >
                  {t("payroll.actions.cancel")}
                </Button>
              </Popconfirm>
            )}

            {canDelete && (
              <Popconfirm
                title={t("payroll.documents.deleteTitle")}
                description={t("payroll.documents.deleteText")}
                okText={t("common.delete")}
                cancelText={t("common.cancel")}
                okButtonProps={{ danger: true }}
                onConfirm={() =>
                  runMutation(
                    () => deleteMutation.mutateAsync(record.id),
                    "payroll.messages.documentDeleted",
                    true,
                  )
                }
              >
                <Button
                  danger
                  icon={<Trash2 className="size-4" />}
                  loading={deleteMutation.isPending}
                  disabled={confirmMutation.isPending || cancelMutation.isPending}
                >
                  {t("common.delete")}
                </Button>
              </Popconfirm>
            )}

            {canConfirm && (
              <Popconfirm
                title={t("payroll.documents.confirmTitle")}
                description={t("payroll.documents.confirmText")}
                okText={t("payroll.actions.confirm")}
                cancelText={t("common.cancel")}
                onConfirm={() =>
                  runMutation(
                    () => confirmMutation.mutateAsync(),
                    "payroll.messages.documentConfirmed",
                  )
                }
              >
                <Button
                  type="primary"
                  icon={<CheckCircle2 className="size-4" />}
                  loading={confirmMutation.isPending}
                  disabled={cancelMutation.isPending || deleteMutation.isPending}
                >
                  {t("payroll.actions.confirmAndPost")}
                </Button>
              </Popconfirm>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
