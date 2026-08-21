import InputNumber from "@/components/fields/InputNumber";
import InputText from "@/components/fields/InputText";
import SelectDate from "@/components/fields/SelectDate";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { Button, Checkbox, Form, Modal } from "antd";
import { useFormik } from "formik";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useSaveHrWorkSchedule } from "../hooks";
import type { HrWorkScheduleForm } from "../types/form";
import { hrWorkScheduleSchema } from "../types/schema";
import type { HrWorkSchedule } from "../types/type";

const emptyValues: HrWorkScheduleForm = {
  name: "",
  effectiveFrom: "",
  effectiveTo: null,
  days: [],
};

interface Props {
  open: boolean;
  employeeId: string | number;
  schedule?: HrWorkSchedule | null;
  onClose: () => void;
}

export default function WorkScheduleModal({
  open,
  employeeId,
  schedule,
  onClose,
}: Props) {
  const { t } = useTranslation();
  const saveMutation = useSaveHrWorkSchedule(employeeId);
  const isEdit = Boolean(schedule?.id);

  const formik = useFormik<HrWorkScheduleForm>({
    initialValues: emptyValues,
    validationSchema: hrWorkScheduleSchema,
    onSubmit: async (values, helpers) => {
      try {
        await saveMutation.mutateAsync({
          scheduleId: schedule?.id,
          payload: {
            ...values,
            effectiveTo: values.effectiveTo || null,
            days: [...values.days].sort(
              (left, right) => left.dayOfWeek - right.dayOfWeek,
            ),
          },
        });
        toast.success(
          t(
            isEdit
              ? "hr.messages.scheduleUpdated"
              : "hr.messages.scheduleCreated",
          ),
        );
        helpers.resetForm({ values: emptyValues });
        onClose();
      } catch (error) {
        errorHandlers(error);
      }
    },
  });

  const { resetForm } = formik;

  useEffect(() => {
    if (!open) return;
    resetForm({
      values: schedule
        ? {
            name: schedule.name,
            effectiveFrom: schedule.effectiveFrom,
            effectiveTo: schedule.effectiveTo ?? null,
            days: schedule.days ?? [],
          }
        : emptyValues,
    });
  }, [open, resetForm, schedule]);

  const toggleDay = (dayOfWeek: number, checked: boolean) => {
    const nextDays = checked
      ? [...formik.values.days, { dayOfWeek, workHours: 8 }]
      : formik.values.days.filter((day) => day.dayOfWeek !== dayOfWeek);
    void formik.setFieldValue("days", nextDays, true);
  };

  const setDayHours = (dayOfWeek: number, workHours: number | null) => {
    void formik.setFieldValue(
      "days",
      formik.values.days.map((day) =>
        day.dayOfWeek === dayOfWeek
          ? { ...day, workHours: workHours ?? 0 }
          : day,
      ),
      true,
    );
  };

  return (
    <Modal
      mask={{ closable: false }}
      title={t(isEdit ? "hr.schedules.editTitle" : "hr.schedules.createTitle")}
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={720}
      destroyOnHidden
    >
      <Form layout="vertical" onFinish={formik.handleSubmit}>
        <div className="grid gap-x-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <InputText
              formik={formik}
              fieldName="name"
              label="hr.fields.scheduleName"
            />
          </div>
          <SelectDate
            formik={formik}
            fieldName="effectiveFrom"
            label="hr.fields.effectiveFrom"
            valueFormat="YYYY-MM-DD"
            required
          />
          <SelectDate
            formik={formik}
            fieldName="effectiveTo"
            label="hr.fields.effectiveTo"
            valueFormat="YYYY-MM-DD"
            clearable
          />
        </div>

        <div className="mb-5">
          <div className="mb-2 text-sm font-medium text-text">
            {t("hr.schedules.weekDays")}
          </div>
          <div className="overflow-hidden rounded-md border border-border">
            {Array.from({ length: 7 }, (_, index) => index + 1).map(
              (dayOfWeek) => {
                const selectedDay = formik.values.days.find(
                  (day) => day.dayOfWeek === dayOfWeek,
                );
                return (
                  <div
                    key={dayOfWeek}
                    className="flex min-h-12 items-center justify-between gap-4 border-b border-border px-3 last:border-b-0"
                  >
                    <Checkbox
                      checked={Boolean(selectedDay)}
                      onChange={(event) =>
                        toggleDay(dayOfWeek, event.target.checked)
                      }
                    >
                      {t(`hr.weekDays.${dayOfWeek}`)}
                    </Checkbox>
                    <div className="flex w-40 items-center gap-2">
                      <InputNumber
                        standalone
                        height={32}
                        min={0}
                        max={24}
                        precision={1}
                        disabled={!selectedDay}
                        value={selectedDay?.workHours ?? null}
                        onValueChange={(value) => setDayHours(dayOfWeek, value)}
                      />
                      <span className="text-xs text-secondary-text">
                        {t("hr.units.hour")}
                      </span>
                    </div>
                  </div>
                );
              },
            )}
          </div>
          {formik.touched.days && typeof formik.errors.days === "string" && (
            <div className="mt-1 text-xs text-red-500">
              {formik.errors.days}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>{t("common.cancel")}</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={saveMutation.isPending}
          >
            {t("common.save")}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
