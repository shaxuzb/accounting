import { Button, Form, Spin } from "antd";
import { useFormik } from "formik";
import { Calendar, CheckCircle2, CircleX, Save } from "lucide-react";
import { useMemo } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import dayjs from "@/config/dayjs";
import Card from "@/components/ui/card/Card";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import CashReadonlyDetailsCard from "@/modules/cashoperation/components/CashReadonlyDetailsCard";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { customDate, numberSpacing } from "@/utils/utils";
import { cashDocumentSchema } from "../types/schema";
import type { CashDocumentForm } from "../types/form";
import {
  useCancelCashDocument,
  useConfirmCashDocument,
  useCreateCashDocument,
  useGetDetailCashDocument,
  useUpdateCashDocument,
} from "../hooks";
import { getCashDocumentLabels, resolveCashDocumentKind } from "../utils/kind";
import CashDocumentFormFields from "./CashDocumentFormFields";
import { cashDocumentTypeIds } from "@/modules/cashoperation/constants/documentAccount";

const defaultValues: CashDocumentForm = {
  cashBoxId: null,
  paymentTypeId: null,
  counterpartyId: null,
  docDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
  currencyId: null,
  amount: null,
  exchangeRate: 1,
  cashChartAccountId: null,
  offsetAccountId: null,
  comment: "",
};

export default function CashDocumentDetailPage() {
  const { t } = useTranslation();
  const { id = "", kind: rawKind } = useParams();
  const navigate = useNavigate();
  const kind = resolveCashDocumentKind(rawKind);
  const labels = getCashDocumentLabels(kind);
  const isCreate = !id;
  const detailQuery = useGetDetailCashDocument(kind, id);
  const createMutation = useCreateCashDocument(kind);
  const updateMutation = useUpdateCashDocument(kind, id);
  const confirmMutation = useConfirmCashDocument(kind, id);
  const cancelMutation = useCancelCashDocument(kind, id);
  const record = detailQuery.data;
  const statusId = record?.statusId ?? 1;
  const isDraft = isCreate || statusId === 1;

  const initialValues = useMemo<CashDocumentForm>(
    () => ({
      cashBoxId: record?.cashBoxId ?? null,
      paymentTypeId: record?.paymentTypeId ?? null,
      counterpartyId: record?.counterpartyId ?? null,
      docDate: record?.docDate ?? defaultValues.docDate,
      currencyId: record?.currencyId ?? null,
      amount: record?.amount ?? null,
      exchangeRate: record?.exchangeRate ?? 1,
      comment: record?.comment ?? "",
      cashChartAccountId: record?.cashChartAccountId ?? null,
      offsetAccountId: record?.offsetAccountId ?? null,
    }),
    [record],
  );

  const formik = useFormik<CashDocumentForm>({
    initialValues,
    enableReinitialize: true,
    validationSchema: cashDocumentSchema,
    onSubmit: async (values) => {
      try {
        if (isCreate) {
          await createMutation.mutateAsync(values);
          toast.success("Hujjat yaratildi");
          navigate(`/main/cash-operationses/cash-documents/${kind}`, {
            replace: true,
          });
          return;
        }

        await updateMutation.mutateAsync(values);
        toast.success("Hujjat saqlandi");
        navigate(`/main/cash-operationses/cash-documents/${kind}/${id}`, {
          replace: true,
        });
      } catch (error) {
        errorHandlers(error);
      }
    },
  });

  const saveDraft = async () => {
    const errors = await formik.validateForm();
    if (Object.keys(errors).length > 0) {
      formik.setTouched({
        cashBoxId: true,
        paymentTypeId: true,
        counterpartyId: true,
        docDate: true,
        currencyId: true,
        amount: true,
        exchangeRate: true,
        comment: true,
        cashChartAccountId:true,
        offsetAccountId: true,
      });
      toast.error("Iltimos, majburiy maydonlarni to'ldiring");
      return false;
    }

    await formik.submitForm();
    return true;
  };

  const ensureSavedBeforeAction = async () => {
    if (!formik.dirty) return true;
    return saveDraft();
  };

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
              {t(labels.detailTitle)}
            </div>
            <div className="text-lg font-semibold">
              {record?.docNumber ?? (isCreate ? t(labels.addTitle) : "Hujjat")}
            </div>
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
          <div className="flex items-center gap-2">
            {!isCreate && (
              <ProcessStatusBadge
                statusId={record?.statusId}
                statusName={record?.statusName}
              />
            )}
            {/* <Button
              icon={<ArrowLeft className="size-4" />}
              onClick={() => navigate("..")}
            >
              Orqaga
            </Button> */}
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.7fr_0.9fr]">
        <Card className="p-4">
          {isDraft ? (
            <Form layout="vertical" onFinish={formik.handleSubmit}>
              <CashDocumentFormFields
                formik={formik}
                documentTypeId={
                  kind === "rko"
                    ? cashDocumentTypeIds.expense
                    : cashDocumentTypeIds.income
                }
              />
            </Form>
          ) : (
            record && <CashReadonlyDetailsCard record={record} />
          )}
        </Card>

        <Card className="space-y-3 p-4">
          <div className="text-sm font-semibold">Amallar</div>
          {isDraft && (
            <>
              <Button
                block
                icon={<Save className="size-4" />}
                onClick={() => void saveDraft()}
                loading={createMutation.isPending || updateMutation.isPending}
              >
                Saqlash
              </Button>
              {!isCreate && (
                <>
                  <Button
                    type="primary"
                    block
                    icon={<CheckCircle2 className="size-4" />}
                    onClick={async () => {
                      const ready = await ensureSavedBeforeAction();
                      if (!ready) return;

                      try {
                        await confirmMutation.mutateAsync();
                        toast.success("Hujjat tasdiqlandi");
                        navigate(`/main/cash-operationses/cash-documents/${kind}`, {
                          replace: true,
                        });
                      } catch (error) {
                        errorHandlers(error);
                      }
                    }}
                    loading={confirmMutation.isPending}
                  >
                    Tasdiqlash
                  </Button>
                  <Button
                    danger
                    block
                    icon={<CircleX className="size-4" />}
                    onClick={async () => {
                      const ready = await ensureSavedBeforeAction();
                      if (!ready) return;

                      try {
                        await cancelMutation.mutateAsync();
                        toast.success("Hujjat bekor qilindi");
                        navigate(`/main/cash-operationses/cash-documents/${kind}`, {
                          replace: true,
                        });
                      } catch (error) {
                        errorHandlers(error);
                      }
                    }}
                    loading={cancelMutation.isPending}
                  >
                    Bekor qilish
                  </Button>
                </>
              )}
            </>
          )}
          {record?.statusName && (
            <div className="rounded-lg border border-border/60 bg-background/60 p-3 text-sm">
              Joriy holat:{" "}
              <span className="font-semibold">{record.statusName}</span>
            </div>
          )}
          {record?.amount != null && (
            <div className="rounded-lg border border-border/60 bg-background/60 p-3 text-sm">
              Summa:{" "}
              <span className="font-semibold">
                {numberSpacing(record.amount)} {record.currencyName ?? ""}
              </span>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
