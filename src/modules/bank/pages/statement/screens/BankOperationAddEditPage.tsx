import { Button, Col, Form, Input, Popconfirm, Row, Spin } from "antd";
import { useFormik } from "formik";
import {
  Ban,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  CircleX,
  FileText,
  Info,
  Save,
  WalletCards,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "@/config/dayjs";
import Card from "@/components/ui/card/Card";
import DocumentAccountSelect from "@/components/fields/DocumentAccountSelect";
import { useContractSettlementAccount } from "@/shared/hooks/useContractSettlementAccount";
import InOutSelect from "@/components/fields/InOutSelect";
import InputNumberFormat from "@/components/fields/InputNumber";
import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import BankReadonlyDetailsCard from "@/modules/bank/components/BankReadonlyDetailsCard";
import CounterpartyAddEditPage from "@/modules/settings/pages/counterparty/screens/CounterpartyAddEditPage";
import CounterpartyBankAccountAddEditPage from "@/modules/settings/pages/counterpartybankaccount/screens/CounterpartyBankAccountAddEditPage";
import ContractAddEditPage from "@/modules/contract/screens/ContractAddEditPage";
import { counterpartyPermissions } from "@/modules/settings/pages/counterparty/constants/permissions";
import { counterpartybankaccountPermissions } from "@/modules/settings/pages/counterpartybankaccount/constants/permissions";
import { contractPermissions } from "@/modules/contract/constants/permissions";
import type { Contract } from "@/modules/contract/types/type";
import type { Counterparty } from "@/modules/settings/pages/counterparty/types/type";
import type { Counterpartybankaccount } from "@/modules/settings/pages/counterpartybankaccount/types/type";
import { filterIds, selectListEndpoints } from "@/shared/constants/selectLists";
import { invalidateSelectListQuery } from "@/shared/utils/invalidateSelectListQuery";
import { customDate, numberSpacing } from "@/utils/utils";
import { formatDateWithOutTime } from "@/utils/helpers";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import {
  useCancelBankOperation,
  useConfirmBankOperation,
  useCreateBankOperation,
  useGetBankOperationCategories,
  useGetDetailBankOperation,
  useUpdateBankOperation,
} from "../hooks";
import {
  bankDocumentAccountRoleCodes,
  bankDocumentTypeIds,
} from "../constants/endpoints";
import { createBankOperationSchema } from "../types/schema";
import type { BankOperationCreatePayload } from "../types/form";
import {
  buildBankDocumentQueryParams,
  getBankRelatedDocumentTypeCode,
} from "../utils/bankImportRules";
import { useAppSelector } from "@/store/hooks";
import { bankPermissions } from "../constants/permissions";

/** cmn_document_status: a posted document. */
const POSTED_STATUS_ID = 2;
import { DocumentSummary, DocumentSummaryItem } from "@/components/ui/card/DocumentSummary";

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
  relatedDocumentId: number | null;
  exchangeRate: number | null;
  bankDocumentNumber: string;
  classificationCategoryId: number | null;
  classificationRuleId: number | null;
};

const createDefaultValues = (): BankOperationForm => ({
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
  // National currency, as on the other documents; a foreign account is changed by hand.
  currencyId: 1,
  amount: null,
  comment: "",
  bankDocumentNumber: "",
  classificationCategoryId: null,
  classificationRuleId: null,
  relatedDocumentId: null,
});

const toPositiveNumber = (value: unknown) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : null;
};

const buildTouched = (values: BankOperationForm) => ({
  bankAccountId: values.bankAccountId !== null,
  bankChartAccountId: values.bankChartAccountId !== null,
  offsetAccountId: values.offsetAccountId !== null,
  docDate: Boolean(values.docDate),
  directionId: values.directionId !== null,
  operationTypeId: values.operationTypeId !== null,
  paymentTypeId: values.paymentTypeId !== null,
  counterpartyId: values.counterpartyId !== null,
  currencyId: values.currencyId !== null,
  amount: values.amount !== null,
  comment: Boolean(values.comment),
  counterpartyBankAccountId: values.counterpartyBankAccountId !== null,
  contractId: values.contractId !== null,
  relatedDocumentId: values.relatedDocumentId !== null,
  exchangeRate: values.exchangeRate !== null,
  bankDocumentNumber: Boolean(values.bankDocumentNumber),
  classificationCategoryId: values.classificationCategoryId !== null,
  classificationRuleId: values.classificationRuleId !== null,
});

export default function BankOperationAddEditPage() {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const organizationName = useAppSelector((state) => state.organization.name);
  const permissions = useAppSelector(
    (state) => state.auth.user?.user.permissions ?? [],
  );
  const isCreate = !id;
  const detailQuery = useGetDetailBankOperation(id);
  const createMutation = useCreateBankOperation();
  const updateMutation = useUpdateBankOperation();
  const confirmMutation = useConfirmBankOperation(id);
  const cancelMutation = useCancelBankOperation(id);
  const { data: classificationOptions = [] } = useGetBankOperationCategories();
  const queryClient = useQueryClient();
  const record = detailQuery.data;
  const isDraft = isCreate || record?.statusId === 1;
  const previousCounterpartyId = useRef<number | null>(null);
  const [counterpartyCreateOpen, setCounterpartyCreateOpen] = useState(false);
  const [
    counterpartyBankAccountCreateOpen,
    setCounterpartyBankAccountCreateOpen,
  ] = useState(false);
  const [contractCreateOpen, setContractCreateOpen] = useState(false);

  const initialValues = useMemo<BankOperationForm>(
    () => ({
      bankAccountId: record?.bankAccountId ?? createDefaultValues().bankAccountId,
      directionId:
        record?.directionId ??
        (record?.operationTypeId === 2 ? -1 : createDefaultValues().directionId),
      bankChartAccountId: record?.bankChartAccountId ?? null,
      offsetAccountId: record?.offsetAccountId ?? null,
      operationTypeId:
        record?.operationTypeId ??
        (record?.directionId === -1 ? 2 : createDefaultValues().operationTypeId),
      paymentTypeId: record?.paymentTypeId ?? null,
      counterpartyId: record?.counterpartyId ?? null,
      counterpartyBankAccountId: record?.counterpartyBankAccountId ?? null,
      contractId: record?.contractId ?? null,
      exchangeRate: record?.exchangeRate ?? createDefaultValues().exchangeRate,
      docDate: record?.docDate ?? createDefaultValues().docDate,
      currencyId: record?.currencyId ?? createDefaultValues().currencyId,
      amount: record?.amount ?? null,
      comment: record?.comment ?? createDefaultValues().comment,
      bankDocumentNumber:
        record?.bankDocumentNumber ?? createDefaultValues().bankDocumentNumber,
      classificationCategoryId: record?.classificationCategoryId ?? null,
      classificationRuleId: record?.classificationRuleId ?? null,
      relatedDocumentId: record?.relatedDocumentId ?? null,
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
          directionId:
            values.directionId ??
            (Number(values.operationTypeId) === 2 ? -1 : 1),
          bankChartAccountId: toPositiveNumber(values.bankChartAccountId),
          offsetAccountId: toPositiveNumber(values.offsetAccountId),
          paymentTypeId: toPositiveNumber(values.paymentTypeId),
          counterpartyId: toPositiveNumber(values.counterpartyId),
          counterpartyBankAccountId: toPositiveNumber(
            values.counterpartyBankAccountId,
          ),
          bankDocumentNumber: values.bankDocumentNumber.trim() || null,
          classificationCategoryId: toPositiveNumber(
            values.classificationCategoryId,
          ),
          classificationRuleId: toPositiveNumber(values.classificationRuleId),
          relatedDocumentId: toPositiveNumber(values.relatedDocumentId),
          docDate: dayjs(values.docDate).format("YYYY-MM-DDTHH:mm:ss"),
          currencyId: Number(values.currencyId),
          amount: Number(values.amount),
          exchangeRate: Number(values.exchangeRate) || 1,
          contractId: toPositiveNumber(values.contractId),
          comment: values.comment.trim() || null,
        };

        if (isCreate) {
          await createMutation.mutateAsync(payload);
          toast.success(t("bank.messages.documentCreated"));
          navigate("..", { replace: true });
          return;
        }

        await updateMutation.mutateAsync({ id, payload });
        toast.success(t("bank.messages.documentSaved"));
        formik.resetForm({ values });
      } catch (error) {
        errorHandlers(error);
        throw error;
      }
    },
  });

  const operationTypeId = useMemo(
    () => toPositiveNumber(formik.values.operationTypeId),
    [formik.values.operationTypeId],
  );
  const documentTypeId =
    operationTypeId === 2
      ? bankDocumentTypeIds.expense
      : bankDocumentTypeIds.income;
  const counterpartyId = useMemo(
    () => toPositiveNumber(formik.values.counterpartyId),
    [formik.values.counterpartyId],
  );
  const documentTypeCode = useMemo(() => {
    const categoryId = formik.values.classificationCategoryId;
    if (!categoryId) return null;
    const selectedClassification = classificationOptions.find(
      (option) => option.id === categoryId,
    );
    return (
      selectedClassification?.code ??
      (categoryId === record?.classificationCategoryId
        ? record?.classificationCode
        : null) ??
      null
    );
  }, [classificationOptions, formik.values.classificationCategoryId, record]);
  const documentQueryParams = useMemo(
    () =>
      buildBankDocumentQueryParams(documentTypeCode, {
        directionId: formik.values.directionId,
      }),
    [documentTypeCode, formik.values.directionId],
  );
  const relatedDocumentTypeCode = getBankRelatedDocumentTypeCode(
    documentTypeCode,
    { directionId: formik.values.directionId },
  );
  const isActionBusy =
    createMutation.isPending ||
    updateMutation.isPending ||
    confirmMutation.isPending ||
    cancelMutation.isPending;

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

  useEffect(() => {
    if (!detailQuery.error) return;
    errorHandlers(detailQuery.error);
  }, [detailQuery.error]);

  useContractSettlementAccount({
    formik,
    offsetFieldName: "offsetAccountId",
    documentTypeId,
    offsetRoleCode: bankDocumentAccountRoleCodes.offsetAccount,
    counterpartyId,
    contractId: toPositiveNumber(formik.values.contractId),
    directionId: formik.values.directionId,
    docDate: formik.values.docDate,
  });

  const saveDraft = async () => {
    const errors = await formik.validateForm();
    if (Object.keys(errors).length > 0) {
      formik.setTouched(buildTouched(formik.values));
      toast.error(t("bank.messages.fillRequired"));
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

  const handleAction = async (kind: "confirm" | "cancel") => {
    if (isCreate || !isDraft) return;
    if (!(await ensureSavedBeforeAction())) return;

    try {
      if (kind === "confirm") {
        await confirmMutation.mutateAsync();
        toast.success(t("bank.messages.documentConfirmed"));
      } else {
        await cancelMutation.mutateAsync();
        toast.success(t("bank.messages.documentCancelled"));
      }
      navigate("..", { replace: true });
    } catch (error) {
      errorHandlers(error);
    }
  };

  const handleCounterpartyCreated = (counterparty: Counterparty) => {
    formik.setFieldValue("counterpartyId", counterparty.id, true);
    setCounterpartyBankAccountCreateOpen(true);
  };

  const handleCounterpartyBankAccountCreated = (
    account: Counterpartybankaccount,
  ) => {
    formik.setFieldValue("counterpartyBankAccountId", account.id, true);
    invalidateSelectListQuery(
      queryClient,
      "counterpartyBankAccountId",
      selectListEndpoints.counterPartyBankAccounts,
    );
  };

  const handleContractCreated = (contract: Contract) => {
    formik.setFieldValue("contractId", contract.id, true);
    invalidateSelectListQuery(
      queryClient,
      "contractId",
      selectListEndpoints.contractsSelectList,
    );
  };

  if (detailQuery.isLoading && !isCreate && !record) {
    return (
      <div className="flex justify-center p-10">
        <Spin />
      </div>
    );
  }

  if (!isDraft) {
    if (!record) return null;
    const canCancelPosted =
      record.statusId === POSTED_STATUS_ID &&
      permissions.includes(bankPermissions.cancel);

    // Cancelling a posted payment reverses its entries (storno), the money movement and
    // what it did to the counterparty's debt or advance.
    const cancelPosted = async () => {
      try {
        await cancelMutation.mutateAsync();
        toast.success(t("bank.messages.documentCancelled"));
      } catch (error) {
        errorHandlers(error);
      }
    };

    return (
      <div className="space-y-2">
        {canCancelPosted && (
          <div className="flex justify-end">
            <Popconfirm
              title={t("bank.actions.cancelPosted")}
              description={
                <div className="max-w-80">
                  {t("bank.messages.cancelPostedConfirm")}
                </div>
              }
              okText={t("bank.actions.cancelPosted")}
              okButtonProps={{ danger: true, loading: cancelMutation.isPending }}
              cancelText={t("common.close")}
              onConfirm={cancelPosted}
            >
              <Button
                danger
                icon={<Ban className="size-4" />}
                loading={cancelMutation.isPending}
              >
                {t("bank.actions.cancelPosted")}
              </Button>
            </Popconfirm>
          </div>
        )}
        <BankReadonlyDetailsCard record={record} />
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-2 pb-2">
      <DocumentSummary>
        <DocumentSummaryItem
          icon={<Building2 size={24} strokeWidth={1.8} />}
          label={t("app.fields.organization")}
          value={organizationName || "-"}
        />
        <DocumentSummaryItem
          icon={<FileText size={24} strokeWidth={1.8} />}
          label={t("purchase.fields.docNumber")}
          value={record?.docNumber ?? record?.id ?? "-"}
        />
        <DocumentSummaryItem
          icon={<CalendarDays size={24} strokeWidth={1.8} />}
          label={t("bank.fields.date")}
          value={customDate(formik.values.docDate)}
        />
        <DocumentSummaryItem
          icon={<CircleDollarSign size={24} strokeWidth={1.8} />}
          label={t("settings.fields.currency")}
          value={record?.currencyName ?? "-"}
        />
        <DocumentSummaryItem
          icon={<WalletCards size={24} strokeWidth={1.8} />}
          label={t("bank.fields.amount")}
          value={
            formik.values.amount != null
              ? `${numberSpacing(formik.values.amount)} ${record?.currencyName ?? ""}`
              : "-"
          }
          emphasized
        />
      </DocumentSummary>

      <Card className="border border-border p-3 sm:p-3">
        <h2 className="mb-3 text-lg font-semibold text-heading">
          {t("bank.readonlySections.general")}
        </h2>
        <Form layout="vertical" onFinish={formik.handleSubmit}>
          <Row gutter={[16, 0]}>
            <Col span={4}>
              <InOutSelect
                formik={formik}
                fieldName="directionId"
                label="bank.fields.operationType"
                required
                disabled={isActionBusy}
                resetFields={[
                  "bankChartAccountId",
                  "offsetAccountId",
                  "relatedDocumentId",
                ]}
                onChange={(value) =>
                  formik.setFieldValue(
                    "operationTypeId",
                    Number(value) === -1 ? 2 : 1,
                    false,
                  )
                }
              />
            </Col>
            <Col span={4}>
              <SelectCustom
                formik={formik}
                fieldName="bankAccountId"
                label="bank.fields.bankAccount"
                path={selectListEndpoints.orgBankAccountsSelectList}
                search
              />
            </Col>
            {relatedDocumentTypeCode && (
              <Col span={4}>
                <SelectCustom
                  formik={formik}
                  fieldName="relatedDocumentId"
                  label="documents.relatedDocument"
                  path={selectListEndpoints.documentsSelectList}
                  queryParams={documentQueryParams}
                  refetchSync={`${relatedDocumentTypeCode}-${formik.values.directionId ?? ""}`}
                  enabled={Boolean(Object.keys(documentQueryParams).length)}
                  search
                  clearable
                />
              </Col>
            )}
            <Col span={4}>
              <DocumentAccountSelect
                formik={formik}
                fieldName="bankChartAccountId"
                label="bank.fields.bankChartAccount"
                documentTypeId={documentTypeId}
                documentRoleCode={bankDocumentAccountRoleCodes.bankAccount}
                getFirst
              />
            </Col>
            <Col span={4}>
              <DocumentAccountSelect
                formik={formik}
                fieldName="offsetAccountId"
                label="bank.fields.offsetAccount"
                documentTypeId={documentTypeId}
                documentRoleCode={bankDocumentAccountRoleCodes.offsetAccount}
                getFirst
              />
            </Col>
            <Col span={4}>
              <SelectCustom
                formik={formik}
                fieldName="paymentTypeId"
                label="bank.fields.paymentType"
                path={selectListEndpoints.paymentTypesSelectList}
              />
            </Col>
            <Col span={4}>
              <SelectCustom
                formik={formik}
                fieldName="counterpartyId"
                label="bank.fields.counterparty"
                path={selectListEndpoints.counterpartiesSelectList}
                search
                addOption={{
                  bool: true,
                  permissionCode: counterpartyPermissions.create,
                  onClick: () => setCounterpartyCreateOpen(true),
                }}
              />
            </Col>
            <Col span={4}>
              <SelectCustom
                formik={formik}
                fieldName="counterpartyBankAccountId"
                label="bank.fields.counterpartyBankAccount"
                path={selectListEndpoints.counterPartyBankAccounts}
                queryParams={{ [filterIds.counterparty]: counterpartyId }}
                enabled={Boolean(counterpartyId)}
                refetchSync={String(counterpartyId ?? "")}
                disabled={!counterpartyId}
                search
                addOption={{
                  bool: true,
                  permissionCode: counterpartybankaccountPermissions.create,
                  onClick: () => setCounterpartyBankAccountCreateOpen(true),
                }}
              />
            </Col>
            <Col span={4}>
              <InputText
                formik={formik}
                fieldName="bankDocumentNumber"
                label="bank.fields.bankDocumentNumber"
              />
            </Col>
            <Col span={4}>
              <SelectCustom
                formik={formik}
                fieldName="classificationCategoryId"
                label="bank.fields.classification"
                path={selectListEndpoints.bankOperationCategoriesSelectList}
                clearable
                search
                onChange={() => {
                  formik.setFieldValue("classificationRuleId", null);
                  formik.setFieldValue("relatedDocumentId", null);
                }}
              />
            </Col>
            <Col span={4}>
              <InputNumberFormat
                formik={formik}
                fieldName="exchangeRate"
                label="bank.fields.exchangeRate"
                min={0}
                precision={6}
              />
            </Col>
            <Col span={4}>
              <SelectDate
                formik={formik}
                fieldName="docDate"
                label="bank.fields.date"
              />
            </Col>
            <Col span={4}>
              <SelectCustom
                formik={formik}
                fieldName="currencyId"
                label="settings.fields.currency"
                path={selectListEndpoints.currenciesSelectList}
              />
            </Col>
            <Col span={4}>
              <InputNumberFormat
                formik={formik}
                fieldName="amount"
                label="bank.fields.amount"
                min={0}
                precision={2}
              />
            </Col>
            <Col span={4}>
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
                addOption={{
                  bool: true,
                  permissionCode: contractPermissions.create,
                  onClick: () => setContractCreateOpen(true),
                }}
              />
            </Col>
          </Row>
        </Form>
      </Card>

      <Card className="border border-border p-5 sm:p-3">
        <h2 className="mb-5 text-lg font-semibold text-heading">
          {t("bank.fields.comment")}
        </h2>
        <Form.Item
          validateStatus={
            formik.touched.comment && formik.errors.comment ? "error" : ""
          }
          help={
            formik.touched.comment && formik.errors.comment
              ? String(formik.errors.comment)
              : undefined
          }
        >
          <Input.TextArea
            value={formik.values.comment}
            onChange={(event) =>
              formik.setFieldValue("comment", event.target.value, true)
            }
            onBlur={() => formik.setFieldTouched("comment", true)}
            placeholder={t("bank.fields.comment")}
            autoSize={{ minRows: 3, maxRows: 6 }}
          />
        </Form.Item>
      </Card>

      <div className="sticky bottom-0 z-20 mx-1 rounded-xl border border-border bg-primary-bg/95 px-4 py-3 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur sm:py-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-4 text-sm text-secondary-text">
            <div className="flex items-center gap-2">
              <Info className="size-6 text-primary" />
              <span>{t("bank.fields.status")}:</span>
              <span className="font-semibold text-text">
                {record?.statusName ?? t("processStatuses.draft")}
              </span>
            </div>
            <div className="hidden h-8 w-px bg-border sm:block" />
            <div>
              <span>{t("bank.fields.currentAmount")}:</span>{" "}
              <span className="font-semibold text-primary">
                {formik.values.amount != null
                  ? `${numberSpacing(formik.values.amount)} ${record?.currencyName ?? ""}`
                  : "-"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <Button
              size="large"
              icon={<Save className="size-4" />}
              loading={createMutation.isPending || updateMutation.isPending}
              disabled={isActionBusy}
              onClick={() => void saveDraft()}
              className="min-w-36"
            >
              {t("common.save")}
            </Button>
            {!isCreate && (
              <>
                <Button
                  type="primary"
                  size="large"
                  icon={<CheckCircle2 className="size-4" />}
                  loading={confirmMutation.isPending}
                  disabled={isActionBusy}
                  onClick={() => void handleAction("confirm")}
                  className="min-w-44"
                >
                  {t("common.confirm")}
                </Button>
                <Button
                  danger
                  size="large"
                  icon={<CircleX className="size-4" />}
                  loading={cancelMutation.isPending}
                  disabled={isActionBusy}
                  onClick={() => void handleAction("cancel")}
                  className="min-w-40"
                >
                  {t("common.cancel")}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <CounterpartyAddEditPage
        open={counterpartyCreateOpen}
        onCreated={handleCounterpartyCreated}
        onClose={() => {
          setCounterpartyCreateOpen(false);
          invalidateSelectListQuery(
            queryClient,
            "counterpartyId",
            selectListEndpoints.counterpartiesSelectList,
          );
        }}
      />
      <CounterpartyBankAccountAddEditPage
        open={counterpartyBankAccountCreateOpen}
        initialCounterpartyId={counterpartyId}
        onCreated={handleCounterpartyBankAccountCreated}
        onClose={() => {
          setCounterpartyBankAccountCreateOpen(false);
          invalidateSelectListQuery(
            queryClient,
            "counterpartyBankAccountId",
            selectListEndpoints.counterPartyBankAccounts,
          );
        }}
      />
      <ContractAddEditPage
        open={contractCreateOpen}
        initialCounterpartyId={formik.values.counterpartyId}
        onCreated={handleContractCreated}
        onClose={() => setContractCreateOpen(false)}
      />
    </div>
  );
}
