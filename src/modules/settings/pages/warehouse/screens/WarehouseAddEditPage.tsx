import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useFormik } from "formik";
import { Alert, Button, Checkbox, Col, Form, Modal, Row, Select, Spin } from "antd";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import SelectCustom from "@/components/fields/SelectCustom";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import InputText from "@/components/fields/InputText";
import ContractSelect from "@/components/fields/ContractSelect";
import { contractTypeIds } from "@/shared/constants/contractSelect";
import type { WarehouseForm } from "../types/form";
import { useGetDetailWarehouses } from "../hooks/useGetDetailWarehouses";
import { useCreateWarehouses } from "../hooks/useCreateWarehouses";
import { useUpdateWarehouses } from "../hooks/useUpdateWarehouses";
import { warehouseSchema } from "../types/schema";

const defaultValues: WarehouseForm = {
  organizationId: null,
  branchId: null,
  code: "",
  name: "",
  responsibleUserId: null,
  stateId: null,
  isMain: false,
  address: null,
  isRetail: false,
  retailStockAccountId: null,
  markupAccountId: null,
  commissionKind: null,
  commissionCounterpartyId: null,
  commissionContractId: null,
};

/** inv_warehouse.commission_kind */
const commissionKinds = { atAgent: 1, fromCommittent: 2 } as const;

interface WarehouseAddEditPageProps {
  open: boolean;
  onClose: () => void;
  /** Called with the new record's id, so a field it was made from can pick it. */
  onCreated?: (id: number) => void;
  id?: number | null;
}

export default function WarehouseAddEditPage({
  open,
  onClose,
  onCreated,
  id,
}: WarehouseAddEditPageProps) {
  const { t } = useTranslation();
  const editId = id ?? null;
  const isEdit = Boolean(editId);
  const { data: Warehouses, isLoading: isOrgonizationsLoading } =
    useGetDetailWarehouses(editId ?? "");
  const createMutation = useCreateWarehouses();
  const updateMutation = useUpdateWarehouses();

  const formik = useFormik<WarehouseForm>({
    initialValues: {
      ...defaultValues,
      stateId: isEdit ? null : 1,
    },
    enableReinitialize: true,
    validationSchema: warehouseSchema(isEdit),
    onSubmit: async (values, helpers) => {
      try {
        if (isEdit && editId) {
          await updateMutation.mutateAsync({ id: editId, payload: values });
          toast.success(t("settings.messages.updated"));
        } else {
          const created: unknown = await createMutation.mutateAsync(values);
          const createdId =
            typeof created === "number" ? created : Number((created as { id?: number } | null)?.id);
          if (createdId > 0) onCreated?.(createdId);
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
    if (Warehouses && isEdit) {
      formik.setValues({
        organizationId: Warehouses.organizationId ?? null,
        branchId: Warehouses.branchId ?? null,
        code: Warehouses.code ?? "",
        name: Warehouses.name ?? "",
        responsibleUserId: Warehouses.responsibleUserId ?? null,
        stateId: Warehouses.stateId ?? null,
        isMain: Warehouses.isMain ?? false,
        address: Warehouses.address ?? null,
        isRetail: Warehouses.isRetail ?? false,
        retailStockAccountId: Warehouses.retailStockAccountId ?? null,
        markupAccountId: Warehouses.markupAccountId ?? null,
        commissionKind: Warehouses.commissionKind ?? null,
        commissionCounterpartyId: Warehouses.commissionCounterpartyId ?? null,
        commissionContractId: Warehouses.commissionContractId ?? null,
      });
    }
    // formik is a new object every render: the values are set once per loaded record
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Warehouses, isEdit]);
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      mask={{ closable: false }}
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
      width={600}
    >
      <Spin spinning={isOrgonizationsLoading}>
        <Form layout="vertical" onFinish={formik.handleSubmit}>
          <Row gutter={[16, 0]}>
            <Col span={12}>
              <InputText
                formik={formik}
                fieldName="name"
                label="settings.fields.name"
              />
            </Col>
            <Col span={12}>
              <InputText
                formik={formik}
                fieldName="code"
                label="settings.fields.code"
              />
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
                fieldName="responsibleUserId"
                label="settings.fields.responsibleUser"
                path={selectListEndpoints.usersSelectList}
              />
            </Col>

            <Col span={24}>
              <Checkbox
                checked={Boolean(formik.values.isRetail)}
                disabled={Boolean(formik.values.commissionKind)}
                onChange={(event) => {
                  formik.setFieldValue("isRetail", event.target.checked);
                  if (!event.target.checked) {
                    formik.setFieldValue("retailStockAccountId", null);
                    formik.setFieldValue("markupAccountId", null);
                  }
                }}
              >
                {t("settings.fields.isRetailStore")}
              </Checkbox>
              {formik.values.isRetail && (
                <Alert
                  className="my-2"
                  type="info"
                  showIcon
                  message={t("settings.descriptions.retailStore")}
                />
              )}
            </Col>
            {!formik.values.isRetail && (
              <Col span={24}>
                <Form.Item label={t("warehouseCommission.kind")} className="mb-2">
                  <Select
                    className="w-full"
                    allowClear
                    value={formik.values.commissionKind ?? null}
                    placeholder={t("warehouseCommission.kindNone")}
                    // as the other selects of the form (SelectCustom): no filled background
                    style={{ backgroundColor: "transparent" }}
                    onChange={(value?: number) => {
                      formik.setFieldValue("commissionKind", value ?? null);
                      formik.setFieldValue("commissionContractId", null);
                      if (!value) formik.setFieldValue("commissionCounterpartyId", null);
                    }}
                    options={[
                      { value: commissionKinds.atAgent, label: t("warehouseCommission.atAgent") },
                      { value: commissionKinds.fromCommittent, label: t("warehouseCommission.fromCommittent") },
                    ]}
                  />
                </Form.Item>
              </Col>
            )}
            {Boolean(formik.values.commissionKind) && (
              <>
                <Col span={12}>
                  <SelectCustom
                    formik={formik}
                    fieldName="commissionCounterpartyId"
                    label={
                      formik.values.commissionKind === commissionKinds.atAgent
                        ? "warehouseCommission.agent"
                        : "warehouseCommission.committent"
                    }
                    path={selectListEndpoints.counterpartiesSelectList}
                    required
                    onChange={() => formik.setFieldValue("commissionContractId", null)}
                  />
                </Col>
                <Col span={12}>
                  <ContractSelect
                    formik={formik}
                    fieldName="commissionContractId"
                    label="purchase.fields.contract"
                    counterpartyId={formik.values.commissionCounterpartyId}
                    date={dayjs().format("YYYY-MM-DD")}
                    contractTypeId={
                      formik.values.commissionKind === commissionKinds.atAgent
                        ? contractTypeIds.commissionAgent
                        : contractTypeIds.committent
                    }
                  />
                </Col>
                <Col span={24}>
                  <Alert
                    className="mb-3"
                    type="info"
                    showIcon
                    message={t(
                      formik.values.commissionKind === commissionKinds.atAgent
                        ? "warehouseCommission.atAgentHint"
                        : "warehouseCommission.fromCommittentHint",
                    )}
                  />
                </Col>
              </>
            )}
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
