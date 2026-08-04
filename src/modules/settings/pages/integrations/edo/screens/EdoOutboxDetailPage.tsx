import { Alert, Button, Descriptions, Input, Select } from "antd";
import { Download, FileSignature } from "lucide-react";
import { useMemo, useState } from "react";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useEimzo } from "@islom929/react-eimzo";
import toast from "react-hot-toast";
import Card from "@/components/ui/card/Card";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import {
  useDownloadEdoFile,
  useEdoActiveProvider,
  useEdoDocumentStatus,
  useSignEdoOutbox,
} from "../hooks";
import { hasSupportedCapability } from "../utils/capabilities";
import { saveDownloadedEdoFile } from "../utils/fileDownload";
import {
  clearIdempotencyKey,
  getOrCreateIdempotencyKey,
} from "../utils/idempotency";
import { readEdoOutboxDocument, saveEdoOutboxDocument } from "../utils/outboxDocument";
import EdoDocumentStatusPanel from "../components/EdoDocumentStatusPanel";
import { createEimzoSignature } from "../utils/eimzoSignature";
import { getEimzoSigningDataBase64 } from "../utils/signingPayload";

export default function EdoOutboxDetailPage() {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const activeProviderQuery = useEdoActiveProvider();
  const provider = activeProviderQuery.data;
  const statusQuery = useEdoDocumentStatus("OUTBOX", id, Boolean(id));
  const signMutation = useSignEdoOutbox();
  const downloadMutation = useDownloadEdoFile();
  const { isInstalled, keyList, prepareKey } = useEimzo();
  const [selectedSerial, setSelectedSerial] = useState<string>();
  const [preparedPkcs7, setPreparedPkcs7] = useState("");
  const document = readEdoOutboxDocument(id);
  const certificates = useMemo(() => keyList.filter((item) => !item.expired), [keyList]);
  const certificate = certificates.find((item) => item.serialNumber === selectedSerial);
  const status = statusQuery.data ?? document?.status;
  const canSign = hasSupportedCapability(provider, "SignOutbox") && !status?.isTerminal && status?.code !== "FAILED" && status?.code !== "RECONCILIATION_REQUIRED";
  const canDownload = hasSupportedCapability(provider, "GetFile");

  const finishSign = (response: Awaited<ReturnType<typeof signMutation.mutateAsync>>) => {
    saveEdoOutboxDocument(response.document);
    clearIdempotencyKey(`sign:${id}`);
    toast.success(t("settings.integrations.edo.messages.signed"));
    void statusQuery.refetch();
  };

  const handleSign = async () => {
    if (!provider || !id || !canSign) return;
    const idempotencyKey = getOrCreateIdempotencyKey(`sign:${id}`);
    try {
      if (provider.code === "EDOCS") {
        if (!preparedPkcs7.trim()) return;
        finishSign(await signMutation.mutateAsync({ id, payload: { idempotencyKey, preparedPkcs7: preparedPkcs7.trim() } }));
        return;
      }
      if (!certificate) return;
      const challenge = await signMutation.mutateAsync({ id, payload: { idempotencyKey } });
      const session = challenge.signingSession;
      if (!session || new Date(session.expiresAt).getTime() <= Date.now()) throw new Error(t("settings.integrations.edo.errors.challengeExpired"));
      const keyId = await prepareKey(certificate);
      const { preparedPkcs7: pkcs7, signatureHex } =
        await createEimzoSignature(
          keyId,
          getEimzoSigningDataBase64(session.payload, session.payloadFormat),
        );
      finishSign(await signMutation.mutateAsync({
        id,
        payload: {
          idempotencyKey,
          certificateSerialNumber: certificate.serialNumber,
          signingSessionId: session.sessionId,
          signingMode: session.signingMode,
          preparedPkcs7: pkcs7,
          signatureHex,
        },
      }));
    } catch (error) {
      errorHandlers(error);
    }
  };

  const download = async () => {
    try {
      saveDownloadedEdoFile(await downloadMutation.mutateAsync(id));
    } catch (error) {
      errorHandlers(error);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="px-1">
        <h1 className="text-2xl font-semibold text-heading">{t("settings.integrations.edo.outbox.document", { id })}</h1>
        <p className="mt-1 text-sm text-secondary-text">{t("settings.integrations.edo.outbox.detailDescription")}</p>
      </div>

      {status?.isReconciliationRequired && <Alert type="warning" showIcon message={t("settings.integrations.edo.status.reconciliation")} />}
      <Card className="border border-border p-5">
        <Descriptions bordered size="small" column={{ xs: 1, md: 2, xl: 4 }} items={[
          { key: "id", label: "ID", children: id },
          { key: "number", label: t("settings.integrations.edo.fields.documentNumber"), children: document?.documentNumber ?? "—" },
          { key: "providerId", label: t("settings.integrations.edo.fields.providerDocumentId"), children: document?.providerDocumentId ?? "—" },
          { key: "type", label: t("settings.integrations.edo.fields.documentType"), children: document?.documentType ?? "—" },
        ]} />
      </Card>

      <Card className="border border-border p-5"><EdoDocumentStatusPanel id={id} direction="OUTBOX" /></Card>

      <Card className="border border-border p-5">
        <h2 className="mb-4 font-semibold">{t("settings.integrations.edo.outbox.sign")}</h2>
        {!canSign && <Alert type="warning" showIcon message={t("settings.integrations.edo.outbox.signUnavailable")} className="mb-4" />}
        {provider?.code === "EDOCS" ? (
          <div>
            <label className="mb-2 block text-sm font-medium">{t("settings.integrations.edo.fields.preparedPkcs7")}</label>
            <Input.TextArea rows={5} value={preparedPkcs7} onChange={(event) => setPreparedPkcs7(event.target.value)} />
          </div>
        ) : (
          <div>
            <label className="mb-2 block text-sm font-medium">{t("settings.integrations.eimzo.selectCertificate")}</label>
            <Select className="w-full" value={selectedSerial} onChange={setSelectedSerial} options={certificates.map((item) => ({ value: item.serialNumber, label: `${item.ownerName || item.CN} — ${item.serialNumber}` }))} showSearch optionFilterProp="label" />
          </div>
        )}
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <Button icon={<Download className="size-4" />} disabled={!canDownload} loading={downloadMutation.isPending} onClick={() => void download()}>{t("settings.integrations.edo.actions.download")}</Button>
          <Button type="primary" icon={<FileSignature className="size-4" />} disabled={!canSign || (provider?.code === "EDOCS" ? !preparedPkcs7.trim() : !certificate || !isInstalled)} loading={signMutation.isPending} onClick={() => void handleSign()}>{t("settings.integrations.edo.actions.sign")}</Button>
        </div>
      </Card>
    </div>
  );
}
