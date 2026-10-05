import { getIn } from "formik";
import type { FormikProps } from "formik";
import { useEffect, useRef } from "react";
import dayjs from "@/config/dayjs";
import { UZS_CURRENCY_ID } from "./constants";
import { useRateOnDate } from "./hooks";

interface Fields {
  currency?: string;
  date?: string;
  rate?: string;
}

/**
 * Keeps a document's exchange rate on the Central Bank rate of its currency and date: UZS is
 * 1, and choosing another currency or date puts that day's rate in. A rate the document was
 * saved with stays until the currency or the date is changed, and the user may still type a
 * rate of their own (a commercial bank's, as agreed).
 */
export function useAutoExchangeRate<T>(
  formik: FormikProps<T>,
  { currency = "currencyId", date = "docDate", rate = "exchangeRate" }: Fields = {},
) {
  const keyOf = (values: T) => {
    const id = Number(getIn(values, currency)) || null;
    const value = getIn(values, date) as string | undefined;
    return { id, day: value ? dayjs(value).format("YYYY-MM-DD") : null };
  };
  const { id: currencyId, day } = keyOf(formik.values);
  const key = `${currencyId}|${day}`;
  // the currency and date whose rate is in the form; the values the form was (re)loaded with
  // count as applied when they carry a rate, so a saved document keeps its own
  const appliedKey = useRef<string | null>(null);
  useEffect(() => {
    const initial = keyOf(formik.initialValues);
    appliedKey.current =
      Number(getIn(formik.initialValues, rate)) > 1 ? `${initial.id}|${initial.day}` : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.initialValues]);

  const query = useRateOnDate(currencyId, day);

  useEffect(() => {
    if (!currencyId || !day || appliedKey.current === key) return;
    if (currencyId === UZS_CURRENCY_ID) {
      appliedKey.current = key;
      void formik.setFieldValue(rate, 1, false);
      return;
    }
    if (query.data?.rate) {
      appliedKey.current = key;
      void formik.setFieldValue(rate, query.data.rate, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, query.data?.rate]);

  return {
    isForeign: !!currencyId && currencyId !== UZS_CURRENCY_ID,
    official: query.data,
    loading: query.isFetching,
  };
}
