import { useEffect } from "react";
import { useFormik } from "formik";
import { Button, Col, Form, Modal, Row, Spin } from "antd";
import toast from "react-hot-toast";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { counterpartySchema } from "../../types/schema";
import type { CounterpartyForm } from "../../types/form";
import { useCreateCounteryParty } from "@/modules/settings/hooks/counterparty/useCreateCounterParty";
import { useUpdateCounteryParty } from "@/modules/settings/hooks/counterparty/useUpdateCounterParty";
import { useGetDetailCounteryParty } from "@/modules/settings/hooks/counterparty/useGetDetailCounterParty";
import InputText from "@/components/fields/InputText";
import InputPhoneNumber from "@/components/fields/InputPhoneNumber";
import SelectCustom from "@/components/fields/SelectCustom";
import { selectListEndpoints } from "@/shared/constants/selectLists";

const defaultValues: CounterpartyForm = {
  organizationId: null,
  counterpartyTypeId: null,
  shortName: "",
  fullName: "",
  inn: "",
  phoneNumber: "",
  regionId: null,
  districtId: null,
  address: "",
  stateId: null,
};

interface CounteryPartyModalProps {
  open: boolean;
  onClose: () => void;
  id?: number | null;
}

export default function CounteryPartyAddPage({
  open,
  onClose,
  id,
}: CounteryPartyModalProps) {
  const editId = id ?? null;
  const isEdit = Boolean(editId);
  const { data: counterpartyDetail, isLoading: isOrgonizationsLoading } =
    useGetDetailCounteryParty(editId ?? "");
  const createMutation = useCreateCounteryParty();
  const updateMutation = useUpdateCounteryParty();

  const formik = useFormik<CounterpartyForm>({
    initialValues: defaultValues,
    enableReinitialize: true,
    validationSchema: counterpartySchema(isEdit),
    onSubmit: async (values) => {
      try {
        if (isEdit && editId) {
          await updateMutation.mutateAsync({ id: editId, payload: values });
          toast.success("Tashkilot muvaffaqiyatli o'zgartirildi");
        } else {
          await createMutation.mutateAsync(values);
          toast.success("Tashkilot muvaffaqiyatli yaratildi");
        }
        onClose();
        formik.resetForm();
      } catch (err: unknown) {
        errorHandlers(err);
      }
    },
  });

  useEffect(() => {
    if (counterpartyDetail && isEdit) {
      formik.setValues({
        organizationId: counterpartyDetail.organizationId ?? 1,
        counterpartyTypeId: counterpartyDetail.counterpartyTypeId ?? 0,
        shortName: counterpartyDetail.shortName ?? "",
        fullName: counterpartyDetail.fullName ?? "",
        inn: counterpartyDetail.inn ?? "",
        phoneNumber: counterpartyDetail.phoneNumber ?? "",
        regionId: counterpartyDetail.regionId ?? 1,
        districtId: counterpartyDetail.districtId ?? 1,
        address: "",
        stateId: counterpartyDetail.stateId ?? 1,
      });
    }
  }, [counterpartyDetail, isEdit]);
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
      width={650}
      destroyOnHidden
    >
      <Spin spinning={isOrgonizationsLoading}>
        <Form layout="vertical" onFinish={formik.handleSubmit}>
          <Row gutter={[16, 8]}>
            <Col span={12}>
              <InputText
                formik={formik}
                fieldName="fullName"
                label="To'liq nomi"
              />
            </Col>
            <Col span={12}>
              <InputText
                formik={formik}
                fieldName="shortName"
                label="Qisqacha nomi"
              />
            </Col>
            <Col span={12}>
              <SelectCustom
                formik={formik}
                fieldName="regionId"
                label="Regions"
                path={selectListEndpoints.regionsSelectList}
              />
            </Col>
            <Col span={12}>
              <SelectCustom
                formik={formik}
                fieldName="districtId"
                label="Districts"
                path={selectListEndpoints.districtsSelectList}
              />
            </Col>
            <Col span={12}>
              <InputText formik={formik} fieldName="inn" label="INN" />
            </Col>
            <Col span={12}>
              <SelectCustom
                formik={formik}
                fieldName="organizationId"
                label="organization"
                path={selectListEndpoints.operationTypesSelectList}
              />
            </Col>
            <Col span={12}>
              <InputPhoneNumber
                formik={formik}
                fieldName="phoneNumber"
                label="Tel raqam"
              />
            </Col>
            <Col span={12}>
              <SelectCustom
                formik={formik}
                fieldName="counterpartyTypeId"
                label="PartyType"
                path={selectListEndpoints.counterpartyTypesSelectList}
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
