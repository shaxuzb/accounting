import InputTextArea from "@/components/fields/InputTextArea";
import SelectDate from "@/components/fields/SelectDate";
import Card from "@/components/ui/card/Card";
import {
  DocumentSummary,
  DocumentSummaryItem,
} from "@/components/ui/card/DocumentSummary";
import SectionCard from "@/components/ui/card/SectionCard";
import PayrollPeriodSelect from "@/modules/payroll/components/PayrollPeriodSelect";
import { isDraftStatus } from "@/modules/payroll/constants/options";
import { payrollTimesheetPermissions } from "@/modules/payroll/constants/permissions";
import { usePayrollPeriodLookup } from "@/modules/payroll/pages/periods/hooks";
import { useAppSelector } from "@/store/hooks";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { Button, Col, Form, Popconfirm, Row, Spin } from "antd";
import { useFormik } from "formik";
import {
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  CircleX,
  Clock,
  Save,
  Users,
  X,
} from "lucide-react";
import { useMemo } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import TimesheetCalendarView from "../components/TimesheetCalendarView";
import TimesheetLinesEditor from "../components/TimesheetLinesEditor";
import {
  useCancelPayrollTimesheet,
  useConfirmPayrollTimesheet,
  useCreatePayrollTimesheet,
  useGetDetailPayrollTimesheet,
  useUpdatePayrollTimesheet,
} from "../hooks";
import type { PayrollTimesheetForm } from "../types/form";
import { payrollTimesheetSchema } from "../types/schema";
import {
  createDefaultTimesheetForm,
  mapTimesheetToForm,
  summarizeTimesheet,
} from "../utils/timesheet";

const LIST_PATH = "/main/payroll/timesheets";

export default function PayrollTimesheetDetailPage() {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const isCreate = !id;
  const permissions = useAppSelector(
    (state) => state.auth.user?.user.permissions ?? [],
  );

  const detailQuery = useGetDetailPayrollTimesheet(id);
  const createMutation = useCreatePayrollTimesheet();
  const updateMutation = useUpdatePayrollTimesheet(id);
  const confirmMutation = useConfirmPayrollTimesheet(id);
  const cancelMutation = useCancelPayrollTimesheet(id);
  const { data: periods } = usePayrollPeriodLookup();

  const record = detailQuery.data;
  const statusId = record?.statusId ?? 1;
  const isDraft = isCreate || isDraftStatus(statusId);
  const canSave = isCreate
    ? permissions.includes(payrollTimesheetPermissions.create)
    : isDraft && permissions.includes(payrollTimesheetPermissions.update);
  const canConfirm =
    !isCreate &&
    isDraft &&
    permissions.includes(payrollTimesheetPermissions.confirm);
  const canCancel =
    !isCreate &&
    statusId !== 3 &&
    permissions.includes(payrollTimesheetPermissions.cancel);

  const initialValues = useMemo<PayrollTimesheetForm>(
    () => (isCreate ? createDefaultTimesheetForm() : mapTimesheetToForm(record)),
    [isCreate, record],
  );

  const formik = useFormik<PayrollTimesheetForm>({
    initialValues,
    enableReinitialize: true,
    validationSchema: payrollTimesheetSchema,
    onSubmit: async (values) => {
      const payload: PayrollTimesheetForm = {
        ...values,
        lines: values.lines.map((line) => ({
          ...line,
          normWorkDays: line.normWorkDays ?? 0,
          normWorkHours: line.normWorkHours ?? 0,
          workedDays: line.workedDays ?? 0,
          workedHours: line.workedHours ?? 0,
          leaveDays: line.leaveDays ?? 0,
          sickDays: line.sickDays ?? 0,
          absentDays: line.absentDays ?? 0,
          overtimeHours: line.overtimeHours ?? 0,
        })),
      };
      try {
        if (isCreate) {
          await createMutation.mutateAsync(payload);
          toast.success(t("payroll.messages.timesheetCreated"));
          navigate(LIST_PATH, { replace: true });
          return;
        }
        await updateMutation.mutateAsync(payload);
        toast.success(t("payroll.messages.timesheetSaved"));
        navigate(LIST_PATH, { replace: true });
      } catch (error) {
        errorHandlers(error);
      }
    },
  });

  const selectedPeriod = useMemo(
    () =>
      (periods ?? []).find((period) => period.id === formik.values.periodId),
    [periods, formik.values.periodId],
  );
  const isPeriodClosed = selectedPeriod?.status === "CLOSED";
  const visibleCalendar = record?.calendar ?? null;
  const totals = useMemo(
    () => summarizeTimesheet(formik.values.lines),
    [formik.values.lines],
  );

  const handleSave = async () => {
    const errors = await formik.validateForm();
    if (Object.keys(errors).length > 0) {
      formik.setTouched(
        {
          periodId: true,
          docDate: true,
          lines: formik.values.lines.map(() => ({ employeeId: true })),
        },
        false,
      );
      toast.error(t("payroll.messages.fillRequired"));
      return;
    }
    await formik.submitForm();
  };

  const runMutation = async (
    action: () => Promise<unknown>,
    successKey: string,
  ) => {
    try {
      await action();
      toast.success(t(successKey));
    } catch (error) {
      errorHandlers(error);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isBusy =
    isSaving || confirmMutation.isPending || cancelMutation.isPending;

  if (detailQuery.isLoading && !isCreate) {
    return (
      <div className="flex justify-center p-10">
        <Spin />
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-4">
      <SectionCard
        title="payroll.timesheets.headerTitle"
        description="payroll.timesheets.headerHint"
        icon={<CalendarDays className="size-4" />}
      >
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} md={8}>
              <PayrollPeriodSelect
                formik={formik}
                fieldName="periodId"
                onlyOpen={isCreate}
                required
                disabled={!isDraft || !isCreate}
              />
            </Col>
            <Col xs={24} md={8}>
              <SelectDate
                formik={formik}
                fieldName="docDate"
                label="payroll.fields.docDate"
                required
                disabled={!isDraft}
              />
            </Col>
            <Col xs={24} md={8}>
              <InputTextArea
                formik={formik}
                fieldName="note"
                label="payroll.fields.note"
                rows={1}
                disabled={!isDraft}
              />
            </Col>
          </Row>
        </Form>
      </SectionCard>

      <DocumentSummary>
        <DocumentSummaryItem
          icon={<Users className="size-5" />}
          label={t("payroll.fields.employeeCount")}
          value={totals.employees}
          emphasized
        />
        <DocumentSummaryItem
          icon={<CalendarDays className="size-5" />}
          label={t("payroll.fields.totalWorkedDays")}
          value={totals.workedDays}
        />
        <DocumentSummaryItem
          icon={<Clock className="size-5" />}
          label={t("payroll.fields.totalWorkedHours")}
          value={totals.workedHours}
        />
        <DocumentSummaryItem
          icon={<CalendarClock className="size-5" />}
          label={t("payroll.fields.normWorkDays")}
          value={selectedPeriod?.normWorkDays ?? "—"}
        />
        <DocumentSummaryItem
          icon={<Clock className="size-5" />}
          label={t("payroll.fields.normWorkHours")}
          value={selectedPeriod?.normWorkHours ?? "—"}
        />
      </DocumentSummary>

      {visibleCalendar ? (
        <TimesheetCalendarView calendar={visibleCalendar} />
      ) : (
        <TimesheetLinesEditor
          formik={formik}
          disabled={!isDraft}
          normWorkDays={selectedPeriod?.normWorkDays}
          normWorkHours={selectedPeriod?.normWorkHours}
          periodId={formik.values.periodId}
        />
      )}

      {(isCreate || canSave || canConfirm || canCancel) && (
        <Card className="sticky bottom-0 z-20 border border-border bg-primary-bg/95 px-4 py-3 shadow-sm backdrop-blur sm:px-5">
          <div className="flex flex-wrap justify-end gap-3">
            {isCreate && (
              <Button
                icon={<X className="size-4" />}
                disabled={isBusy}
                onClick={() => navigate(LIST_PATH)}
              >
                {t("common.cancel")}
              </Button>
            )}

            {canCancel && (
              <Popconfirm
                title={t("payroll.timesheets.cancelTitle")}
                description={t("payroll.timesheets.cancelText")}
                okText={t("payroll.actions.cancel")}
                cancelText={t("common.cancel")}
                okButtonProps={{ danger: true }}
                onConfirm={() =>
                  runMutation(
                    () => cancelMutation.mutateAsync(),
                    "payroll.messages.timesheetCancelled",
                  )
                }
              >
                <Button
                  danger
                  icon={<CircleX className="size-4" />}
                  loading={cancelMutation.isPending}
                  disabled={isSaving || confirmMutation.isPending}
                >
                  {t("payroll.actions.cancel")}
                </Button>
              </Popconfirm>
            )}

            {canSave && (
              <Button
                type={isCreate || !canConfirm ? "primary" : "default"}
                icon={<Save className="size-4" />}
                loading={isSaving}
                disabled={
                  isPeriodClosed ||
                  confirmMutation.isPending ||
                  cancelMutation.isPending
                }
                onClick={handleSave}
              >
                {t("common.save")}
              </Button>
            )}

            {canConfirm && (
              <Popconfirm
                title={t("payroll.timesheets.confirmTitle")}
                description={t("payroll.timesheets.confirmText")}
                okText={t("payroll.actions.confirm")}
                cancelText={t("common.cancel")}
                onConfirm={() =>
                  runMutation(
                    () => confirmMutation.mutateAsync(),
                    "payroll.messages.timesheetConfirmed",
                  )
                }
              >
                <Button
                  type="primary"
                  icon={<CheckCircle2 className="size-4" />}
                  loading={confirmMutation.isPending}
                  disabled={isSaving || cancelMutation.isPending}
                >
                  {t("payroll.actions.confirm")}
                </Button>
              </Popconfirm>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
