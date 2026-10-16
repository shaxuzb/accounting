import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useFormik } from "formik";
import { Alert, Button, Form, Modal, Spin, Checkbox } from "antd";
import { Link } from "react-router";
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
import DocumentAccountSelect from "@/components/fields/DocumentAccountSelect";
import { bankDocumentAccountRoleCodes, bankDocumentTypeIds } from "@/modules/bank/pages/statement/constants/endpoints";

const defaultValues: OrgBankAccountsForm = {
  organizationId: null,
  bankId: null,
  bankBranchId: null,
  accountNumber: null,
  currencyId: null,
  isMain: false,
  chartAccountId: null,
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
      isMain: false,
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
        bankBranchId: OrgBankAccounts.bankBranchId ?? null,
        accountNumber: OrgBankAccounts.accountNumber ?? null,
        currencyId: OrgBankAccounts.currencyId ?? null,
        isMain: OrgBankAccounts.isMain ?? false,
        chartAccountId: OrgBankAccounts.chartAccountId ?? null,
        stateId: OrgBankAccounts.stateId ?? null,
      });
    }
    // formik is a new object every render: the values are set once per loaded record
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [OrgBankAccounts, isEdit]);
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal maskClosable={false}
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
                path={selectListEndpoints.organizationsSelectList}
              />

              <SelectCustom
                formik={formik}
                fieldName="bankId"
                label="settings.fields.bank"
                path={selectListEndpoints.banksSelectList}
                onChange={() => formik.setFieldValue("bankBranchId", null)}
              />

              <SelectCustom
                formik={formik}
                fieldName="bankBranchId"
                label="settings.fields.bankBranch"
                path={selectListEndpoints.bankBranchesSelectList}
                queryParams={{ bankId: formik.values.bankId }}
                enabled={Boolean(formik.values.bankId)}
                disabled={!formik.values.bankId}
                clearable
                search
                displayConfig={{
                  optionLabel: (item) =>
                    [item.name, item.mfo, item.code].filter(Boolean).join(" - "),
                  selectedLabel: (item) => String(item.name ?? item.mfo ?? item.code ?? ""),
                  searchFields: ["name", "mfo", "code"],
                }}
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
              <DocumentAccountSelect
                formik={formik}
                fieldName="chartAccountId"
                label="settings.fields.moneyChartAccount"
                documentTypeId={bankDocumentTypeIds.income}
                documentRoleCode={bankDocumentAccountRoleCodes.bankAccount}
              />
              {/* one main account (1C «Основной банковский счет»): marking this one takes the mark from the old one */}
              <Checkbox
                className="mb-4"
                checked={Boolean(formik.values.isMain)}
                onChange={(event) => formik.setFieldValue("isMain", event.target.checked)}
              >
                {t("settings.fields.isMainAccount")}
              </Checkbox>

     

            {isEdit && (
  
                <SelectCustom
                  formik={formik}
                  fieldName="stateId"
                  label="settings.fields.status"
                  path={selectListEndpoints.statesSelectList}
                />

            )}

          {/* 1C keeps no balance on the card: it opens in the ledger («Ввод начальных остатков») */}
          <Alert
            showIcon
            type="info"
            className="mb-4"
            message={
              <span>
                {t("settings.messages.bankAccountOpeningBalance")}{" "}
                <Link to="/main/settings/opening-balances">{t("openingBalance.title")}</Link>
              </span>
            }
          />

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
