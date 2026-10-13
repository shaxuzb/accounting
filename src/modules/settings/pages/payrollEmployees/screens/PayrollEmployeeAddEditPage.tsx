import InputNumber from "@/components/fields/InputNumber";
import InputPhoneNumber from "@/components/fields/InputPhoneNumber";
import InputText from "@/components/fields/InputText";
import SearchInnField from "@/components/fields/SearchInnField";
import SelectDate from "@/components/fields/SelectDate";
import SelectStatic from "@/components/fields/SelectStatic";
import { incomeTaxPrivilegeOptions } from "@/modules/payroll/constants/options";
import SwitchField from "@/components/fields/SwitchField";
import { emptyToNull, normalizePhone } from "@/modules/payroll/utils/format";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { Alert, Button, Col, Form, Modal, Row, Spin } from "antd";
import { useFormik } from "formik";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import {
  useCreatePayrollEmployee,
  useGetDetailPayrollEmployee,
  useUpdatePayrollEmployee,
  useLookupEmployee,
} from "../hooks";
import type {
  PayrollEmployeeForm,
  PayrollEmployeeMainForm,
} from "../types/form";
import { employeeMainSchema } from "../types/schema";
import { mergeLookupValues } from "@/modules/settings/shared/taxpayerLookup";

const defaultValues: PayrollEmployeeForm = {
  employeeNumber: "",
  pinfl: null,
  tin: null,
  firstName: "",
  lastName: "",
  middleName: null,
  birthDate: null,
  phoneNumber: null,
  email: null,
  bankAccountNumber: null,
  experienceSince: null,
  sickBenefitFull: false,
  isTaxResident: true,
  annualLeaveDays: 21,
  openingLeaveDays: null,
  openingLeaveDate: null,
  incomeTaxPrivilege: null,
  incomeTaxPrivilegeFrom: null,
  incomeTaxPrivilegeTo: null,
};

const emptyLookupValues: Partial<PayrollEmployeeForm> = {
  pinfl: null,
  tin: null,
  firstName: "",
  lastName: "",
  middleName: null,
  birthDate: null,
  phoneNumber: null,
  email: null,
};

interface Props {
  open: boolean;
  onClose: () => void;
  id?: number | null;
}

/**
 * Xodim kartochkasi — faqat shaxsiy ma'lumotlar (1C «Сотрудник»). Ishga qabul, lavozim, maosh va
 * rejali hisoblashlar kadr buyrug'i bilan rasmiylashtiriladi (1C «Прием на работу»).
 */
export default function PayrollEmployeeAddEditPage({
  open,
  onClose,
  id,
}: Props) {
  const { t } = useTranslation();
  const editId = id ?? null;
  const isEdit = Boolean(editId);

  const { data: employee, isFetching } = useGetDetailPayrollEmployee(editId);
  const createMutation = useCreatePayrollEmployee();
  const updateMutation = useUpdatePayrollEmployee();
  const lookupMutation = useLookupEmployee();
  const navigate = useNavigate();
  const previousLookupValues = useRef<Partial<PayrollEmployeeForm>>({});

  const formik = useFormik<PayrollEmployeeForm>({
    initialValues: defaultValues,
    enableReinitialize: false,
    validationSchema: employeeMainSchema,
    onSubmit: async (values, helpers) => {
      const main: PayrollEmployeeMainForm = {
        employeeNumber: values.employeeNumber.trim(),
        pinfl: emptyToNull(values.pinfl)?.replace(/\D/g, "") ?? null,
        tin: emptyToNull(values.tin),
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        middleName: emptyToNull(values.middleName),
        birthDate: values.birthDate || null,
        phoneNumber: normalizePhone(values.phoneNumber),
        email: emptyToNull(values.email),
        bankAccountNumber: emptyToNull(values.bankAccountNumber),
        experienceSince: values.experienceSince || null,
        sickBenefitFull: values.sickBenefitFull,
        isTaxResident: values.isTaxResident,
        annualLeaveDays: Number(values.annualLeaveDays) || 21,
        openingLeaveDays: values.openingLeaveDate ? Number(values.openingLeaveDays ?? 0) : null,
        openingLeaveDate: values.openingLeaveDate || null,
        incomeTaxPrivilege: values.incomeTaxPrivilege || null,
        incomeTaxPrivilegeFrom: values.incomeTaxPrivilege ? values.incomeTaxPrivilegeFrom || null : null,
        incomeTaxPrivilegeTo: values.incomeTaxPrivilege ? values.incomeTaxPrivilegeTo || null : null,
      };

      try {
        if (isEdit && editId) {
          await updateMutation.mutateAsync({ id: editId, payload: main });
          toast.success(t("settings.messages.updated"));
        } else {
          const created = await createMutation.mutateAsync(main);
          toast.success(t("settings.messages.created"));
          // 1C: the person is hired by the «Прием на работу» document — open it for the new employee
          const createdId = typeof created === "number" ? created : Number((created as { id?: number })?.id);
          if (createdId > 0) {
            toast(t("payroll.employees.hirePromptText"), { icon: "📄" });
            navigate(`/main/hr/orders/add?type=HIRE&employeeId=${createdId}`);
          }
        }
        helpers.resetForm({ values: defaultValues });
        previousLookupValues.current = {};
        onClose();
      } catch (error) {
        errorHandlers(error);
      }
    },
  });

  const { resetForm, setValues } = formik;

  useEffect(() => {
    if (!open) return;
    if (isEdit && employee) {
      void setValues({
        ...defaultValues,
        employeeNumber: employee.employeeNumber ?? "",
        pinfl: employee.pinfl ?? null,
        tin: employee.tin ?? null,
        firstName: employee.firstName ?? "",
        lastName: employee.lastName ?? "",
        middleName: employee.middleName ?? null,
        birthDate: employee.birthDate ?? null,
        phoneNumber: employee.phoneNumber ?? null,
        email: employee.email ?? null,
        bankAccountNumber: employee.bankAccountNumber ?? null,
        experienceSince: employee.experienceSince ?? null,
        sickBenefitFull: Boolean(employee.sickBenefitFull),
        isTaxResident: employee.isTaxResident ?? true,
        annualLeaveDays: employee.annualLeaveDays ?? 21,
        openingLeaveDays: employee.openingLeaveDays ?? null,
        openingLeaveDate: employee.openingLeaveDate ?? null,
        incomeTaxPrivilege: employee.incomeTaxPrivilege ?? null,
        incomeTaxPrivilegeFrom: employee.incomeTaxPrivilegeFrom ?? null,
        incomeTaxPrivilegeTo: employee.incomeTaxPrivilegeTo ?? null,
      });
      return;
    }
    if (!isEdit) resetForm({ values: defaultValues });
  }, [open, isEdit, employee, resetForm, setValues]);

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
      formik.setValues({ ...clearedValues, tin: value }, false);
      return;
    }

    formik.setFieldValue("tin", value, false);
  };

  const handleLookup = async (identifier: string) => {
    try {
      const result = await lookupMutation.mutateAsync(identifier);
      if (!result.isMatch) {
        toast.error(t("settings.lookup.mismatch"));
        return;
      }
      if (!result.isPerson) {
        toast.error(t("payroll.lookup.notPerson"));
        return;
      }
      resetForm({
        values: mergeLookupValues(
          formik.values,
          previousLookupValues.current,
          result.values as Partial<PayrollEmployeeForm>,
          emptyLookupValues,
        ),
      });
      previousLookupValues.current = result.values;
      toast.success(t("payroll.lookup.success"));
    } catch (error) {
      errorHandlers(error);
    }
  };

  const handleClose = () => {
    previousLookupValues.current = {};
    lookupMutation.reset();
    resetForm({ values: defaultValues });
    onClose();
  };

  return (
    <Modal
      mask={{ closable: false }}
      title={
        isEdit
          ? t("payroll.employees.editTitle")
          : t("payroll.employees.createTitle")
      }
      open={open}
      onCancel={handleClose}
      footer={null}
      centered
      width={860}
      destroyOnHidden
    >
      <Spin spinning={isEdit && isFetching}>
        <Form layout="vertical" onFinish={formik.handleSubmit}>
          <Row gutter={[16, 0]}>
            <Col xs={24} md={8}>
              <InputText
                formik={formik}
                fieldName="employeeNumber"
                label="payroll.fields.employeeNumber"
              />
            </Col>
            <Col xs={24} md={8}>
              <InputText
                formik={formik}
                fieldName="lastName"
                label="settings.fields.lastName"
              />
            </Col>
            <Col xs={24} md={8}>
              <InputText
                formik={formik}
                fieldName="firstName"
                label="settings.fields.firstName"
              />
            </Col>

            <Col xs={24} md={8}>
              <InputText
                formik={formik}
                fieldName="middleName"
                label="payroll.fields.middleName"
              />
            </Col>
            <Col xs={24} md={8}>
              <InputText
                formik={formik}
                fieldName="pinfl"
                label="payroll.fields.pinfl"
              />
            </Col>
            <Col xs={24} md={8}>
              <SearchInnField
                mode="auto"
                value={formik.values.tin ?? ""}
                onChange={handleLookupIdentifierChange}
                onSearch={handleLookup}
                loading={lookupMutation.isPending}
                label="settings.lookup.identifier"
              />
            </Col>

            <Col xs={24} md={8}>
              <SelectDate
                formik={formik}
                fieldName="birthDate"
                label="payroll.fields.birthDate"
                valueFormat="YYYY-MM-DD"
                clearable
              />
            </Col>
            <Col xs={24} md={8}>
              <InputPhoneNumber
                formik={formik}
                fieldName="phoneNumber"
                label="settings.fields.phoneNumber"
              />
            </Col>
            <Col xs={24} md={8}>
              <InputText
                formik={formik}
                fieldName="email"
                label="settings.fields.email"
              />
            </Col>

            <Col xs={24}>
              <InputText
                formik={formik}
                fieldName="bankAccountNumber"
                label="payroll.fields.bankAccountNumber"
              />
            </Col>

            <Col xs={24} md={8}>
              <SelectDate
                formik={formik}
                fieldName="experienceSince"
                label="payroll.fields.experienceSince"
                valueFormat="YYYY-MM-DD"
                clearable
              />
              <div className="-mt-3 mb-3 text-xs text-secondary-text">
                {t("payroll.fields.experienceSinceHint")}
              </div>
            </Col>
            <Col xs={24} md={8}>
              <SwitchField
                formik={formik}
                fieldName="sickBenefitFull"
                label="payroll.fields.sickBenefitFull"
                description="payroll.fields.sickBenefitFullHint"
                marginBottom="mb-4"
              />
            </Col>
            <Col xs={24} md={8}>
              <SwitchField
                formik={formik}
                fieldName="isTaxResident"
                label="payroll.fields.isTaxResident"
                description="payroll.fields.isTaxResidentHint"
                marginBottom="mb-4"
              />
            </Col>

            <Col xs={24} md={8}>
              <InputNumber
                formik={formik}
                fieldName="annualLeaveDays"
                label="payroll.leave.annualDays"
                min={0}
                max={366}
              />
              <div className="-mt-3 mb-3 text-xs text-secondary-text">
                {t("payroll.leave.annualDaysHint")}
              </div>
            </Col>
            <Col xs={24} md={8}>
              <SelectDate
                formik={formik}
                fieldName="openingLeaveDate"
                label="payroll.leave.openingDate"
                valueFormat="YYYY-MM-DD"
                clearable
              />
            </Col>
            <Col xs={24} md={8}>
              <InputNumber
                formik={formik}
                fieldName="openingLeaveDays"
                label="payroll.leave.openingDays"
                min={-366}
                max={1000}
              />
              <div className="-mt-3 mb-3 text-xs text-secondary-text">
                {t("payroll.leave.openingHint")}
              </div>
            </Col>
            <Col xs={24} md={8}>
              <SelectStatic
                formik={formik}
                fieldName="incomeTaxPrivilege"
                label="payroll.fields.incomeTaxPrivilege"
                options={incomeTaxPrivilegeOptions}
                clearable
                marginBottom="mb-1"
              />
              <div className="mb-3 text-xs text-secondary-text">{t("payroll.fields.incomeTaxPrivilegeHint")}</div>
            </Col>
            {formik.values.incomeTaxPrivilege && (
              <>
                <Col xs={24} md={8}>
                  <SelectDate formik={formik} fieldName="incomeTaxPrivilegeFrom" label="payroll.fields.privilegeFrom" valueFormat="YYYY-MM-DD" clearable />
                </Col>
                <Col xs={24} md={8}>
                  <SelectDate formik={formik} fieldName="incomeTaxPrivilegeTo" label="payroll.fields.privilegeTo" valueFormat="YYYY-MM-DD" clearable />
                </Col>
              </>
            )}
          </Row>

          <Alert
            type="info"
            showIcon
            message={t("payroll.employees.employmentByOrderHint")}
          />

          <div className="flex justify-end gap-2 mt-3">
            <Button onClick={handleClose} size="large" className="h-10!">
              {t("common.cancel")}
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={isSubmitting}
              className="h-10! min-w-40 font-semibold"
            >
              {t("common.save")}
            </Button>
          </div>
        </Form>
      </Spin>
    </Modal>
  );
}
