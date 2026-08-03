import { Button, Form, Spin } from "antd";
import { useMemo } from "react";
import { useFormik } from "formik";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import dayjs from "@/config/dayjs";
import { Calendar, CheckCircle2, CircleX, Save } from "lucide-react";
import Card from "@/components/ui/card/Card";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";

import { useAppSelector } from "@/store/hooks";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { customDate, numberSpacing } from "@/utils/utils";

import { faDisposalSchema } from "../types/schema";
import type { FaDisposalFormValues } from "../types/form";
import {
  useCancelFaDisposal,
  useConfirmFaDisposal,
  useCreateFaDisposal,
  useGetDetailFaDisposal,
  useUpdateFaDisposal,
} from "../hooks";
import { faDisposalPermissions } from "../constants/permissions";
import { faDocumentStatusIds } from "../../../shared/constants/statuses";
import FaDisposalFormFields from "../components/FaDisposalFormFields";

const defaultValues: FaDisposalFormValues = {
  disposalDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
  disposalTypeId: null,
  reason: "",
  stateId: faDocumentStatusIds.draft,
  disposalAccountId: null,
  customerAccountId: null,
  vatAccountId: null,
  gainAccountId: null,
  lossAccountId: null,
  lines: [
    {
      faAssetId: null,
      saleAmount: 0,
      note: "",
      assetAccountId: null,
      accumulatedDepreciationAccountId: null,
    },
  ],
};

export default function FaDisposalFormPage() {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const isCreate = !id;
  
  const { user } = useAppSelector((state) => state.auth);
  const permissions = user?.user.permissions ?? [];
  const canCreate = permissions.includes(faDisposalPermissions.create);
  const canUpdate = permissions.includes(faDisposalPermissions.update);
  const canConfirm = permissions.includes(faDisposalPermissions.confirm);
  const canCancel = permissions.includes(faDisposalPermissions.cancel);

  const detailQuery = useGetDetailFaDisposal(id);
  const createMutation = useCreateFaDisposal();
  const updateMutation = useUpdateFaDisposal();
  const confirmMutation = useConfirmFaDisposal(id);
  const cancelMutation = useCancelFaDisposal(id);

  const record = detailQuery.data;
  const statusId =
    record?.statusId ?? record?.stateId ?? faDocumentStatusIds.draft;
  const isDraft = isCreate || statusId === faDocumentStatusIds.draft;
  const canSubmit = isCreate ? canCreate : isDraft && canUpdate;

  const initialValues = useMemo<FaDisposalFormValues>(
    () => ({
      disposalDate: record?.disposalDate ?? defaultValues.disposalDate,
      disposalTypeId: record?.disposalTypeId ?? defaultValues.disposalTypeId,
      reason: record?.reason ?? "",
      stateId: record?.stateId ?? defaultValues.stateId,
      disposalAccountId:
        record?.disposalAccountId ?? defaultValues.disposalAccountId,
      customerAccountId:
        record?.customerAccountId ?? defaultValues.customerAccountId,
      vatAccountId: record?.vatAccountId ?? defaultValues.vatAccountId,
      gainAccountId: record?.gainAccountId ?? defaultValues.gainAccountId,
      lossAccountId: record?.lossAccountId ?? defaultValues.lossAccountId,
      lines: record?.lines?.length ? record.lines : defaultValues.lines,
    }),
    [record],
  );

  const formik = useFormik<FaDisposalFormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema: faDisposalSchema(t),
    onSubmit: async (values, helpers) => {
      try {
        const payload = {
          disposalDate: values.disposalDate,
          disposalTypeId: Number(values.disposalTypeId),
          reason: values.reason,
          stateId: values.stateId,
          disposalAccountId: Number(values.disposalAccountId),
          customerAccountId: Number(values.customerAccountId),
          vatAccountId: Number(values.vatAccountId),
          gainAccountId: Number(values.gainAccountId),
          lossAccountId: Number(values.lossAccountId),
          lines: values.lines.map((line) => ({
            ...line,
            faAssetId: Number(line.faAssetId),
            saleAmount: Number(line.saleAmount),
            assetAccountId: Number(line.assetAccountId),
            accumulatedDepreciationAccountId: Number(
              line.accumulatedDepreciationAccountId,
            ),
          })),
        };

        if (!isCreate && id) {
          await updateMutation.mutateAsync({ id, payload });
          helpers.resetForm({ values });
          toast.success(t("settings.messages.updated"));
        } else {
          const created = await createMutation.mutateAsync(payload);
          toast.success(t("settings.messages.created"));
          navigate(`/main/fa/disposals/edit/${created.id}`, { replace: true });
        }
      } catch (err: unknown) {
        errorHandlers(err);
        throw err;
      }
    },
  });

  const saveDraft = async () => {
    const errors = await formik.validateForm();
    if (Object.keys(errors).length > 0) {
      formik.setTouched(
        Object.keys(errors).reduce((acc, key) => ({ ...acc, [key]: true }), {})
      );
      toast.error(t("common.requiredFields"));
      return false;
    }
    try {
      await formik.submitForm();
      return true;
    } catch {
      return false;
    }
  };

  const ensureSavedBeforeAction = async () => {
    if (!formik.dirty) return true;
    return saveDraft();
  };

  const isSubmitting =
    createMutation.isPending ||
    updateMutation.isPending ||
    confirmMutation.isPending ||
    cancelMutation.isPending;

  const totalSaleAmount = formik.values.lines.reduce((sum, line) => sum + Number(line.saleAmount || 0), 0);

  if (detailQuery.isLoading && !isCreate) {
    return (
      <div className="flex justify-center p-10">
        <Spin />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm text-muted-foreground">
              {t("app.routes.faDisposals")}
            </div>
            <div className="text-lg font-semibold">
              {isCreate ? t("fa.form.create") : `${t("fa.form.edit")} №${record?.id ?? id}`}
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="size-4 text-primary" />
              <span className="font-semibold">{t("fa.fields.disposalDate")}</span>
            </div>
            <p className="font-semibold text-foreground">
              {customDate(record?.disposalDate ?? defaultValues.disposalDate)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isCreate && (
              <ProcessStatusBadge
                statusId={record?.statusId ?? record?.stateId}
                statusName={record?.statusName ?? record?.stateName}
              />
            )}
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.7fr_0.9fr]">
        <Card className="p-4">
          <Form layout="vertical" onFinish={formik.handleSubmit}>
            <fieldset disabled={!isDraft} className="group">
              <FaDisposalFormFields formik={formik} isDraft={isDraft} />
            </fieldset>
          </Form>
        </Card>

        {/* Right Column - Actions */}
        <div className="flex flex-col gap-4">
          <Card className="space-y-3 p-4">
            <div className="text-sm font-semibold">{t("common.actions")}</div>
            {isDraft && (
              <>
                {canSubmit && (
                  <Button
                    block
                    icon={<Save className="size-4" />}
                    onClick={() => void saveDraft()}
                    loading={isSubmitting}
                  >
                    {t("common.save")}
                  </Button>
                )}
                {!isCreate && canConfirm && (
                    <Button
                      type="primary"
                      block
                      icon={<CheckCircle2 className="size-4" />}
                      onClick={async () => {
                        const ready = await ensureSavedBeforeAction();
                        if (!ready) return;

                        try {
                          await confirmMutation.mutateAsync();
                          toast.success(t("actions.confirmSuccess", { id: record?.id ?? id }));
                          navigate("/main/fa/disposals", { replace: true });
                        } catch (error) {
                          errorHandlers(error);
                        }
                      }}
                      loading={confirmMutation.isPending}
                    >
                      {t("common.confirm")}
                    </Button>
                )}
                {!isCreate && canCancel && (
                    <Button
                      danger
                      block
                      icon={<CircleX className="size-4" />}
                      onClick={async () => {
                        const ready = await ensureSavedBeforeAction();
                        if (!ready) return;

                        try {
                          await cancelMutation.mutateAsync();
                          toast.success(t("actions.cancelSuccess", { id: record?.id ?? id }));
                          navigate("/main/fa/disposals", { replace: true });
                        } catch (error) {
                          errorHandlers(error);
                        }
                      }}
                      loading={cancelMutation.isPending}
                    >
                      {t("common.cancel")}
                    </Button>
                )}
              </>
            )}
          </Card>
          
          <Card className="p-4 bg-gray-50/50">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-medium">{t("fa.sections.totalSaleAmount")}:</span>
              <span className="font-bold text-lg">{numberSpacing(totalSaleAmount)}</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
