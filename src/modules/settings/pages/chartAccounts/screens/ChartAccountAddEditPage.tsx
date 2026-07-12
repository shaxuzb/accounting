import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useFormik } from "formik";
import { Button, Col, Form, Modal, Row, Spin, Switch } from "antd";
import toast from "react-hot-toast";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import type { ChartAccountsForm } from "../types/form";
import { useCreateChartAccounts } from "../hooks";
import { useUpdateChartAccounts } from "../hooks";
import { useGetDetailChartAccounts } from "../hooks";
import { chartAccountsSchema } from "../types/schema";

const defaultValues: ChartAccountsForm = {
  number: "",
  code: "",
  name: "",
  isGroup: true,
  accountTypeId: 0,
  isQuantity: true,
  isCurrency: true,
  isDepartment: true,
  isTaxAccounting: true,
  isOffBalance: true,
  subkontos: [],
  subkontoTypeIds: [],
  organizationId: null,
  stateId: null,
};

interface ChartAccountAddEditPageProps {
  open: boolean;
  onClose: () => void;
  id?: number | null;
}

export default function ChartAccountAddEditPage({
  open,
  onClose,
  id,
}: ChartAccountAddEditPageProps) {
  const { t } = useTranslation();
  const editId = id ?? null;
  const isEdit = Boolean(editId);
  const { data: Chartaccounts, isLoading: isOrgonizationsLoading } =
    useGetDetailChartAccounts(editId ?? "");
  const createMutation = useCreateChartAccounts();
  const updateMutation = useUpdateChartAccounts();

  const formik = useFormik<ChartAccountsForm>({
    initialValues: {
      ...defaultValues,
      stateId: isEdit ? null : 1,
    },
    enableReinitialize: true,
    validationSchema: chartAccountsSchema(isEdit),
    onSubmit: async (values, helpers) => {
      const { subkontoTypeIds = [], ...formValues } = values;
      const payload = {
        ...formValues,
        subkontos: subkontoTypeIds.map((subkontoTypeId, sortOrder) => ({
          subkontoTypeId,
          sortOrder,
          isRequired: true,
        })),
      };

      try {
        if (isEdit && editId) {
          await updateMutation.mutateAsync({ id: editId, payload });
          toast.success(t("settings.messages.updated"));
        } else {
          await createMutation.mutateAsync({
            ...payload,
          });
          toast.success(t("settings.messages.created"));
        }
        helpers.resetForm();
        onClose();
      } catch (err: unknown) {
        errorHandlers(err);
      }
    },
  });
  const { setValues } = formik;

  useEffect(() => {
    if (Chartaccounts && isEdit) {
      setValues({
        number: Chartaccounts.number ?? Chartaccounts.code ?? "",
        code: Chartaccounts.code ?? "",
        name: Chartaccounts.name ?? "",
        isGroup: Chartaccounts.isGroup ?? false,
        accountTypeId: Chartaccounts.accountTypeId ?? 0,
        isQuantity: Chartaccounts.isQuantity ?? true,
        isCurrency: Chartaccounts.isCurrency ?? true,
        isDepartment: Chartaccounts.isDepartment ?? true,
        isTaxAccounting: Chartaccounts.isTaxAccounting ?? true,
        isOffBalance: Chartaccounts.isOffBalance ?? true,
        subkontos: Chartaccounts.subkontos ?? [],
        subkontoTypeIds: (Chartaccounts.subkontos ?? []).map(
          (item) => item.subkontoTypeId,
        ),
        organizationId: Chartaccounts.organizationId ?? null,
        stateId: Chartaccounts.stateId ?? null,
      });
    }
  }, [Chartaccounts, isEdit, setValues]);
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
      width={550}
    >
      <Spin spinning={isOrgonizationsLoading}>
        <Form layout="vertical" onFinish={formik.handleSubmit}>
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <InputText
                formik={formik}
                fieldName="number"
                label="settings.fields.number"
              />
            </Col>
            <Col xs={24} sm={12}>
              <InputText
                formik={formik}
                fieldName="code"
                label="settings.fields.code"
              />
            </Col>

            {isEdit ? (
              <>
                <Col span={12}>
                  <InputText
                    formik={formik}
                    fieldName="name"
                    label="settings.fields.name"
                  />
                </Col>

                <Col span={12}>
                  <SelectCustom
                    formik={formik}
                    fieldName="stateId"
                    label="Holati"
                    path={selectListEndpoints.statesSelectList}
                  />
                </Col>
              </>
            ) : (
              <>
                <Col span={24}>
                  <InputText
                    formik={formik}
                    fieldName="name"
                    label="settings.fields.name"
                  />
                </Col>
                <Col span={24}>
                  <SelectCustom
                    formik={formik}
                    fieldName="accountTypeId"
                    label="accountTypeId"
                    path={selectListEndpoints.accountType}
                    clearable
                  />
                </Col>
              </>
            )}
            <Col span={24}>
              <SelectCustom
                formik={formik}
                fieldName="subkontoTypeIds"
                label="settings.fields.subkonto"
                path={selectListEndpoints.subkontoTypes}
                mode="multiple"
                clearable
                search
              />
            </Col>

            <Col span={24}>
              <Row
                gutter={[16, 0]}
                className="rounded-lg border border-border p-3"
              >
                {[
                  ["isGroup", "settings.fields.isGroup"],
                  ["isQuantity", "settings.fields.isQuantity"],
                  ["isCurrency", "settings.fields.isCurrency"],
                  ["isDepartment", "settings.fields.isDepartment"],
                  ["isTaxAccounting", "settings.fields.isTaxAccounting"],
                  ["isOffBalance", "settings.fields.isOffBalance"],
                ].map(([fieldName, label]) => (
                  <Col xs={12} sm={8} key={fieldName}>
                    <Form.Item label={t(label)} className="mb-1!">
                      <Switch
                        checked={Boolean(
                          formik.values[fieldName as keyof ChartAccountsForm],
                        )}
                        onChange={(checked) =>
                          formik.setFieldValue(fieldName, checked, true)
                        }
                      />
                    </Form.Item>
                  </Col>
                ))}
              </Row>
            </Col>
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
