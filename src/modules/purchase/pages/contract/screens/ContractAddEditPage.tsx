import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useFormik } from "formik";
import { Button, Col, Form, Modal, Row, Spin } from "antd";
import toast from "react-hot-toast";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import SelectCustom from "@/components/fields/SelectCustom";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import InputText from "@/components/fields/InputText";
import type { ContractForm } from "../types/form";
import { useGetDetailContract } from "../hooks/useGetDetailContract";
import { useCreateContract } from "../hooks/useCreateContract";
import { useUpdateContract } from "../hooks/useUpdateContract";
import { contractSchema } from "../types/schema";
import SelectDate from "@/components/fields/SelectDate";

const defaultValues: ContractForm = {
  organizationId: null,
  counterpartyId: null,
  contractTypeId: null,
  contractDate: "",
  startDate: "",
  endDate: "",
  comment: "",
  stateId: null,
};

interface ContractAddEditPageProps {
  open: boolean;
  onClose: () => void;
  id?: number | null;
}

export default function ContractAddEditPage({
  open,
  onClose,
  id,
}: ContractAddEditPageProps) {
  const { t } = useTranslation();
  const editId = id ?? null;
  const isEdit = Boolean(editId);
  const { data: Contract, isLoading: isOrgonizationsLoading } =
    useGetDetailContract(editId ?? "");
  const createMutation = useCreateContract();
  const updateMutation = useUpdateContract();

  const formik = useFormik<ContractForm>({
    initialValues: {
      ...defaultValues,
      stateId: isEdit ? null : 1,
    },
    enableReinitialize: true,
    validationSchema: contractSchema(isEdit),
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
    if (Contract && isEdit) {
      formik.setValues({
        organizationId: Contract.organizationId ?? null,
        counterpartyId: Contract.counterpartyId ?? null,
        contractTypeId: Contract.contractTypeId ?? null,
        contractDate: Contract.contractDate ?? "",
        startDate: Contract.startDate ?? "",
        endDate: Contract.endDate ?? "",
        comment: Contract.comment ?? "",
        stateId: Contract.stateId ?? null,
      });
    }
  }, [Contract, isEdit]);
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
      width={600}
    >
      <Spin spinning={isOrgonizationsLoading}>
        <Form layout="vertical" onFinish={formik.handleSubmit}>
          <Row gutter={[16, 8]}>
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
                fieldName="counterpartyId"
                label="contract.fields.counterpartyName"
                path={selectListEndpoints.counterpartiesSelectList}
              />
            </Col>
            <Col span={12}>
              <SelectCustom
                formik={formik}
                fieldName="contractTypeId"
                label="contract.fields.contractType"
                path={selectListEndpoints.contractTypeSelectList}
              />
            </Col>
            <Col span={12}>
              <SelectDate
                formik={formik}
                fieldName="contractDate"
                label="contractDate"
              />
            </Col>
            <Col span={12}>
              <SelectDate
                formik={formik}
                fieldName="startDate"
                label="startDate"
              />
            </Col>
            <Col span={12}>
              <SelectDate formik={formik} fieldName="endDate" label="endDate" />
            </Col>
            <Col span={12}>
              <InputText formik={formik} fieldName="comment" label="comment" />
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
