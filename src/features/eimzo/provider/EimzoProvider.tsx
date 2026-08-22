import {
  EimzoProvider as LibraryEimzoProvider,
  useEimzo as useLibraryEimzo,
  type ICertificate,
  type IEimzoContext,
  type IEimzoProviderProps,
  type ILoadKeysOptions,
} from "@islom929/react-eimzo";
import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { EimzoContext } from "./EimzoContext";
import {
  EimzoBridgeClient,
  getEimzoBridgeClient,
} from "../client/EimzoBridgeClient";
import { isEimzoBridgeEnabled } from "../config";
import { isEimzoTunnelEnabled } from "../config";
import { HujjatEimzoAdapter } from "./HujjatEimzoAdapter";
import type { EimzoBridgeStatusPayload } from "../types";
import { toCertificate } from "../types";

const toErrorMessage = (cause: unknown) =>
  cause instanceof Error ? cause.message : String(cause);

function DirectEimzoAdapter({ children }: { children: React.ReactNode }) {
  const context = useLibraryEimzo();
  return (
    <EimzoContext.Provider value={context}>{children}</EimzoContext.Provider>
  );
}

function BridgeEimzoAdapter({ children }: { children: React.ReactNode }) {
  const clientRef = useRef<EimzoBridgeClient | null>(null);
  if (!clientRef.current) clientRef.current = getEimzoBridgeClient();

  const [bridgeStatus, setBridgeStatus] = useState<EimzoBridgeStatusPayload>({
    status: "loading",
    isInstalled: false,
    error: null,
    version: null,
    deviceStatus: { idcard: false, baikey: false, ckc: false },
  });
  const [keyList, setKeyList] = useState<ICertificate[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const client = clientRef.current!;
    const unsubscribe = client.subscribe(setBridgeStatus);
    client.mount();
    return () => {
      unsubscribe();
      client.dispose();
    };
  }, []);

  const loadKeys = useCallback(
    async (options: ILoadKeysOptions = {}) => {
      setIsLoading(true);
      try {
        const keys = await clientRef.current!.loadKeys(options);
        setKeyList(keys.map(toCertificate));
        setBridgeStatus((current) => ({
          ...current,
          status: "ready",
          isInstalled: true,
          error: null,
        }));
      } catch (cause) {
        setBridgeStatus((current) => ({
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

  const prepareKey = useCallback(async (certificate: ICertificate) => {
    if (!certificate.serialNumber) {
      throw new Error("E-IMZO sertifikati identifikatori topilmadi");
    }
    return certificate.serialNumber;
  }, []);

  const signAsync = useCallback(
    async ({
      keyId,
      data,
      verifyPassword = false,
    }: {
      keyId: ICertificate | string;
      data: string;
      verifyPassword?: boolean;
    }) => {
      setIsLoading(true);
      try {
        const certificateId =
          typeof keyId === "string" ? keyId : keyId.serialNumber;
        const signature = await clientRef.current!.sign({
          certificateId,
          data,
          verifyPassword,
        });
        setBridgeStatus((current) => ({ ...current, error: null }));
        return signature;
      } catch (cause) {
        setBridgeStatus((current) => ({
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
    ({
      onSuccess,
      onError,
      ...params
    }: {
      keyId: ICertificate | string;
      data: string;
      verifyPassword?: boolean;
      onSuccess: (pkcs7: string) => void;
      onError?: (error: string) => void;
    }) => {
      void signAsync(params)
        .then(onSuccess)
        .catch((cause) => onError?.(toErrorMessage(cause)));
    },
    [signAsync],
  );

  const context: IEimzoContext = {
    isInstalled: bridgeStatus.isInstalled,
    isLoading: isLoading || bridgeStatus.status === "loading",
    error: bridgeStatus.error,
    version: bridgeStatus.version,
    keyList,
    loadKeys: loadKeysSafely,
    reloadKeys: loadKeys,
    prepareKey,
    signAsync,
    sign,
    deviceStatus: bridgeStatus.deviceStatus,
  };

  return (
    <EimzoContext.Provider value={context}>{children}</EimzoContext.Provider>
  );
}

export function EimzoProvider({
  children,
  apiKeys,
}: IEimzoProviderProps) {
  if (isEimzoTunnelEnabled()) {
    return <HujjatEimzoAdapter>{children}</HujjatEimzoAdapter>;
  }

  if (isEimzoBridgeEnabled()) {
    return <BridgeEimzoAdapter>{children}</BridgeEimzoAdapter>;
  }

  return (
    <LibraryEimzoProvider apiKeys={apiKeys}>
      <DirectEimzoAdapter>{children}</DirectEimzoAdapter>
    </LibraryEimzoProvider>
  );
}

export const useEimzo = () => {
  const context = useContext(EimzoContext);
  if (!context) throw new Error("useEimzo must be used within EimzoProvider");
  return context;
};

export type {
  ICertificate,
  IDeviceStatus,
  IEimzoContext,
  IEimzoProviderProps,
  IEimzoVersion,
  ILoadKeysOptions,
  ISignAsyncParams,
  ISignParams,
  TKeyType,
} from "@islom929/react-eimzo";
