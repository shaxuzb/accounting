import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { FormikProps } from "formik";
import { $axiosPrivate } from "@/services/AxiosService";
import { selectListEndpoints } from "@/shared/constants/selectLists";

/**
 * A cash box is kept in one currency: a document in it takes that currency (the server refuses
 * another), so it is set from the box rather than picked by hand.
 */
export function useCashBoxCurrency<
  T extends { cashBoxId: number | null; currencyId: number | null },
>(formik: FormikProps<T>, enabled = true) {
  const { data: cashBoxes } = useQuery({
    queryKey: ["cash-box-currencies"],
    queryFn: async () =>
      (
        await $axiosPrivate.get<{ id: number; currencyId: number }[]>(
          selectListEndpoints.cashBoxesSelectList,
        )
      ).data,
    staleTime: 5 * 60 * 1000,
  });
  const currencyId = cashBoxes?.find(
    (box) => box.id === Number(formik.values.cashBoxId),
  )?.currencyId;

  useEffect(() => {
    if (enabled && currencyId && Number(formik.values.currencyId) !== currencyId)
      void formik.setFieldValue("currencyId", currencyId, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currencyId, enabled]);
}
