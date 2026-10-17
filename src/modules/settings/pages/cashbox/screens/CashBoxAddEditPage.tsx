import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useFormik } from "formik";
import { Alert, Button, Col, Form, Modal, Row, Spin } from "antd";
import { Link } from "react-router";
import toast from "react-hot-toast";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import SelectCustom from "@/components/fields/SelectCustom";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import type { CashBoxForm } from "../types/form";
import InputText from "@/components/fields/InputText";
import InputNumberFormat from "@/components/fields/InputNumber";
import { cashBoxSchema } from "../types/schema";
import DocumentAccountSelect from "@/components/fields/DocumentAccountSelect";
import { cashDocumentAccountRoleCodes, cashDocumentTypeIds } from "@/modules/cashoperation/constants/documentAccount";
import { useUpdateCashBox } from "../hooks/useUpdateCashBox";
import { useCreateCashBox } from "../hooks/useCreateCashBox";
import { useGetDetailCashBox } from "../hooks/useGetDetailCashBox";

const defaultValues: CashBoxForm = {
  organizationId: null,
  branchId: null,
  code: "",
  name: "",
  currencyId: null,
  stateId: null,
  isMain: false,
  responsibleUserId: null,
  chartAccountId: null,
  cashLimit: null,
};

interface CashBoxAddEditPageProps {
  open: boolean;
  onClose: () => void;
  id?: number | null;
}

export default function CashBoxAddEditPage({
  open,
  onClose,
  id,
}: CashBoxAddEditPageProps) {
  const { t } = useTranslation();
  const editId = id ?? null;
  const isEdit = Boolean(editId);
  const { data: CashBox, isLoading: isOrgonizationsLoading } =
    useGetDetailCashBox(editId ?? "");
  const createMutation = useCreateCashBox();
  const updateMutation = useUpdateCashBox();

  const formik = useFormik<CashBoxForm>({
    initialValues: {
      ...defaultValues,
      stateId: isEdit ? null : 1,
    },
    enableReinitialize: true,
    validationSchema: cashBoxSchema(isEdit),
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
    if (CashBox && isEdit) {
      formik.setValues({
        organizationId: CashBox.organizationId ?? null,
        branchId: CashBox.branchId ?? null,
        code: CashBox.code ?? "",
        name: CashBox.name ?? "",
        currencyId: CashBox.currencyId ?? null,
        stateId: CashBox.stateId ?? null,
        isMain: CashBox.isMain ?? false,
        responsibleUserId: CashBox.responsibleUserId ?? null,
        chartAccountId: CashBox.chartAccountId ?? null,
        cashLimit: CashBox.cashLimit ?? null,
      });
    }
    // formik is a new object every render: the values are set once per loaded record
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [CashBox, isEdit]);
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal maskClosable={false}
      title={isEdit ? t("settings.form.editTitle") : t("settings.form.createTitle")}
      open={open}
      onCancel={() => {
        formik.resetForm();
        onClose();
      }}
      footer={null}
      centered
      width={600}
    >
      <Spin spinning={isOrgonizationsLoading}>
        <Form layout="vertical" onFinish={formik.handleSubmit}>
          <Row gutter={[16, 8]}>
            <Col span={12}>
              <InputText formik={formik} fieldName="name" label="settings.fields.name" />
            </Col>
            <Col span={12}>
              <InputText formik={formik} fieldName="code" label="settings.fields.code" />
            </Col>
            <Col span={12}>
              <SelectCustom
                formik={formik}
                fieldName="organizationId"
                label="settings.fields.organization"
                path={selectListEndpoints.organizationsSelectList}
              />
            </Col>
            <Col span={12}>
              <SelectCustom
                formik={formik}
                fieldName="branchId"
                label="settings.fields.branch"
                path={selectListEndpoints.branchesSelectList}
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
            <Col span={12}>
              <DocumentAccountSelect
                formik={formik}
                fieldName="chartAccountId"
                label="settings.fields.moneyChartAccount"
                documentTypeId={cashDocumentTypeIds.income}
                documentRoleCode={cashDocumentAccountRoleCodes.cashAccount}
              />
            </Col>
            <Col span={12}>
              <InputNumberFormat
                formik={formik}
                fieldName="cashLimit"
                label="settings.fields.cashLimit"
                min={0}
                precision={2}
              />
            </Col>
            <Col span={12}>
              {isEdit && (
                <SelectCustom
                  formik={formik}
                  fieldName="stateId"
                  label="settings.fields.status"
                  path={selectListEndpoints.statesSelectList}
                />
              )}
            </Col>
          </Row>

          {/* 1C keeps no balance on the card: it opens in the ledger («Ввод начальных остатков») */}
          <Alert
            showIcon
            type="info"
            className="mb-4"
            message={
              <span>
                {t("settings.messages.cashBoxOpeningBalance")}{" "}
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
          >{t("common.submit")}</Button>
        </Form>
      </Spin>
    </Modal>
  );
}
