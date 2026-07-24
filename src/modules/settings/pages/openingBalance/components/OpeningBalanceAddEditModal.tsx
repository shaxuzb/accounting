import { useFormik } from "formik";
import { useTranslation } from "react-i18next";
import { Button, Col, Form, Modal, Row } from "antd";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { useAppSelector } from "@/store/hooks";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { useCreateOpeningBalance, useUpdateOpeningBalance } from "../hooks";
import type { OpeningBalanceHeaderForm } from "../types/form";
import { openingBalanceHeaderSchema } from "../types/schema";
import type { OpeningBalance } from "../types/type";

interface OpeningBalanceAddEditModalProps {
  open: boolean;
  onClose: () => void;
  record?: OpeningBalance | null;
}

export default function OpeningBalanceAddEditModal({
  open,
  onClose,
  record,
}: OpeningBalanceAddEditModalProps) {
  const { t } = useTranslation();
  const organization = useAppSelector((state) => state.organization);
  const isEdit = Boolean(record?.id);
  const createMutation = useCreateOpeningBalance();
  const updateMutation = useUpdateOpeningBalance(record?.id);

  const formik = useFormik<OpeningBalanceHeaderForm>({
    initialValues: {
      balanceDate: record?.balanceDate ?? dayjs().format("YYYY-MM-DD"),
      description: record?.description ?? "",
      stateId: record?.stateId ?? (isEdit ? null : 1),
    },
    enableReinitialize: true,
    validationSchema: openingBalanceHeaderSchema(isEdit),
    onSubmit: async (values, helpers) => {
      try {
        if (record?.id) {
          await updateMutation.mutateAsync(values);
          toast.success(t("openingBalance.messages.updated"));
        } else {
          await createMutation.mutateAsync(values);
          toast.success(t("openingBalance.messages.created"));
        }

        helpers.resetForm();
        onClose();
      } catch (error: unknown) {
        errorHandlers(error);
      }
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Modal
      title={
        isEdit
          ? t("openingBalance.form.editTitle")
          : t("openingBalance.form.createTitle")
      }
      open={open}
      onCancel={handleClose}
      footer={null}
      centered
      destroyOnHidden
      width={620}
    >
      <Form layout="vertical" onFinish={formik.handleSubmit}>
        <Row gutter={[16, 8]}>
          <Col xs={24} md={12}>
            <div className="mb-2 text-sm text-secondary-text">
              {t("settings.fields.organization")}
            </div>
            <div className="flex h-9.5 items-center rounded-lg border border-border px-3 text-text">
              {record?.organizationName || organization.name || "-"}
            </div>
          </Col>
          <Col xs={24} md={12}>
            <SelectDate
              formik={formik}
              fieldName="balanceDate"
              label="openingBalance.fields.balanceDate"
              required
            />
          </Col>

          <Col xs={24} md={isEdit ? 12 : 24}>
            <InputText
              formik={formik}
              fieldName="description"
              label="openingBalance.fields.description"
            />
          </Col>
          {isEdit && (
            <Col xs={24} md={12}>
              <SelectCustom
                formik={formik}
                fieldName="stateId"
                label="settings.fields.status"
                path={selectListEndpoints.statesSelectList}
                required
              />
            </Col>
          )}
        </Row>

        <Button
          type="primary"
          htmlType="submit"
          block
          size="large"
          loading={createMutation.isPending || updateMutation.isPending}
        >
          {t("common.save")}
        </Button>
      </Form>
    </Modal>
  );
}
