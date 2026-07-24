// import { useGetByDateOrganizationExchange } from "@/modules/settings/features/settings/currencyexchanges/organization/hook/useGetByDateOrganizationExchange";
// import { useGetListOrganizationExchange } from "@/modules/settings/features/settings/currencyexchanges/organization/hook/useGetListOrganizationExchange";
// import { useGetByDateSupplierExchange } from "@/modules/settings/features/settings/currencyexchanges/supplier/hook/useGetByDateSupplierExchange";
// import { useGetListSupplierExchange } from "@/modules/settings/features/settings/currencyexchanges/supplier/hook/useGetListSupplierExchange";
import { DatePicker, Form, type FormProps } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { type FormikProps, getIn } from "formik";
import React, { useCallback, useRef } from "react";
// import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

type FormValues = object;

interface CheckCurrencyExchange {
  check: boolean;
  exchangeType?: "org" | "supplier";
  organizationId?: number;
  supplierId?: number;
  viewCurrencyExchange?: boolean;
}

interface SelectDateProps {
  label?: string;
  formik: FormikProps<FormValues>;
  fieldName: string;
  required?: boolean;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  readOnly?: boolean;
  placeholder?: string;
  disabled?: boolean;
  marginBottom?: string;
  checkCurrencyExchange?: CheckCurrencyExchange;
  onChange?: (value: string) => void;
}

const DEFAULT_EXCHANGE: CheckCurrencyExchange = {
  check: false,
  exchangeType: "org",
  viewCurrencyExchange: false,
  organizationId: undefined,
  supplierId: undefined,
};

const DATE_FORMAT = "YYYY-MM-DDTHH:mm:ss";
const DISPLAY_FORMAT = "DD.MM.YYYY";

// function useCurrencyExchange(
//   checkCurrencyExchange: CheckCurrencyExchange,
//   paymentDate: string,
// ) {
//   const exchangeParams = useMemo(() => {
//     if (!checkCurrencyExchange.check || !paymentDate) return undefined;
//     const params = new URLSearchParams();
//     params.set("rateDate", paymentDate);
//     params.set(
//       "supplierId",
//       checkCurrencyExchange.supplierId?.toString() ?? "",
//     );
//     return params;
//   }, [
//     checkCurrencyExchange.check,
//     checkCurrencyExchange.supplierId,
//     paymentDate,
//   ]);

//   // const orgResult = useGetByDateOrganizationExchange(
//   //   checkCurrencyExchange.exchangeType === "org" ? exchangeParams : undefined,
//   //   !!paymentDate,
//   // );
//   // const supplierResult = useGetByDateSupplierExchange(
//   //   checkCurrencyExchange.exchangeType === "supplier"
//   //     ? exchangeParams
//   //     : undefined,
//   // );

//   // return checkCurrencyExchange.exchangeType === "supplier"
//   //   ? supplierResult
//   //   : orgResult;
// }

const SelectDate: React.FC<SelectDateProps> = ({
  label = "",
  formik,
  fieldName = "",
  required = false,
  placeholder = "",
  readOnly = false,
  minDate,
  maxDate,
  disabled = false,
  checkCurrencyExchange = DEFAULT_EXCHANGE,
  onChange,
}) => {
  const { t } = useTranslation();
  const todayRef = useRef(dayjs());
  const param = new URLSearchParams();
  if (checkCurrencyExchange.supplierId) {
    param.set("supplierId", checkCurrencyExchange.supplierId.toString());
  }
  const handleChangeDate = useCallback(
    (event: Dayjs | null) => {
      const value = event
        ? dayjs(event)
            .set("hour", todayRef.current.hour())
            .set("minute", todayRef.current.minute())
            .format(DATE_FORMAT)
        : "";
      formik.setFieldValue(fieldName, value, true);
      onChange?.(value);
    },
    [formik, fieldName, onChange],
  );

  // const paymentDate =
  //   (getIn(formik.values, fieldName) as string | undefined) ?? "";
  // const { data: exchangesData } =
  //   checkCurrencyExchange.exchangeType === "supplier"
  //     ? useGetListSupplierExchange(param)
  //     : useGetListOrganizationExchange();
  // const {
  //   data: exchangeData,
  //   isSuccess,
  //   isError,
  // } = useCurrencyExchange(checkCurrencyExchange, paymentDate);

  // const paymentDateOnly = useMemo(
  //   () => (paymentDate ? dayjs(paymentDate).format("YYYY-MM-DD") : ""),
  //   [paymentDate],
  // );

  // const exchangeDateOnly = useMemo(
  //   () =>
  //     exchangeData?.rateDate
  //       ? dayjs(exchangeData.rateDate).format("YYYY-MM-DD")
  //       : null,
  //   [exchangeData?.rateDate],
  // );

  // const isDateMismatch = useMemo(() => {
  //   if (!exchangeData || !paymentDateOnly) return false;
  //   return paymentDateOnly !== exchangeDateOnly;
  // }, [exchangeData, paymentDateOnly, exchangeDateOnly]);

  // useEffect(() => {
  //   if (isError) {
  //     formik.setFieldValue("exchangeRate", 0);
  //     formik.setFieldValue("exchangeRateId", null);
  //     toast.error("Bu sanaga kurs kiritilmagan");
  //   }
  //   if (!checkCurrencyExchange.check || !isSuccess || !exchangeData) return;

  //   if (isDateMismatch) {
  //     formik.setFieldValue("exchangeRate", 0);
  //     formik.setFieldValue("exchangeRateId", null);
  //     toast.error("Bu sanaga kurs kiritilmagan");
  //   } else {
  //     formik.setFieldValue("exchangeRate", exchangeData.exchangeRate);
  //     formik.setFieldValue("exchangeRateId", exchangeData.id);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [
  //   isSuccess,
  //   exchangeData,
  //   isDateMismatch,
  //   checkCurrencyExchange.check,
  //   isError,
  // ]);

  const fieldValue = getIn(formik.values, fieldName) as string | undefined;
  const hasError = !!(
    getIn(formik.touched, fieldName) && getIn(formik.errors, fieldName)
  );

  // const cellRender: DatePickerProps<Dayjs>["cellRender"] = (current, info) => {
  //   if (info.type !== "date") {
  //     return info.originNode;
  //   }
  //   if (typeof current === "number" || typeof current === "string") {
  //     return <div className="ant-picker-cell-inner">{current}</div>;
  //   }
  //   return (
  //     <div className="ant-picker-cell-inner">
  //       <div className="flex flex-col">
  //         {current.date()}
  //         <span className="text-[9px] text-text text-nowrap absolute top-[70%] left-1/2 transform -translate-x-1/2">
  //           {numberSpacing(
  //             exchangesData?.results.find((ex) =>
  //               dayjs(ex.rateDate).isSame(current, "day"),
  //             )?.exchangeRate ?? null,
  //           )}
  //         </span>
  //       </div>
  //     </div>
  //   );
  // };

  return (
    <Form.Item<FormProps>
      className="flex! flex-col!"
      label={
        label ? (
          <span>
            {t(label)} {required && <span className="text-red-500">*</span>}
          </span>
        ) : undefined
      }
      validateStatus={hasError ? "error" : ""}
      help={
        hasError
          ? (getIn(formik.errors, fieldName) as React.ReactNode)
          : undefined
      }
    >
      <DatePicker
        value={fieldValue ? dayjs(fieldValue) : null}
        format={DISPLAY_FORMAT}
        // cellRender={
        //   checkCurrencyExchange.viewCurrencyExchange ? cellRender : undefined
        // }
        readOnly={readOnly}
        onChange={handleChangeDate}
        minDate={minDate}
        maxDate={maxDate}
        allowClear={false}
        placeholder={placeholder ? t(placeholder) : ""}
        disabled={disabled}
        className={`${disabled ? "disabled" : ""} w-full!`}
        style={{ backgroundColor: "transparent", height: "38px" }}
      />
    </Form.Item>
  );
};

export default SelectDate;
