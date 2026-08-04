import { Alert, Button, Input, Modal, Select } from "antd";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useEimzo, type ICertificate } from "@islom929/react-eimzo";
import toast from "react-hot-toast";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { useRejectEdoInbox } from "../hooks";
import type { EdoDocumentDto } from "../types/type";
import {
  clearIdempotencyKey,
  getOrCreateIdempotencyKey,
} from "../utils/idempotency";
import { createEimzoSignature } from "../utils/eimzoSignature";
import { getEimzoSigningDataBase64 } from "../utils/signingPayload";

export default function EdoRejectModal({
  open,
  document,
  onClose,
  onRejected,
}: {
  open: boolean;
  document: EdoDocumentDto;
  onClose: () => void;
  onRejected: () => void;
}) {
  const { t } = useTranslation();
  const { isInstalled, keyList, prepareKey } = useEimzo();
  const rejectMutation = useRejectEdoInbox();
  const [reason, setReason] = useState("");
  const [selectedSerial, setSelectedSerial] = useState<string>();
  const [localError, setLocalError] = useState<string>();
  const certificates = useMemo(
    () => keyList.filter((certificate) => !certificate.expired),
    [keyList],
  );
  const certificate = certificates.find(
    (item) => item.serialNumber === selectedSerial,
  );

  const finish = () => {
    clearIdempotencyKey(`reject:${document.id}`);
    toast.success(t("settings.integrations.edo.messages.rejected"));
    onRejected();
    onClose();
  };

  const handleReject = async () => {
    if (!reason.trim() || !certificate) return;
    setLocalError(undefined);
    const idempotencyKey = getOrCreateIdempotencyKey(`reject:${document.id}`);
    try {
      const challengeResponse = await rejectMutation.mutateAsync({
        id: document.id,
        payload: { reason: reason.trim(), idempotencyKey },
      });
      if (!challengeResponse.signingSession) {
        finish();
        return;
      }
      const session = challengeResponse.signingSession;
      if (new Date(session.expiresAt).getTime() <= Date.now()) {
        throw new Error(t("settings.integrations.edo.errors.challengeExpired"));
      }
      const keyId = await prepareKey(certificate);
      const { preparedPkcs7, signatureHex } = await createEimzoSignature(
        keyId,
        getEimzoSigningDataBase64(session.payload, session.payloadFormat),
      );
      await rejectMutation.mutateAsync({
        id: document.id,
        payload: {
          reason: reason.trim(),
          idempotencyKey,
          signingSessionId: session.sessionId,
          preparedPkcs7,
          signatureHex,
        },
      });
      finish();
    } catch (cause) {
      setLocalError(cause instanceof Error ? cause.message : String(cause));
      errorHandlers(cause);
    }
  };

  const certificateOptions = certificates.map((certificate: ICertificate) => ({
    value: certificate.serialNumber,
    label: `${certificate.ownerName || certificate.CN} — ${certificate.serialNumber}`,
  }));

  return (
    <Modal
      open={open}
      title={t("settings.integrations.edo.inbox.rejectTitle")}
      onCancel={rejectMutation.isPending ? undefined : onClose}
      footer={null}
      width={560}
    >
      <div className="space-y-4 pt-2">
        {localError && (
          <Alert type="error" showIcon message={localError} />
        )}
        {!isInstalled && (
          <Alert
            type="warning"
            showIcon
            message={t("settings.integrations.eimzo.notInstalled")}
          />
        )}
        <div>
          <label className="mb-2 block text-sm font-medium">
            {t("settings.integrations.edo.fields.reason")} *
          </label>
          <Input.TextArea
            rows={4}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">
            {t("settings.integrations.eimzo.selectCertificate")} *
          </label>
          <Select
            className="w-full"
            value={selectedSerial}
            onChange={setSelectedSerial}
            options={certificateOptions}
            showSearch
            optionFilterProp="label"
          />
        </div>
        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button disabled={rejectMutation.isPending} onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button
            danger
            type="primary"
            disabled={!reason.trim() || !certificate || !isInstalled}
            loading={rejectMutation.isPending}
            onClick={() => void handleReject()}
          >
            {t("settings.integrations.edo.actions.reject")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
