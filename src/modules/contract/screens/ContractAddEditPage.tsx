import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import { Button, Col, Form, Modal, Row, Spin } from "antd";
import toast from "react-hot-toast";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import SelectCustom from "@/components/fields/SelectCustom";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import InputText from "@/components/fields/InputText";
import SwitchField from "@/components/fields/SwitchField";
import type { ContractForm } from "../types/form";
import { useGetDetailContract } from "../hooks/useGetDetailContract";
import { useCreateContract } from "../hooks/useCreateContract";
import { useUpdateContract } from "../hooks/useUpdateContract";
import { contractSchema } from "../types/schema";
import SelectDate from "@/components/fields/SelectDate";
import dayjs from "dayjs";
import { formatDate } from "@/utils/helpers";
import type { Contract } from "../types/type";
import { contractEndpoints } from "../constants/endpoints";
import { contractPermissions } from "../constants/permissions";
import ContractResponsiblePersonAddEditModal from "./ContractResponsiblePersonAddEditModal";

const createDefaultValues = (): ContractForm => ({
  organizationId: null,
  counterpartyId: null,
  contractTypeId: null,
  responsiblePersonId: null,
  contractDate: dayjs().format(formatDate),
  startDate: dayjs().format(formatDate),
  endDate: "",
  comment: "",
  priceIncludesVat: false,
  stateId: null,
});

/** «Yetkazib beruvchi bilan shartnoma» (cmn_contract_type). */
const supplierContractTypeId = 1;

interface ContractAddEditPageProps {
  open: boolean;
  onClose: () => void;
  id?: number | null;
  contractTypeId?: number;
  initialCounterpartyId?: number | null;
  initialContractDate?: string;
  onCreated?: (contract: Contract) => void;
}

export default function ContractAddEditPage({
  open,
  onClose,
  id,
  contractTypeId,
  initialCounterpartyId,
  initialContractDate,
  onCreated,
}: ContractAddEditPageProps) {
  // Taken once when the form opens; the factory reads the clock.
  const [openedDefaults] = useState(createDefaultValues);
  const { t } = useTranslation();
  const editId = id ?? null;
  const isEdit = Boolean(editId);
  const { data: Contract, isLoading: isOrgonizationsLoading } =
    useGetDetailContract(editId ?? "");
  const createMutation = useCreateContract();
  const updateMutation = useUpdateContract();
  const isSaleContract = contractTypeId === 2;
  const counterpartyPath = selectListEndpoints.counterpartiesSelectList;
  const counterpartyLabel = isSaleContract
    ? "contract.fields.customerName"
    : "contract.fields.supplierName";

  const formik = useFormik<ContractForm>({
    initialValues: {
      ...openedDefaults,
      contractTypeId: contractTypeId ?? null,
      counterpartyId: initialCounterpartyId ?? null,
      contractDate: initialContractDate ?? openedDefaults.contractDate,
      startDate: initialContractDate ?? openedDefaults.startDate,
      stateId: isEdit ? null : 1,
    },
    enableReinitialize: true,
    validationSchema: contractSchema(isEdit),
    onSubmit: async (values, helpers) => {
      const payload = {
        ...values,
        endDate: values.endDate?.trim() || null,
        // Mas'ul shaxs ixtiyoriy: tozalanganda backendga aniq null ketishi kerak,
        // aks holda tanlov olib tashlanmaydi.
        responsiblePersonId: values.responsiblePersonId ?? null,
        // Faqat xarid shartnomasida ma'noli: savdo narxi doim QQSsiz kiritiladi.
        priceIncludesVat:
          values.contractTypeId === supplierContractTypeId &&
          values.priceIncludesVat,
      };
      try {
        if (isEdit && editId) {
          await updateMutation.mutateAsync({ id: editId, payload });
          toast.success(t("settings.messages.updated"));
        } else {
          const createdContract = await createMutation.mutateAsync(payload);
          onCreated?.(createdContract);
          toast.success(t("settings.messages.created"));
        }
        helpers.resetForm();
        onClose();
      } catch (err: unknown) {
        errorHandlers(err);
      }
    },
  });

  useEffect(() => {
    if (Contract && isEdit) {
      formik.setValues({
        organizationId: Contract.organizationId ?? null,
        counterpartyId: Contract.counterpartyId ?? null,
        contractTypeId: Contract.contractTypeId ?? null,
        responsiblePersonId: Contract.responsiblePersonId ?? null,
        contractDate: Contract.contractDate ?? "",
        startDate: Contract.startDate ?? "",
        endDate: Contract.endDate ?? null,
        comment: Contract.comment ?? "",
        priceIncludesVat: Boolean(Contract.priceIncludesVat),
        stateId: Contract.stateId ?? null,
      });
    }
  }, [Contract, isEdit]);
  const [isResponsiblePersonOpen, setIsResponsiblePersonOpen] = useState(false);
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      title={isEdit ? t("contract.editTitle") : t("contract.createTitle")}
      open={open}
      onCancel={() => {
        formik.resetForm();
        onClose();
      }}
      footer={null}
      centered
      width={600}
      mask={{ closable: false }}
      maskClosable={false}
    >
      <Spin spinning={isOrgonizationsLoading}>
        <Form layout="vertical" onFinish={formik.handleSubmit}>
          <Row gutter={[16, 8]}>
            <Col span={12}>
              <SelectCustom
                formik={formik}
                fieldName="organizationId"
                label="settings.fields.organization"
                path={selectListEndpoints.organizationsSelectList}
              />
            </Col>
            <Col span={12}>
              <SelectCustom
                formik={formik}
                fieldName="counterpartyId"
                label={counterpartyLabel}
                path={counterpartyPath}
                disabled={!isEdit && Boolean(initialCounterpartyId)}
              />
            </Col>
            <Col span={12}>
              <SelectCustom
                formik={formik}
                fieldName="contractTypeId"
                label="contract.fields.contractType"
                path={selectListEndpoints.contractTypeSelectList}
                allowedIds={contractTypeId ? [contractTypeId] : undefined}
                getFirst
              />
            </Col>
            <Col span={12}>
              <SelectCustom
                formik={formik}
                fieldName="responsiblePersonId"
                label="contract.fields.responsiblePerson"
                path={contractEndpoints.responsiblePerson.list}
                // Ma'lumotnoma faqat ism saqlaydi, shuning uchun localized "name"
                // emas, fullName bo'yicha ko'rsatiladi va qidiriladi.
                dinamicLabel="fullName"
                queryParams={{ stateId: 1, pageSize: 100 }}
                displayConfig={{ searchFields: ["fullName"] }}
                search
                clearable
                optional
                // Maydon ixtiyoriy: ma'lumotnomada bitta shaxs bo'lsa ham uni
                // o'zicha tanlab qo'ymasin, aks holda shartnomaga so'ralmagan
                // mas'ul shaxs biriktirilib qoladi.
                autoSelectSingle={false}
                addOption={{
                  bool: true,
                  permissionCode: contractPermissions.create,
                  onClick: () => setIsResponsiblePersonOpen(true),
                }}
              />
            </Col>
            <Col span={12}>
              <SelectDate
                formik={formik}
                fieldName="contractDate"
                label="contract.fields.contractDate"
              />
            </Col>
            <Col span={12}>
              <SelectDate
                formik={formik}
                fieldName="startDate"
                label="contract.fields.startDate"
                maxDate={
                  formik.values.endDate
                    ? dayjs(formik.values.endDate)
                    : undefined
                }
              />
            </Col>
            <Col span={12}>
              <SelectDate
                formik={formik}
                fieldName="endDate"
                minDate={
                  formik.values.startDate
                    ? dayjs(formik.values.startDate)
                    : undefined
                }
                label="contract.fields.endDate"
              />
            </Col>
            <Col span={12}>
              <InputText
                formik={formik}
                fieldName="comment"
                label="contract.fields.comment"
              />
            </Col>
            {formik.values.contractTypeId === supplierContractTypeId && (
              <Col span={24}>
                <SwitchField
                  formik={formik}
                  fieldName="priceIncludesVat"
                  label="contract.fields.priceIncludesVat"
                  description="contract.messages.priceIncludesVatHint"
                  marginBottom="mb-2"
                />
              </Col>
            )}
            <Col span={12}>
              {isEdit && (
                <SelectCustom
                  formik={formik}
                  fieldName="stateId"
                  label="settings.fields.status"
                  path={selectListEndpoints.statesSelectList}
                />
              )}
            </Col>
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

      <ContractResponsiblePersonAddEditModal
        open={isResponsiblePersonOpen}
        onClose={() => setIsResponsiblePersonOpen(false)}
        onCreated={(createdId) =>
          void formik.setFieldValue("responsiblePersonId", createdId)
        }
      />
    </Modal>
  );
}
