import { useAppSelector } from "@/store/hooks";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import { Button, Col, Form, Modal, Row, Select, Spin } from "antd";
import toast from "react-hot-toast";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import SelectCustom from "@/components/fields/SelectCustom";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import InputText from "@/components/fields/InputText";
import SwitchField from "@/components/fields/SwitchField";
import InputNumberFormat from "@/components/fields/InputNumber";
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
import { usePriceTypes } from "@/modules/priceType/api";
import { commissionTwinContractType } from "@/shared/constants/contractSelect";

const createDefaultValues = (): ContractForm => ({
  organizationId: null,
  counterpartyId: null,
  contractTypeId: null,
  contractNumber: "",
  currencyId: null,
  responsiblePersonId: null,
  contractDate: dayjs().format(formatDate),
  startDate: dayjs().format(formatDate),
  endDate: "",
  comment: "",
  priceIncludesVat: false,
  isDefault: false,
  paymentTermDays: null,
  priceTypeId: null,
  isTaxAgentVat: false,
  stateId: null,
});

/** «Yetkazib beruvchi bilan shartnoma» (cmn_contract_type). */
const supplierContractTypeId = 1;
/** «Qarz (kredit) shartnomasi»: no main contract or payment term for documents. */
const loanContractTypeId = 3;

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
  const { data: priceTypes = [] } = usePriceTypes();
  // a contract always belongs to the organization in work (the server takes it from there)
  const currentOrganizationId = useAppSelector((state) => state.organization.id);
  const editId = id ?? null;
  const isEdit = Boolean(editId);
  const { data: Contract, isLoading: isOrgonizationsLoading } =
    useGetDetailContract(editId ?? "");
  const createMutation = useCreateContract();
  const updateMutation = useUpdateContract();
  const isSaleContract = contractTypeId === 2;
  const counterpartyPath = selectListEndpoints.counterpartiesSelectList;
  const counterpartyLabel =
    contractTypeId === 3
      ? "contract.fields.lenderName"
      : isSaleContract
        ? "contract.fields.customerName"
        : "contract.fields.supplierName";

  const formik = useFormik<ContractForm>({
    initialValues: {
      ...openedDefaults,
      organizationId: currentOrganizationId ?? null,
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
        contractNumber: values.contractNumber?.trim() || null,
        currencyId: values.currencyId ?? null,
        // Mas'ul shaxs ixtiyoriy: tozalanganda backendga aniq null ketishi kerak,
        // aks holda tanlov olib tashlanmaydi.
        responsiblePersonId: values.responsiblePersonId ?? null,
        // Faqat xarid shartnomasida ma'noli: savdo narxi doim QQSsiz kiritiladi.
        priceIncludesVat:
          values.contractTypeId === supplierContractTypeId &&
          values.priceIncludesVat,
        paymentTermDays: values.paymentTermDays ?? null,
        // 1C «Тип цен»: only a customer's contract prices its sales
        priceTypeId: values.contractTypeId === 2 ? (values.priceTypeId ?? null) : null,
        // Tax Code 255: only what we buy from a foreign supplier
        isTaxAgentVat: values.contractTypeId === supplierContractTypeId && values.isTaxAgentVat,
      };
      try {
        if (isEdit && editId) {
          await updateMutation.mutateAsync({ id: editId, payload });
          toast.success(t("settings.messages.updated"));
        } else {
          // the API answers with the new contract's id
          const created: Contract | number = await createMutation.mutateAsync(payload);
          const createdContract =
            typeof created === "number"
              ? ({ ...payload, id: created } as unknown as Contract)
              : created;
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
        contractNumber: Contract.contractNumber ?? "",
        currencyId: Contract.currencyId ?? null,
        responsiblePersonId: Contract.responsiblePersonId ?? null,
        contractDate: Contract.contractDate ?? "",
        startDate: Contract.startDate ?? "",
        endDate: Contract.endDate ?? null,
        comment: Contract.comment ?? "",
        priceIncludesVat: Boolean(Contract.priceIncludesVat),
        isDefault: Boolean(Contract.isDefault),
        paymentTermDays: Contract.paymentTermDays ?? null,
        priceTypeId: Contract.priceTypeId ?? null,
        isTaxAgentVat: Boolean(Contract.isTaxAgentVat),
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
                allowedIds={
                  contractTypeId
                    ? [contractTypeId, commissionTwinContractType(contractTypeId)].filter(
                        (value): value is number => Boolean(value),
                      )
                    : undefined
                }
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
              <InputText
                formik={formik}
                fieldName="contractNumber"
                label="contract.fields.contractNumber"
              />
              <div className="-mt-4 mb-2 text-xs text-secondary-text">
                {t("contract.fields.contractNumberHint")}
              </div>
            </Col>
            <Col span={12}>
              <SelectCustom
                formik={formik}
                fieldName="currencyId"
                label="contract.fields.currency"
                path={selectListEndpoints.currenciesSelectList}
                clearable
                optional
                autoSelectSingle={false}
              />
              <div className="-mt-4 mb-2 text-xs text-secondary-text">
                {t("contract.fields.currencyHint")}
              </div>
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
            {/* 1C: the counterparty's main contract of its kind and the term a debt falls due in */}
            {formik.values.contractTypeId !== loanContractTypeId && (
              <>
                <Col span={12}>
                  <InputNumberFormat
                    formik={formik}
                    fieldName="paymentTermDays"
                    label="contract.fields.paymentTermDays"
                    min={0}
                    max={3650}
                    precision={0}
                    placeholder={t("contract.messages.paymentTermPlaceholder")}
                  />
                </Col>
                <Col span={12}>
                  <SwitchField
                    formik={formik}
                    fieldName="isDefault"
                    label="contract.fields.isDefault"
                    description="contract.messages.isDefaultHint"
                    marginBottom="mb-2"
                  />
                </Col>
              </>
            )}
            {formik.values.contractTypeId === 2 && (
              <Col span={12}>
                <Form.Item
                  label={t("contract.fields.priceType")}
                  extra={t("contract.messages.priceTypeHint")}
                >
                  <Select
                    allowClear
                    className="w-full"
                    value={formik.values.priceTypeId ?? null}
                    placeholder={t("priceType.saleNoType")}
                    // as the other selects of the form (SelectCustom): no filled background
                    style={{ backgroundColor: "transparent" }}
                    onChange={(value?: number) => formik.setFieldValue("priceTypeId", value ?? null)}
                    options={priceTypes.map((type) => ({ value: type.id, label: type.name }))}
                  />
                </Form.Item>
              </Col>
            )}
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
            {formik.values.contractTypeId === supplierContractTypeId && (
              <Col span={24}>
                <SwitchField
                  formik={formik}
                  fieldName="isTaxAgentVat"
                  label="contract.fields.isTaxAgentVat"
                  description="contract.messages.isTaxAgentVatHint"
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
