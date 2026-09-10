import InputNumber from "@/components/fields/InputNumber";
import SelectStatic from "@/components/fields/SelectStatic";
import { monthOptions } from "@/modules/payroll/constants/options";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import {
  Alert,
  Button,
  Calendar,
  Col,
  Form,
  InputNumber as AntInputNumber,
  Modal,
  Result,
  Select,
  Row,
  Spin,
} from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useFormik } from "formik";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  useCreatePayrollPeriod,
  useGetDetailPayrollPeriod,
  useUpdatePayrollPeriod,
} from "../hooks";
import type { PayrollPeriodForm } from "../types/form";
import { payrollPeriodSchema } from "../types/schema";
import {
  calculateCalendarDayTotals,
  calendarDaysToWorkDates,
  createPeriodCalendarDays,
  updateNormalCalendarDayHours,
  updatePeriodCalendarDay,
} from "../utils/periodCalendar";
import type { PayrollPeriodDayType } from "../types/form";

type PayrollPeriodModalMode = "create" | "edit" | "view";

interface Props {
  open: boolean;
  mode: PayrollPeriodModalMode;
  periodId?: number | null;
  onClose: () => void;
}

const getDefaultValues = (): PayrollPeriodForm => {
  const current = dayjs();
  const year = current.year();
  const month = current.month() + 1;
  const calendarDays = createPeriodCalendarDays(year, month, 8);
  return {
    year,
    month,
    dailyWorkHours: 8,
    workDates: calendarDaysToWorkDates(calendarDays),
    calendarDays,
  };
};

const toFormValues = (period: {
  year: number;
  month: number;
  dailyWorkHours: number;
  workDates?: string[];
  calendarDays?: PayrollPeriodForm["calendarDays"];
}): PayrollPeriodForm => ({
  year: period.year,
  month: period.month,
  dailyWorkHours: period.dailyWorkHours,
  workDates: period.workDates ?? [],
  calendarDays: period.calendarDays?.length
    ? period.calendarDays.map((day) => ({
        ...day,
        isWorkDay: day.dayType !== "HOLIDAY" && day.workHours > 0,
      }))
    : createPeriodCalendarDays(period.year, period.month, period.dailyWorkHours).map((day) => ({
        ...day,
        isWorkDay: (period.workDates ?? []).includes(day.date),
        dayType: (period.workDates ?? []).includes(day.date) ? "NORMAL" : "HOLIDAY",
        workHours: (period.workDates ?? []).includes(day.date) ? period.dailyWorkHours : 0,
      })),
});

export default function PayrollPeriodModal({
  open,
  mode,
  periodId,
  onClose,
}: Props) {
  const { t } = useTranslation();
  const createMutation = useCreatePayrollPeriod();
  const updateMutation = useUpdatePayrollPeriod();
  const detailQuery = useGetDetailPayrollPeriod(periodId);
  const detail = detailQuery.data;
  const isReadOnly = mode === "view" || (mode !== "create" && !detail?.canEdit);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const formik = useFormik<PayrollPeriodForm>({
    initialValues: getDefaultValues(),
    validationSchema: payrollPeriodSchema,
    onSubmit: async (values, helpers) => {
      try {
        if (mode === "create") {
          await createMutation.mutateAsync(values);
          toast.success(t("payroll.messages.periodCreated"));
        } else if (periodId && !isReadOnly) {
          await updateMutation.mutateAsync({ id: periodId, payload: values });
          toast.success(t("payroll.messages.periodUpdated"));
        }
        helpers.resetForm({ values: getDefaultValues() });
        onClose();
      } catch (error) {
        errorHandlers(error);
      }
    },
  });

  const { resetForm, setFieldTouched, setFieldValue } = formik;

  useEffect(() => {
    if (!open) return;
    if (mode === "create") resetForm({ values: getDefaultValues() });
    // The selection belongs to the modal session, so it must be cleared when
    // a new period form opens (the calendar itself is local UI state).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (mode === "create") setSelectedDate(null);
  }, [mode, open, resetForm]);

  useEffect(() => {
    if (open && mode !== "create" && detail) {
      resetForm({ values: toFormValues(detail) });
    }
  }, [detail, mode, open, resetForm]);

  const totals = useMemo(
    () => calculateCalendarDayTotals(formik.values.calendarDays),
    [formik.values.calendarDays],
  );
  const calendarRange = useMemo<[Dayjs, Dayjs] | undefined>(() => {
    if (!formik.values.year || !formik.values.month) return undefined;
    const start = dayjs(
      `${formik.values.year}-${String(formik.values.month).padStart(2, "0")}-01`,
    );
    return [start, start.endOf("month")];
  }, [formik.values.month, formik.values.year]);

  const handlePeriodChange = (year: number | null, month: number | null) => {
    if (!year || !month) return;
    const calendarDays = createPeriodCalendarDays(year, month, formik.values.dailyWorkHours ?? 8);
    void setFieldValue("calendarDays", calendarDays, true);
    void setFieldValue("workDates", calendarDaysToWorkDates(calendarDays), true);
    setSelectedDate(null);
  };

  const handleCalendarSelect = (date: Dayjs) => {
    if (isReadOnly || !calendarRange) return;
    const dateKey = date.format("YYYY-MM-DD");
    const current = formik.values.calendarDays.find((day) => day.date === dateKey);
    setSelectedDate(dateKey);
    if (current && (current.dayType === "NORMAL" || current.dayType === "HOLIDAY")) {
      const nextType: PayrollPeriodDayType = current.isWorkDay ? "HOLIDAY" : "NORMAL";
      const nextDays = updatePeriodCalendarDay(
        formik.values.calendarDays,
        dateKey,
        nextType,
        formik.values.dailyWorkHours ?? 8,
      );
      void setFieldValue("calendarDays", nextDays, true);
      void setFieldValue("workDates", calendarDaysToWorkDates(nextDays), true);
    }
    void setFieldTouched("workDates", true, false);
  };

  const selectedCalendarDay = formik.values.calendarDays.find((day) => day.date === selectedDate);
  const updateSelectedCalendarDay = (dayType: PayrollPeriodDayType, workHours: number) => {
    if (!selectedDate) return;
    const nextDays = updatePeriodCalendarDay(formik.values.calendarDays, selectedDate, dayType, workHours);
    void setFieldValue("calendarDays", nextDays, true);
    void setFieldValue("workDates", calendarDaysToWorkDates(nextDays), true);
  };

  const handleClose = () => {
    resetForm({ values: getDefaultValues() });
    onClose();
  };

  const title =
    mode === "create"
      ? t("payroll.periods.createTitle")
      : mode === "edit" && !isReadOnly
        ? t("payroll.periods.editTitle")
        : t("payroll.periods.viewTitle");
  const mutationPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      maskClosable={false}
      title={title}
      open={open}
      onCancel={handleClose}
      footer={null}
      centered
      width={760}
      destroyOnHidden
    >
      {mode !== "create" && detailQuery.isLoading ? (
        <div className="flex justify-center py-12">
          <Spin />
        </div>
      ) : mode !== "create" && detailQuery.isError ? (
        <Result
          status="error"
          title={t("payroll.periods.detailLoadError")}
          extra={
            <Button type="primary" onClick={() => void detailQuery.refetch()}>
              {t("common.reload")}
            </Button>
          }
        />
      ) : mode !== "create" && !detail ? (
        <Result status="warning" title={t("payroll.periods.detailUnavailable")} />
      ) : (
        <Form layout="vertical" onFinish={formik.handleSubmit}>
          {isReadOnly && detail?.editBlockedReason && (
            <Alert
              className="mb-4"
              type="info"
              showIcon
              message={t("payroll.periods.readOnly")}
              description={detail.editBlockedReason}
            />
          )}
          <Row gutter={[16, 0]}>
            <Col xs={24} md={8}>
              <InputNumber
                formik={formik}
                fieldName="year"
                label="payroll.fields.year"
                max={2200}
                min={2000}
                disabled={isReadOnly}
                onValueChange={(value) => {
                  void setFieldValue("year", value, true);
                  handlePeriodChange(value, formik.values.month);
                }}
                value={formik.values.year}
              />
            </Col>
            <Col xs={24} md={8}>
              <SelectStatic
                formik={formik}
                fieldName="month"
                label="payroll.fields.month"
                options={monthOptions}
                required
                disabled={isReadOnly}
                marginBottom="mb-4"
                onChange={(value) =>
                  handlePeriodChange(formik.values.year, Number(value))
                }
              />
            </Col>
            <Col xs={24} md={8}>
              <InputNumber
                formik={formik}
                fieldName="dailyWorkHours"
                label="payroll.fields.dailyWorkHours"
                min={0}
                max={24}
                precision={2}
                required
                disabled={isReadOnly}
                onValueChange={(value) => {
                  const hours = value ?? 0;
                  const calendarDays = updateNormalCalendarDayHours(
                    formik.values.calendarDays,
                    hours,
                  );
                  void setFieldValue("dailyWorkHours", hours, true);
                  void setFieldValue("calendarDays", calendarDays, true);
                  void setFieldValue("workDates", calendarDaysToWorkDates(calendarDays), true);
                }}
              />
            </Col>
          </Row>

          {calendarRange && (
            <Calendar
              fullscreen={false}
              defaultValue={calendarRange[0]}
              validRange={calendarRange}
              onSelect={(date, { source }) => {
                if (source === "date") handleCalendarSelect(date);
              }}
              fullCellRender={(date, info) => {
                if (info.type !== "date") return info.originNode;
                const calendarDay = formik.values.calendarDays.find((day) => day.date === date.format("YYYY-MM-DD"));
                const selected = calendarDay?.isWorkDay ?? false;
                const dayClass = calendarDay?.dayType === "HOLIDAY"
                  ? "bg-red-50 text-red-700"
                  : calendarDay?.dayType === "SHORTENED"
                    ? "bg-amber-50 text-amber-700"
                    : calendarDay?.dayType === "TRANSFERRED"
                      ? "bg-violet-50 text-violet-700"
                      : selected
                        ? "bg-primary! text-primary-foreground!"
                        : "bg-transparent! text-inherit!";
                return (
                  <div
                    className={`${info.prefixCls}-cell-inner ${info.prefixCls}-calendar-date rounded! ${dayClass}`}
                  >
                    <div className={`${info.prefixCls}-calendar-date-value`}>
                      {String(date.date()).padStart(2, "0")}
                    </div>
                    <div className={`${info.prefixCls}-calendar-date-content`} />
                  </div>
                );
              }}
            />
          )}

          {selectedCalendarDay && (
            <div className="mb-4 grid grid-cols-1 gap-3 rounded border border-border bg-muted/40 p-3 md:grid-cols-[1fr_1fr_140px] md:items-end">
              <div className="text-sm">
                <div className="text-muted-foreground">{t("payroll.periods.selectedCalendarDate")}</div>
                <div className="font-semibold">{selectedCalendarDay.date}</div>
              </div>
              <Form.Item label={t("payroll.periods.calendarDayType")} className="mb-0">
                <Select
                  value={selectedCalendarDay.dayType}
                  disabled={isReadOnly}
                  onChange={(value: PayrollPeriodDayType) => updateSelectedCalendarDay(value, selectedCalendarDay.workHours || formik.values.dailyWorkHours || 8)}
                  options={[
                    { value: "NORMAL", label: t("payroll.periods.dayTypes.NORMAL") },
                    { value: "HOLIDAY", label: t("payroll.periods.dayTypes.HOLIDAY") },
                    { value: "TRANSFERRED", label: t("payroll.periods.dayTypes.TRANSFERRED") },
                    { value: "SHORTENED", label: t("payroll.periods.dayTypes.SHORTENED") },
                  ]}
                  className="w-full"
                />
              </Form.Item>
              <Form.Item label={t("payroll.fields.dailyWorkHours")} className="mb-0">
                <AntInputNumber
                  min={selectedCalendarDay.dayType === "HOLIDAY" ? 0 : 1}
                  max={24}
                  precision={2}
                  value={selectedCalendarDay.workHours}
                  disabled={isReadOnly || selectedCalendarDay.dayType === "HOLIDAY"}
                  onChange={(value) => updateSelectedCalendarDay(selectedCalendarDay.dayType, value ?? 0)}
                  className="w-full"
                />
              </Form.Item>
            </div>
          )}

          {formik.touched.workDates && formik.errors.workDates && (
            <div className="mt-2 text-sm text-red-500">
              {String(formik.errors.workDates)}
            </div>
          )}
          <div className="my-4 grid grid-cols-3 gap-3 rounded bg-muted p-3 text-sm">
            <div>
              <div className="text-muted-foreground">
                {t("payroll.periods.selectedDays")}
              </div>
              <div className="font-semibold">{totals.normWorkDays}</div>
            </div>
            <div>
              <div className="text-muted-foreground">
                {t("payroll.fields.dailyWorkHours")}
              </div>
              <div className="font-semibold">{formik.values.dailyWorkHours ?? "—"}</div>
            </div>
            <div>
              <div className="text-muted-foreground">
                {t("payroll.fields.normWorkHours")}
              </div>
              <div className="font-semibold">{totals.normWorkHours}</div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button onClick={handleClose} size="large" className="h-10!">
              {isReadOnly ? t("common.close") : t("common.cancel")}
            </Button>
            {!isReadOnly && (
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={mutationPending}
                className="h-10! min-w-40 font-semibold"
              >
                {mode === "create" ? t("common.create") : t("common.save")}
              </Button>
            )}
          </div>
        </Form>
      )}
    </Modal>
  );
}
