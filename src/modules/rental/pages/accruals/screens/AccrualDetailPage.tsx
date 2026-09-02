import { Button, Card, Result, Spin } from "antd";
import { ArrowLeft } from "lucide-react";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store/hooks";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { buildAccrualUpdatePayload } from "../utils/payload";
import type { RentalAccrualForm } from "../types/form";
import {
  useCancelRentalAccrual,
  useDeleteRentalAccrual,
  usePostRentalAccrual,
  useRentalAccrual,
  useUpdateRentalAccrual,
} from "../hooks";
import AccrualActions from "../components/AccrualActions";
import AccrualDetailContent from "../components/AccrualDetailContent";

export default function AccrualDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const permissions = useAppSelector(
    (state) => state.auth.user?.user.permissions ?? [],
  );
  const { data, isLoading, isError, refetch } = useRentalAccrual(id);
  const [editing, setEditing] = useState(false);
  const updateMutation = useUpdateRentalAccrual();
  const postMutation = usePostRentalAccrual();
  const cancelMutation = useCancelRentalAccrual();
  const deleteMutation = useDeleteRentalAccrual();
  const formik = useFormik<RentalAccrualForm>({
    initialValues: {
      exchangeRate: 1,
      lessorPayableAccountId: null,
      taxPayableAccountId: null,
      comment: "",
      items: [],
    },
    enableReinitialize: false,
    onSubmit: async (values) => {
      if (!data) return;
      try {
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
        toast.success(t("settings.messages.updated"));
        setEditing(false);
        await refetch();
      } catch (error) {
        errorHandlers(error);
      }
    },
  });

  const { setValues } = formik;
  useEffect(() => {
    if (!data) return;
    setValues({
      exchangeRate: data.exchangeRate ?? 1,
      lessorPayableAccountId: data.lessorPayableAccountId ?? null,
      taxPayableAccountId: data.taxPayableAccountId ?? null,
      comment: data.comment ?? "",
      items: data.items.map((item) => ({
        itemId: item.id,
        expenseAccountId: item.expenseAccountId ?? null,
      })),
    });
  }, [data, setValues]);

  const runAction = async (action: () => Promise<unknown>) => {
    try {
      await action();
      await refetch();
    } catch (error) {
      errorHandlers(error);
    }
  };
  const isMutating =
    updateMutation.isPending ||
    postMutation.isPending ||
    cancelMutation.isPending ||
    deleteMutation.isPending;

  if (isLoading) return <Spin className="block py-20" />;
  if (isError || !data)
    return <Result status="404" title={t("common.notFound")} />;

  return (
    <div className="w-full min-w-0 space-y-3 px-2 pb-4 sm:px-3">
      <Card className="border-border!" bodyStyle={{ padding: 12 }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            icon={<ArrowLeft className="size-4" />}
            onClick={() => navigate("/main/rentals/accruals")}
          >
            {t("common.back")}
          </Button>
          <AccrualActions
            statusId={data.statusId}
            permissions={permissions}
            editing={editing}
            loading={isMutating}
            onEdit={() => setEditing(true)}
            onSave={() => void formik.submitForm()}
            onDiscard={() => {
              formik.resetForm();
              setEditing(false);
            }}
            onPost={() =>
              void runAction(() => postMutation.mutateAsync(data.id))
            }
            onCancel={() =>
              void runAction(() => cancelMutation.mutateAsync(data.id))
            }
            onDelete={() =>
              void runAction(async () => {
                await deleteMutation.mutateAsync(data.id);
                navigate("/main/rentals/accruals");
              })
            }
          />
        </div>
      </Card>
      <AccrualDetailContent data={data} formik={editing ? formik : undefined} />
    </div>
  );
}
