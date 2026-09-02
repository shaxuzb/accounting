import { Spin } from "antd";
import dayjs from "dayjs";
import { useFormik } from "formik";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { mergeLookupValues } from "@/modules/settings/shared/taxpayerLookup";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { buildContractPayload } from "../utils/payload";
import { rentalContractSchema } from "../types/schema";
import type { RentalContractForm } from "../types/form";
import {
  useCreateRentalContract,
  useLookupRentalLessor,
  useRentalContract,
  useUpdateRentalContract,
} from "../hooks";
import ContractFormFields from "../components/ContractFormFields";
import { emptyObject } from "../utils/defaults";

const today = dayjs().format("YYYY-MM-DDT00:00:00");
const nextYear = dayjs().add(1, "year").format("YYYY-MM-DDT00:00:00");

const defaultValues: RentalContractForm = {
  lessorFullName: "",
  lessorInn: null,
  lessorPinfl: null,
  contractNumber: "",
  contractDate: today,
  startDate: today,
  endDate: nextYear,
  currencyId: null,
  lessorPayableAccountId: null,
  taxPayableAccountId: null,
  comment: "",
  objects: [emptyObject(today, nextYear)],
};

const emptyLessorLookupValues: Pick<
  RentalContractForm,
  "lessorFullName" | "lessorInn" | "lessorPinfl"
> = {
  lessorFullName: "",
  lessorInn: null,
  lessorPinfl: null,
};

export default function ContractAddEditPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { data, isLoading } = useRentalContract(id);
  const createMutation = useCreateRentalContract();
  const updateMutation = useUpdateRentalContract();
  const lookupMutation = useLookupRentalLessor();
  const previousLookupValues = useRef<
    Partial<
      Pick<RentalContractForm, "lessorFullName" | "lessorInn" | "lessorPinfl">
    >
  >({});

  const formik = useFormik<RentalContractForm>({
    initialValues: defaultValues,
    enableReinitialize: false,
    validationSchema: rentalContractSchema,
    onSubmit: async (values) => {
      try {
        const payload = buildContractPayload(
          values as unknown as Record<string, unknown>,
          { includeObjectIds: isEdit },
        );
        if (isEdit && id) {
          await updateMutation.mutateAsync({ id, payload });
          toast.success(t("settings.messages.updated"));
          navigate(`/main/rentals/contracts/${id}`);
        } else {
          const createdId = await createMutation.mutateAsync(payload);
          toast.success(t("settings.messages.created"));
          navigate(`/main/rentals/contracts/${createdId}`);
        }
      } catch (error) {
        errorHandlers(error);
      }
    },
  });

  const handleLessorInnChange = (value: string) => {
    if (Object.keys(previousLookupValues.current).length > 0) {
      const clearedValues = mergeLookupValues<RentalContractForm>(
        formik.values,
        previousLookupValues.current,
        {},
        emptyLessorLookupValues,
      );
      previousLookupValues.current = {};
      formik.setValues({ ...clearedValues, lessorInn: value }, false);
      return;
    }

    formik.setFieldValue("lessorInn", value || null, false);
  };

  const handleLessorInnSearch = async (identifier: string) => {
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
          emptyLessorLookupValues,
        ),
        false,
      );
      previousLookupValues.current = result.values;
      toast.success(t("rental.messages.lessorFound"));
    } catch (error: unknown) {
      errorHandlers(error);
    }
  };

  const { setValues } = formik;
  useEffect(() => {
    if (!data || !isEdit) return;
    previousLookupValues.current = {};
    setValues({
      lessorFullName: data.lessorFullName ?? "",
      lessorInn: data.lessorInn ?? null,
      lessorPinfl: data.lessorPinfl ?? null,
      contractNumber: data.contractNumber ?? "",
      contractDate: data.contractDate ?? "",
      startDate: data.startDate ?? "",
      endDate: data.endDate ?? "",
      currencyId: data.currencyId ?? null,
      lessorPayableAccountId: data.lessorPayableAccountId ?? null,
      taxPayableAccountId: data.taxPayableAccountId ?? null,
      comment: data.comment ?? "",
      objects: data.objects.map((object) => ({
        id: object.id,
        rentalObjectTypeId: object.rentalObjectTypeId,
        objectName: object.objectName ?? "",
        objectIdentifier: object.objectIdentifier ?? "",
        objectAddress: object.objectAddress ?? "",
        startDate: object.startDate ?? "",
        endDate: object.endDate ?? "",
        periodUnit: object.periodUnit === "DAY" ? "DAY" : "MONTH",
        periodValue: object.periodValue,
        contractAmount: object.contractAmount,
        taxBaseAmount: object.taxBaseAmount,
        taxRate: object.taxRate,
        expenseAccountId: object.expenseAccountId ?? null,
      })),
    });
  }, [data, isEdit, setValues]);

  return (
    <Spin spinning={isLoading}>
      <div className="w-full min-w-0 space-y-4 px-2 pb-4 sm:px-3">
        <ContractFormFields
          formik={formik}
          isEdit={isEdit}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          onCancel={() => navigate("/main/rentals/contracts")}
          onLessorInnChange={handleLessorInnChange}
          onLessorInnSearch={handleLessorInnSearch}
          lessorInnLookupLoading={lookupMutation.isPending}
        />
      </div>
    </Spin>
  );
}
