import { Alert, Button, Checkbox, Col, Form, Input, Row } from "antd";
import { Plus, Send, Trash2 } from "lucide-react";
import { useFormik } from "formik";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import dayjs from "@/config/dayjs";
import Card from "@/components/ui/card/Card";
import InputNumber from "@/components/fields/InputNumber";
import InputText from "@/components/fields/InputText";
import SelectDate from "@/components/fields/SelectDate";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import {
  useCreateEdoOutboxFactura,
  useEdoActiveProvider,
} from "../hooks";
import type {
  EdoFacturaLineDto,
  EdoOutboxFacturaCreateRequestDto,
  EdoPartyDto,
} from "../types/type";
import { hasSupportedCapability } from "../utils/capabilities";
import {
  clearIdempotencyKey,
  getOrCreateIdempotencyKey,
} from "../utils/idempotency";
import { saveEdoOutboxDocument } from "../utils/outboxDocument";

const emptyParty = (): EdoPartyDto => ({
  name: "",
  taxIdentifier: "",
  bankCode: "",
  accountNumber: "",
  address: "",
  branchCode: "",
  branchName: "",
  directorName: "",
  accountantName: "",
  vatRegistrationStatus: "",
  districtId: null,
});

const emptyLine = (number: number): EdoFacturaLineDto => ({
  number,
  name: "",
  catalogCode: "",
  catalogName: "",
  unitCode: "",
  unitName: "",
  quantity: 1,
  amount: 0,
  taxRate: 0,
  taxAmount: 0,
  isTaxFree: false,
  markingCodeIds: [],
});

const initialValues: EdoOutboxFacturaCreateRequestDto = {
  internalDocumentId: 0,
  internalDocumentType: "SALE",
  seller: emptyParty(),
  buyer: emptyParty(),
  documentNumber: "",
  documentDate: dayjs().format("YYYY-MM-DD"),
  contractNumber: "",
  contractDate: null,
  empowerment: {
    empowermentNumber: "",
    dateOfIssue: dayjs().format("YYYY-MM-DD"),
    agentName: "",
    agentPinfl: "",
  },
  lines: [emptyLine(1)],
  idempotencyKey: "",
};

const requiredPartyFields: (keyof EdoPartyDto)[] = [
  "name",
  "taxIdentifier",
  "bankCode",
  "accountNumber",
  "address",
];

function validateFactura(
  values: EdoOutboxFacturaCreateRequestDto,
  providerCode?: string,
) {
  if (!values.internalDocumentId || !values.internalDocumentType.trim()) return false;
  if (!values.documentNumber.trim() || !values.documentDate) return false;
  if (
    [values.seller, values.buyer].some((party) =>
      requiredPartyFields.some((field) => !String(party[field] ?? "").trim()),
    )
  ) return false;
  if (!values.lines.length || values.lines.some((line) =>
    !line.name.trim() || !line.unitCode.trim() || line.quantity <= 0 || line.amount < 0
  )) return false;
  if (providerCode === "DIDOX") {
    if (!values.contractNumber?.trim() || !values.contractDate) return false;
    if (!values.seller.vatRegistrationStatus || !values.buyer.vatRegistrationStatus) return false;
    const empowerment = values.empowerment;
    if (!empowerment?.empowermentNumber.trim() || !empowerment.agentName.trim() || !empowerment.agentPinfl.trim()) return false;
  }
  if (providerCode === "EDOCS") {
    if (!values.seller.districtId || !values.buyer.districtId) return false;
    if (values.lines.some((line) => !Number.isInteger(Number(line.unitCode)) || Number(line.unitCode) <= 0)) return false;
  }
  return true;
}

function PartyFields({
  prefix,
  title,
  formik,
  providerCode,
}: {
  prefix: "seller" | "buyer";
  title: string;
  formik: ReturnType<typeof useFormik<EdoOutboxFacturaCreateRequestDto>>;
  providerCode?: string;
}) {
  return (
    <Card className="border border-border p-4">
      <h2 className="mb-4 font-semibold text-heading">{title}</h2>
      <Row gutter={[16, 4]}>
        <Col xs={24} md={12}><InputText formik={formik} fieldName={`${prefix}.name`} label="settings.integrations.edo.fields.name" required /></Col>
        <Col xs={24} md={12}><InputText formik={formik} fieldName={`${prefix}.taxIdentifier`} label="settings.integrations.edo.fields.taxIdentifier" required /></Col>
        <Col xs={24} md={12}><InputText formik={formik} fieldName={`${prefix}.bankCode`} label="settings.integrations.edo.fields.bankCode" required /></Col>
        <Col xs={24} md={12}><InputText formik={formik} fieldName={`${prefix}.accountNumber`} label="settings.integrations.edo.fields.accountNumber" required /></Col>
        <Col xs={24}><InputText formik={formik} fieldName={`${prefix}.address`} label="settings.integrations.edo.fields.address" required /></Col>
        <Col xs={24} md={12}><InputText formik={formik} fieldName={`${prefix}.branchCode`} label="settings.integrations.edo.fields.branchCode" /></Col>
        <Col xs={24} md={12}><InputText formik={formik} fieldName={`${prefix}.branchName`} label="settings.integrations.edo.fields.branchName" /></Col>
        <Col xs={24} md={12}><InputText formik={formik} fieldName={`${prefix}.directorName`} label="settings.integrations.edo.fields.directorName" /></Col>
        <Col xs={24} md={12}><InputText formik={formik} fieldName={`${prefix}.accountantName`} label="settings.integrations.edo.fields.accountantName" /></Col>
        {providerCode === "DIDOX" && <Col xs={24} md={12}><InputText formik={formik} fieldName={`${prefix}.vatRegistrationStatus`} label="settings.integrations.edo.fields.vatRegistrationStatus" required /></Col>}
        {providerCode === "EDOCS" && <Col xs={24} md={12}><InputNumber formik={formik} fieldName={`${prefix}.districtId`} label="settings.integrations.edo.fields.districtId" min={1} required /></Col>}
      </Row>
    </Card>
  );
}

export default function EdoOutboxCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const activeProviderQuery = useEdoActiveProvider();
  const createMutation = useCreateEdoOutboxFactura();
  const provider = activeProviderQuery.data;
  const canCreate = hasSupportedCapability(provider, "CreateFactura");
  const formik = useFormik<EdoOutboxFacturaCreateRequestDto>({
    initialValues,
    onSubmit: async (values) => {
      if (!validateFactura(values, provider?.code)) {
        toast.error(t("common.requiredFields"));
        return;
      }
      const operationKey = `factura:${values.internalDocumentType}:${values.internalDocumentId}`;
      try {
        const response = await createMutation.mutateAsync({
          ...values,
          idempotencyKey: getOrCreateIdempotencyKey(operationKey),
          empowerment: provider?.code === "EDOCS" ? null : values.empowerment,
        });
        clearIdempotencyKey(operationKey);
        saveEdoOutboxDocument(response.document);
        toast.success(
          t(
            response.isReplay
              ? "settings.integrations.edo.messages.replay"
              : "settings.integrations.edo.messages.created",
          ),
        );
        navigate(`../${response.document.id}`);
      } catch (error) {
        errorHandlers(error);
      }
    },
  });

  const addLine = () =>
    formik.setFieldValue("lines", [
      ...formik.values.lines,
      emptyLine(formik.values.lines.length + 1),
    ]);
  const removeLine = (index: number) =>
    formik.setFieldValue(
      "lines",
      formik.values.lines
        .filter((_, lineIndex) => lineIndex !== index)
        .map((line, lineIndex) => ({ ...line, number: lineIndex + 1 })),
    );

  return (
    <div className="w-full space-y-4">
      <div className="px-1">
        <h1 className="text-2xl font-semibold text-heading">{t("settings.integrations.edo.outbox.create")}</h1>
        <p className="mt-1 text-sm text-secondary-text">{t("settings.integrations.edo.outbox.createDescription")}</p>
      </div>
      {!canCreate && !activeProviderQuery.isLoading && <Alert type="warning" showIcon message={t("settings.integrations.edo.outbox.unavailable")} />}

      <Form layout="vertical" onFinish={formik.handleSubmit}>
        <fieldset disabled={!canCreate || createMutation.isPending} className="space-y-4">
          <Card className="border border-border p-5">
            <h2 className="mb-4 font-semibold">{t("settings.integrations.edo.sections.document")}</h2>
            <Row gutter={[16, 4]}>
              <Col xs={24} md={12} xl={6}><InputNumber formik={formik} fieldName="internalDocumentId" label="settings.integrations.edo.fields.internalDocumentId" min={1} required /></Col>
              <Col xs={24} md={12} xl={6}><InputText formik={formik} fieldName="internalDocumentType" label="settings.integrations.edo.fields.internalDocumentType" required /></Col>
              <Col xs={24} md={12} xl={6}><InputText formik={formik} fieldName="documentNumber" label="settings.integrations.edo.fields.documentNumber" required /></Col>
              <Col xs={24} md={12} xl={6}><SelectDate formik={formik} fieldName="documentDate" label="settings.integrations.edo.fields.documentDate" valueFormat="YYYY-MM-DD" required /></Col>
              <Col xs={24} md={12}><InputText formik={formik} fieldName="contractNumber" label="settings.integrations.edo.fields.contractNumber" required={provider?.code === "DIDOX"} /></Col>
              <Col xs={24} md={12}><SelectDate formik={formik} fieldName="contractDate" label="settings.integrations.edo.fields.contractDate" valueFormat="YYYY-MM-DD" clearable required={provider?.code === "DIDOX"} /></Col>
            </Row>
          </Card>

          <div className="grid gap-4 xl:grid-cols-2">
            <PartyFields prefix="seller" title={t("settings.integrations.edo.fields.seller")} formik={formik} providerCode={provider?.code} />
            <PartyFields prefix="buyer" title={t("settings.integrations.edo.fields.buyer")} formik={formik} providerCode={provider?.code} />
          </div>

          {provider?.code === "DIDOX" && (
            <Card className="border border-border p-5">
              <h2 className="mb-4 font-semibold">{t("settings.integrations.edo.sections.empowerment")}</h2>
              <Row gutter={[16, 4]}>
                <Col xs={24} md={12} xl={6}><InputText formik={formik} fieldName="empowerment.empowermentNumber" label="settings.integrations.edo.fields.empowermentNumber" required /></Col>
                <Col xs={24} md={12} xl={6}><SelectDate formik={formik} fieldName="empowerment.dateOfIssue" label="settings.integrations.edo.fields.dateOfIssue" valueFormat="YYYY-MM-DD" required /></Col>
                <Col xs={24} md={12} xl={6}><InputText formik={formik} fieldName="empowerment.agentName" label="settings.integrations.edo.fields.agentName" required /></Col>
                <Col xs={24} md={12} xl={6}><InputText formik={formik} fieldName="empowerment.agentPinfl" label="settings.integrations.edo.fields.agentPinfl" required /></Col>
              </Row>
            </Card>
          )}

          <Card className="border border-border p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-semibold">{t("settings.integrations.edo.sections.lines")}</h2>
              <Button icon={<Plus className="size-4" />} onClick={addLine}>{t("common.add")}</Button>
            </div>
            <div className="space-y-3">
              {formik.values.lines.map((line, index) => (
                <div key={line.number} className="rounded-xl border border-border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-semibold">#{index + 1}</span>
                    {formik.values.lines.length > 1 && <Button type="text" danger icon={<Trash2 className="size-4" />} onClick={() => removeLine(index)} />}
                  </div>
                  <Row gutter={[16, 4]}>
                    <Col xs={24} md={12} xl={6}><InputText formik={formik} fieldName={`lines[${index}].name`} label="settings.integrations.edo.fields.name" required /></Col>
                    <Col xs={24} md={12} xl={6}><InputText formik={formik} fieldName={`lines[${index}].catalogCode`} label="settings.integrations.edo.fields.catalogCode" /></Col>
                    <Col xs={24} md={12} xl={6}><InputText formik={formik} fieldName={`lines[${index}].catalogName`} label="settings.integrations.edo.fields.catalogName" /></Col>
                    <Col xs={24} md={12} xl={6}><InputText formik={formik} fieldName={`lines[${index}].unitCode`} label="settings.integrations.edo.fields.unitCode" required /></Col>
                    <Col xs={24} md={12} xl={6}><InputText formik={formik} fieldName={`lines[${index}].unitName`} label="settings.integrations.edo.fields.unitName" /></Col>
                    <Col xs={24} md={12} xl={6}><InputNumber formik={formik} fieldName={`lines[${index}].quantity`} label="settings.integrations.edo.fields.quantity" min={0.000001} required /></Col>
                    <Col xs={24} md={12} xl={6}><InputNumber formik={formik} fieldName={`lines[${index}].amount`} label="settings.integrations.edo.fields.amount" min={0} required /></Col>
                    <Col xs={24} md={12} xl={6}><InputNumber formik={formik} fieldName={`lines[${index}].taxRate`} label="settings.integrations.edo.fields.taxRate" min={0} /></Col>
                    <Col xs={24} md={12} xl={6}><InputNumber formik={formik} fieldName={`lines[${index}].taxAmount`} label="settings.integrations.edo.fields.taxAmount" min={0} /></Col>
                    <Col xs={24} md={12} xl={6} className="flex items-center"><Checkbox checked={line.isTaxFree} onChange={(event) => formik.setFieldValue(`lines[${index}].isTaxFree`, event.target.checked)}>{t("settings.integrations.edo.fields.isTaxFree")}</Checkbox></Col>
                    <Col xs={24} md={12}>
                      <Form.Item label={t("settings.integrations.edo.fields.markingCodes")}>
                        <Input
                          value={line.markingCodeIds.join(", ")}
                          onChange={(event) =>
                            formik.setFieldValue(
                              `lines[${index}].markingCodeIds`,
                              event.target.value
                                .split(",")
                                .map((value) => value.trim())
                                .filter(Boolean),
                            )
                          }
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              ))}
            </div>
          </Card>
        </fieldset>

        <Card className="sticky bottom-0 z-20 mt-4 flex justify-end gap-3 border border-border bg-primary-bg/95 p-4 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] backdrop-blur-xl">
          <Button onClick={() => navigate("../..")} disabled={createMutation.isPending}>{t("common.cancel")}</Button>
          <Button type="primary" htmlType="submit" icon={<Send className="size-4" />} loading={createMutation.isPending} disabled={!canCreate}>{t("settings.integrations.edo.actions.createFactura")}</Button>
        </Card>
      </Form>
    </div>
  );
}
