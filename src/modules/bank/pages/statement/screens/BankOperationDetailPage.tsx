import { Button, Card as AntCard, Col, Form, Row, Segmented, Spin } from "antd";
import { useFormik } from "formik";
import {
  Calendar,
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
import DocumentAccountSelect from "@/components/fields/DocumentAccountSelect";
import InputNumberFormat from "@/components/fields/InputNumber";
import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import {
  filterIds,
  selectListEndpoints,
} from "@/shared/constants/selectLists";
import { formatDateWithOutTime } from "@/utils/helpers";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { customDate, numberSpacing } from "@/utils/utils";
import BankReadonlyDetailsCard from "@/modules/bank/components/BankReadonlyDetailsCard";
import {
  useCancelBankOperation,
  useConfirmBankOperation,
  useGetDetailBankOperation,
  useUpdateBankOperation,
} from "../hooks";
import { bankPermissions } from "../constants/permissions";
import { createBankOperationSchema } from "../types/schema";
import type { BankOperationCreatePayload } from "../types/form";
import {
  bankDocumentAccountRoleCodes,
  bankDocumentTypeIds,
} from "../constants/endpoints";
import { useTranslation } from "react-i18next";

const toPositiveNumber = (value: unknown) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : null;
};

type BankOperationForm = {
  bankAccountId: number | null;
  bankChartAccountId: number | null;
  offsetAccountId: number | null;
  docDate: string;
  directionId: number | null;
  operationTypeId: number | null;
  paymentTypeId: number | null;
  counterpartyId: number | null;
  currencyId: number | null;
  amount: number | null;
  comment: string;
  counterpartyBankAccountId: number | null;
  contractId: number | null;
  exchangeRate: number | null;
  bankDocumentNumber: string;
  classificationCategoryId: number | null;
  classificationRuleId: number | null;
};

const defaultValues: BankOperationForm = {
  bankAccountId: null,
  directionId: 1,
  bankChartAccountId: null,
  offsetAccountId: null,
  operationTypeId: 1,
  paymentTypeId: null,
  counterpartyId: null,
  counterpartyBankAccountId: null,
  contractId: null,
  exchangeRate: null,
  docDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
  currencyId: null,
  amount: null,
  comment: "",
  bankDocumentNumber: "",
  classificationCategoryId: null,
  classificationRuleId: null,
};

export default function BankOperationDetailPage() {
  const { t } = useTranslation();
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
      directionId: record?.directionId ?? (record?.operationTypeId === 2 ? -1 : 1),
      bankChartAccountId: record?.bankChartAccountId ?? null,
      offsetAccountId: record?.offsetAccountId ?? null,
      operationTypeId: record?.operationTypeId ?? 1,
      paymentTypeId: record?.paymentTypeId ?? null,
      counterpartyId: record?.counterpartyId ?? null,
      counterpartyBankAccountId: record?.counterpartyBankAccountId ?? null,
      contractId: record?.contractId ?? null,
      exchangeRate: record?.exchangeRate ?? null,
      docDate: record?.docDate ?? defaultValues.docDate,
      currencyId: record?.currencyId ?? null,
      amount: record?.amount ?? null,
      comment: record?.comment ?? "",
      bankDocumentNumber: record?.bankDocumentNumber ?? "",
      classificationCategoryId: record?.classificationCategoryId ?? null,
      classificationRuleId: record?.classificationRuleId ?? null,
    }),
    [record],
  );

  const formik = useFormik<BankOperationForm>({
    initialValues,
    enableReinitialize: true,
    validationSchema: createBankOperationSchema(t),
    onSubmit: async (values) => {
      try {
        const payload: BankOperationCreatePayload = {
          bankAccountId: Number(values.bankAccountId),
          directionId: values.directionId ?? (Number(values.operationTypeId) === 2 ? -1 : 1),
          bankChartAccountId: toPositiveNumber(values.bankChartAccountId),
          offsetAccountId: toPositiveNumber(values.offsetAccountId),
          paymentTypeId: toPositiveNumber(values.paymentTypeId),
          counterpartyId: toPositiveNumber(values.counterpartyId),
          counterpartyBankAccountId: toPositiveNumber(values.counterpartyBankAccountId),
          bankDocumentNumber: values.bankDocumentNumber.trim() || null,
          classificationCategoryId: toPositiveNumber(values.classificationCategoryId),
          classificationRuleId: toPositiveNumber(values.classificationRuleId),
          docDate: dayjs(values.docDate).toISOString(),
          currencyId: Number(values.currencyId),
          amount: Number(values.amount),
          exchangeRate: Number(values.exchangeRate) || 1,
          contractId: toPositiveNumber(values.contractId),
          comment: values.comment.trim() || null,
        };
        await updateMutation.mutateAsync({ id, payload });
        toast.success(t("bank.messages.documentSaved"));
      } catch (error) {
        errorHandlers(error);
      }
    },
  });
  const { setFieldValue } = formik;
  const documentTypeId =
    Number(formik.values.operationTypeId) === 2
      ? bankDocumentTypeIds.expense
      : bankDocumentTypeIds.income;

  const counterpartyId = useMemo(
    () => toPositiveNumber(formik.values.counterpartyId),
    [formik.values.counterpartyId],
  );

  useEffect(() => {
    if (
      previousCounterpartyId.current !== null &&
      previousCounterpartyId.current !== counterpartyId
    ) {
      setFieldValue("counterpartyBankAccountId", null, false);
      setFieldValue("contractId", null, false);
    }
    previousCounterpartyId.current = counterpartyId;
  }, [counterpartyId, setFieldValue]);

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
            <div className="text-sm text-muted-foreground">{t("bank.operation.title")}</div>
            <div className="text-lg font-semibold">
              {record.docNumber ?? record.id}
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="size-4 text-primary" />
              <span className="font-semibold">{t("bank.fields.date")}</span>
            </div>
            <p className="font-semibold text-foreground">
              {customDate(record.docDate)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ProcessStatusBadge
              statusId={record.statusId}
              statusName={record.statusName}
            />
            {/* <Button
              icon={<ArrowLeft className="size-4" />}
              onClick={() => navigate("..")}
            >
              Orqaga
            </Button> */}
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.8fr_0.9fr]">
        <Card className="p-4">
          {isDraft ? (
            <Form layout="vertical" onFinish={formik.handleSubmit}>
              <Row gutter={[24, 8]}>
                <Col span={8}>
                  <Segmented
                    block
                    options={[
                      { label: t("bank.operation.income"), value: 1 },
                      { label: t("bank.operation.expense"), value: 2 },
                    ]}
                    value={Number(formik.values.operationTypeId) === 2 ? 2 : 1}
                    onChange={(value) =>
                      formik.setValues(
                        (previous) => ({
                          ...previous,
                          operationTypeId: Number(value),
                          directionId: Number(value) === 2 ? -1 : 1,
                          bankChartAccountId: null,
                          offsetAccountId: null,
                        }),
                        false,
                      )
                    }
                  />
                </Col>
                <Col span={8}>
                  <SelectCustom
                    formik={formik}
                    fieldName="bankAccountId"
                    label="bank.fields.bankAccount"
                    path={selectListEndpoints.orgBankAccountsSelectList}
                  />
                </Col>
                <Col span={8}>
                  <DocumentAccountSelect
                    formik={formik}
                    fieldName="bankChartAccountId"
                    label="bank.fields.bankChartAccount"
                    documentTypeId={documentTypeId}
                    documentRoleCode={bankDocumentAccountRoleCodes.bankAccount}
                    getFirst
                  />
                </Col>
                <Col span={8}>
                  <DocumentAccountSelect
                    formik={formik}
                    fieldName="offsetAccountId"
                    label="bank.fields.offsetAccount"
                    documentTypeId={documentTypeId}
                    documentRoleCode={bankDocumentAccountRoleCodes.offsetAccount}
                    getFirst
                  />
                </Col>

                <Col span={8}>
                  <SelectCustom
                    formik={formik}
                    fieldName="paymentTypeId"
                    label="bank.fields.paymentType"
                    path={selectListEndpoints.paymentTypesSelectList}
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
                    label="bank.fields.counterpartyBankAccount"
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
                  <InputText
                    formik={formik}
                    fieldName="bankDocumentNumber"
                    label="bank.fields.bankDocumentNumber"
                  />
                </Col>
                <Col span={8}>
                  <SelectCustom
                    formik={formik}
                    fieldName="classificationCategoryId"
                    label="bank.fields.classification"
                    path={selectListEndpoints.bankOperationCategoriesSelectList}
                    clearable
                    search
                    onChange={() => formik.setFieldValue("classificationRuleId", null)}
                  />
                </Col>
                <Col span={8}>
                  <InputNumberFormat
                    formik={formik}
                    fieldName="exchangeRate"
                    label="bank.fields.exchangeRate"
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
                    label="bank.fields.contract"
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
            <BankReadonlyDetailsCard record={record} />
          )}
        </Card>

        <Card className="space-y-3 p-4">
          <div className="text-sm font-semibold">{t("common.actions")}</div>
          {isDraft && (
            <PermissionCard permission={bankPermissions.update}>
              <Button
                block
                icon={<Save className="size-4" />}
                onClick={() => formik.submitForm()}
                loading={updateMutation.isPending}
              >
                {t("common.save")}
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
                    toast.success(t("bank.messages.documentConfirmed"));
                    navigate(-1);
                  } catch (error) {
                    errorHandlers(error);
                  }
                }}
              >
                {t("common.confirm")}
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
                    toast.success(t("bank.messages.documentCancelled"));
                    navigate(-1);
                  } catch (error) {
                    errorHandlers(error);
                  }
                }}
              >
                {t("common.cancel")}
              </Button>
            </PermissionCard>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <AntCard size="small">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Landmark className="size-4" />
                <span>{t("bank.fields.status")}</span>
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
                <span>{t("bank.fields.currentAmount")}</span>
              </div>
              <div className="mt-2 font-semibold">
                {numberSpacing(record.amount)} {record.currencyName ?? ""}
              </div>
            </AntCard>
          </div>
        </Card>
      </div>
    </div>
  );
}
