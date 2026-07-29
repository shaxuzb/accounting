import { Form, Select } from "antd";
import { getIn, type FormikProps } from "formik";
import React from "react";
import { useTranslation } from "react-i18next";
import { usePayrollEmployeeLookup } from "../hooks/usePayrollEmployeeLookup";

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formik?: FormikProps<any>;
  fieldName?: string;
  label?: string;
  value?: number | null;
  onChange?: (value: number | null) => void;
  disabled?: boolean;
  required?: boolean;
  /** Allaqachon tanlangan xodimlar ro'yxatdan chiqariladi. */
  excludeIds?: (number | null | undefined)[];
  standalone?: boolean;
  marginBottom?: string;
}

/**
 * Xodim tanlash. Tabel va to'lov qatorlarida, hisobot filtrlarida ishlatiladi.
 * Qidiruv ism, tabel raqami va bo'lim bo'yicha ishlaydi.
 */
const PayrollEmployeeSelect: React.FC<Props> = ({
  formik,
  fieldName = "",
  label = "payroll.fields.employee",
  value,
  onChange,
  disabled = false,
  required = false,
  excludeIds,
  standalone = false,
  marginBottom = "mb-4",
}) => {
  const { t } = useTranslation();
  const { data, isFetching } = usePayrollEmployeeLookup();

  const currentValue = formik ? getIn(formik.values, fieldName) : value;
  const hasError = Boolean(
    formik &&
      getIn(formik.touched, fieldName) &&
      getIn(formik.errors, fieldName),
  );

  const excluded = React.useMemo(
    () =>
      new Set(
        (excludeIds ?? [])
          .filter((item): item is number => Boolean(item))
          .filter((item) => item !== currentValue),
      ),
    [currentValue, excludeIds],
  );

  const options = React.useMemo(
    () =>
      (data ?? [])
        .filter((employee) => !excluded.has(employee.id))
        .map((employee) => ({
          value: employee.id,
          label: employee.label,
          searchText: [
            employee.label,
            employee.employeeNumber,
            employee.departmentName,
            employee.positionName,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase(),
          employeeNumber: employee.employeeNumber,
          subtitle: [employee.departmentName, employee.positionName]
            .filter(Boolean)
            .join(" • "),
        })),
    [data, excluded],
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
      filterOption={(input, option) =>
        String((option as { searchText?: string })?.searchText ?? "").includes(
          input.toLowerCase(),
        )
      }
      placeholder={t("payroll.placeholders.selectEmployee")}
      options={options}
      optionRender={(option) => {
        const data = option.data as {
          label: string;
          employeeNumber?: string;
          subtitle?: string;
        };
        return (
          <div className="flex flex-col">
            <span className="text-sm">
              {data.label}
              {data.employeeNumber && (
                <span className="ml-2 text-xs text-secondary-text">
                  {data.employeeNumber}
                </span>
              )}
            </span>
            {data.subtitle && (
              <span className="text-xs text-secondary-text">
                {data.subtitle}
              </span>
            )}
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

export default PayrollEmployeeSelect;
