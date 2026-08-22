import {
  EimzoProvider as LibraryEimzoProvider,
  useEimzo,
  type ICertificate,
} from "@islom929/react-eimzo";
import { useEffect, useMemo, useRef, useState } from "react";
import { getEimzoParentOrigin } from "../config";
import { createBridgeEimzoSignature } from "./createBridgeEimzoSignature";
import {
  isEimzoBridgeRequest,
  toCertificateDto,
  type EimzoBridgeRequest,
  type EimzoBridgeResponse,
  type EimzoBridgeStatusPayload,
} from "../types";

const getStatus = (params: {
  isInstalled: boolean;
  isLoading: boolean;
  error: string | null;
  version: EimzoBridgeStatusPayload["version"];
  deviceStatus: EimzoBridgeStatusPayload["deviceStatus"];
}): EimzoBridgeStatusPayload => ({
  status: params.isLoading
    ? "loading"
    : params.error
      ? "error"
      : params.isInstalled
        ? "ready"
        : "eimzo-not-installed",
  isInstalled: params.isInstalled,
  error: params.error,
  version: params.version,
  deviceStatus: params.deviceStatus,
});

function BridgeController() {
  const {
    isInstalled,
    isLoading,
    error,
    version,
    deviceStatus,
    keyList,
    reloadKeys,
    prepareKey,
    signAsync,
  } = useEimzo();
  const parentOrigin = useMemo(getEimzoParentOrigin, []);
  const keyListRef = useRef<ICertificate[]>(keyList);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    keyListRef.current = keyList;
  }, [keyList]);

  useEffect(() => {
    let active = true;
    void reloadKeys({ force: true })
      .catch(() => undefined)
      .finally(() => {
        if (active) setInitialized(true);
      });

    return () => {
      active = false;
    };
  }, [reloadKeys]);

  const status = useMemo(
    () =>
      getStatus({
        isInstalled,
        isLoading,
        error,
        version,
        deviceStatus,
      }),
    [deviceStatus, error, isInstalled, isLoading, version],
  );

  useEffect(() => {
    if (!initialized) return;

    window.parent.postMessage(
      { type: "EIMZO_BRIDGE_READY", payload: status },
      parentOrigin,
    );
  }, [initialized, parentOrigin, status]);

  useEffect(() => {
    const sendResponse = (response: EimzoBridgeResponse) =>
      window.parent.postMessage(response, parentOrigin);

    const findCertificate = (certificateId: string) => {
      const certificate = keyListRef.current.find(
        (item) => item.serialNumber === certificateId,
      );
      if (!certificate) {
        throw new Error("Tanlangan E-IMZO sertifikati topilmadi");
      }
      return certificate;
    };

    const handleMessage = async (event: MessageEvent<unknown>) => {
      if (event.origin !== parentOrigin || event.source !== window.parent) {
        return;
      }

      const message = event.data;
      if (!isEimzoBridgeRequest(message)) return;

      try {
        const payload = await handleRequest(
          message,
          status,
          findCertificate,
          reloadKeys,
          signAsync,
          prepareKey,
          keyListRef,
        );
        sendResponse({
          id: message.id,
          type: "EIMZO_SUCCESS",
          action: message.type,
          payload,
        });
      } catch (cause) {
        sendResponse({
          id: message.id,
          type: "EIMZO_ERROR",
          action: message.type,
          error: {
            code: "EIMZO_BRIDGE_ERROR",
            message: cause instanceof Error ? cause.message : String(cause),
          },
        });
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [parentOrigin, prepareKey, reloadKeys, signAsync, status]);

  return null;
}

async function handleRequest(
  message: EimzoBridgeRequest,
  status: EimzoBridgeStatusPayload,
  findCertificate: (certificateId: string) => ICertificate,
  reloadKeys: ReturnType<typeof useEimzo>["reloadKeys"],
  signAsync: ReturnType<typeof useEimzo>["signAsync"],
  prepareKey: ReturnType<typeof useEimzo>["prepareKey"],
  keyListRef: { current: ICertificate[] },
) {
  switch (message.type) {
    case "EIMZO_GET_STATUS":
      return status;
    case "EIMZO_LOAD_KEYS":
      await reloadKeys({
        force: true,
        includeLegacyTokens: message.payload?.includeLegacyTokens,
      });
      await new Promise<void>((resolve) => window.setTimeout(resolve, 0));
      return keyListRef.current.map(toCertificateDto);
    case "EIMZO_SIGN": {
      const certificate = findCertificate(message.payload.certificateId);
      return signAsync({
        keyId: certificate,
        data: message.payload.data,
        verifyPassword: message.payload.verifyPassword,
      });
    }
    case "EIMZO_CREATE_SIGNATURE": {
      const certificate = findCertificate(message.payload.certificateId);
      const keyId = await prepareKey(certificate);
      return createBridgeEimzoSignature(keyId, message.payload.data);
    }
  }
}

export default function EimzoBridgePage() {
  const apiKeys =
    import.meta.env.VITE_EIMZO_DOMAIN && import.meta.env.VITE_EIMZO_API_KEY
      ? [import.meta.env.VITE_EIMZO_DOMAIN, import.meta.env.VITE_EIMZO_API_KEY]
      : undefined;

  return (
    <LibraryEimzoProvider apiKeys={apiKeys}>
      <BridgeController />
    </LibraryEimzoProvider>
  );
}
