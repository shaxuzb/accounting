import { Button, Spin } from "antd";
import { useFormik } from "formik";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  CircleX,
  FileText,
  Landmark,
  MessagesSquare,
  Save,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router";
import Card from "@/components/ui/card/Card";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import CashOperationFormFields from "@/modules/cashoperation/shared/components/CashOperationFormFields";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { customDate, numberSpacing } from "@/utils/utils";
import { cashOperationSchema } from "../types/schema";
import type { CashOperationForm } from "../types/form";
import { useCancelCashOperation, useConfirmCashOperation } from "../hooks";
import { useGetDetailCashOperation } from "../hooks";
import { useUpdateCashOperation } from "../hooks";

const buildTouched = (values: CashOperationForm) => ({
  cashBoxId: values.cashBoxId !== null,
  cashOperationId: values.cashOperationId !== null,
  operationTypeId: values.operationTypeId !== null,
  paymentPurposeId: values.paymentPurposeId !== null,
  counterpartyId: values.counterpartyId !== null,
  docDate: Boolean(values.docDate),
  currencyId: values.currencyId !== null,
  amount: values.amount !== null,
  comment: Boolean(values.comment),
});

export default function CashOperationDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();

  const detailQuery = useGetDetailCashOperation(id);
  const updateMutation = useUpdateCashOperation();
  const confirmMutation = useConfirmCashOperation(id);
  const cancelMutation = useCancelCashOperation(id);

  const record = detailQuery.data;
  const isDraft = record?.statusId === 1;
  const isConfirmed = record?.statusId === 2;
  const isCancelled = record?.statusId === 3;
  const isBusy = detailQuery.isLoading || updateMutation.isPending;
  const isActionBusy =
    confirmMutation.isPending || cancelMutation.isPending || updateMutation.isPending;

  const initialValues = useMemo<CashOperationForm>(
    () => ({
      cashBoxId: record?.cashBoxId ?? null,
      cashOperationId: record?.cashOperationId ?? null,
      operationTypeId: record?.operationTypeId ?? null,
      paymentPurposeId: record?.paymentPurposeId ?? null,
      counterpartyId: record?.counterpartyId ?? null,
      docDate: record?.docDate ?? "",
      currencyId: record?.currencyId ?? null,
      amount: record?.amount ?? null,
      comment: record?.comment ?? "",
      stateId: record?.stateId ?? null,
    }),
    [record],
  );

  const formik = useFormik<CashOperationForm>({
    initialValues,
    enableReinitialize: true,
    validationSchema: cashOperationSchema(),
    onSubmit: async () => {},
  });

  useEffect(() => {
    if (!record) return;
    formik.setValues(initialValues);
    formik.setTouched({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues, record]);

  useEffect(() => {
    if (!detailQuery.error) return;
    errorHandlers(detailQuery.error);
  }, [detailQuery.error]);

  const saveDraft = async () => {
    if (!id) return false;

    const errors = await formik.validateForm();
    if (Object.keys(errors).length > 0) {
      formik.setTouched(buildTouched(formik.values));
      toast.error("Iltimos, majburiy maydonlarni to'ldiring");
      return false;
    }

    try {
      await updateMutation.mutateAsync({
        id,
        payload: formik.values,
      });
      toast.success("Hujjat saqlandi");
      return true;
    } catch (error) {
      errorHandlers(error);
      return false;
    }
  };

  const ensureSavedBeforeAction = async () => {
    if (!formik.dirty) return true;
    return saveDraft();
  };

  const handleConfirm = async () => {
    if (!isDraft) return;

    const ready = await ensureSavedBeforeAction();
    if (!ready) return;

    try {
      await confirmMutation.mutateAsync();
      toast.success("Kassa amaliyoti tasdiqlandi");
      navigate("..");
    } catch (error) {
      errorHandlers(error);
    }
  };

  const handleCancel = async () => {
    if (!isDraft) return;

    const ready = await ensureSavedBeforeAction();
    if (!ready) return;

    try {
      await cancelMutation.mutateAsync();
      toast.success("Kassa amaliyoti bekor qilindi");
      navigate("..");
    } catch (error) {
      errorHandlers(error);
    }
  };

  if (isBusy && !record) {
    return (
      <div className="flex justify-center p-10">
        <Spin />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-border/50 overflow-hidden bg-gradient-card">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="size-4 text-primary" />
              <span className="font-semibold">Hujjat raqami</span>
            </div>
            <p className="text-lg font-bold text-foreground">
              {record?.docNumber ?? record?.id ?? "-"}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="size-4 text-primary" />
              <span className="font-semibold">Sana</span>
            </div>
            <p className="font-semibold text-foreground">
              {customDate(record?.docDate)}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Wallet className="size-4 text-primary" />
              <span className="font-semibold">Holati</span>
            </div>
            <div>
              <ProcessStatusBadge
                statusId={record?.statusId}
                statusName={record?.statusName}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              icon={<ArrowLeft className="size-4" />}
              onClick={() => navigate("..")}
            >
              Orqaga
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card className="space-y-4 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Landmark className="size-4 text-primary" />
            <span>Document ma'lumotlari</span>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <CashOperationFormFields formik={formik} disabled={!isDraft} />
          </form>

          <div className="rounded-lg border border-border/60 bg-background/60 p-3 text-sm text-muted-foreground">
            {isDraft
              ? "Hujjat qoralama holatda. Maydonlarni o`zgartirish, saqlash, tasdiqlash yoki bekor qilish mumkin."
              : "Hujjat yakuniy holatda. Tasdiqlangan yoki bekor qilingan hujjatlar readonly bo`ladi."}
          </div>
        </Card>

        <Card className="space-y-4 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <MessagesSquare className="size-4 text-primary" />
            <span>Amallar</span>
          </div>

          <div className="space-y-3">
            <Button
              block
              size="large"
              icon={<Save className="size-4" />}
              loading={updateMutation.isPending}
              disabled={isActionBusy || !isDraft}
              onClick={() => void saveDraft()}
            >
              Saqlash
            </Button>
            <Button
              type="primary"
              block
              size="large"
              icon={<CheckCircle2 className="size-4" />}
              loading={confirmMutation.isPending}
              disabled={isActionBusy || !isDraft}
              onClick={() => void handleConfirm()}
            >
              Tasdiqlash
            </Button>
            <Button
              danger
              block
              size="large"
              icon={<CircleX className="size-4" />}
              loading={cancelMutation.isPending}
              disabled={isActionBusy || !isDraft}
              onClick={() => void handleCancel()}
            >
              Bekor qilish
            </Button>
          </div>

          {record?.statusName && (
            <div className="rounded-lg border border-border/60 bg-background/60 p-3 text-sm">
              Joriy holat: <span className="font-semibold">{record.statusName}</span>
            </div>
          )}
          {isConfirmed && (
            <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-700">
              Hujjat tasdiqlangan. Endi bu yerda o`zgartirish yoki qayta tasdiqlash mumkin emas.
            </div>
          )}
          {isCancelled && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700">
              Hujjat bekor qilingan. Endi bu yerda o`zgartirish yoki action bajarish mumkin emas.
            </div>
          )}
          {record?.amount != null && (
            <div className="rounded-lg border border-border/60 bg-background/60 p-3 text-sm">
              Summa:{" "}
              <span className="font-semibold">
                {numberSpacing(record.amount)} UZS
              </span>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
