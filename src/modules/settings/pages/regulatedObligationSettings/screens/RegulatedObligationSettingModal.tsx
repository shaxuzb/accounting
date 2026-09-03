import { useEffect } from "react";
import { useFormik } from "formik";
import dayjs from "dayjs";
import { Button, Col, Form, Modal, Row, Spin } from "antd";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import InputNumberFormat from "@/components/fields/InputNumber";
import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { chartAccountSelectDisplayConfig } from "@/shared/constants/selectLists";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { buildRegulatedObligationSettingPayload } from "../utils/payload";
import {
  useCreateRegulatedObligationSetting,
  useGetDetailRegulatedObligationSetting,
  useUpdateRegulatedObligationSetting,
} from "../hooks";
import { regulatedObligationSettingSchema } from "../types/schema";
import type { RegulatedObligationSettingForm } from "../types";

const defaultValues = (
  obligationId?: number | null,
): RegulatedObligationSettingForm => ({
  regulatedObligationId: obligationId ?? null,
  periodicityId: null,
  classifierCode: "",
  rate: null,
  chartAccountId: null,
  effectiveFrom: dayjs().format("YYYY-MM-DD"),
  effectiveTo: null,
  stateId: 1,
});

interface RegulatedObligationSettingModalProps {
  open: boolean;
  onClose: () => void;
  id?: number | null;
  obligationId?: number | null;
  readOnly?: boolean;
}

export default function RegulatedObligationSettingModal({
  open,
  onClose,
  id,
  obligationId,
  readOnly = false,
}: RegulatedObligationSettingModalProps) {
  const { t } = useTranslation();
  const editId = id ?? null;
  const isEdit = editId !== null;
  const { data, isLoading } = useGetDetailRegulatedObligationSetting(editId);
  const createMutation = useCreateRegulatedObligationSetting();
  const updateMutation = useUpdateRegulatedObligationSetting();

  const formik = useFormik<RegulatedObligationSettingForm>({
    initialValues: defaultValues(obligationId),
    enableReinitialize: true,
    validationSchema: regulatedObligationSettingSchema(isEdit),
    onSubmit: async (values, helpers) => {
      try {
        const payload = buildRegulatedObligationSettingPayload(values);

        if (isEdit) {
          await updateMutation.mutateAsync({ id: editId, payload });
          toast.success(t("settings.messages.updated"));
        } else {
          await createMutation.mutateAsync(payload);
          toast.success(t("settings.messages.created"));
        }

        helpers.resetForm();
        onClose();
      } catch (error: unknown) {
        errorHandlers(error);
      }
    },
  });
  const { setValues } = formik;

  useEffect(() => {
    if (!data || !isEdit) return;

    setValues({
      regulatedObligationId: data.regulatedObligationId,
      periodicityId: data.periodicityId,
      classifierCode: data.classifierCode ?? "",
      rate: data.rate,
      chartAccountId: data.chartAccountId,
      effectiveFrom: data.effectiveFrom ?? dayjs().format("YYYY-MM-DD"),
      effectiveTo: data.effectiveTo,
      stateId: data.stateId,
    });
  }, [data, isEdit, setValues]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (!open) return null;

  return (
    <Modal
      mask={{ closable: false }}
      title={
        isEdit
          ? readOnly
            ? t("settings.form.viewRegulatedObligationSetting")
            : t("settings.form.editRegulatedObligationSetting")
          : t("settings.form.createRegulatedObligationSetting")
      }
      open={open}
      onCancel={() => {
        formik.resetForm();
        onClose();
      }}
      footer={null}
      centered
      width={720}
    >
      <Spin spinning={isLoading}>
        <Form layout="vertical" onFinish={formik.handleSubmit}>
          <Row gutter={[16, 8]}>
            <Col span={12}>
              <SelectCustom
                formik={formik}
                fieldName="regulatedObligationId"
                label="settings.fields.regulatedObligation"
                path={selectListEndpoints.regulatedObligationsSelectList}
                required={!isEdit && !readOnly}
                disabled={readOnly}
              />
            </Col>
            <Col span={12}>
              <SelectCustom
                formik={formik}
                fieldName="periodicityId"
                label="settings.fields.periodicity"
                path={
                  selectListEndpoints.regulatedObligationPeriodicitiesSelectList
                }
                required={!isEdit && !readOnly}
                disabled={readOnly}
              />
            </Col>
            <Col span={12}>
              <InputText
                formik={formik}
                fieldName="classifierCode"
                label="settings.fields.classifierCode"
                disabled={readOnly}
              />
            </Col>
            <Col span={12}>
              <InputNumberFormat
                formik={formik}
                fieldName="rate"
                label="settings.fields.rate"
                min={0}
                max={100}
                precision={5}
                disabled={readOnly}
              />
            </Col>
            <Col span={12}>
              <SelectCustom
                formik={formik}
                fieldName="chartAccountId"
                label="settings.fields.chartAccount"
                path={selectListEndpoints.chartAccountSelect}
                required={!isEdit && !readOnly}
                search
                displayConfig={chartAccountSelectDisplayConfig}
                disabled={readOnly}
              />
            </Col>
            <Col span={12}>
              <SelectCustom
                formik={formik}
                fieldName="stateId"
                label="settings.fields.status"
                path={selectListEndpoints.statesSelectList}
                required={!isEdit && !readOnly}
                disabled={readOnly}
              />
            </Col>
            <Col span={12}>
              <SelectDate
                formik={formik}
                fieldName="effectiveFrom"
                label="settings.fields.effectiveFrom"
                valueFormat="YYYY-MM-DD"
                required={!isEdit && !readOnly}
                disabled={readOnly}
              />
            </Col>
            <Col span={12}>
              <SelectDate
                formik={formik}
                fieldName="effectiveTo"
                label="settings.fields.effectiveTo"
                valueFormat="YYYY-MM-DD"
                clearable
                disabled={readOnly}
              />
            </Col>
          </Row>

          {!readOnly && (
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
          )}
        </Form>
      </Spin>
    </Modal>
  );
}
