import { Button, Card as AntCard, Col, Form, Row, Spin } from "antd";
import { useFormik } from "formik";
import {
  ArrowLeft,
  CheckCircle2,
  CircleX,
  Landmark,
  Save,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router";
import dayjs from "@/config/dayjs";
import InputNumberFormat from "@/components/fields/InputNumber";
import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import { filterIds, selectListEndpoints } from "@/shared/constants/selectLists";
import { formatDateWithOutTime } from "@/utils/helpers";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { customDate, numberSpacing } from "@/utils/utils";
import {
  useCancelBankOperation,
  useConfirmBankOperation,
  useGetDetailBankOperation,
  useUpdateBankOperation,
} from "../hooks";
import { bankPermissions } from "../constants/permissions";
import { schema } from "../types/schema";
import type { BankOperationCreatePayload } from "../types/form";

const toPositiveNumber = (value: unknown) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : null;
};

const getPaymentPurposeId = (record?: {
  paymentPurposeId?: number | null;
  lines?: { paymentPurposeId?: number | null }[] | null;
}) =>
  toPositiveNumber(record?.paymentPurposeId) ??
  toPositiveNumber(record?.lines?.[0]?.paymentPurposeId);

const getPaymentPurposeName = (record?: {
  paymentPurposeName?: string | null;
  lines?: { paymentPurposeName?: string | null }[] | null;
}) => record?.paymentPurposeName ?? record?.lines?.[0]?.paymentPurposeName ?? null;

type BankOperationForm = Omit<
  BankOperationCreatePayload,
  | "bankAccountId"
  | "operationTypeId"
  | "counterpartyId"
  | "currencyId"
  | "amount"
  | "comment"
  | "paymentPurposeId"
  | "counterpartyBankAccountId"
  | "contractId"
  | "exchangeRate"
> & {
  bankAccountId: number | null;
  operationTypeId: number | null;
  counterpartyId: number | null;
  currencyId: number | null;
  amount: number | null;
  comment: string;
  paymentPurposeId: number | null;
  counterpartyBankAccountId: number | null;
  contractId: number | null;
  exchangeRate: number | null;
};

const defaultValues: BankOperationForm = {
  bankAccountId: null,
  operationTypeId: 1,
  paymentPurposeId: null,
  counterpartyId: null,
  counterpartyBankAccountId: null,
  contractId: null,
  exchangeRate: null,
  docDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
  currencyId: null,
  amount: null,
  comment: "",
};

const DisplayField = ({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) => (
  <AntCard size="small">
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className="mt-1 font-medium">{value || "-"}</div>
  </AntCard>
);

export default function BankOperationDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const detailQuery = useGetDetailBankOperation(id);
  const updateMutation = useUpdateBankOperation();
  const confirmMutation = useConfirmBankOperation(id);
  const cancelMutation = useCancelBankOperation(id);
  const record = detailQuery.data;
  const isDraft = record?.statusId === 1;
  const previousCounterpartyId = useRef<number | null>(null);

  const initialValues = useMemo<BankOperationForm>(
    () => ({
      bankAccountId: record?.bankAccountId ?? null,
      operationTypeId: record?.operationTypeId ?? 1,
      paymentPurposeId: getPaymentPurposeId(record),
      counterpartyId: record?.counterpartyId ?? null,
      counterpartyBankAccountId: record?.counterpartyBankAccountId ?? null,
      contractId: record?.contractId ?? null,
      exchangeRate: record?.exchangeRate ?? null,
      docDate: record?.docDate ?? defaultValues.docDate,
      currencyId: record?.currencyId ?? null,
      amount: record?.amount ?? null,
      comment: record?.comment ?? "",
    }),
    [record],
  );

  const formik = useFormik<BankOperationForm>({
    initialValues,
    enableReinitialize: true,
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        const paymentPurposeId = toPositiveNumber(values.paymentPurposeId);
        const payload: BankOperationCreatePayload = {
          bankAccountId: Number(values.bankAccountId),
          operationTypeId: Number(values.operationTypeId),
          ...(paymentPurposeId ? { paymentPurposeId } : {}),
          counterpartyId: Number(values.counterpartyId),
          counterpartyBankAccountId: Number(values.counterpartyBankAccountId),
          docDate: dayjs(values.docDate).toISOString(),
          currencyId: Number(values.currencyId),
          amount: Number(values.amount),
          exchangeRate: Number(values.exchangeRate),
          contractId: Number(values.contractId),
          comment: values.comment.trim() || null,
        };
        await updateMutation.mutateAsync({ id, payload });
        toast.success("Hujjat saqlandi");
      } catch (error) {
        errorHandlers(error);
      }
    },
  });

  const counterpartyId = useMemo(
    () => toPositiveNumber(formik.values.counterpartyId),
    [formik.values.counterpartyId],
  );

  useEffect(() => {
    if (
      previousCounterpartyId.current !== null &&
      previousCounterpartyId.current !== counterpartyId
    ) {
      formik.setFieldValue("counterpartyBankAccountId", null, false);
      formik.setFieldValue("contractId", null, false);
    }
    previousCounterpartyId.current = counterpartyId;
  }, [counterpartyId, formik]);

  if (detailQuery.isLoading || !record) {
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
            <div className="text-sm text-muted-foreground">Bank operation</div>
            <div className="text-lg font-semibold">
              {record.docNumber ?? record.id}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ProcessStatusBadge
              statusId={record.statusId}
              statusName={record.statusName}
            />
            <Button
              icon={<ArrowLeft className="size-4" />}
              onClick={() => navigate("..")}
            >
              Orqaga
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.8fr_0.9fr]">
        <Card className="p-4">
          {isDraft ? (
            <Form layout="vertical" onFinish={formik.handleSubmit}>
              <Row gutter={[24, 8]}>
                <Col span={8}>
                  <SelectCustom
                    formik={formik}
                    fieldName="bankAccountId"
                    label="bank.fields.bankAccount"
                    path={selectListEndpoints.orgBankAccountsSelectList}
                  />
                </Col>
                <Col span={8}>
                  <SelectCustom
                    formik={formik}
                    fieldName="paymentPurposeId"
                    label="To'lov maqsadi"
                    path={`${selectListEndpoints.paymentPurposesSelectList}?operationTypeId=${formik.values.operationTypeId ?? ""}`}
                    enabled={Boolean(formik.values.operationTypeId)}
                    clearable
                    search
                    refetchSync={String(formik.values.operationTypeId ?? "")}
                    marginBottom="mb-0"
                  />
                </Col>
                <Col span={8}>
                  <SelectCustom
                    formik={formik}
                    fieldName="counterpartyId"
                    label="bank.fields.counterparty"
                    path={selectListEndpoints.counterpartiesSelectList}
                  />
                </Col>
                <Col span={8}>
                  <SelectCustom
                    formik={formik}
                    fieldName="counterpartyBankAccountId"
                    label="Counterparty bank hisob raqami"
                    path={selectListEndpoints.counterPartyBankAccounts}
                    queryParams={{
                      [filterIds.counterparty]: counterpartyId,
                    }}
                    enabled={Boolean(counterpartyId)}
                    refetchSync={String(counterpartyId ?? "")}
                    disabled={!counterpartyId}
                  />
                </Col>
                <Col span={8}>
                  <InputNumberFormat
                    formik={formik}
                    fieldName="exchangeRate"
                    label="Kurs"
                    min={0}
                    precision={6}
                  />
                </Col>
                <Col span={8}>
                  <SelectDate
                    formik={formik}
                    fieldName="docDate"
                    label="bank.fields.date"
                  />
                </Col>
                <Col span={8}>
                  <SelectCustom
                    formik={formik}
                    fieldName="currencyId"
                    label="settings.fields.currency"
                    path={selectListEndpoints.currenciesSelectList}
                  />
                </Col>
                <Col span={8}>
                  <InputNumberFormat
                    formik={formik}
                    fieldName="amount"
                    label="bank.fields.amount"
                    min={0}
                    precision={2}
                  />
                </Col>
                <Col span={8}>
                  <SelectCustom
                    formik={formik}
                    fieldName="contractId"
                    label="Shartnoma"
                    path={selectListEndpoints.contractsSelectList}
                    queryParams={{
                      choosedDate: dayjs(formik.values.docDate).format(
                        formatDateWithOutTime,
                      ),
                      [filterIds.counterparty]: counterpartyId,
                    }}
                    enabled={Boolean(counterpartyId)}
                    refetchSync={`${counterpartyId ?? ""}${formik.values.docDate ?? ""}`}
                    disabled={!counterpartyId}
                  />
                </Col>
                <Col span={24}>
                  <InputText
                    formik={formik}
                    fieldName="comment"
                    label="bank.fields.comment"
                  />
                </Col>
              </Row>
            </Form>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <DisplayField label="Sana" value={customDate(record.docDate)} />
              <DisplayField
                label="Bank hisobi"
                value={record.bankAccountName}
              />
              <DisplayField
                label="Amaliyot turi"
                value={record.operationTypeName}
              />
              <DisplayField
                label="To'lov maqsadi"
                value={getPaymentPurposeName(record)}
              />
              <DisplayField
                label="Kontragent"
                value={record.counterpartyName}
              />
              <DisplayField
                label="Kontragent bank hisobi"
                value={
                  record.counterpartyBankAccountName ??
                  record.counterpartyBankAccountNumber
                }
              />
              <DisplayField label="Valyuta" value={record.currencyName} />
              <DisplayField
                label="Summa"
                value={`${numberSpacing(record.amount)} ${record.currencyName ?? ""}`}
              />
              <DisplayField label="Kurs" value={record.exchangeRate} />
              <DisplayField
                label="Shartnoma"
                value={record.contractName ?? record.contractNumber}
              />
              <div className="md:col-span-2">
                <DisplayField label="Izoh" value={record.comment} />
              </div>
            </div>
          )}
        </Card>

        <Card className="space-y-3 p-4">
          <div className="text-sm font-semibold">Amallar</div>
          {isDraft && (
            <PermissionCard permission={bankPermissions.update}>
              <Button
                block
                icon={<Save className="size-4" />}
                onClick={() => void formik.submitForm()}
                loading={updateMutation.isPending}
              >
                Saqlash
              </Button>
            </PermissionCard>
          )}
          {isDraft && (
            <PermissionCard
              permission={[bankPermissions.confirm, bankPermissions.update]}
            >
              <Button
                type="primary"
                block
                icon={<CheckCircle2 className="size-4" />}
                loading={confirmMutation.isPending}
                onClick={async () => {
                  try {
                    await confirmMutation.mutateAsync();
                    toast.success("Hujjat tasdiqlandi");
                  } catch (error) {
                    errorHandlers(error);
                  }
                }}
              >
                Tasdiqlash
              </Button>
            </PermissionCard>
          )}
          {isDraft && (
            <PermissionCard
              permission={[bankPermissions.cancel, bankPermissions.update]}
            >
              <Button
                danger
                block
                icon={<CircleX className="size-4" />}
                loading={cancelMutation.isPending}
                onClick={async () => {
                  try {
                    await cancelMutation.mutateAsync();
                    toast.success("Hujjat bekor qilindi");
                  } catch (error) {
                    errorHandlers(error);
                  }
                }}
              >
                Bekor qilish
              </Button>
            </PermissionCard>
          )}
          <AntCard size="small">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Landmark className="size-4" />
              <span>Holati</span>
            </div>
            <div className="mt-2">
              <ProcessStatusBadge
                statusId={record.statusId}
                statusName={record.statusName}
              />
            </div>
          </AntCard>
          <AntCard size="small">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Wallet className="size-4" />
              <span>Joriy summa</span>
            </div>
            <div className="mt-2 font-semibold">
              {numberSpacing(record.amount)} {record.currencyName ?? ""}
            </div>
          </AntCard>
        </Card>
      </div>
    </div>
  );
}
