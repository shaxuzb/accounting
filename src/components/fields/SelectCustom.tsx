// import useAxios from "@/hooks/useAxios";
// import { FieldProps, SelectData } from "@/interface/interface";
// import $axiosPrivate from "@/services/AxiosService";
// import { useAppSelector } from "@/store/hooks";
// import { useQuery } from "@tanstack/react-query";
// import { Form, FormProps, Select } from "antd";
// import { FormikProps } from "formik";
// import { get } from "lodash";
// import React from "react";
// import { useTranslation } from "react-i18next";

// interface SelectCustomProps {
//   label?: string;
//   formik: FormikProps<FieldProps> | any;
//   fieldName: string;
//   refetchSync?: string;
//   getFieldName?: string | null;
//   height?: string;
//   validation?: boolean;
//   path: string;
//   disabled?: boolean;
//   marginBottom?: string;
//   isOrganizationId?: boolean;
//   isPossibleBorrow?: boolean;
// }

// const SelectCustom: React.FC<SelectCustomProps> = (props) => {
//   const { t } = useTranslation();
//   const axiosPrivate = useAxios();
//   const {
//     label = "",
//     formik,
//     fieldName = "",
//     getFieldName = null,
//     validation = true,
//     refetchSync,
//     height = "38px",
//     path,

//     disabled = false,
//   } = props;
//   const { data, isFetching, isLoading } = useQuery({
//     queryKey: [fieldName, refetchSync],
//     queryFn: async () => {
//       const response = await $axiosPrivate.get<SelectData[]>(path);
//       return response && response.data;
//     },
//   });
//   return (
//     <Form.Item<FormProps>
//       className={`flex! flex-col! ${validation ? "" : "mb-0!"}`}
//       label={label === "" ? false : t(label)}
//       validateStatus={
//         validation &&
//         get(formik.touched, fieldName) &&
//         get(formik.errors, fieldName)
//           ? "error"
//           : ""
//       }
//       help={
//         validation &&
//         get(formik.touched, fieldName) &&
//         get(formik.errors, fieldName)
//       }
//       rules={[{ required: true, message: "Please input your password!" }]}
//     >
//       <Select
//         value={get(formik.values, fieldName)}
//         loading={isFetching || isLoading}
//         onSelect={(event, selectValue) => {
//           let value = event;
//           if (getFieldName) {
//             formik.setFieldValue(getFieldName, selectValue.label, true);
//           }
//           if (formik.values.regionId && fieldName === "regionId") {
//             formik.setFieldValue("districtId", null, true);
//           }
//           formik.setFieldValue(fieldName, value, true);
//         }}
//         placeholder={t(label)}
//         options={data?.map((item) => ({
//           value: item.id,
//           label: item.name,
//         }))}
//         disabled={disabled}
//         style={{
//           backgroundColor: "transparent",
//           height: height,
//         }}
//       />
//     </Form.Item>
//   );
// };

// export default SelectCustom;