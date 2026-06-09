import { useMemo } from "react";
import { Formik } from "formik";
import type { FormikHelpers } from "formik";
import { Col, Form, Row, Select, Spin } from "antd";
import { useNavigate, useParams } from "react-router";
import toast from "react-hot-toast";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { roleSchema } from "../../types/settings";
import type { RoleForm } from "../../types/settings";
import { useCreateRole } from "../../hooks/role/useCreateRole";
import { useUpdateRole } from "../../hooks/role/useUpdateRole";
import { useGetDetailRole } from "../../hooks/role/useGetDetailRole";
import RoleModuleSelector from "./components/RoleModuleSelector";
import Card from "@/components/ui/card/Card";
import InputText from "@/components/fields/InputText";

const emptyRoleForm: RoleForm = {
  fullName: "",
  shortName: "",
  roleModules: [],
};

export default function RoleAddPage() {
  const navigate = useNavigate();
  const params = useParams();
  const roleId = params.id ? Number(params.id) : null;
  const isEdit = Boolean(roleId);
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const { data: roleDetail, isLoading: isDetailLoading } = useGetDetailRole(
    roleId ?? "",
  );

  const initialValues = useMemo<RoleForm>(() => {
    if (!roleDetail) {
      return isEdit
        ? { ...emptyRoleForm, id: roleId, stateId: null }
        : emptyRoleForm;
    }

    return {
      id: roleDetail.id,
      fullName: roleDetail.fullName,
      shortName: roleDetail.shortName,
      stateId: roleDetail.stateId,
      roleModules: roleDetail.roleModules?.map((item) => item.moduleId) ?? [],
    };
  }, [isEdit, roleDetail, roleId]);
  
  const handleSubmit = async (
    values: RoleForm,
    helpers: FormikHelpers<RoleForm>,
  ) => {
    try {
      if (isEdit && roleId) {
        await updateRole.mutateAsync({ id: roleId, payload: values });
        toast.success("Rol muvaffaqiyatli o'zgartirildi");
      } else {
        await createRole.mutateAsync(values);
        toast.success("Rol muvaffaqiyatli yaratildi");
      }
      helpers.resetForm();
      navigate("/main/settings/role");
    } catch (error) {
      errorHandlers(error);
    }
  };

  return (
    <Spin spinning={isDetailLoading && isEdit}>
      <Formik<RoleForm>
        enableReinitialize
        initialValues={initialValues}
        validationSchema={roleSchema(isEdit)}
        onSubmit={handleSubmit}
      >
        {(formik) => {
          const stateError =
            formik.touched.stateId && formik.errors.stateId
              ? String(formik.errors.stateId)
              : undefined;

          return (
            <div>
              {" "}
              <Form layout="inline" onFinish={formik.handleSubmit}>
                <Card className="border border-border p-3 w-full">
                  <Row gutter={20}>
                    <Col span={8}>
                      <InputText
                        formik={formik}
                        fieldName="fullName"
                        label="To'liq nomi"
                      />
                    </Col>
                    <Col span={8}>
                      <InputText
                        formik={formik}
                        fieldName="shortName"
                        label="Qisqacha nomi"
                      />
                    </Col>
                    {isEdit && (
                      <Col span={8}>
                        <Form.Item
                          label="Holati"
                          validateStatus={stateError ? "error" : ""}
                          help={stateError}
                        >
                          <Select
                            value={formik.values.stateId}
                            onChange={(value) =>
                              void formik.setFieldValue("stateId", value)
                            }
                            onBlur={() =>
                              void formik.setFieldTouched("stateId", true)
                            }
                            options={[
                              { value: 1, label: "Aktiv" },
                              { value: 2, label: "Nofaol" },
                            ]}
                            placeholder="Holatini tanlang"
                          />
                        </Form.Item>
                      </Col>
                    )}
                  </Row>
                </Card>
              </Form>
              <RoleModuleSelector
                formik={formik}
                submitting={createRole.isPending || updateRole.isPending}
              />
            </div>
          );
        }}
      </Formik>
    </Spin>
  );
}
