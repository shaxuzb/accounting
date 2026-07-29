import { Alert, Button, Empty, List, Modal, Spin, Tag } from "antd";
import { CheckCircle2, KeyRound, RefreshCw, ShieldAlert, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useEimzo, type ICertificate } from "@islom929/react-eimzo";
import PermissionCard from "@/components/ui/card/PermissionCard";
import { integrationPermissions } from "../constants/permissions";
import { integrationService } from "../services/integrationService";
import type {
  CertificateMetadata,
  IntegrationDefinition,
  IntegrationRecord,
} from "../types/type";

type ModalPhase =
  | "details"
  | "checking"
  | "ready"
  | "empty"
  | "not-installed"
  | "error"
  | "signing";

interface IntegrationConnectionModalProps {
  open: boolean;
  definition: IntegrationDefinition;
  record?: IntegrationRecord;
  onClose: () => void;
  onChanged: () => Promise<void>;
}

function formatDate(value: string | Date, language: string) {
  return new Intl.DateTimeFormat(language === "ru" ? "ru-RU" : "uz-UZ", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function getCertificateOwner(certificate: ICertificate) {
  return certificate.ownerName || certificate.CN || certificate.name;
}

function toMetadata(certificate: ICertificate): CertificateMetadata {
  return {
    serialNumber: certificate.serialNumber,
    ownerName: getCertificateOwner(certificate),
    commonName: certificate.CN,
    tin: certificate.TIN || undefined,
    pinfl: certificate.PINFL || undefined,
    validTo: new Date(certificate.validTo).toISOString(),
  };
}

export default function IntegrationConnectionModal({
  open,
  definition,
  record,
  onClose,
  onChanged,
}: IntegrationConnectionModalProps) {
  const { t, i18n } = useTranslation();
  const {
    isInstalled,
    isLoading: isEimzoLoading,
    error: eimzoError,
    keyList,
    reloadKeys,
    signAsync,
  } = useEimzo();
  const isManageMode = record?.status === "CONNECTED";
  const [phase, setPhase] = useState<ModalPhase>(
    isManageMode ? "details" : "checking",
  );
  const [isSelectingCertificate, setIsSelectingCertificate] = useState(
    !isManageMode,
  );
  const [selectedCertificate, setSelectedCertificate] =
    useState<ICertificate | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const availableCertificates = useMemo(
    () =>
      keyList.filter(
        (certificate) => !certificate.expired,
      ),
    [keyList],
  );

  const hasEimzoInstallError = !isInstalled && Boolean(eimzoError);

  useEffect(() => {
    if (!open || !isSelectingCertificate || phase !== "checking") return;
    if (!isInstalled || hasEimzoInstallError) return;

    void reloadKeys({ force: true })
      .then(() => setPhase("ready"))
      .catch((cause) => {
        setErrorMessage(cause instanceof Error ? cause.message : String(cause));
        setPhase("error");
      });
  }, [
    hasEimzoInstallError,
    isInstalled,
    isSelectingCertificate,
    open,
    phase,
    reloadKeys,
  ]);

  const startCertificateSelection = () => {
    setErrorMessage(null);
    setIsSelectingCertificate(true);
    setPhase("checking");
  };

  const handleDisconnect = async () => {
    try {
      await integrationService.disconnect(definition.code);
      toast.success(t("settings.integrations.messages.disconnected"));
      await onChanged();
      onClose();
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : String(cause));
    }
  };

  const handleConnect = async () => {
    if (!selectedCertificate) return;
    setPhase("signing");
    setErrorMessage(null);
    try {
      const challenge = await integrationService.challenge(definition.code);
      const signature = await signAsync({
        keyId: selectedCertificate,
        data: JSON.stringify(challenge),
      });
      await integrationService.connect(definition.code, {
        certificate: toMetadata(selectedCertificate),
        signature,
      });
      toast.success(t("settings.integrations.messages.connected"));
      await onChanged();
      onClose();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause);
      setErrorMessage(message);
      setPhase("error");
      toast.error(message);
    }
  };

  const isSigning = phase === "signing";
  const isLoadingCertificates =
    (phase === "checking" && !hasEimzoInstallError) || isEimzoLoading;

  return (
    <Modal
      open={open}
      title={
        isManageMode && !isSelectingCertificate
          ? t("settings.integrations.actions.manage")
          : t("settings.integrations.actions.connect")
      }
      width={620}
      onCancel={isSigning ? undefined : onClose}
      closable={!isSigning}
      maskClosable={!isSigning}
      keyboard={!isSigning}
      footer={null}
    >
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-blue-50/60 p-3">
          <div className={`flex size-10 items-center justify-center rounded-lg text-xs font-bold ${definition.logoClassName}`}>
            {definition.logo}
          </div>
          <div>
            <div className="font-semibold text-primary">{t(definition.nameKey)}</div>
            <div className="text-xs text-secondary-text">{t(definition.descriptionKey)}</div>
          </div>
        </div>

        {isManageMode && !isSelectingCertificate ? (
          <div className="space-y-4">
            <Alert
              type="success"
              showIcon
              icon={<CheckCircle2 className="size-4" />}
              message={t("settings.integrations.connected")}
              description={record.certificate?.ownerName}
            />
            {record.certificate && (
              <div className="grid gap-3 rounded-xl border border-border p-4 text-sm sm:grid-cols-2">
                <div>
                  <div className="text-xs text-secondary-text">{t("settings.integrations.certificate.serial")}</div>
                  <div className="mt-1 font-medium text-primary">{record.certificate.serialNumber}</div>
                </div>
                <div>
                  <div className="text-xs text-secondary-text">{t("settings.integrations.certificate.validTo")}</div>
                  <div className="mt-1 font-medium text-primary">{formatDate(record.certificate.validTo, i18n.language)}</div>
                </div>
              </div>
            )}
            <div className="flex flex-wrap justify-end gap-2">
              <PermissionCard permission={integrationPermissions.connect}>
                <Button icon={<KeyRound className="size-4" />} onClick={startCertificateSelection}>
                  {t("settings.integrations.actions.replaceKey")}
                </Button>
              </PermissionCard>
              <PermissionCard permission={integrationPermissions.disconnect}>
                <Button danger icon={<XCircle className="size-4" />} onClick={() => void handleDisconnect()}>
                  {t("settings.integrations.actions.disconnect")}
                </Button>
              </PermissionCard>
            </div>
          </div>
        ) : (
          <>
            {(phase === "not-installed" || hasEimzoInstallError) && (
              <Alert
                type="warning"
                showIcon
                icon={<ShieldAlert className="size-4" />}
                message={t("settings.integrations.eimzo.notInstalled")}
                description={errorMessage ?? eimzoError ?? undefined}
                action={<Button size="small" icon={<RefreshCw className="size-3" />} onClick={startCertificateSelection}>{t("common.refresh")}</Button>}
              />
            )}
            {phase === "error" && (
              <Alert type="error" showIcon message={t("settings.integrations.eimzo.error")} description={errorMessage ?? undefined} />
            )}
            {isLoadingCertificates && (
              <div className="flex min-h-36 items-center justify-center rounded-xl border border-border">
                <Spin tip={t("settings.integrations.eimzo.loadingCertificates")} />
              </div>
            )}
            {phase === "ready" && availableCertificates.length === 0 && !isLoadingCertificates && (
              <Empty description={t("settings.integrations.eimzo.noCertificates")} />
            )}
            {phase === "ready" && availableCertificates.length > 0 && !isLoadingCertificates && (
              <div className="space-y-3">
                <div className="text-sm font-medium text-primary">{t("settings.integrations.eimzo.selectCertificate")}</div>
                <List
                  bordered
                  dataSource={availableCertificates}
                  renderItem={(certificate) => (
                    <List.Item
                      className={`cursor-pointer! px-3! ${selectedCertificate?.serialNumber === certificate.serialNumber ? "bg-blue-50" : ""}`}
                      onClick={() => setSelectedCertificate(certificate)}
                    >
                      <div className="flex w-full items-start gap-3">
                        <KeyRound className="mt-1 size-4 shrink-0 text-blue-600" />
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium text-primary">{getCertificateOwner(certificate)}</div>
                          <div className="mt-1 flex flex-wrap gap-2 text-xs text-secondary-text">
                            <span>{t("settings.integrations.certificate.serial")}: {certificate.serialNumber}</span>
                            <span>{t("settings.integrations.certificate.validTo")}: {formatDate(certificate.validTo, i18n.language)}</span>
                          </div>
                        </div>
                        {selectedCertificate?.serialNumber === certificate.serialNumber && <Tag color="blue">{t("common.selected")}</Tag>}
                      </div>
                    </List.Item>
                  )}
                />
              </div>
            )}
            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <Button onClick={onClose} disabled={isSigning}>{t("common.cancel")}</Button>
              {isSelectingCertificate && (
                <PermissionCard permission={integrationPermissions.connect}>
                  <Button type="primary" icon={<CheckCircle2 className="size-4" />} loading={isSigning} disabled={!selectedCertificate || isLoadingCertificates} onClick={() => void handleConnect()}>
                    {t("settings.integrations.actions.save")}
                  </Button>
                </PermissionCard>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
