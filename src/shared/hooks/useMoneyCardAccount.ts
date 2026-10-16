import { useEffect, useRef } from "react";
import type { FormikProps } from "formik";
import { $axiosPrivate } from "@/services/AxiosService";

interface MoneyCardOption {
  id: number;
  chartAccountId?: number | null;
}

/**
 * A cash desk or bank account card names the account its money is kept on (5010.x / 5110.x …):
 * picking the desk or account in a document puts that account on the document, so a desk kept
 * on its own subaccount is not posted to the first cash account by mistake. A document opened
 * again keeps what it was saved with; a card without an account leaves the field as it is.
 */
export function useMoneyCardAccount<T extends object>(
  // what it reads and sets of the form (useFormik's own result and FormikProps both have it)
  formik: Pick<FormikProps<T>, "values" | "initialValues" | "setFieldValue">,
  // the form type comes from formik alone: the field names only have to be its keys
  sourceField: NoInfer<keyof T & string>,
  targetField: NoInfer<keyof T & string>,
  endpoint: string,
) {
  const source = formik.values[sourceField] as unknown;
  const previous = useRef<unknown>(source);
  const initialValuesRef = useRef(formik.initialValues);

  useEffect(() => {
    const before = previous.current;
    previous.current = source;
    // a (re)loaded document brings its own account
    if (initialValuesRef.current !== formik.initialValues) {
      initialValuesRef.current = formik.initialValues;
      return;
    }
    if (!source || source === before) return;
    let cancelled = false;
    void $axiosPrivate
      .get<MoneyCardOption[]>(endpoint)
      .then((response) => {
        const accountId = response.data.find((item) => item.id === Number(source))?.chartAccountId;
        if (!cancelled && accountId) void formik.setFieldValue(targetField, accountId);
      })
      .catch(() => {
        // the account stays as picked
      });
    return () => {
      cancelled = true;
    };
    // only a change of the desk / account moves the document's account
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);
}
