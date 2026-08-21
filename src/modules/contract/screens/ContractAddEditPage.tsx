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
import dayjs from "dayjs";
import { formatDate } from "@/utils/helpers";
import type { Contract } from "../types/type";

const defaultValues: ContractForm = {
  organizationId: null,
  counterpartyId: null,
  contractTypeId: null,
  contractDate: dayjs().format(formatDate),
  startDate: dayjs().format(formatDate),
  endDate: "",
  comment: "",
  stateId: null,
};

interface ContractAddEditPageProps {
  open: boolean;
  onClose: () => void;
  id?: number | null;
  contractTypeId?: number;
  initialCounterpartyId?: number | null;
  initialContractDate?: string;
  onCreated?: (contract: Contract) => void;
}

export default function ContractAddEditPage({
  open,
  onClose,
  id,
  contractTypeId,
  initialCounterpartyId,
  initialContractDate,
  onCreated,
}: ContractAddEditPageProps) {
  const { t } = useTranslation();
  const editId = id ?? null;
  const isEdit = Boolean(editId);
  const { data: Contract, isLoading: isOrgonizationsLoading } =
    useGetDetailContract(editId ?? "");
  const createMutation = useCreateContract();
  const updateMutation = useUpdateContract();
  const isSaleContract = contractTypeId === 2;
  const counterpartyPath = isSaleContract
    ? selectListEndpoints.clients
    : selectListEndpoints.suppliersSelectList;
  const counterpartyLabel = isSaleContract
    ? "contract.fields.customerName"
    : "contract.fields.supplierName";

  const formik = useFormik<ContractForm>({
    initialValues: {
      ...defaultValues,
      contractTypeId: contractTypeId ?? null,
      counterpartyId: initialCounterpartyId ?? null,
      contractDate: initialContractDate ?? defaultValues.contractDate,
      startDate: initialContractDate ?? defaultValues.startDate,
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
          const createdContract = await createMutation.mutateAsync(values);
          onCreated?.(createdContract);
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
      title={isEdit ? t("contract.editTitle") : t("contract.createTitle")}
      open={open}
      onCancel={() => {
        formik.resetForm();
        onClose();
      }}
      footer={null}
      centered
      width={600}
      mask={{closable: false}}
      maskClosable={false}
   

    >
      <Spin spinning={isOrgonizationsLoading}>
        <Form layout="vertical" onFinish={formik.handleSubmit}>
          <Row gutter={[16, 8]}>
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
                fieldName="counterpartyId"
                label={counterpartyLabel}
                path={counterpartyPath}
                disabled={!isEdit && Boolean(initialCounterpartyId)}
              />
            </Col>
            <Col span={12}>
              <SelectCustom
                formik={formik}
                fieldName="contractTypeId"
                label="contract.fields.contractType"
                path={selectListEndpoints.contractTypeSelectList}
                allowedIds={contractTypeId ? [contractTypeId] : undefined}
                getFirst
              />
            </Col>
            <Col span={12}>
              <SelectDate
                formik={formik}
                fieldName="contractDate"
                label="contract.fields.contractDate"
              />
            </Col>
            <Col span={12}>
              <SelectDate
                formik={formik}
                fieldName="startDate"
                label="contract.fields.startDate"
                maxDate={
                  formik.values.endDate
                    ? dayjs(formik.values.endDate)
                    : undefined
                }
              />
            </Col>
            <Col span={12}>
              <SelectDate
                formik={formik}
                fieldName="endDate"
                minDate={
                  formik.values.startDate
                    ? dayjs(formik.values.startDate)
                    : undefined
                }
                label="contract.fields.endDate"
              />
            </Col>
            <Col span={12}>
              <InputText
                formik={formik}
                fieldName="comment"
                label="contract.fields.comment"
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
