import { Spin } from "antd";
import dayjs from "dayjs";
import { useFormik } from "formik";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import DraftActionsBar from "@/components/ui/card/DraftActionsBar";
import { buildContractPayload } from "../utils/payload";
import { rentalContractSchema } from "../types/schema";
import type { RentalContractForm } from "../types/form";
import {
  useCreateRentalContract,
  useRentalLessorLookup,
  useRentalContract,
  useUpdateRentalContract,
} from "../hooks";
import ContractFormFields from "../components/ContractFormFields";
import { createRentalContractDefaults } from "../utils/defaults";
import { mapRentalContractToForm } from "../utils/form";

const today = dayjs().format("YYYY-MM-DD");
const nextYear = dayjs().add(1, "year").format("YYYY-MM-DD");

const defaultValues = createRentalContractDefaults(today, nextYear);

export default function ContractAddEditPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { data, isLoading } = useRentalContract(id);
  const createMutation = useCreateRentalContract();
  const updateMutation = useUpdateRentalContract();

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

  const {
    handleLessorIdentifierChange,
    handleLessorIdentifierSearch,
    lessorInnLookupLoading,
    resetLookup,
  } = useRentalLessorLookup(formik);

  const { setValues } = formik;
  useEffect(() => {
    if (!data || !isEdit) return;
    resetLookup();
    setValues(mapRentalContractToForm(data));
  }, [data, isEdit, resetLookup, setValues]);

  return (
    <Spin spinning={isLoading}>
      <ContractFormFields
        formik={formik}
        isEdit={isEdit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onCancel={() => navigate("/main/rentals/contracts")}
        onLessorIdentifierChange={handleLessorIdentifierChange}
        onLessorIdentifierSearch={handleLessorIdentifierSearch}
        lessorInnLookupLoading={lessorInnLookupLoading}
        actions={
          <DraftActionsBar
            isCreate
            canSave
            canConfirm={false}
            canCancel={false}
            saving={createMutation.isPending || updateMutation.isPending}
            confirming={false}
            cancelling={false}
            onExit={() => navigate("/main/rentals/contracts")}
            onConfirm={() => undefined}
            onCancelDocument={() => undefined}
          />
        }
      />
    </Spin>
  );
}
