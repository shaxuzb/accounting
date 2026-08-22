import type {
  ICertificate,
  IEimzoContext,
  ILoadKeysOptions,
} from "@islom929/react-eimzo";
import { useCallback, useEffect, useRef, useState } from "react";
import { EimzoContext } from "./EimzoContext";
import { getHujjatEimzoClient } from "../tunnel/HujjatEimzoClient";
import type { EimzoBridgeStatusPayload } from "../types";

const toErrorMessage = (cause: unknown) =>
  cause instanceof Error ? cause.message : String(cause);

const initialStatus: EimzoBridgeStatusPayload = {
  status: "loading",
  isInstalled: false,
  error: null,
  version: null,
  deviceStatus: { idcard: false, baikey: false, ckc: false },
};

export function HujjatEimzoAdapter({
  children,
}: {
  children: React.ReactNode;
}) {
  const clientRef = useRef(getHujjatEimzoClient());
  const [status, setStatus] = useState(initialStatus);
  const [keyList, setKeyList] = useState<ICertificate[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let active = true;
    void clientRef.current
      .getVersion()
      .then(async (version) => {
        const deviceStatus = await clientRef.current.getDeviceStatus();
        if (!active) return;
        setStatus({
          status: "ready",
          isInstalled: true,
          error: null,
          version,
          deviceStatus,
        });
      })
      .catch((cause) => {
        if (!active) return;
        setStatus((current) => ({
          ...current,
          status: "error",
          error: toErrorMessage(cause),
        }));
      });

    return () => {
      active = false;
    };
  }, []);

  const loadKeys = useCallback(
    async (_options: ILoadKeysOptions = {}) => {
      setIsLoading(true);
      try {
        const [keys, version, deviceStatus] = await Promise.all([
          clientRef.current.listAllUserKeys(),
          clientRef.current.getVersion(),
          clientRef.current.getDeviceStatus(),
        ]);
        setKeyList(keys);
        setStatus({
          status: "ready",
          isInstalled: true,
          error: null,
          version,
          deviceStatus,
        });
      } catch (cause) {
        setStatus((current) => ({
          ...current,
          status: "error",
          error: toErrorMessage(cause),
        }));
        throw cause;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const loadKeysSafely = useCallback(
    async (options: ILoadKeysOptions = {}) => {
      await loadKeys(options).catch(() => undefined);
    },
    [loadKeys],
  );

  const prepareKey = useCallback(
    async (certificate: ICertificate) => {
      const result = await clientRef.current.loadKey(certificate);
      return result.id;
    },
    [],
  );

  const signAsync = useCallback(
    async ({
      keyId,
      data,
    }: {
      keyId: ICertificate | string;
      data: string;
      verifyPassword?: boolean;
    }) => {
      setIsLoading(true);
      try {
        const id =
          typeof keyId === "string"
            ? keyId
            : (await clientRef.current.loadKey(keyId)).id;
        return await clientRef.current.createPkcs7(id, data);
      } catch (cause) {
        setStatus((current) => ({
          ...current,
          status: "error",
          error: toErrorMessage(cause),
        }));
        throw cause;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const sign = useCallback(
    ({ onSuccess, onError, ...params }: Parameters<IEimzoContext["sign"]>[0]) => {
      void signAsync(params)
        .then(onSuccess)
        .catch((cause) => onError?.(toErrorMessage(cause)));
    },
    [signAsync],
  );

  const context: IEimzoContext = {
    isInstalled: status.isInstalled,
    isLoading: isLoading || status.status === "loading",
    error: status.error,
    version: status.version,
    keyList,
    deviceStatus: status.deviceStatus,
    loadKeys: loadKeysSafely,
    reloadKeys: loadKeys,
    prepareKey,
    signAsync,
    sign,
  };

  return (
    <EimzoContext.Provider value={context}>{children}</EimzoContext.Provider>
  );
}
