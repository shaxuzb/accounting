import { Alert, Button, Empty, Select, Spin } from "antd";
import { CheckCircle2, KeyRound, RefreshCw, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useEimzo, type ICertificate } from "@/features/eimzo";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import Card from "@/components/ui/card/Card";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import {
  useEdoActiveProvider,
  useEdoAuthSession,
  useEdoAuthChallenge,
  useEdoAuthComplete,
  useEdoCapabilities,
} from "../hooks";
import { hasSupportedCapability } from "../utils/capabilities";
import {
  isEdoAuthSessionActive,
  saveEdoAuthSession,
} from "../utils/authSession";
import { createEimzoSignature } from "../utils/eimzoSignature";
import { getEimzoSigningDataBase64 } from "../utils/signingPayload";

const getOwner = (certificate: ICertificate) =>
  certificate.ownerName || certificate.CN || certificate.name;

export default function EdoAuthenticationPanel({
  onAuthenticated,
}: {
  onAuthenticated?: () => void;
}) {
  const { t } = useTranslation();
  const activeProviderQuery = useEdoActiveProvider();
  const challengeMutation = useEdoAuthChallenge();
  const completeMutation = useEdoAuthComplete();
  const {
    isInstalled,
    isLoading,
    error,
    keyList,
    reloadKeys,
    prepareKey,
    signAsync,
  } = useEimzo();
  const [selectedSerial, setSelectedSerial] = useState<string>();
  const [localError, setLocalError] = useState<string>();
  const provider = activeProviderQuery.data;
  const capabilitiesQuery = useEdoCapabilities(provider?.code);
  const session = useEdoAuthSession(provider?.code);
  const certificates = useMemo(
    () => keyList.filter((certificate) => !certificate.expired),
    [keyList],
  );
  const selectedCertificate = certificates.find(
    (certificate) => certificate.serialNumber === selectedSerial,
  );
  const isFaktura = provider?.code === "FAKTURA";
  const authAvailable =
    Boolean(provider) &&
    (isFaktura ||
      (hasSupportedCapability(
        provider,
        "AuthChallenge",
        capabilitiesQuery.data,
      ) &&
        hasSupportedCapability(
          provider,
          "AuthComplete",
          capabilitiesQuery.data,
        )));

  useEffect(() => {
    if (!isInstalled) return;
    void reloadKeys({ force: true }).catch((cause: unknown) => {
      setLocalError(cause instanceof Error ? cause.message : String(cause));
    });
  }, [isInstalled, reloadKeys]);

  const authenticate = async () => {
    if (!provider || !selectedCertificate || !authAvailable) return;
    setLocalError(undefined);
    try {
      if (isFaktura) {
        const preparedPkcs7 = await signAsync({
          keyId: selectedCertificate,
          data: selectedCertificate.serialNumber,
          verifyPassword: true,
        });
        const response = await completeMutation.mutateAsync({
          providerCode: provider.code,
          payload: {
            preparedPkcs7,
            rememberMe: false,
          },
        });

        if (!response.isAuthenticated) {
          throw new Error(t("settings.integrations.edo.errors.authRejected"));
        }
        saveEdoAuthSession(provider.code, response);
        toast.success(t("settings.integrations.edo.messages.authenticated"));
        onAuthenticated?.();
        return;
      }

      const certificateSerialNumber =
        provider.code === "EDOCS"
          ? selectedCertificate.serialNumber.toLowerCase()
          : selectedCertificate.serialNumber;
      const challenge = await challengeMutation.mutateAsync({
        certificateSerialNumber,
        authMode: "EImzo",
      });
      if (new Date(challenge.expiresAt).getTime() <= Date.now()) {
        throw new Error(t("settings.integrations.edo.errors.challengeExpired"));
      }

      const keyId = await prepareKey(selectedCertificate);
      const { preparedPkcs7, signatureHex } = await createEimzoSignature(
        keyId,
        getEimzoSigningDataBase64(challenge.payload, challenge.payloadFormat),
      );

      if (new Date(challenge.expiresAt).getTime() <= Date.now()) {
        throw new Error(t("settings.integrations.edo.errors.challengeExpired"));
      }
      const response = await completeMutation.mutateAsync({
        providerCode: provider.code,
        payload: {
          challengeId: challenge.challengeId,
          signingSessionId: challenge.signingSessionId,
          certificateSerialNumber,
          signedPayload: preparedPkcs7,
          preparedPkcs7,
          signatureHex,
        },
      });

      if (!response.isAuthenticated) {
        throw new Error(t("settings.integrations.edo.errors.authRejected"));
      }
      saveEdoAuthSession(provider.code, response);
      toast.success(t("settings.integrations.edo.messages.authenticated"));
      onAuthenticated?.();
    } catch (cause) {
      if (isAxiosError(cause) && cause.response?.status === 404) {
        const message = t(
          "settings.integrations.edo.errors.providerUserNotFound",
        );
        setLocalError(message);
        toast.error(message, { id: "edo-provider-user-not-found" });
      } else {
        setLocalError(cause instanceof Error ? cause.message : String(cause));
        errorHandlers(cause);
      }
    }
  };

  return (
    <Card className="border border-border p-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          <ShieldCheck className="size-5" />
        </div>
        <div>
          <h2 className="font-semibold text-heading">
            {t("settings.integrations.edo.auth.title")}
          </h2>
          <p className="mt-1 text-sm text-secondary-text">
            {t("settings.integrations.edo.auth.description")}
          </p>
        </div>
      </div>

      {!provider && !activeProviderQuery.isLoading && (
        <Alert
          type="warning"
          showIcon
          message={t("settings.integrations.edo.auth.selectProvider")}
        />
      )}
      {provider && !capabilitiesQuery.isLoading && !authAvailable && (
        <Alert
          type="warning"
          showIcon
          message={t("settings.integrations.edo.auth.unavailable")}
        />
      )}
      {isEdoAuthSessionActive(session) && (
        <Alert
          type="success"
          showIcon
          icon={<CheckCircle2 className="size-4" />}
          message={t("settings.integrations.edo.auth.authenticated", {
            provider: provider?.name,
          })}
          description={
            session.expiresAt
              ? t("settings.integrations.edo.auth.expiresAt", {
                  date: new Date(session.expiresAt).toLocaleString(),
                })
              : undefined
          }
          className="mb-4! border-emerald-200! bg-emerald-50! text-emerald-700! dark:border-emerald-800! dark:bg-emerald-950/60! dark:text-emerald-300!"
        />
      )}
      {(!isInstalled || error) && (
        <Alert
          type="warning"
          showIcon
          message={t("settings.integrations.eimzo.notInstalled")}
          description={error ?? undefined}
          className="mb-4"
        />
      )}
      {localError && (
        <Alert
          type="error"
          showIcon
          message={t("settings.integrations.eimzo.error")}
          description={localError}
          closable
          onClose={() => setLocalError(undefined)}
          className="mb-4"
        />
      )}

      {isLoading ? (
        <div className="flex min-h-28 items-center justify-center">
          <Spin />
        </div>
      ) : certificates.length ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <label className="mb-2 block text-sm font-medium text-heading">
              {t("settings.integrations.eimzo.selectCertificate")}
            </label>
            <Select
              className="w-full"
              value={selectedSerial}
              onChange={setSelectedSerial}
              options={certificates.map((certificate) => ({
                value: certificate.serialNumber,
                label: [
                  getOwner(certificate),
                  certificate.TIN,
                  certificate.serialNumber,
                ]
                  .filter(Boolean)
                  .join(" — "),
              }))}
              placeholder={t("settings.integrations.eimzo.selectCertificate")}
              showSearch
              optionFilterProp="label"
            />
          </div>
          <Button
            icon={<RefreshCw className="size-4" />}
            onClick={() => reloadKeys({ force: true })}
          >
            {t("common.refresh")}
          </Button>
          <Button
            type="primary"
            icon={<KeyRound className="size-4" />}
            disabled={!selectedCertificate || !authAvailable || !isInstalled}
            loading={challengeMutation.isPending || completeMutation.isPending}
            onClick={() => authenticate()}
          >
            {t("settings.integrations.edo.auth.authenticate")}
          </Button>
        </div>
      ) : (
        <Empty description={t("settings.integrations.eimzo.noCertificates")} />
      )}
    </Card>
  );
}
