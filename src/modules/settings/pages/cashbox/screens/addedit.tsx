import { useEffect } from "react";
import { useFormik } from "formik";
import { Button, Col, Form, Modal, Row, Spin } from "antd";
import toast from "react-hot-toast";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import SelectCustom from "@/components/fields/SelectCustom";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import type { CashBoxForm } from "../types/form";
import InputText from "@/components/fields/InputText";
import { cashBoxSchema } from "../types/schema";
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
};

interface CashBoxModalProps {
  open: boolean;
  onClose: () => void;
  id?: number | null;
}

export default function CashBoxAddPage({
  open,
  onClose,
  id,
}: CashBoxModalProps) {
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
          toast.success("Tashkilot muvaffaqiyatli o'zgartirildi");
        } else {
          await createMutation.mutateAsync(values);
          toast.success("Tashkilot muvaffaqiyatli yaratildi");
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
      });
    }
  }, [CashBox, isEdit]);
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      title={isEdit ? "Tashkilotni tahrirlash" : "Yangi tashkilot qo'shish"}
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
              <InputText formik={formik} fieldName="name" label="name" />
            </Col>
            <Col span={12}>
              <InputText formik={formik} fieldName="code" label="code" />
            </Col>
            <Col span={12}>
              <SelectCustom
                formik={formik}
                fieldName="organizationId"
                label="organizationId"
                path={selectListEndpoints.operationTypesSelectList}
              />
            </Col>
            <Col span={12}>
              <SelectCustom
                formik={formik}
                fieldName="branchId"
                label="branchId"
                path={selectListEndpoints.branchesSelectList}
              />
            </Col>
            <Col span={12}>
              <SelectCustom
                formik={formik}
                fieldName="currencyId"
                label="currencyId"
                path={selectListEndpoints.currenciesSelectList}
              />
            </Col>
            <Col span={12}>
              {isEdit && (
                <SelectCustom
                  formik={formik}
                  fieldName="stateId"
                  label="Holati"
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
            Yakunlash
          </Button>
        </Form>
      </Spin>
    </Modal>
  );
}
