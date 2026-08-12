import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useFormik } from "formik";
import { Button, Col, Form, Modal, Row, Spin } from "antd";
import toast from "react-hot-toast";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import SelectCustom from "@/components/fields/SelectCustom";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import InputText from "@/components/fields/InputText";
import type { CounterpartybankaccountForm } from "../types/form";
import type { Counterpartybankaccount } from "../types/type";
import { useGetDetailCounterpartybankaccount } from "../hooks";
import { useCreateCounterpartybankaccount } from "../hooks";
import { useUpdateCounterpartybankaccount } from "../hooks";
import { counterpartybankaccountSchema } from "../types/schema";

const defaultValues: CounterpartybankaccountForm = {
  organizationId: null,
  counterpartyId: null,
  bankId: null,
  accountNumber: null,
  currencyId: null,
  isMain: null,
  stateId: null,
};

interface counterpartybankaccountModalProps {
  open: boolean;
  onClose: () => void;
  id?: number | null;
  initialCounterpartyId?: number | null;
  initialOrganizationId?: number | null;
  initialAccountNumber?: string | null;
  onCreated?: (account: Counterpartybankaccount) => void;
}

export default function CounterpartyBankAccountAddEditPage({
  open,
  onClose,
  id,
  initialCounterpartyId,
  initialOrganizationId,
  initialAccountNumber,
  onCreated,
}: counterpartybankaccountModalProps) {
  const { t } = useTranslation();
  const editId = id ?? null;
  const isEdit = Boolean(editId);
  const { data: counterpartybankaccount, isLoading: isOrgonizationsLoading } =
    useGetDetailCounterpartybankaccount(editId ?? "");
  const createMutation = useCreateCounterpartybankaccount();
  const updateMutation = useUpdateCounterpartybankaccount();

  const formik = useFormik<CounterpartybankaccountForm>({
    initialValues: {
      ...defaultValues,
      counterpartyId: initialCounterpartyId ?? null,
      organizationId: initialOrganizationId ?? null,
      accountNumber: initialAccountNumber ?? null,
      stateId: isEdit ? null : 1,
      isMain: true,
    },
    enableReinitialize: true,
    validationSchema: counterpartybankaccountSchema(isEdit),
    onSubmit: async (values, helpers) => {
      try {
        if (isEdit && editId) {
          await updateMutation.mutateAsync({ id: editId, payload: values });
          toast.success(t("settings.messages.updated"));
        } else {
          const createdAccount = await createMutation.mutateAsync(values);
          onCreated?.(createdAccount);
          toast.success(t("settings.messages.created"));
        }
        helpers.resetForm();
        onClose();
      } catch (err: unknown) {
        errorHandlers(err);
      }
    },
  });

  useEffect(() => {
    if (counterpartybankaccount && isEdit) {
      formik.setValues({
        organizationId: counterpartybankaccount.organizationId ?? null,
        counterpartyId: counterpartybankaccount.counterpartyId ?? null,
        bankId: counterpartybankaccount.bankId ?? null,
        accountNumber: counterpartybankaccount.accountNumber ?? null,
        currencyId: counterpartybankaccount.currencyId ?? null,
        isMain: counterpartybankaccount.isMain ?? true,
        stateId: counterpartybankaccount.stateId ?? null,
      });
    }
  }, [counterpartybankaccount, formik, isEdit]);
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      title={
        isEdit ? t("settings.form.editTitle") : t("settings.form.createTitle")
      }
      open={open}
      onCancel={() => {
        formik.resetForm();
        onClose();
      }}
      footer={null}
      centered
      width={650}
    >
      <Spin spinning={isOrgonizationsLoading}>
        <Form layout="vertical" onFinish={formik.handleSubmit}>
          <Row gutter={[16, 0]}>
            <Col span={12}>
              <SelectCustom
                formik={formik}
                fieldName="counterpartyId"
                label="settings.fields.counterparty"
                path={selectListEndpoints.counterparty}
              />
            </Col>
            <Col span={12}>
              <SelectCustom
                formik={formik}
                fieldName="organizationId"
                label="settings.fields.organization"
                path={selectListEndpoints.operationTypesSelectList}
              />
            </Col>
            <Col span={12}>
              <SelectCustom
                formik={formik}
                fieldName="bankId"
                label="settings.fields.bank"
                path={selectListEndpoints.banksSelectList}
              />
            </Col>

            <Col span={12}>
              <InputText
                formik={formik}
                fieldName="accountNumber"
                label="settings.fields.accountNumber"
              />
            </Col>
            <Col span={12}>
              <SelectCustom
                formik={formik}
                fieldName="currencyId"
                label="settings.fields.currency"
                path={selectListEndpoints.currenciesSelectList}
              />
            </Col>

            {isEdit && (
              <Col span={12}>
                <SelectCustom
                  formik={formik}
                  fieldName="stateId"
                  label="settings.fields.status"
                  path={selectListEndpoints.statesSelectList}
                />
              </Col>
            )}
          </Row>

          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            className="h-12 rounded-xl bg-blue-600! hover:bg-blue-700! font-semibold text-base"
            loading={isSubmitting}
          >
            {t("common.submit")}
          </Button>
        </Form>
      </Spin>
    </Modal>
  );
}
