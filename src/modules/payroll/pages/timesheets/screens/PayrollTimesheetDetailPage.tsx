import InputTextArea from "@/components/fields/InputTextArea";
import SelectDate from "@/components/fields/SelectDate";
import DocumentActionsCard from "@/components/ui/card/DocumentActionsCard";
import {
  DocumentSummary,
  DocumentSummaryItem,
} from "@/components/ui/card/DocumentSummary";
import SectionCard from "@/components/ui/card/SectionCard";
import PayrollDocumentHeader from "@/modules/payroll/components/PayrollDocumentHeader";
import PayrollPeriodSelect from "@/modules/payroll/components/PayrollPeriodSelect";
import { isDraftStatus } from "@/modules/payroll/constants/options";
import { payrollTimesheetPermissions } from "@/modules/payroll/constants/permissions";
import { usePayrollPeriodLookup } from "@/modules/payroll/pages/periods/hooks";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { Alert, Col, Form, Row, Spin } from "antd";
import { useFormik } from "formik";
import {
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  CircleX,
  Clock,
  Save,
  Users,
} from "lucide-react";
import { useMemo } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
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

  const detailQuery = useGetDetailPayrollTimesheet(id);
  const createMutation = useCreatePayrollTimesheet();
  const updateMutation = useUpdatePayrollTimesheet(id);
  const confirmMutation = useConfirmPayrollTimesheet(id);
  const cancelMutation = useCancelPayrollTimesheet(id);
  const { data: periods } = usePayrollPeriodLookup();

  const record = detailQuery.data;
  const statusId = record?.statusId ?? 1;
  const isDraft = isCreate || isDraftStatus(statusId);

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
          const created = await createMutation.mutateAsync(payload);
          toast.success(t("payroll.messages.timesheetCreated"));
          navigate(`${LIST_PATH}/${created.id}`, { replace: true });
          return;
        }
        await updateMutation.mutateAsync(payload);
        toast.success(t("payroll.messages.timesheetSaved"));
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

  if (detailQuery.isLoading && !isCreate) {
    return (
      <div className="flex justify-center p-10">
        <Spin />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PayrollDocumentHeader
        title="payroll.timesheets.title"
        docNumber={record?.docNumber}
        docDate={record?.docDate}
        statusId={record?.statusId}
        statusName={record?.statusName}
        isCreate={isCreate}
        onBack={() => navigate(LIST_PATH)}
      />

      {isPeriodClosed && (
        <Alert
          type="warning"
          showIcon
          message={t("payroll.messages.periodClosedWarning")}
        />
      )}

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
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

          <TimesheetLinesEditor
            formik={formik}
            disabled={!isDraft}
            normWorkDays={selectedPeriod?.normWorkDays}
            normWorkHours={selectedPeriod?.normWorkHours}
            periodId={formik.values.periodId}
          />
        </div>

        <DocumentActionsCard
          actions={[
            {
              key: "save",
              label: "common.save",
              icon: <Save className="size-4" />,
              onClick: handleSave,
              loading: createMutation.isPending || updateMutation.isPending,
              hidden: !isDraft,
              disabled: isPeriodClosed,
              permission: isCreate
                ? payrollTimesheetPermissions.create
                : payrollTimesheetPermissions.update,
            },
            {
              key: "confirm",
              label: "payroll.actions.confirm",
              icon: <CheckCircle2 className="size-4" />,
              type: "primary",
              onClick: () =>
                runMutation(
                  () => confirmMutation.mutateAsync(),
                  "payroll.messages.timesheetConfirmed",
                ),
              loading: confirmMutation.isPending,
              hidden: isCreate || !isDraft,
              permission: payrollTimesheetPermissions.confirm,
              confirm: {
                title: "payroll.timesheets.confirmTitle",
                content: "payroll.timesheets.confirmText",
                okText: "payroll.actions.confirm",
              },
              hint: "payroll.timesheets.confirmHint",
            },
            {
              key: "cancel",
              label: "payroll.actions.cancel",
              icon: <CircleX className="size-4" />,
              danger: true,
              onClick: () =>
                runMutation(
                  () => cancelMutation.mutateAsync(),
                  "payroll.messages.timesheetCancelled",
                ),
              loading: cancelMutation.isPending,
              hidden: isCreate || statusId === 3,
              permission: payrollTimesheetPermissions.cancel,
              confirm: {
                title: "payroll.timesheets.cancelTitle",
                content: "payroll.timesheets.cancelText",
                okText: "payroll.actions.cancel",
                danger: true,
              },
            },
          ]}
        />
      </div>
    </div>
  );
}
