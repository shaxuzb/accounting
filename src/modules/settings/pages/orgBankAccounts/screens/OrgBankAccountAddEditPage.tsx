import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useFormik } from "formik";
import { Button, Col, Form, Modal, Row, Spin } from "antd";
import toast from "react-hot-toast";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import SelectCustom from "@/components/fields/SelectCustom";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import InputText from "@/components/fields/InputText";
import type { OrgBankAccountsForm } from "../types/form";
import { useGetDetailOrgBankAccounts } from "../hooks";
import { useUpdateOrgBankAccounts } from "../hooks";
import { useCreateOrgBankAccounts } from "../hooks";
import { orgBankAccountsSchema } from "../types/schema";

const defaultValues: OrgBankAccountsForm = {
  organizationId: null,
  bankId: null,
  accountNumber: null,
  currencyId: null,
  isMain: true,
  stateId: null,
};

interface OrgBankAccountAddEditPageProps {
  open: boolean;
  onClose: () => void;
  id?: number | null;
}

export default function OrgBankAccountAddEditPage({
  open,
  onClose,
  id,
}: OrgBankAccountAddEditPageProps) {
  const { t } = useTranslation();
  const editId = id ?? null;
  const isEdit = Boolean(editId);
  const { data: OrgBankAccounts, isLoading: isOrgonizationsLoading } =
    useGetDetailOrgBankAccounts(editId ?? "");
  const createMutation = useCreateOrgBankAccounts();
  const updateMutation = useUpdateOrgBankAccounts();

  const formik = useFormik<OrgBankAccountsForm>({
    initialValues: {
      ...defaultValues,
      stateId: isEdit ? null : 1,
      isMain: true,
    },
    enableReinitialize: true,
    validationSchema: orgBankAccountsSchema(isEdit),
    onSubmit: async (values, helpers) => {
      try {
        if (isEdit && editId) {
          await updateMutation.mutateAsync({ id: editId, payload: values });
          toast.success(t("settings.messages.updated"));
        } else {
          await createMutation.mutateAsync(values);
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
    if (OrgBankAccounts && isEdit) {
      formik.setValues({
        organizationId: OrgBankAccounts.organizationId ?? null,
        bankId: OrgBankAccounts.bankId ?? null,
        accountNumber: OrgBankAccounts.accountNumber ?? null,
        currencyId: OrgBankAccounts.currencyId ?? null,
        isMain: OrgBankAccounts.isMain ?? true,
        stateId: OrgBankAccounts.stateId ?? null,
      });
    }
  }, [OrgBankAccounts, isEdit]);
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
      width={450}
    >
      <Spin spinning={isOrgonizationsLoading}>
        <Form layout="vertical" onFinish={formik.handleSubmit}>
    
              <SelectCustom
                formik={formik}
                fieldName="organizationId"
                label="settings.fields.organization"
                path={selectListEndpoints.operationTypesSelectList}
              />

              <SelectCustom
                formik={formik}
                fieldName="bankId"
                label="settings.fields.bank"
                path={selectListEndpoints.banksSelectList}
              />


              <InputText
                formik={formik}
                fieldName="accountNumber"
                label="settings.fields.accountNumber"
              />

              <SelectCustom
                formik={formik}
                fieldName="currencyId"
                label="settings.fields.currency"
                path={selectListEndpoints.currenciesSelectList}
              />
     

            {isEdit && (
  
                <SelectCustom
                  formik={formik}
                  fieldName="stateId"
                  label="settings.fields.status"
                  path={selectListEndpoints.statesSelectList}
                />

            )}


          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            className="h-12 rounded-xl bg-blue-600! hover:bg-blue-700! font-semibold text-base"
            onClick={() => console.log(formik)}
            loading={isSubmitting}
          >
            {t("common.submit")}
          </Button>
        </Form>
      </Spin>
    </Modal>
  );
}
