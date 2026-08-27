import { getEimzoBridgeOrigin } from "../config";
import type {
  EimzoBridgeReadyMessage,
  EimzoBridgeRequest,
  EimzoBridgeResponse,
  EimzoBridgeStatusPayload,
  EimzoCertificateDto,
  EimzoSignatureDto,
} from "../types";
import { isEimzoBridgeResponse } from "../types";

const REQUEST_TIMEOUT_MS = 25_000;

type PendingRequest = {
  action: EimzoBridgeRequest["type"];
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  timeout: number;
};

type EimzoBridgeRequestInput = EimzoBridgeRequest extends infer Request
  ? Request extends { id: string }
    ? Omit<Request, "id">
    : never
  : never;

type Listener = (status: EimzoBridgeStatusPayload) => void;

const toError = (message: string) => new Error(message);

export class EimzoBridgeClient {
  private readonly bridgeOrigin: string;
  private iframe: HTMLIFrameElement | null = null;
  private ready = false;
  private disposed = false;
  private readyTimeout: number | null = null;
  private pending = new Map<string, PendingRequest>();
  private listeners = new Set<Listener>();
  private messageHandler = (event: MessageEvent<unknown>) =>
    this.handleMessage(event);

  constructor(bridgeOrigin = getEimzoBridgeOrigin()) {
    this.bridgeOrigin = bridgeOrigin;
  }

  mount() {
    if (this.iframe || this.disposed) return;
    window.addEventListener("message", this.messageHandler);

    const iframe = document.createElement("iframe");
    iframe.src = `${this.bridgeOrigin}/eimzo-bridge`;
    iframe.title = "E-IMZO bridge";
    iframe.setAttribute("aria-hidden", "true");
    iframe.tabIndex = -1;
    iframe.style.position = "absolute";
    iframe.style.width = "1px";
    iframe.style.height = "1px";
    iframe.style.border = "0";
    iframe.style.opacity = "0";
    iframe.style.pointerEvents = "none";
    document.body.appendChild(iframe);
    this.iframe = iframe;
    this.readyTimeout = window.setTimeout(() => {
      if (this.ready || this.disposed) return;
      this.listeners.forEach((listener) =>
        listener({
          status: "error",
          isInstalled: false,
          error: "E-IMZO bridge yuklanmadi",
          version: null,
          deviceStatus: { idcard: false, baikey: false, ckc: false },
        }),
      );
    }, REQUEST_TIMEOUT_MS);
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getStatus() {
    return this.request<EimzoBridgeStatusPayload>({
      type: "EIMZO_GET_STATUS",
    });
  }

  loadKeys(options?: { includeLegacyTokens?: boolean }) {
    return this.request<EimzoCertificateDto[]>({
      type: "EIMZO_LOAD_KEYS",
      payload: options,
    });
  }

  sign(payload: {
    certificateId: string;
    data: string;
    verifyPassword?: boolean;
  }) {
    return this.request<string>({
      type: "EIMZO_SIGN",
      payload,
    });
  }

  createSignature(payload: { certificateId: string; data: string }) {
    return this.request<EimzoSignatureDto>({
      type: "EIMZO_CREATE_SIGNATURE",
      payload,
    });
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    window.removeEventListener("message", this.messageHandler);
    this.iframe?.remove();
    this.iframe = null;
    if (this.readyTimeout !== null) {
      window.clearTimeout(this.readyTimeout);
      this.readyTimeout = null;
    }
    this.ready = false;
    this.pending.forEach((request) => {
      window.clearTimeout(request.timeout);
      request.reject(toError("E-IMZO bridge yopildi"));
    });
    this.pending.clear();
    this.listeners.clear();
    if (sharedClient === this) sharedClient = null;
  }

  private request<T>(
    request: EimzoBridgeRequestInput,
  ): Promise<T> {
    if (this.disposed) {
      return Promise.reject(toError("E-IMZO bridge mavjud emas"));
    }
    if (!this.ready || !this.iframe?.contentWindow) {
      return Promise.reject(toError("E-IMZO bridge hali tayyor emas"));
    }

    const id = crypto.randomUUID();
    const message = { ...request, id } as EimzoBridgeRequest;

    return new Promise<T>((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        this.pending.delete(id);
        reject(toError("E-IMZO so'rovi vaqt tugashi sababli bekor qilindi"));
      }, REQUEST_TIMEOUT_MS);

      this.pending.set(id, {
        action: message.type,
        resolve: (value) => resolve(value as T),
        reject,
        timeout,
      });
      this.iframe?.contentWindow?.postMessage(message, this.bridgeOrigin);
    });
  }

  private handleMessage(event: MessageEvent<unknown>) {
    if (event.origin !== this.bridgeOrigin) return;
    if (
      !this.iframe?.contentWindow ||
      event.source !== this.iframe.contentWindow
    ) {
      return;
    }

    const message = event.data as
      | EimzoBridgeReadyMessage
      | EimzoBridgeResponse
      | undefined;
    if (message?.type === "EIMZO_BRIDGE_READY") {
      this.ready = true;
      if (this.readyTimeout !== null) {
        window.clearTimeout(this.readyTimeout);
        this.readyTimeout = null;
      }
      this.listeners.forEach((listener) => listener(message.payload));
      return;
    }
    if (!isEimzoBridgeResponse(message)) return;

    const pending = this.pending.get(message.id);
    if (!pending || pending.action !== message.action) return;
    this.pending.delete(message.id);
    window.clearTimeout(pending.timeout);

    if (message.type === "EIMZO_ERROR") {
      pending.reject(toError(message.error.message));
      return;
    }
    pending.resolve(message.payload);
  }
}

let sharedClient: EimzoBridgeClient | null = null;

export const getEimzoBridgeClient = () => {
  sharedClient ??= new EimzoBridgeClient();
  return sharedClient;
};
