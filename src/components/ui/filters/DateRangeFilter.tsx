import dayjs from "@/config/dayjs";
import SelectFromToDate from "@/components/fields/SelectFromToDate";
import { useFormik } from "formik";
import { useSearchParams } from "react-router";

interface DateRangeFilterProps {
  paramKeys?: readonly [string, string];
  placeholderKeys: readonly [string, string];
  width?: number;
}

/**
 * Ro'yxat sahifalari uchun URL searchParams bilan ishlaydigan sana oralig'i.
 * Sana o'zgarganda pagination birinchi sahifaga qaytariladi.
 */
export default function DateRangeFilter({
  paramKeys = ["dateFrom", "dateTo"],
  placeholderKeys,
  width = 250,
}: DateRangeFilterProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [dateFromKey, dateToKey] = paramKeys;
  const dateFrom = searchParams.get(dateFromKey);
  const dateTo = searchParams.get(dateToKey);
  const formik = useFormik<Record<string, string>>({
    initialValues: {
      [dateFromKey]: dateFrom ?? "",
      [dateToKey]: dateTo ?? "",
    },
    enableReinitialize: true,
    onSubmit: () => undefined,
  });

  const handleChange = (nextDateFrom: string, nextDateTo: string) => {
    const nextParams = new URLSearchParams(searchParams);

    if (nextDateFrom && nextDateTo) {
      nextParams.set(dateFromKey, dayjs(nextDateFrom).format("YYYY-MM-DD"));
      nextParams.set(dateToKey, dayjs(nextDateTo).format("YYYY-MM-DD"));
    } else {
      nextParams.delete(dateFromKey);
      nextParams.delete(dateToKey);
    }

    nextParams.delete("page");
    setSearchParams(nextParams, { replace: true });
  };

  return (
    <div style={{ width }} className="[&_.ant-picker]:h-8!">
      <SelectFromToDate
        formik={formik}
        fieldName={`${dateFromKey},${dateToKey}`}
        placeholder={placeholderKeys.join(",")}
        onDateChange={handleChange}
      />
    </div>
  );
}
