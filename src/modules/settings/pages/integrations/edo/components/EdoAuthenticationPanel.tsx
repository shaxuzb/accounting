import { Alert, Button, Empty, Select, Spin } from "antd";
import { CheckCircle2, KeyRound, LogOut, RefreshCw, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useEimzo, type ICertificate } from "@/features/eimzo";
import { useQuery } from "@tanstack/react-query";
import { $axiosPrivate } from "@/services/AxiosService";
import { useAppSelector } from "@/store/hooks";
import { organizationService } from "@/modules/settings/pages/organizations/api";
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
  clearEdoAuthSession,
  isEdoAuthSessionActive,
  saveEdoAuthSession,
} from "../utils/authSession";
import { createEimzoSignature } from "../utils/eimzoSignature";
import { getEimzoSigningDataBase64 } from "../utils/signingPayload";

// outside the component: the clock is read when signing, not while rendering
const isExpired = (at: string) => new Date(at).getTime() <= Date.now();

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
  const sessionActive = isEdoAuthSessionActive(session);
  const certificates = useMemo(
    () => keyList.filter((certificate) => !certificate.expired),
    [keyList],
  );
  const selectedCertificate = certificates.find(
    (certificate) => certificate.serialNumber === selectedSerial,
  );
  // the operator signs in the organization by its INN: a key of another taxpayer is refused (Didox: 422)
  const organizationId = useAppSelector((state) => state.organization.id);
  const organizationQuery = useQuery({
    queryKey: ["organization-detail", organizationId],
    queryFn: () => organizationService.detail(organizationId),
    enabled: Boolean(organizationId),
    staleTime: 5 * 60 * 1000,
  });
  const organizationInn = organizationQuery.data?.inn?.trim() || undefined;
  const organizationPinfl = (organizationQuery.data as { pinfl?: string | null } | undefined)?.pinfl?.trim() || undefined;
  const keyMismatch =
    selectedCertificate && organizationInn
      ? !(
          (selectedCertificate.TIN && selectedCertificate.TIN === organizationInn) ||
          (selectedCertificate.PINFL && organizationPinfl && selectedCertificate.PINFL === organizationPinfl)
        )
      : false;
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
    if (keyMismatch) {
      setLocalError(
        t("settings.integrations.edo.errors.keyOrganizationMismatch", {
          keyInn: selectedCertificate.TIN || selectedCertificate.PINFL,
          orgInn: organizationInn,
        }),
      );
      return;
    }
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
      // with the session open the invoices are compared with the books at once, not at the next round
      void $axiosPrivate.post("/organization-health/run").catch(() => undefined);
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
      if (isExpired(challenge.expiresAt)) {
        throw new Error(t("settings.integrations.edo.errors.challengeExpired"));
      }

      const keyId = await prepareKey(selectedCertificate);
      const { preparedPkcs7, signatureHex } = await createEimzoSignature(
        keyId,
        getEimzoSigningDataBase64(challenge.payload, challenge.payloadFormat),
      );

      if (isExpired(challenge.expiresAt)) {
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
      // with the session open the invoices are compared with the books at once, not at the next round
      void $axiosPrivate.post("/organization-health/run").catch(() => undefined);
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
      {sessionActive && (
        <Alert
          type="success"
          showIcon
          icon={<CheckCircle2 className="size-4" />}
          action={
            provider ? (
              <Button
                size="small"
                icon={<LogOut className="size-4" />}
                onClick={() => clearEdoAuthSession(provider.code)}
              >
                {t("settings.integrations.edo.auth.signOut")}
              </Button>
            ) : undefined
          }
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
      {!sessionActive && (!isInstalled || error) && (
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

      {/* a live session is kept until it ends or the user signs out: no key is asked for again */}
      {sessionActive ? null : isLoading ? (
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
            {keyMismatch && (
              <Alert
                className="mt-2"
                type="warning"
                showIcon
                message={t("settings.integrations.edo.errors.keyOrganizationMismatch", {
                  keyInn: selectedCertificate?.TIN || selectedCertificate?.PINFL,
                  orgInn: organizationInn,
                })}
              />
            )}
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
