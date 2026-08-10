// import useAxios from "@/hooks/useAxios";
// import { useQuery } from "@tanstack/react-query";
import { DatePicker, Form, type FormProps } from "antd";
import dayjs from "dayjs";
import type { FormikProps } from "formik";
import { useTranslation } from "react-i18next";

interface SelectFromToDateProps<T extends object> {
  label?: string;
  placeholder?: string;
  formik: FormikProps<T>;
  fieldName: string;
  disabled?: boolean;
  marginBottom?: string;
  onDateChange?: (dateFrom: string, dateTo: string) => void;
}

const SelectFromToDate = <T extends object,>(
  props: SelectFromToDateProps<T>,
) => {
  const { t } = useTranslation();
  const dateFormat = "YYYY-MM-DDTHH:mm";
  const today = dayjs();
  // const axiosPrivate = useAxios();
  const {
    label = "",
    placeholder = "",
    formik,
    fieldName = "",
    disabled = false,
    marginBottom = "0",
    onDateChange,
  } = props;
  const [dateFromField, dateToField] = fieldName.split(",");
  const values = formik.values as Record<string, unknown>;
  const touched = formik.touched as Record<string, boolean | undefined>;
  const errors = formik.errors as Record<string, string | undefined>;
  // const { data, isFetching, isLoading } = useQuery({
  //   queryKey: [fieldName],
  //   queryFn: async () => {
  //     const response = await axiosPrivate.get<SelectData[]>(path);
  //     return response && response.data;
  //   },
  // });
  return (
    <Form.Item<FormProps>
      className="flex! flex-col!"
      style={{ marginBottom }}
      label={label === "" ? false : t(label)}
      validateStatus={
        touched[dateFromField] && errors[dateFromField] ? "error" : ""
      }
      help={touched[dateFromField] && errors[dateFromField]}
    >
      <DatePicker.RangePicker
        value={
          values[dateFromField]
            ? [
                dayjs(values[dateFromField] as string),
                dayjs(values[dateToField] as string),
              ]
            : null
        }
        format={"DD.MM.YYYY"}
        allowClear
        onChange={(event) => {
          if (!event?.[0] || !event?.[1]) {
            formik.setFieldValue(dateFromField, "", true);
            formik.setFieldValue(dateToField, "", true);
            onDateChange?.("", "");
            return;
          }

          const valueFirst = dayjs(event[0])
            .set("hour", today.hour())
            .set("minute", today.minute())
            .format(dateFormat);
          const valueSecond = dayjs(event[1])
            .set("hour", today.hour())
            .set("minute", today.minute())
            .format(dateFormat);
          formik.setFieldValue(dateFromField, valueFirst, true);
          formik.setFieldValue(dateToField, valueSecond, true);
          onDateChange?.(valueFirst, valueSecond);
        }}
        placeholder={[
          t(placeholder.split(",")[0]),
          t(placeholder.split(",")[1]),
        ]}
        className={`${disabled ? "disabled" : ""} mono w-full!`}
        style={{
          backgroundColor: "transparent",
          height: "38px",
        }}
      />
    </Form.Item>
  );
};

export default SelectFromToDate;
