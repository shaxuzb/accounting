import { useTranslation } from "react-i18next";
import { useFormik } from "formik";
import { Col, Form, Row, Spin } from "antd";
import { useNavigate, useParams } from "react-router";
import toast from "react-hot-toast";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { roleSchema } from "../types/schema";
import type { RoleForm } from "../types/form";
import { useCreateRole } from "../hooks";
import { useUpdateRole } from "../hooks";
import { useGetDetailRole } from "../hooks";
import RoleModuleSelector from "../components/RoleModuleSelector";
import Card from "@/components/ui/card/Card";
import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import { selectListEndpoints } from "@/shared/constants/selectLists";

export default function RoleAddEditPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const roleId = params.id ? Number(params.id) : null;
  const isEdit = Boolean(roleId);
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const { data, isLoading } = useGetDetailRole(roleId ?? "");
  const formik = useFormik<RoleForm>({
    enableReinitialize: true,
    initialValues: {
      fullName: data?.fullName ?? "",
      shortName: data?.shortName ?? "",
      moduleIds: data?.modules.map((item) => item.moduleId) ?? [],
      ...(isEdit
        ? {
            stateId: data?.stateId,
          }
        : {}),
    },
    validationSchema: roleSchema(isEdit),
    onSubmit: async (values, helpers) => {
      try {
        if (isEdit && roleId) {
          await updateRole.mutateAsync({ id: roleId, payload: values });
          toast.success(t("settings.messages.roleUpdated"));
        } else {
          await createRole.mutateAsync(values);
          toast.success(t("settings.messages.roleCreated"));
        }
        helpers.resetForm();
        navigate("/main/settings/role");
      } catch (error) {
        errorHandlers(error);
      }
    },
  });

  return (
    <Spin spinning={isLoading}>
      <div>
        <Form layout="vertical" onFinish={formik.handleSubmit}>
          <Card className="border border-border p-3 w-full">
            <Row gutter={20}>
              <Col span={8}>
                <InputText
                  formik={formik}
                  fieldName="fullName"
                  label="settings.fields.fullName"
                />
              </Col>
              <Col span={8}>
                <InputText
                  formik={formik}
                  fieldName="shortName"
                  label="settings.fields.shortName"
                />
              </Col>
              {isEdit && (
                <Col span={8}>
                  <SelectCustom
                    formik={formik}
                    fieldName="stateId"
                    label="settings.fields.status"
                    path={selectListEndpoints.statesSelectList}
                  />
                </Col>
              )}
            </Row>
          </Card>
          <RoleModuleSelector
            formik={formik}
            submitting={createRole.isPending || updateRole.isPending}
          />
        </Form>
      </div>
    </Spin>
  );
}
