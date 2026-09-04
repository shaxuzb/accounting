import { Result, Spin } from "antd";
import { useFormik } from "formik";
import { useMemo } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store/hooks";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import DraftActionsBar from "@/components/ui/card/DraftActionsBar";
import { mapRentalAccrualToForm } from "../utils/form";
import { buildAccrualUpdatePayload } from "../utils/payload";
import type { RentalAccrualForm } from "../types/form";
import { rentalAccrualSchema } from "../types/schema";
import {
  useCancelRentalAccrual,
  usePostRentalAccrual,
  useRentalAccrual,
  useUpdateRentalAccrual,
} from "../hooks";
import AccrualDetailContent from "../components/AccrualDetailContent";
import { rentalAccrualPermissions } from "../constants/permissions";
import {
  isRentalDraft,
  isRentalPosted,
} from "@/modules/rental/shared/constants/statuses";

export default function AccrualDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const permissions = useAppSelector(
    (state) => state.auth.user?.user.permissions ?? [],
  );
  const { data, isLoading, isError, refetch } = useRentalAccrual(id);
  const updateMutation = useUpdateRentalAccrual();
  const postMutation = usePostRentalAccrual();
  const cancelMutation = useCancelRentalAccrual();
  const isDraft = isRentalDraft(data?.statusId);
  const canSave = Boolean(
    isDraft && permissions.includes(rentalAccrualPermissions.update),
  );
  const canPost = Boolean(
    isDraft && permissions.includes(rentalAccrualPermissions.post),
  );
  const canCancel = Boolean(
    data &&
      (isDraft || isRentalPosted(data.statusId)) &&
      permissions.includes(rentalAccrualPermissions.cancel),
  );

  const initialValues = useMemo<RentalAccrualForm>(
    () =>
      data
        ? mapRentalAccrualToForm(data)
        : {
            exchangeRate: 1,
            lessorPayableAccountId: null,
            taxPayableAccountId: null,
            comment: "",
            items: [],
          },
    [data],
  );

  const persistDraft = async (values: RentalAccrualForm) => {
    if (!data) return;

    const itemAccounts = new Map(
      values.items.map((item) => [item.itemId, item.expenseAccountId]),
    );
    await updateMutation.mutateAsync({
      id: data.id,
      payload: buildAccrualUpdatePayload({
        ...data,
        exchangeRate: values.exchangeRate,
        lessorPayableAccountId: values.lessorPayableAccountId,
        taxPayableAccountId: values.taxPayableAccountId,
        comment: values.comment,
        items: data.items.map((item) => ({
          ...item,
          expenseAccountId: itemAccounts.get(item.id) ?? null,
        })),
      }),
    });
  };

  const formik = useFormik<RentalAccrualForm>({
    initialValues,
    enableReinitialize: true,
    validationSchema: rentalAccrualSchema,
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

  const handleConfirm = async () => {
    if (!data) return;

    const validationErrors = await formik.validateForm();
    if (Object.keys(validationErrors).length) {
      toast.error(t("common.requiredFields"));
      return;
    }
    if (
      !formik.values.lessorPayableAccountId ||
      !formik.values.taxPayableAccountId ||
      formik.values.items.some((item) => !item.expenseAccountId)
    ) {
      toast.error(t("rental.messages.accountsRequired"));
      return;
    }

    try {
      await persistDraft(formik.values);
      await postMutation.mutateAsync(data.id);
      toast.success(t("actions.confirmSuccess", { id: data.id }));
      await refetch();
    } catch (error) {
      errorHandlers(error);
    }
  };

  const runAction = async (action: () => Promise<unknown>) => {
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

  return (
    <div className="w-full min-w-0 space-y-3 px-2 pb-4 sm:px-3">
      <AccrualDetailContent
        data={data}
        formik={isDraft ? formik : undefined}
        disabled={!canSave}
        actions={
          <DraftActionsBar
            isCreate={false}
            canSave={canSave}
            canConfirm={canPost}
            canCancel={canCancel}
            saving={updateMutation.isPending}
            confirming={postMutation.isPending}
            cancelling={cancelMutation.isPending}
            onExit={() => navigate("/main/rentals/accruals")}
            onConfirm={handleConfirm}
            onCancelDocument={() =>
              runAction(() => cancelMutation.mutateAsync(data.id))
            }
            cancelLabel="rental.actions.cancel"
          />
        }
      />
    </div>
  );
}
