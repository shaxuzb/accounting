import { Form, Select, Tag } from "antd";
import { getIn, type FormikProps } from "formik";
import React from "react";
import { useTranslation } from "react-i18next";
import { usePayrollPeriodLookup } from "../pages/periods/hooks";

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formik?: FormikProps<any>;
  fieldName?: string;
  label?: string;
  value?: number | null;
  onChange?: (value: number | null) => void;
  /** Faqat ochiq davrlarni ko'rsatish (hujjat yaratishda). */
  onlyOpen?: boolean;
  disabled?: boolean;
  required?: boolean;
  standalone?: boolean;
  marginBottom?: string;
}

/** Hisoblash davrini tanlash: "Iyul 2026 · Ochiq". */
const PayrollPeriodSelect: React.FC<Props> = ({
  formik,
  fieldName = "periodId",
  label = "payroll.fields.period",
  value,
  onChange,
  onlyOpen = false,
  disabled = false,
  required = false,
  standalone = false,
  marginBottom = "mb-4",
}) => {
  const { t } = useTranslation();
  const { data, isFetching } = usePayrollPeriodLookup(
    onlyOpen ? "OPEN" : undefined,
  );

  const currentValue = formik ? getIn(formik.values, fieldName) : value;
  const hasError = Boolean(
    formik &&
      getIn(formik.touched, fieldName) &&
      getIn(formik.errors, fieldName),
  );

  const options = React.useMemo(
    () =>
      (data ?? []).map((period) => ({
        value: period.id,
        label: `${t(`payroll.months.${period.month}`, {
          defaultValue: period.monthName ?? String(period.month),
        })} ${period.year}`,
        status: period.status,
      })),
    [data, t],
  );

  const handleChange = (nextValue: number | null) => {
    formik?.setFieldValue(fieldName, nextValue ?? null, true);
    onChange?.(nextValue ?? null);
  };

  const select = (
    <Select
      value={(currentValue ?? undefined) as number | undefined}
      onChange={handleChange}
      loading={isFetching}
      disabled={disabled}
      showSearch
      optionFilterProp="label"
      placeholder={t("payroll.placeholders.selectPeriod")}
      options={options}
      optionRender={(option) => {
        const item = option.data as { label: string; status: string };
        return (
          <div className="flex items-center justify-between gap-2">
            <span>{item.label}</span>
            <Tag
              className="m-0!"
              color={item.status === "OPEN" ? "green" : "default"}
            >
              {t(`payroll.enums.periodStatus.${item.status}`, {
                defaultValue: item.status,
              })}
            </Tag>
          </div>
        );
      }}
      style={{ width: "100%", height: 38, backgroundColor: "transparent" }}
    />
  );

  if (standalone) return select;

  return (
    <Form.Item
      className={`flex! flex-col! ${marginBottom}`}
      label={
        <span>
          {t(label)} {required && <span className="text-red-500">*</span>}
        </span>
      }
      validateStatus={hasError ? "error" : ""}
      help={
        hasError && formik
          ? (getIn(formik.errors, fieldName) as React.ReactNode)
          : undefined
      }
    >
      {select}
    </Form.Item>
  );
};

export default PayrollPeriodSelect;
