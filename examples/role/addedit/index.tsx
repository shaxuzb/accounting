import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import { Col, Form, Row } from "antd";
import { useFormik } from "formik";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useUpdateRole } from "./hook/useUpdateRole";
import { useCreateRole } from "./hook/useCreateRole";
import { useGetRoleId } from "./hook/useGetRoleId";
import { RoleInitialValues } from "@/modules/settings/types/initialValues";
import { roleSchema } from "@/modules/settings/utils/validation";
import BackButton from "@/components/ui/buttons/BackButton";
import Card from "@/components/ui/card/Card";
import SubGroupModules from "./components/SubGroupModules";
import { useChangeSelectType } from "@/hooks/useChangeSelectType ";

const RoleAdd = () => {
  const { t } = useTranslation();
  const params = useParams();
  const isEdit = Boolean(params.id);
  const navigate = useNavigate();
  const updateMutation = useUpdateRole(Number(params.id));
  const createMutation = useCreateRole();
  const mutate = params.id ? updateMutation : createMutation;
  const formik = useFormik<RoleInitialValues>({
    initialValues: {
      fullName: "",
      shortName: "",
      roleModules: [],
      ...(params.id && { stateId: null, id: null }),
    },
    validationSchema: roleSchema(isEdit),
    onSubmit: (values) => {
      mutate.mutate(values, {
        onSuccess: () => {
          navigate(-1);
          formik.resetForm();
        },
      });
    },
  });

  const { data: getData, isSuccess } = useGetRoleId(Number(params.id));

  useEffect(() => {
    if (isSuccess) {
      if (getData) {
        formik.setValues({
          fullName: getData.fullName,
          shortName: getData.shortName,
          roleModules: getData.roleModules.map((item) => item.moduleId),
          id: getData.id,
          stateId: getData.stateId,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, getData]);
  useChangeSelectType("disabled");
  return (
    <div>
      <Form onFinish={formik.handleSubmit} layout="vertical">
        <div className="">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">
              {params.id ? t("Settings.role.edit") : t("Settings.role.add")}
            </h2>
            <BackButton />
          </div>
          <Card className="mt-3 border border-border p-2 rounded-md">
            <Row gutter={20}>
              <Col span={8}>
                <InputText
                  label="To'liq nomi"
                  formik={formik}
                  fieldName="fullName"
                />
              </Col>
              <Col span={8}>
                <InputText
                  label="Qisqacha nomi"
                  formik={formik}
                  fieldName="shortName"
                />
              </Col>
              {params.id && (
                <Col span={8}>
                  <SelectCustom
                    label="Holati"
                    formik={formik}
                    path="select-list/states"
                    fieldName="stateId"
                  />
                </Col>
              )}
            </Row>
          </Card>
        </div>
        <SubGroupModules formik={formik} />
      </Form>
    </div>
  );
};

export default RoleAdd;
