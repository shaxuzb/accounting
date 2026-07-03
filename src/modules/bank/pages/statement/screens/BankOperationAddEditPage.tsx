import { Button, Col, Form, Row, Segmented, Spin } from "antd";
import { useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { useFormik } from "formik";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import dayjs from "@/config/dayjs";
import InputNumberFormat from "@/components/fields/InputNumber";
import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import { filterIds, selectListEndpoints } from "@/shared/constants/selectLists";
import { formatDateWithOutTime } from "@/utils/helpers";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import {
  useCreateBankOperation,
  useGetDetailBankOperation,
  useUpdateBankOperation,
} from "../hooks";
import { schema } from "../types/schema";
import type { BankOperationCreatePayload } from "../types/form";
import Card from "@/components/ui/card/Card";

const toPositiveNumber = (value: unknown) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : null;
};

type BankOperationForm = Omit<
  BankOperationCreatePayload,
  | "bankAccountId"
  | "operationTypeId"
  | "counterpartyId"
  | "currencyId"
  | "amount"
  | "comment"
> & {
  bankAccountId: number | null;
  operationTypeId: number | null;
  counterpartyId: number | null;
  currencyId: number | null;
  amount: number | null;
  comment: string;
  stateId: number | null;
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
  stateId: null,
};

export default function BankOperationAddEditPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const id = params.id;
  const isEdit = Boolean(id);
  const createMutation = useCreateBankOperation();
  const updateMutation = useUpdateBankOperation();
  const { data: record, isLoading: isDetailLoading } =
    useGetDetailBankOperation(id);

  const formik = useFormik<BankOperationForm>({
    initialValues: defaultValues,
    enableReinitialize: true,
    validationSchema: schema,
    onSubmit: async (values, helpers) => {
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
          ...(isEdit ? { stateId: Number(values.stateId) } : {}),
        };

        if (isEdit && id) {
          await updateMutation.mutateAsync({ id, payload });
          toast.success(t("settings.messages.updated"));
        } else {
          await createMutation.mutateAsync(payload);
          toast.success(t("settings.messages.created"));
        }

        helpers.resetForm();
        navigate("..");
      } catch (err: unknown) {
        errorHandlers(err);
      }
    },
  });

  const operationTypeId = useMemo(
    () => toPositiveNumber(formik.values.operationTypeId),
    [formik.values.operationTypeId],
  );
  const previousOperationTypeId = useRef<number | null>(null);
  const previousCounterpartyId = useRef<number | null>(null);
  const counterpartyId = useMemo(
    () => toPositiveNumber(formik.values.counterpartyId),
    [formik.values.counterpartyId],
  );

  useEffect(() => {
    if (!record) return;

    formik.setValues({
      bankAccountId: record.bankAccountId ?? null,
      operationTypeId: record.operationTypeId ?? null,
      paymentPurposeId: record.paymentPurposeId ?? null,
      counterpartyId: record.counterpartyId ?? null,
      counterpartyBankAccountId: record.counterpartyBankAccountId ?? null,
      contractId: record.contractId ?? null,
      exchangeRate: record.exchangeRate ?? null,
      docDate: record.docDate ?? defaultValues.docDate,
      currencyId: record.currencyId ?? null,
      amount: record.amount ?? null,
      comment: record.comment ?? "",
      stateId: record.stateId ?? null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (
      previousOperationTypeId.current !== null &&
      previousOperationTypeId.current !== operationTypeId
    ) {
      formik.setFieldValue("paymentPurposeId", null, false);
    }
    previousOperationTypeId.current = operationTypeId;
  }, [formik, operationTypeId]);

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

  return (
    <div className="w-full ">
      <Card className="w-full border border-border p-4">
        <div className=" flex justify-between mb-6 ">
          <div className="text-xl font-semibold text-text">
            {isEdit
              ? t("settings.form.editTitle")
              : t("settings.form.createTitle")}
          </div>
          <div className="w-80">
            <Segmented
              block
              options={[
                { label: "Kirim", value: 1 },
                { label: "Chiqim", value: 2 },
              ]}
              value={operationTypeId ?? undefined}
              disabled={isSubmitting}
              onChange={(value) =>
                formik.setFieldValue("operationTypeId", value)
              }
            />
          </div>
        </div>

        <Spin spinning={isSubmitting || isDetailLoading}>
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
                  path={`${selectListEndpoints.paymentPurposesSelectList}?operationTypeId=${operationTypeId ?? ""}`}
                  enabled={Boolean(operationTypeId)}
                  clearable
                  search
                  placeholder="To'lov maqsadini tanlang"
                  // disabled={!operationTypeId}
                  refetchSync={String(operationTypeId ?? "")}
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
              {isEdit ? (
                <>
                  <Col span={8}>
                    <SelectCustom
                      formik={formik}
                      fieldName="stateId"
                      label="settings.fields.status"
                      path={selectListEndpoints.statesSelectList}
                    />
                  </Col>
                  <Col span={16}>
                    <InputText
                      formik={formik}
                      fieldName="comment"
                      label="bank.fields.comment"
                    />
                  </Col>
                </>
              ) : (
                <Col span={24}>
                  <InputText
                    formik={formik}
                    fieldName="comment"
                    label="bank.fields.comment"
                  />
                </Col>
              )}
            </Row>

            <div className=" flex justify-end gap-3 ">
              <Button onClick={() => navigate("..")}>
                {t("common.cancel")}
              </Button>
              <Button type="primary" htmlType="submit" loading={isSubmitting}>
                {t("common.submit")}
              </Button>
            </div>
          </Form>
        </Spin>
      </Card>
    </div>
  );
}
