import { useEffect } from "react";
import { useFormik } from "formik";
import { Button, Col, Form, Modal, Row, Spin } from "antd";
import toast from "react-hot-toast";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { organizationsSchema } from "../types/schema";
import type { organizationCreate } from "../types/form";
import { useCreateOrganization } from "../hooks";
import { useUpdateOrganizations } from "../hooks";
import { useGetDetailOrganizations } from "../hooks";
import InputText from "@/components/fields/InputText";
import InputPhoneNumber from "@/components/fields/InputPhoneNumber";
import SelectCustom from "@/components/fields/SelectCustom";
import { selectListEndpoints } from "@/shared/constants/selectLists";

const defaultValues: organizationCreate = {
  shortName: "",
  fullName: "",
  inn: "",
  phoneNumber: "",
  address: "",
  director: "",
  isParent: false,
  defaultLanguageId: 1,
  regionId: 1,
  districtId: 1,
  stateId:1,
};

interface OrganizationsModalProps {
  open: boolean;
  onClose: () => void;
  id?: number | null;
}

export default function OrganizationsAddPage({
  open,
  onClose,
  id,
}: OrganizationsModalProps) {
  const editId = id ?? null;
  const isEdit = Boolean(editId);
  const { data: organizations, isLoading: isOrgonizationsLoading } =
    useGetDetailOrganizations(editId ?? "");
  const createMutation = useCreateOrganization();
  const updateMutation = useUpdateOrganizations();

  const formik = useFormik<organizationCreate>({
    initialValues: defaultValues,
    enableReinitialize: true,
    validationSchema: organizationsSchema(isEdit),
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
    if (organizations && isEdit) {
      formik.setValues({
        shortName: organizations.shortName ?? "",
        fullName: organizations.fullName ?? "",
        inn: organizations.inn ?? "",
        phoneNumber: organizations.phoneNumber ?? "",
        address: organizations.address ?? "",
        director: organizations.director ?? "",
        isParent: organizations.isParent ?? false,
        defaultLanguageId: organizations.defaultLanguageId ?? 1,
        regionId: organizations.regionId ?? 1,
        districtId: organizations.districtId ?? 1,
        stateId: organizations.stateId ?? 1,
      });
    }
  }, [organizations, isEdit]);
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      title={isEdit ? "Tashkilotni tahrirlash" : "Yangi tashkilot qo'shish"}
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={650}
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
                fieldName="defaultLanguageId"
                label="Til"
                path={selectListEndpoints.languagesSelectList}
              />
            </Col>
            <Col span={12}>
              <InputText formik={formik} fieldName="inn" label="INN" />
            </Col>
            <Col span={12}>
              <InputPhoneNumber
                formik={formik}
                fieldName="phoneNumber"
                label="Tel raqam"
              />
            </Col>
            <Col span={12}>
              <InputText
                formik={formik}
                fieldName="director"
                label="Direktor"
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

            <Col span={24}>
              <InputText formik={formik} fieldName="address" label="Manzil" />
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
