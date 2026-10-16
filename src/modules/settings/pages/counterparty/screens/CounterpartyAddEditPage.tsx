import { useTranslation } from "react-i18next";
import { useEffect, useRef } from "react";
import { useFormik } from "formik";
import { Button, Checkbox, Col, Form, Modal, Row, Select, Spin } from "antd";
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
import { counterpartyService } from "../api";
import { normalizeLookupPhone } from "@/modules/settings/shared/taxpayerLookup/utils/normalizeLookupPhone";

const KIND_LEGAL = 1;
const kindOptions = [
  { value: 1, label: "settings.fields.kindLegal" },
  { value: 2, label: "settings.fields.kindIndividual" },
  { value: 3, label: "settings.fields.kindEntrepreneur" },
];

const defaultValues: CounterpartyForm = {
  code: "",
  isVatPayer: false,
  shortName: "",
  fullName: "",
  inn: "",
  kindId: KIND_LEGAL,
  isResident: true,
  pinfl: "",
  vatRegistrationCode: "",
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
  pinfl: "",
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
      if (!(await confirmUniqueIdentifier(values))) return;
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
        code: counterpartyDetail.code ?? "",
        isVatPayer: counterpartyDetail.isVatPayer ?? false,
        shortName: counterpartyDetail.shortName ?? "",
        fullName: counterpartyDetail.fullName ?? "",
        inn: counterpartyDetail.inn ?? "",
        kindId: counterpartyDetail.kindId ?? KIND_LEGAL,
        isResident: counterpartyDetail.isResident ?? true,
        pinfl: counterpartyDetail.pinfl ?? "",
        vatRegistrationCode: counterpartyDetail.vatRegistrationCode ?? "",
        phoneNumber: normalizeLookupPhone(counterpartyDetail.phoneNumber ?? ""),
        regionId: counterpartyDetail.regionId ?? null,
        districtId: counterpartyDetail.districtId ?? null,
        address: counterpartyDetail.address ?? "",
        stateId: counterpartyDetail.stateId ?? null,
      });
    }
    // formik is a new object every render: the values are set once per loaded record
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counterpartyDetail, isEdit]);
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // 1C warns when another card has the same STIR / PINFL; the user may still save
  async function confirmUniqueIdentifier(values: CounterpartyForm) {
    const identifiers = [values.inn, values.pinfl]
      .map((value) => value?.trim())
      .filter((value): value is string => Boolean(value));
    for (const identifier of identifiers) {
      const found = await counterpartyService
        .list({ search: identifier, page: 1, pageSize: 20 })
        .catch(() => null);
      const twin = found?.items?.find(
        (item) =>
          item.id !== editId &&
          (item.inn === identifier || item.pinfl === identifier),
      );
      if (twin) {
        return new Promise<boolean>((resolve) =>
          Modal.confirm({
            title: t("settings.messages.duplicateInnTitle"),
            content: t("settings.messages.duplicateInnText", {
              name: twin.shortName,
              inn: identifier,
            }),
            okText: t("common.submit"),
            onOk: () => resolve(true),
            onCancel: () => resolve(false),
          }),
        );
      }
    }
    return true;
  }

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
              <Form.Item label={t("settings.fields.counterpartyKind")}>
                <Select
                  value={formik.values.kindId}
                  options={kindOptions.map((option) => ({
                    value: option.value,
                    label: t(option.label),
                  }))}
                  onChange={(value: number) => {
                    formik.setFieldValue("kindId", value);
                    if (value === KIND_LEGAL) formik.setFieldValue("pinfl", "");
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              {formik.values.kindId !== KIND_LEGAL ? (
                <InputText
                  formik={formik}
                  fieldName="pinfl"
                  label="settings.fields.pinfl"
                />
              ) : (
                <InputText
                  formik={formik}
                  fieldName="code"
                  label="settings.fields.code"
                />
              )}
            </Col>
            {formik.values.kindId !== KIND_LEGAL && (
              <Col span={12}>
                <InputText
                  formik={formik}
                  fieldName="code"
                  label="settings.fields.code"
                />
              </Col>
            )}
            <Col span={12}>
              <InputPhoneNumber
                formik={formik}
                fieldName="phoneNumber"
                label="settings.fields.phoneNumber"
              />
            </Col>
            <Col span={12}>
              <Checkbox
                checked={formik.values.isVatPayer}
                onChange={(event) =>
                  formik.setFieldValue("isVatPayer", event.target.checked)
                }
              >
                {t("settings.fields.isVatPayer")}
              </Checkbox>
              <Checkbox
                checked={formik.values.isResident}
                onChange={(event) =>
                  formik.setFieldValue("isResident", event.target.checked)
                }
              >
                {t("settings.fields.isResident")}
              </Checkbox>
            </Col>
            {/* 1C «Регистрационный код плательщика НДС»: the ESF buyer's VatRegCode */}
            {formik.values.isVatPayer && (
              <Col span={12}>
                <InputText
                  formik={formik}
                  fieldName="vatRegistrationCode"
                  label="settings.fields.vatRegistrationCode"
                />
              </Col>
            )}
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
