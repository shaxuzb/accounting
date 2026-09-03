import { useCallback, useRef } from "react";
import type { FormikProps } from "formik";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { mergeLookupValues } from "@/modules/settings/shared/taxpayerLookup";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import type { RentalContractForm } from "../types/form";
import { useLookupRentalLessor } from "./useLookupRentalLessor";

const emptyLookupValues: Pick<
  RentalContractForm,
  "lessorFullName" | "lessorInn" | "lessorPinfl"
> = {
  lessorFullName: "",
  lessorInn: null,
  lessorPinfl: null,
};

export default function useRentalLessorLookup(
  formik: FormikProps<RentalContractForm>,
) {
  const { t } = useTranslation();
  const lookupMutation = useLookupRentalLessor();
  const previousLookupValues = useRef<
    Partial<
      Pick<RentalContractForm, "lessorFullName" | "lessorInn" | "lessorPinfl">
    >
  >({});

  const resetLookup = useCallback(() => {
    previousLookupValues.current = {};
  }, []);

  const handleLessorInnChange = useCallback((value: string) => {
    if (Object.keys(previousLookupValues.current).length > 0) {
      const clearedValues = mergeLookupValues<RentalContractForm>(
        formik.values,
        previousLookupValues.current,
        {},
        emptyLookupValues,
      );
      resetLookup();
      formik.setValues({ ...clearedValues, lessorInn: value }, false);
      return;
    }

    formik.setFieldValue("lessorInn", value || null, false);
  }, [formik, resetLookup]);

  const handleLessorInnSearch = useCallback(async (identifier: string) => {
    try {
      const result = await lookupMutation.mutateAsync(identifier);
      if (!result.isMatch) {
        toast.error(t("settings.lookup.mismatch"));
        return;
      }

      formik.setValues(
        mergeLookupValues<RentalContractForm>(
          formik.values,
          previousLookupValues.current,
          result.values,
          emptyLookupValues,
        ),
        false,
      );
      previousLookupValues.current = result.values;
      toast.success(t("rental.messages.lessorFound"));
    } catch (error: unknown) {
      errorHandlers(error);
    }
  }, [formik, lookupMutation, t]);

  return {
    handleLessorInnChange,
    handleLessorInnSearch,
    lessorInnLookupLoading: lookupMutation.isPending,
    resetLookup,
  };
}
