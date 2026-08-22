import type { ICertificate, IEimzoVersion } from "@islom929/react-eimzo";
import type { EimzoSignatureDto } from "../types";

const DEFAULT_TUNNEL_SCRIPT_URL =
  "/eimzo-browser.js";
const SCRIPT_LOAD_TIMEOUT_MS = 12_000;
const TUNNEL_CALL_TIMEOUT_MS = 20_000;

type RawPkcs7Response = {
  pkcs7?: string;
  signatureHex?: string;
  signature_hex?: string;
};

export interface HujjatEimzoRuntime {
  checkVersion: () => Promise<IEimzoVersion>;
  install: () => Promise<void>;
  listAllUserKeys: () => Promise<ICertificate[]>;
  loadKey: (certificate: ICertificate) => Promise<{ id: string; cert: ICertificate }>;
  createPkcs7: (keyId: string, data: string) => Promise<string>;
  isIDCardPlugged?: () => Promise<boolean>;
  isCKCPLuggedIn?: () => Promise<boolean>;
  _call?: (action: string, args: unknown) => Promise<unknown>;
}

declare global {
  interface Window {
    EIMZO?: HujjatEimzoRuntime;
    HujjatUzEIMZOClient?: HujjatEimzoRuntime;
  }
}

let scriptPromise: Promise<HujjatEimzoRuntime> | null = null;

const withTimeout = <T>(
  promise: Promise<T>,
  message: string,
  timeoutMs: number,
) =>
  new Promise<T>((resolve, reject) => {
    const timeout = window.setTimeout(
      () => reject(new Error(message)),
      timeoutMs,
    );

    promise.then(
      (value) => {
        window.clearTimeout(timeout);
        resolve(value);
      },
      (cause) => {
        window.clearTimeout(timeout);
        reject(cause);
      },
    );
  });

const getScriptUrl = () =>
  import.meta.env.VITE_EIMZO_TUNNEL_SCRIPT_URL || DEFAULT_TUNNEL_SCRIPT_URL;

const getRuntime = () => window.EIMZO || window.HujjatUzEIMZOClient;

const loadRuntime = (): Promise<HujjatEimzoRuntime> => {
  const currentRuntime = getRuntime();
  if (currentRuntime) return Promise.resolve(currentRuntime);
  if (scriptPromise) return scriptPromise;

  const pendingScript = new Promise<HujjatEimzoRuntime>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-eimzo-tunnel-client="true"]',
    );
    const script = existingScript || document.createElement("script");

    const handleLoad = () => {
      const runtime = getRuntime();
      if (runtime) resolve(runtime);
      else reject(new Error("E-IMZO tunnel client ishga tushmadi"));
    };

    const handleError = () =>
      reject(new Error("E-IMZO tunnel skripti yuklanmadi"));

    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });

    if (!existingScript) {
      script.src = getScriptUrl();
      script.async = true;
      script.dataset.eimzoTunnelClient = "true";
      document.head.appendChild(script);
    }
  });

  scriptPromise = withTimeout(
    pendingScript,
    "E-IMZO tunnel skripti 12 soniyada yuklanmadi",
    SCRIPT_LOAD_TIMEOUT_MS,
  ).catch((error) => {
    scriptPromise = null;
    throw error;
  });

  return scriptPromise;
};

let installationPromise: Promise<HujjatEimzoRuntime> | null = null;

export class HujjatEimzoClient {
  private runtime: HujjatEimzoRuntime | null = null;

  async install() {
    this.runtime = await loadRuntime();
    if (!installationPromise) {
      installationPromise = withTimeout(
        Promise.resolve().then(() => this.runtime!.install()),
        "E-IMZO tunnel javob bermadi. E-IMZO ishga tushganini tekshiring",
        TUNNEL_CALL_TIMEOUT_MS,
      )
        .then(() => this.runtime!)
        .catch((error) => {
          installationPromise = null;
          throw error;
        });
    }
    return installationPromise;
  }

  async getVersion() {
    const runtime = await this.install();
    return withTimeout(
      runtime.checkVersion(),
      "E-IMZO versiyasi olinmadi",
      TUNNEL_CALL_TIMEOUT_MS,
    );
  }

  async listAllUserKeys() {
    const runtime = await this.install();
    return withTimeout(
      runtime.listAllUserKeys(),
      "E-IMZO sertifikatlari 20 soniyada olinmadi",
      TUNNEL_CALL_TIMEOUT_MS,
    );
  }

  async loadKey(certificate: ICertificate) {
    const runtime = await this.install();
    return withTimeout(
      runtime.loadKey(certificate),
      "E-IMZO kaliti yuklanmadi",
      TUNNEL_CALL_TIMEOUT_MS,
    );
  }

  async createPkcs7(keyId: string, data: string) {
    const runtime = await this.install();
    return withTimeout(
      runtime.createPkcs7(keyId, data),
      "E-IMZO imzolash javobi olinmadi",
      TUNNEL_CALL_TIMEOUT_MS,
    );
  }

  async createSignature(
    keyId: string,
    data: string,
  ): Promise<EimzoSignatureDto> {
    const runtime = await this.install();
    if (!runtime._call) {
      throw new Error("E-IMZO tunnel imzo ma'lumotlarini qaytarmadi");
    }

    const raw = (await withTimeout(
      runtime._call("createPkcs7", { id: keyId, data }),
      "E-IMZO imzolash javobi olinmadi",
      TUNNEL_CALL_TIMEOUT_MS,
    )) as RawPkcs7Response;
    const preparedPkcs7 = raw.pkcs7;
    const signatureHex = raw.signatureHex || raw.signature_hex;

    if (!preparedPkcs7 || !signatureHex) {
      throw new Error("E-IMZO javobida PKCS7 yoki signatureHex mavjud emas");
    }

    return { preparedPkcs7, signatureHex };
  }

  async getDeviceStatus() {
    const runtime = await this.install();
    const [idcard, ckc] = await withTimeout(
      Promise.allSettled([
        runtime.isIDCardPlugged?.() || Promise.resolve(false),
        runtime.isCKCPLuggedIn?.() || Promise.resolve(false),
      ]),
      "E-IMZO qurilma holati olinmadi",
      TUNNEL_CALL_TIMEOUT_MS,
    );

    return {
      idcard: idcard.status === "fulfilled" && idcard.value,
      baikey: false,
      ckc: ckc.status === "fulfilled" && ckc.value,
    };
  }
}

let sharedClient: HujjatEimzoClient | null = null;

export const getHujjatEimzoClient = () => {
  sharedClient ??= new HujjatEimzoClient();
  return sharedClient;
};

export const createHujjatEimzoSignature = (
  keyId: string,
  dataBase64: string,
) => getHujjatEimzoClient().createSignature(keyId, dataBase64);
