import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { Button, Col, Form, Modal, Row } from "antd";
import { useFormik } from "formik";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useCreateContractResponsiblePerson } from "../hooks/useCreateContractResponsiblePerson";
import { useUpdateContractResponsiblePerson } from "../hooks/useUpdateContractResponsiblePerson";
import type { ContractResponsiblePersonForm } from "../types/form";
import type { ContractResponsiblePerson } from "../types/type";
import { contractResponsiblePersonSchema } from "../types/schema";

const defaultValues: ContractResponsiblePersonForm = {
  fullName: "",
  stateId: null,
};

interface Props {
  open: boolean;
  onClose: () => void;
  /** Tahrirlanayotgan yozuv; yaratishda null. */
  record?: ContractResponsiblePerson | null;
  /** Yaratilgandan keyin yangi ID — shartnoma formasida darhol tanlash uchun. */
  onCreated?: (id: number) => void;
}

export default function ContractResponsiblePersonAddEditModal({
  open,
  onClose,
  record,
  onCreated,
}: Props) {
  const { t } = useTranslation();
  const isEdit = Boolean(record?.id);
  const createMutation = useCreateContractResponsiblePerson();
  const updateMutation = useUpdateContractResponsiblePerson();

  const formik = useFormik<ContractResponsiblePersonForm>({
    initialValues: defaultValues,
    enableReinitialize: false,
    validationSchema: contractResponsiblePersonSchema(isEdit),
    onSubmit: async (values, helpers) => {
      try {
        if (isEdit && record) {
          await updateMutation.mutateAsync({ id: record.id, payload: values });
          toast.success(t("settings.messages.updated"));
        } else {
          const createdId = await createMutation.mutateAsync(values);
          onCreated?.(createdId);
          toast.success(t("settings.messages.created"));
        }
        helpers.resetForm({ values: defaultValues });
        onClose();
      } catch (error) {
        errorHandlers(error);
      }
    },
  });

  const { resetForm, setValues } = formik;

  useEffect(() => {
    if (!open) return;
    if (record) {
      void setValues({
        fullName: record.fullName ?? "",
        stateId: record.stateId ?? null,
      });
      return;
    }
    resetForm({ values: defaultValues });
  }, [open, record, resetForm, setValues]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleClose = () => {
    resetForm({ values: defaultValues });
    onClose();
  };

  return (
    <Modal
      title={
        isEdit
          ? t("contract.responsiblePersons.editTitle")
          : t("contract.responsiblePersons.createTitle")
      }
      open={open}
      onCancel={handleClose}
      footer={null}
      centered
      width={520}
      mask={{ closable: false }}
      destroyOnHidden
    >
      <Form layout="vertical" onFinish={formik.handleSubmit}>
        <Row gutter={[16, 0]}>
          <Col span={24}>
            <InputText
              formik={formik}
              fieldName="fullName"
              label="contract.fields.responsiblePerson"
            />
          </Col>
          {isEdit && (
            <Col span={24}>
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
          className="h-12 rounded-xl bg-blue-600! font-semibold text-base hover:bg-blue-700!"
          loading={isSubmitting}
        >
          {t("common.submit")}
        </Button>
      </Form>
    </Modal>
  );
}
