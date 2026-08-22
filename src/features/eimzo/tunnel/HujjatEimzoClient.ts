import type { ICertificate, IEimzoVersion } from "@islom929/react-eimzo";
import type { EimzoSignatureDto } from "../types";

const DEFAULT_TUNNEL_SCRIPT_URL =
  "https://hujjat.uz/services/platon-core/web/v1/store/file/js/eimzo-browser.js";

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

const getScriptUrl = () =>
  import.meta.env.VITE_EIMZO_TUNNEL_SCRIPT_URL || DEFAULT_TUNNEL_SCRIPT_URL;

const getRuntime = () => window.EIMZO || window.HujjatUzEIMZOClient;

const loadRuntime = (): Promise<HujjatEimzoRuntime> => {
  const currentRuntime = getRuntime();
  if (currentRuntime) return Promise.resolve(currentRuntime);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<HujjatEimzoRuntime>((resolve, reject) => {
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
  }).catch((error) => {
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
      installationPromise = this.runtime
        .install()
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
    return runtime.checkVersion();
  }

  async listAllUserKeys() {
    const runtime = await this.install();
    return runtime.listAllUserKeys();
  }

  async loadKey(certificate: ICertificate) {
    const runtime = await this.install();
    return runtime.loadKey(certificate);
  }

  async createPkcs7(keyId: string, data: string) {
    const runtime = await this.install();
    return runtime.createPkcs7(keyId, data);
  }

  async createSignature(
    keyId: string,
    data: string,
  ): Promise<EimzoSignatureDto> {
    const runtime = await this.install();
    if (!runtime._call) {
      throw new Error("E-IMZO tunnel imzo ma'lumotlarini qaytarmadi");
    }

    const raw = (await runtime._call("createPkcs7", {
      id: keyId,
      data,
    })) as RawPkcs7Response;
    const preparedPkcs7 = raw.pkcs7;
    const signatureHex = raw.signatureHex || raw.signature_hex;

    if (!preparedPkcs7 || !signatureHex) {
      throw new Error("E-IMZO javobida PKCS7 yoki signatureHex mavjud emas");
    }

    return { preparedPkcs7, signatureHex };
  }

  async getDeviceStatus() {
    const runtime = await this.install();
    const [idcard, ckc] = await Promise.allSettled([
      runtime.isIDCardPlugged?.() || Promise.resolve(false),
      runtime.isCKCPLuggedIn?.() || Promise.resolve(false),
    ]);

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
