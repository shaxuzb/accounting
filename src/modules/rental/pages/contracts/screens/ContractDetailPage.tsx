import { Result, Spin } from "antd";
import { setNestedObjectValues, useFormik } from "formik";
import { useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { useAppSelector } from "@/store/hooks";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import DraftActionsBar from "@/components/ui/card/DraftActionsBar";
import ContractFormFields from "../components/ContractFormFields";
import ContractReadonlyView from "../components/readonly/ContractReadonlyView";
import {
  useActivateRentalContract,
  useCancelRentalContract,
  useRentalLessorLookup,
  useRentalContract,
  useUpdateRentalContract,
} from "../hooks";
import { rentalContractPermissions } from "../constants/permissions";
import {
  isRentalDraft,
  isRentalPosted,
} from "@/modules/rental/shared/constants/statuses";
import { rentalContractSchema } from "../types/schema";
import type { RentalContractForm } from "../types/form";
import { createRentalContractDefaults } from "../utils/defaults";
import { mapRentalContractToForm } from "../utils/form";
import { buildContractPayload } from "../utils/payload";

export default function ContractDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const permissions = useAppSelector(
    (state) => state.auth.user?.user.permissions ?? [],
  );
  const { data, isLoading, isError, refetch } = useRentalContract(id);
  const updateMutation = useUpdateRentalContract();
  const activateMutation = useActivateRentalContract();
  const cancelMutation = useCancelRentalContract();
  const isDraft = isRentalDraft(data?.statusId);
  const canSave =
    isDraft && permissions.includes(rentalContractPermissions.update);
  const canConfirm =
    isDraft && permissions.includes(rentalContractPermissions.activate);
  const canCancel = Boolean(
    data &&
      (isDraft || isRentalPosted(data.statusId)) &&
      permissions.includes(rentalContractPermissions.cancel),
  );
  const listPath = "/main/rentals/contracts";

  const initialValues = useMemo<RentalContractForm>(
    () =>
      data
        ? mapRentalContractToForm(data)
        : createRentalContractDefaults(),
    [data],
  );

  const persistDraft = async (values: RentalContractForm) => {
    if (!id) return;
    await updateMutation.mutateAsync({
      id,
      payload: buildContractPayload(
        values as unknown as Record<string, unknown>,
        { includeObjectIds: true },
      ),
    });
  };

  const formik = useFormik<RentalContractForm>({
    initialValues,
    enableReinitialize: true,
    validationSchema: rentalContractSchema,
    onSubmit: async (values) => {
      try {
        await persistDraft(values);
        toast.success(t("settings.messages.updated"));
        await refetch();
      } catch (error) {
        errorHandlers(error);
      }
    },
  });
  const {
    handleLessorInnChange,
    handleLessorInnSearch,
    lessorInnLookupLoading,
    resetLookup,
  } = useRentalLessorLookup(formik);

  useEffect(() => {
    resetLookup();
  }, [data?.id, resetLookup]);

  const validateContract = async () => {
    const errors = await formik.validateForm();
    if (!Object.keys(errors).length) return true;

    formik.setTouched(setNestedObjectValues(errors, true));
    toast.error(t("common.requiredFields"));
    return false;
  };

  const handleConfirm = async () => {
    if (!(await validateContract()) || !id) return;

    try {
      await persistDraft(formik.values);
      await activateMutation.mutateAsync(id);
      toast.success(t("actions.confirmSuccess", { id }));
      await refetch();
    } catch (error) {
      errorHandlers(error);
    }
  };

  const handleCancelDraft = async () => {
    if (!id) return;

    try {
      await cancelMutation.mutateAsync(id);
      toast.success(t("actions.cancelSuccess", { id }));
      await refetch();
    } catch (error) {
      errorHandlers(error);
    }
  };
  const mutate = async (action: () => Promise<unknown>) => {
    try {
      await action();
      await refetch();
    } catch (error) {
      errorHandlers(error);
    }
  };

  if (isLoading) return <Spin className="block py-20" />;
  if (isError || !data)
    return <Result status="404" title={t("common.notFound")} />;

  if (isDraft) {
    return (
      <ContractFormFields
        formik={formik}
        isEdit
        disabled={!canSave}
        isSubmitting={updateMutation.isPending}
        onCancel={() => navigate(listPath)}
        onLessorInnChange={handleLessorInnChange}
        onLessorInnSearch={handleLessorInnSearch}
        lessorInnLookupLoading={lessorInnLookupLoading}
        actions={
          <DraftActionsBar
            isCreate={false}
            canSave={canSave}
            canConfirm={canConfirm}
            canCancel={canCancel}
            saving={updateMutation.isPending}
            confirming={activateMutation.isPending}
            cancelling={cancelMutation.isPending}
            onExit={() => navigate(listPath)}
            onConfirm={handleConfirm}
            onCancelDocument={handleCancelDraft}
            cancelLabel="rental.actions.cancel"
          />
        }
      />
    );
  }

  return (
    <div className="w-full min-w-0 space-y-3 px-2 pb-4 sm:px-3">
      <ContractReadonlyView data={data} />
      {canCancel && (
        <DraftActionsBar
          isCreate={false}
          canSave={false}
          canConfirm={false}
          canCancel
          saving={false}
          confirming={false}
          cancelling={cancelMutation.isPending}
          onExit={() => navigate(listPath)}
          onConfirm={() => undefined}
          onCancelDocument={() => mutate(() => cancelMutation.mutateAsync(data.id))}
          cancelLabel="rental.actions.cancel"
        />
      )}
    </div>
  );
}
