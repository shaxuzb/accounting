import { Button, Col, Form, Row, Spin } from "antd";
import { useEffect } from "react";
import { useFormik } from "formik";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import dayjs from "@/config/dayjs";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import Card from "@/components/ui/card/Card";
import InputNumberFormat from "@/components/fields/InputNumber";
import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { useAppSelector } from "@/store/hooks";
import type { FaAssetFormValues } from "../types/form";
import { faAssetSchema } from "../types/schema";
import { faAssetPermissions } from "../constants/permissions";
import { useCreateFaAsset, useGetDetailFaAsset, useUpdateFaAsset } from "../hooks";

const defaultValues: FaAssetFormValues = {
  inventoryNumber: "",
  name: "",
  faGroupId: null,
  okofId: null,
  depreciationMethodId: null,
  usefulLifeMonths: null,
  initialCost: null,
  salvageValue: null,
  commissioningDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
  deprStartDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
  plannedUnitsTotal: null,
  sourceProductTableId: null,
  departmentId: null,
  responsibleUserId: null,
};

export default function FaAssetFormPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id = "" } = useParams();
  const isEdit = Boolean(id);
  const user = useAppSelector((state) => state.auth.user);
  const permissions = user?.user.permissions ?? [];
  const canView =
    permissions.includes(faAssetPermissions.view) ||
    permissions.includes(faAssetPermissions.detail);
  const canCreate = permissions.includes(faAssetPermissions.create);
  const canUpdate = permissions.includes(faAssetPermissions.update);
  const canSubmit = isEdit ? canUpdate : canCreate;

  const detailQuery = useGetDetailFaAsset(id);
  const createMutation = useCreateFaAsset();
  const updateMutation = useUpdateFaAsset();

  const formik = useFormik<FaAssetFormValues>({
    initialValues: defaultValues,
    enableReinitialize: true,
    validationSchema: faAssetSchema,
    onSubmit: async (values, helpers) => {
      try {
        const payload = {
          inventoryNumber: values.inventoryNumber.trim(),
          name: values.name.trim(),
          faGroupId: values.faGroupId,
          okofId: values.okofId,
          depreciationMethodId: values.depreciationMethodId,
          usefulLifeMonths: values.usefulLifeMonths,
          initialCost: values.initialCost,
          salvageValue: values.salvageValue,
          commissioningDate: values.commissioningDate,
          deprStartDate: values.deprStartDate,
          plannedUnitsTotal: values.plannedUnitsTotal,
          sourceProductTableId: values.sourceProductTableId,
          departmentId: values.departmentId,
          responsibleUserId: values.responsibleUserId,
        };

        if (isEdit && id) {
          await updateMutation.mutateAsync({ id, payload });
          toast.success(t("settings.messages.updated"));
        } else {
          await createMutation.mutateAsync(payload);
          toast.success(t("settings.messages.created"));
        }

        helpers.resetForm();
        navigate("/main/fa/assets");
      } catch (err: unknown) {
        errorHandlers(err);
      }
    },
  });

  useEffect(() => {
    const record = detailQuery.data;
    if (!record) return;

    formik.setValues({
      inventoryNumber: record.inventoryNumber ?? "",
      name: record.name ?? "",
      faGroupId: record.faGroupId ?? null,
      okofId: record.okofId ?? null,
      depreciationMethodId: record.depreciationMethodId ?? null,
      usefulLifeMonths: record.usefulLifeMonths ?? null,
      initialCost: record.initialCost ?? null,
      salvageValue: record.salvageValue ?? null,
      commissioningDate: record.commissioningDate ?? defaultValues.commissioningDate,
      deprStartDate: record.deprStartDate ?? defaultValues.deprStartDate,
      plannedUnitsTotal: record.plannedUnitsTotal ?? null,
      sourceProductTableId: record.sourceProductTableId ?? null,
      departmentId: record.departmentId ?? null,
      responsibleUserId: record.responsibleUserId ?? null,
    });
  }, [detailQuery.data]);

  const isSubmitLoading =
    createMutation.isPending || updateMutation.isPending || detailQuery.isLoading;

  if (!canView) {
    return null;
  }

  return (
    <Card className="border border-border p-4">
      <div className="mb-4 text-xl font-semibold">
        {isEdit ? t("fa.form.edit") : t("fa.form.create")}
      </div>

      <Spin spinning={detailQuery.isLoading && isEdit}>
        <Form layout="vertical" onFinish={formik.handleSubmit}>
          <Row gutter={[20, 8]}>
            <Col span={12}>
              <InputText
                formik={formik}
                fieldName="inventoryNumber"
                label="fa.fields.inventoryNumber"
              />
            </Col>
            <Col span={12}>
              <InputText formik={formik} fieldName="name" label="fa.fields.name" />
            </Col>
            <Col span={8}>
              <SelectCustom
                formik={formik}
                fieldName="faGroupId"
                label="fa.fields.faGroup"
                path={selectListEndpoints.faGroupsSelectList}
              />
            </Col>
            <Col span={8}>
              <SelectCustom
                formik={formik}
                fieldName="okofId"
                label="fa.fields.okof"
                path={selectListEndpoints.okofsSelectList}
              />
            </Col>
            <Col span={8}>
              <SelectCustom
                formik={formik}
                fieldName="depreciationMethodId"
                label="fa.fields.depreciationMethod"
                path={selectListEndpoints.depreciationMethodsSelectList}
              />
            </Col>

            <Col span={8}>
              <InputNumberFormat
                formik={formik}
                fieldName="usefulLifeMonths"
                label="fa.fields.usefulLifeMonths"
                min={1}
              />
            </Col>
            <Col span={8}>
              <InputNumberFormat
                formik={formik}
                fieldName="initialCost"
                label="fa.fields.initialCost"
                min={0}
              />
            </Col>
            <Col span={8}>
              <InputNumberFormat
                formik={formik}
                fieldName="salvageValue"
                label="fa.fields.salvageValue"
                min={0}
              />
            </Col>
            <Col span={8}>
              <SelectDate
                formik={formik}
                fieldName="commissioningDate"
                label="fa.fields.commissioningDate"
              />
            </Col>
            <Col span={8}>
              <SelectDate
                formik={formik}
                fieldName="deprStartDate"
                label="fa.fields.deprStartDate"
              />
            </Col>
            <Col span={8}>
              <InputNumberFormat
                formik={formik}
                fieldName="plannedUnitsTotal"
                label="fa.fields.plannedUnitsTotal"
                min={0}
              />
            </Col>
            <Col span={8}>
              <SelectCustom
                formik={formik}
                fieldName="sourceProductTableId"
                label="fa.fields.sourceProductTable"
                path={selectListEndpoints.sourceProductTablesSelectList}
              />
            </Col>
            <Col span={8}>
              <SelectCustom
                formik={formik}
                fieldName="departmentId"
                label="fa.fields.department"
                path={selectListEndpoints.departmentsSelectList}
              />
            </Col>
            <Col span={8}>
              <SelectCustom
                formik={formik}
                fieldName="responsibleUserId"
                label="fa.fields.responsibleUser"
                path={selectListEndpoints.usersSelectList}
              />
            </Col>
          </Row>

          {canSubmit && (
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={isSubmitLoading}
              className="h-11 rounded-xl"
            >
              {t("common.submit")}
            </Button>
          )}
        </Form>
      </Spin>
    </Card>
  );
}
