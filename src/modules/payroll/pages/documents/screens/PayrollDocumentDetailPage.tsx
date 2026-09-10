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
  RotateCcw,
  Trash2,
  TrendingDown,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import PayrollCalcLinesTable from "../components/PayrollCalcLinesTable";
import PayrollTaxLinesTable from "../components/PayrollTaxLinesTable";
import {
  useCancelPayrollDocument,
  useConfirmPayrollDocument,
  useDeletePayrollDocument,
  useGetDetailPayrollDocument,
  usePayrollChartAccounts,
  useRecalculatePayrollDocument,
} from "../hooks";
import { payrollDocumentAccountFields } from "../constants/accounts";
import type { PayrollDocument, PayrollDocumentLine } from "../types/type";

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
  const recalculateMutation = useRecalculatePayrollDocument(id);

  const record = detailQuery.data;
  const chartAccountsQuery = usePayrollChartAccounts(Boolean(record));
  const accountById = useMemo(
    () =>
      new Map(
        (chartAccountsQuery.data ?? []).map((account) => [
          account.id,
          account,
        ]),
      ),
    [chartAccountsQuery.data],
  );
  const statusId = record?.statusId ?? 1;
  const isDraft = isDraftStatus(statusId);
  const currency = record?.currencyName ?? "";
  const canConfirm =
    isDraft && permissions.includes(payrollDocumentPermissions.confirm);
  const canCancel =
    statusId !== 3 && permissions.includes(payrollDocumentPermissions.cancel);
  const canDelete =
    isDraft && permissions.includes(payrollDocumentPermissions.delete);
  const canRecalculate =
    statusId === 2 &&
    !record?.hasPendingRecalculation &&
    permissions.includes(payrollDocumentPermissions.calculate);

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

  const renderAccount = (accountId: number | null | undefined) => {
    if (accountId == null) return "—";
    const account = accountById.get(accountId);
    const number = account?.number ?? account?.code;

    return (
      <div className="flex flex-col">
        <span className="font-medium">{number ?? `#${accountId}`}</span>
        {account?.name && (
          <span className="text-xs text-secondary-text">{account.name}</span>
        )}
      </div>
    );
  };

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
          {record.documentKind === "CORRECTION" && (
            <div>
              <dt className="text-secondary-text">{t("payroll.fields.correctionPayoutMode")}</dt>
              <dd className="mt-1 font-medium">{record.correctionPayoutMode ?? "SEPARATE"}</dd>
            </div>
          )}
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
        title="payroll.documents.accountsTitle"
        description="payroll.documents.accountsSavedHint"
        icon={<Landmark className="size-4" />}
      >
        <dl className="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {payrollDocumentAccountFields.map((account) => (
            <div key={account.fieldName}>
              <dt className="text-secondary-text">{t(account.label)}</dt>
              <dd className="mt-1">
                {renderAccount(
                  record[account.fieldName as keyof PayrollDocument] as
                    | number
                    | null
                    | undefined,
                )}
              </dd>
            </div>
          ))}
        </dl>
        {chartAccountsQuery.isFetching && (
          <div className="mt-3 text-xs text-secondary-text">
            {t("payroll.documents.accountsLoading")}
          </div>
        )}
      </SectionCard>

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
              <div className="min-w-0 space-y-3 overflow-hidden rounded-lg border border-border p-2">
                <div className="grid gap-2 text-xs sm:grid-cols-3 lg:grid-cols-6">
                  <div><span className="text-secondary-text">{t("payroll.fields.paidLeaveDays", { defaultValue: "Paid leave days" })}</span><div className="font-medium">{employee.paidLeaveDays ?? 0}</div></div>
                  <div><span className="text-secondary-text">{t("payroll.fields.paidSickDays", { defaultValue: "Paid sick days" })}</span><div className="font-medium">{employee.paidSickDays ?? 0}</div></div>
                  <div><span className="text-secondary-text">{t("payroll.fields.overtimeHours", { defaultValue: "Overtime hours" })}</span><div className="font-medium">{employee.overtimeHours ?? 0}</div></div>
                  <div><span className="text-secondary-text">{t("payroll.fields.nightHours", { defaultValue: "Night hours" })}</span><div className="font-medium">{employee.nightHours ?? 0}</div></div>
                  <div><span className="text-secondary-text">{t("payroll.fields.holidayHours", { defaultValue: "Holiday hours" })}</span><div className="font-medium">{employee.holidayHours ?? 0}</div></div>
                  <div><span className="text-secondary-text">{t("payroll.fields.weekendHours", { defaultValue: "Weekend hours" })}</span><div className="font-medium">{employee.weekendHours ?? 0}</div></div>
                </div>
                {employee.segments?.length ? (
                  <Table
                    size="small"
                    pagination={false}
                    rowKey={(segment) => segment.id ?? `${segment.segmentStartDate}-${segment.employmentId}`}
                    dataSource={employee.segments}
                    columns={[
                      { title: t("payroll.fields.segment", { defaultValue: "Segment" }), key: "range", render: (_: unknown, segment) => `${segment.segmentStartDate} – ${segment.segmentEndDate}` },
                      { title: t("payroll.fields.monthlySalary", { defaultValue: "Monthly salary" }), dataIndex: "monthlySalary", render: (value: number) => money(value) },
                      { title: t("payroll.fields.employmentRate", { defaultValue: "Rate" }), dataIndex: "employmentRate" },
                      { title: t("payroll.fields.workedDays", { defaultValue: "Worked days" }), dataIndex: "workedDays" },
                      { title: t("payroll.fields.workedHours", { defaultValue: "Worked hours" }), dataIndex: "workedHours" },
                      { title: t("payroll.fields.normWorkHours", { defaultValue: "Norm hours" }), dataIndex: "normWorkHours" },
                    ]}
                  />
                ) : null}
                <PayrollCalcLinesTable
                  lines={employee.calcLines}
                  accountById={accountById}
                />
                {employee.taxLines?.length ? (
                  <div>
                    <div className="mb-1 text-xs font-semibold text-secondary-text">{t("payroll.documents.taxLinesTitle", { defaultValue: "Soliq registri" })}</div>
                    <PayrollTaxLinesTable lines={employee.taxLines} />
                  </div>
                ) : null}
              </div>
            ),
            rowExpandable: (employee) => Boolean(employee.calcLines?.length || employee.taxLines?.length || employee.segments?.length),
          }}
          locale={{
            emptyText: (
              <Empty description={t("payroll.documents.noEmployees")} />
            ),
          }}
        />
      </SectionCard>

      {record?.hasPendingRecalculation && (
        <Alert
          className="mb-4"
          type="info"
          showIcon
          message={t("payroll.documents.recalculationPending")}
          description={t("payroll.documents.recalculationPendingText", {
            id: record.pendingRecalculationId ?? "—",
          })}
        />
      )}

      {(canConfirm || canCancel || canDelete || canRecalculate) && (
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

            {canRecalculate && (
              <Popconfirm
                title={t("payroll.documents.recalculateTitle")}
                description={t("payroll.documents.recalculateText")}
                okText={t("payroll.documents.recalculate")}
                cancelText={t("common.cancel")}
                onConfirm={() =>
                  runMutation(
                    () => recalculateMutation.mutateAsync(),
                    "payroll.messages.recalculationQueued",
                  )
                }
              >
                <Button
                  icon={<RotateCcw className="size-4" />}
                  loading={recalculateMutation.isPending}
                  disabled={confirmMutation.isPending || cancelMutation.isPending || deleteMutation.isPending}
                >
                  {t("payroll.documents.recalculate")}
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
