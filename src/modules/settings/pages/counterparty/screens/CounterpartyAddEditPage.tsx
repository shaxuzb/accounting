import { useTranslation } from "react-i18next";
import { useEffect, useRef } from "react";
import { useFormik } from "formik";
import { Button, Col, Form, Modal, Row, Spin } from "antd";
import toast from "react-hot-toast";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { counterpartySchema } from "../types/schema";
import type { CounterpartyForm } from "../types/form";
import type { Counterparty } from "../types/type";
import { useCreateCounteryParty } from "../hooks";
import { useUpdateCounteryParty } from "../hooks";
import { useGetDetailCounteryParty } from "../hooks";
import InputText from "@/components/fields/InputText";
import InputPhoneNumber from "@/components/fields/InputPhoneNumber";
import SelectCustom from "@/components/fields/SelectCustom";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import DistrictSelect from "@/components/fields/DistrictSelect";
import SearchInnField from "@/components/fields/SearchInnField";
import { mergeLookupValues } from "@/modules/settings/shared/taxpayerLookup";
import { useLookupCounterparty } from "../hooks/useLookupCounterparty";

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

const emptyLookupValues: Partial<CounterpartyForm> = {
  shortName: "",
  fullName: "",
  inn: "",
  phoneNumber: "",
  regionId: null,
  districtId: null,
  address: "",
};

interface CounterpartyAddEditPageProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (counterparty: Counterparty) => void;
  id?: number | null;
}

export default function CounterpartyAddEditPage({
  open,
  onClose,
  onCreated,
  id,
}: CounterpartyAddEditPageProps) {
  const { t } = useTranslation();
  const editId = id ?? null;
  const isEdit = Boolean(editId);
  const { data: counterpartyDetail, isLoading: isOrgonizationsLoading } =
    useGetDetailCounteryParty(editId ?? "");
  const createMutation = useCreateCounteryParty();
  const updateMutation = useUpdateCounteryParty();
  const lookupMutation = useLookupCounterparty();
  const previousLookupValues = useRef<Partial<CounterpartyForm>>({});

  const formik = useFormik<CounterpartyForm>({
    initialValues: defaultValues,
    enableReinitialize: true,
    validationSchema: counterpartySchema(isEdit),
    onSubmit: async (values) => {
      try {
        if (isEdit && editId) {
          await updateMutation.mutateAsync({ id: editId, payload: values });
          toast.success(t("settings.messages.updated"));
        } else {
          const createdCounterparty = await createMutation.mutateAsync(values);
          onCreated?.(createdCounterparty);
          toast.success(t("settings.messages.created"));
        }
        previousLookupValues.current = {};
        lookupMutation.reset();
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
        organizationId: counterpartyDetail.organizationId ?? null,
        counterpartyTypeId: counterpartyDetail.counterpartyTypeId ?? null,
        shortName: counterpartyDetail.shortName ?? "",
        fullName: counterpartyDetail.fullName ?? "",
        inn: counterpartyDetail.inn ?? "",
        phoneNumber: counterpartyDetail.phoneNumber ?? "",
        regionId: counterpartyDetail.regionId ?? null,
        districtId: counterpartyDetail.districtId ?? null,
        address: counterpartyDetail.address ?? "",
        stateId: counterpartyDetail.stateId ?? null,
      });
    }
  }, [counterpartyDetail, formik, isEdit]);
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleLookupIdentifierChange = (value: string) => {
    if (Object.keys(previousLookupValues.current).length > 0) {
      const clearedValues = mergeLookupValues(
        formik.values,
        previousLookupValues.current,
        {},
        emptyLookupValues,
      );
      previousLookupValues.current = {};
      formik.setValues({ ...clearedValues, inn: value }, false);
      return;
    }

    formik.setFieldValue("inn", value, false);
  };

  const handleLookup = async (identifier: string) => {
    try {
      const result = await lookupMutation.mutateAsync(identifier);
      if (!result.isMatch) {
        toast.error(t("settings.lookup.mismatch"));
        return;
      }

      formik.setValues(
        mergeLookupValues(
          formik.values,
          previousLookupValues.current,
          result.values,
          emptyLookupValues,
        ),
        false,
      );
      previousLookupValues.current = result.values;
      toast.success(t("settings.lookup.counterpartySuccess"));
    } catch (error: unknown) {
      errorHandlers(error);
    }
  };

  const handleClose = () => {
    previousLookupValues.current = {};
    lookupMutation.reset();
    formik.resetForm();
    onClose();
  };

  return (
    <Modal maskClosable={false}
      title={
        isEdit ? t("settings.form.editTitle") : t("settings.form.createTitle")
      }
      open={open}
      onCancel={handleClose}
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
                label="settings.fields.fullName"
              />
            </Col>
            <Col span={12}>
              <InputText
                formik={formik}
                fieldName="shortName"
                label="settings.fields.shortName"
              />
            </Col>
            <Col span={12}>
              <SelectCustom
                formik={formik}
                fieldName="regionId"
                label="settings.fields.region"
                path={selectListEndpoints.regionsSelectList}
              />
            </Col>
            <Col span={12}>
              <DistrictSelect
                formik={formik}
                regionFieldName="regionId"
                fieldName="districtId"
                label="settings.fields.district"
                path={selectListEndpoints.districtsSelectList}
              />
            </Col>
            <Col span={12}>
              {isEdit ? (
                <InputText
                  formik={formik}
                  fieldName="inn"
                  label="settings.fields.inn"
                />
              ) : (
                <SearchInnField
                  mode="auto"
                  value={formik.values.inn}
                  onChange={handleLookupIdentifierChange}
                  onSearch={handleLookup}
                  loading={lookupMutation.isPending}
                  label="settings.lookup.identifier"
                />
              )}
            </Col>
            <Col span={12}>
              <SelectCustom
                formik={formik}
                fieldName="organizationId"
                label="settings.fields.organization"
                path={selectListEndpoints.organizationsSelectList}
              />
            </Col>
            <Col span={12}>
              <InputPhoneNumber
                formik={formik}
                fieldName="phoneNumber"
                label="settings.fields.phoneNumber"
              />
            </Col>
            <Col span={12}>
              <SelectCustom
                formik={formik}
                fieldName="counterpartyTypeId"
                label="settings.fields.partyType"
                path={selectListEndpoints.counterpartyTypesSelectList}
              />
            </Col>
            {isEdit ? (
              <>
                <Col span={12}>
                  <InputText
                    formik={formik}
                    fieldName="address"
                    label="settings.fields.address"
                  />
                </Col>
                <Col span={12}>
                  <SelectCustom
                    formik={formik}
                    fieldName="stateId"
                    label="settings.fields.status"
                    path={selectListEndpoints.statesSelectList}
                  />
                </Col>
              </>
            ) : (
              <Col span={24}>
                <InputText
                  formik={formik}
                  fieldName="address"
                  label="settings.fields.address"
                />
              </Col>
            )}
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
