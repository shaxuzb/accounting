import { $axiosPrivate } from "@/services/AxiosService";
import { useQuery } from "@tanstack/react-query";
import { Form, type FormProps, Select } from "antd";
import { type FormikProps, getIn } from "formik";
import React from "react";
import { useTranslation } from "react-i18next";

type FormValues = object;

interface SelectItem {
  id: number;
  name: string;
}

interface SelectCustomProps {
  label?: string;
  formik: FormikProps<FormValues>;
  fieldName: string;
  regionFieldName: string;
  required?: boolean;
  readOnly?: boolean;
  getFieldName?: string | null;
  path: string;
  disabled?: boolean;
  marginBottom?: string;
}

const DistrictSelect: React.FC<SelectCustomProps> = (props) => {
  const { t } = useTranslation();
  const {
    label = "",
    formik,
    fieldName = "",
    required = false,
    readOnly = false,
    getFieldName = null,
    path,
    regionFieldName,
    disabled = false,
  } = props;


  const regionId = getIn(formik.values, regionFieldName) as
    | number
    | null
    | undefined;
    console.log(regionId);
  const { data, isFetching, isLoading } = useQuery<SelectItem[]>({
    queryKey: [fieldName, regionId],
    queryFn: async () => {
      const response = await $axiosPrivate.get<SelectItem[]>(path, {
        params: { regionId },
      });
      return response.data;
    },
    enabled: !!regionId,
  });

  const hasError = !!(
    getIn(formik.touched, fieldName) && getIn(formik.errors, fieldName)
  );

  return (
    <Form.Item<FormProps>
      className="flex! flex-col!"
      label={
        label === "" ? (
          false
        ) : (
          <span>
            {t(label)} {required && <span className="text-red-500">*</span>}
          </span>
        )
      }
      validateStatus={hasError ? "error" : ""}
      help={
        hasError
          ? (getIn(formik.errors, fieldName) as React.ReactNode)
          : undefined
      }
      rules={[{ required: true, message: "Please input your password!" }]}
    >
      <Select
        value={getIn(formik.values, fieldName) as number | null | undefined}
        loading={isFetching || isLoading}
        open={readOnly ? false : undefined}
        onSelect={(value, option) => {
          if (
            getFieldName &&
            option &&
            !Array.isArray(option) &&
            "label" in option
          ) {
            formik.setFieldValue(getFieldName, option.label, true);
          }
          formik.setFieldValue(fieldName, value, true);
        }}
        placeholder={t(label)}
        options={data?.map((item) => ({
          value: item.id,
          label: item.name,
        }))}
        className={`${disabled ? "disabled" : ""} mono`}
        style={{
          backgroundColor: "transparent",
          height: "38px",
        }}
      />
    </Form.Item>
  );
};

export default DistrictSelect;
