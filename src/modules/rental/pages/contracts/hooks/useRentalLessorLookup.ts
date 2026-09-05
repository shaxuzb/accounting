import { useCallback, useRef } from "react";
import type { FormikProps } from "formik";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import type { RentalContractForm } from "../types/form";
import type { RentalLessorForm } from "../types/form";
import { updateRentalLessorIdentifier } from "../utils/lessorIdentifier";
import { useLookupRentalLessor } from "./useLookupRentalLessor";

export default function useRentalLessorLookup(
  formik: FormikProps<RentalContractForm>,
) {
  const { t } = useTranslation();
  const lookupMutation = useLookupRentalLessor();
  const previousLookupValues = useRef<Record<number, Partial<RentalLessorForm>>>({});

  const resetLookup = useCallback(() => {
    previousLookupValues.current = {};
  }, []);

  const handleLessorIdentifierChange = useCallback(
    (index: number, value: string) => {
      const current = formik.values.lessors[index];
      if (!current) return;
      let next = current;
      const previous = previousLookupValues.current[index];
      if (previous) {
        const cleared = { ...current };
        Object.entries(previous).forEach(([key, previousValue]) => {
          if (cleared[key as keyof RentalLessorForm] === previousValue) {
            (cleared as Record<string, unknown>)[key] = null;
          }
        });
        delete previousLookupValues.current[index];
        next = cleared;
      }

      formik.setFieldValue(
        `lessors[${index}]`,
        updateRentalLessorIdentifier(next, value),
        false,
      );
    },
    [formik],
  );

  const handleLessorIdentifierSearch = useCallback(
    async (index: number, identifier: string) => {
      try {
        const result = await lookupMutation.mutateAsync(identifier);
        if (!result.isMatch) {
          toast.error(t("settings.lookup.mismatch"));
          return;
        }

        const current = formik.values.lessors[index];
        if (!current) return;
        const values = result.values;
        formik.setFieldValue(`lessors[${index}]`, { ...current, ...values }, false);
        previousLookupValues.current[index] = values;
        toast.success(t("rental.messages.lessorFound"));
      } catch (error: unknown) {
        errorHandlers(error);
      }
    },
    [formik, lookupMutation, t],
  );

  return {
    handleLessorIdentifierChange,
    handleLessorIdentifierSearch,
    lessorInnLookupLoading: lookupMutation.isPending,
    resetLookup,
  };
}
