import type {
  ICertificate,
  IDeviceStatus,
  IEimzoVersion,
} from "@islom929/react-eimzo";

export type EimzoBridgeStatus =
  | "loading"
  | "ready"
  | "eimzo-not-installed"
  | "error";

export interface EimzoCertificateDto {
  disk: string;
  path: string;
  name: string;
  alias: string;
  serialNumber: string;
  validFrom: string;
  validTo: string;
  CN: string;
  TIN: string;
  UID: string;
  PINFL: string;
  O: string;
  T: string;
  type: ICertificate["type"];
  cardUID?: string;
  statusInfo?: string;
  ownerName?: string;
  info?: string;
  expired?: boolean;
}

export interface EimzoBridgeStatusPayload {
  status: EimzoBridgeStatus;
  isInstalled: boolean;
  error: string | null;
  version: IEimzoVersion | null;
  deviceStatus: IDeviceStatus;
}

export type EimzoBridgeRequest =
  | {
      id: string;
      type: "EIMZO_GET_STATUS";
    }
  | {
      id: string;
      type: "EIMZO_LOAD_KEYS";
      payload?: {
        includeLegacyTokens?: boolean;
      };
    }
  | {
      id: string;
      type: "EIMZO_SIGN";
      payload: {
        certificateId: string;
        data: string;
        verifyPassword?: boolean;
      };
    }
  | {
      id: string;
      type: "EIMZO_CREATE_SIGNATURE";
      payload: {
        certificateId: string;
        data: string;
      };
    };

export type EimzoBridgeResponse =
  | {
      id: string;
      type: "EIMZO_SUCCESS";
      action: EimzoBridgeRequest["type"];
      payload: unknown;
    }
  | {
      id: string;
      type: "EIMZO_ERROR";
      action: EimzoBridgeRequest["type"];
      error: {
        code?: string;
        message: string;
      };
    };

export interface EimzoBridgeReadyMessage {
  type: "EIMZO_BRIDGE_READY";
  payload: EimzoBridgeStatusPayload;
}

export interface EimzoSignatureDto {
  preparedPkcs7: string;
  signatureHex: string;
}

export const toCertificate = (
  certificate: EimzoCertificateDto,
): ICertificate => ({
  ...certificate,
  validFrom: new Date(certificate.validFrom),
  validTo: new Date(certificate.validTo),
});

export const toCertificateDto = (
  certificate: ICertificate,
): EimzoCertificateDto => ({
  disk: certificate.disk,
  path: certificate.path,
  name: certificate.name,
  alias: certificate.alias,
  serialNumber: certificate.serialNumber,
  validFrom: new Date(certificate.validFrom).toISOString(),
  validTo: new Date(certificate.validTo).toISOString(),
  CN: certificate.CN,
  TIN: certificate.TIN,
  UID: certificate.UID,
  PINFL: certificate.PINFL,
  O: certificate.O,
  T: certificate.T,
  type: certificate.type,
  cardUID: certificate.cardUID,
  statusInfo: certificate.statusInfo,
  ownerName: certificate.ownerName,
  info: certificate.info,
  expired: certificate.expired,
});

export const isEimzoBridgeRequest = (
  value: unknown,
): value is EimzoBridgeRequest => {
  if (!value || typeof value !== "object") return false;
  const message = value as Partial<EimzoBridgeRequest>;
  if (typeof message.id !== "string" || !message.id) return false;
  if (
    message.type !== "EIMZO_GET_STATUS" &&
    message.type !== "EIMZO_LOAD_KEYS" &&
    message.type !== "EIMZO_SIGN" &&
    message.type !== "EIMZO_CREATE_SIGNATURE"
  ) {
    return false;
  }

  if (
    message.type === "EIMZO_SIGN" ||
    message.type === "EIMZO_CREATE_SIGNATURE"
  ) {
    const payload = message.payload as
      | { certificateId?: unknown; data?: unknown }
      | undefined;
    return (
      typeof payload?.certificateId === "string" &&
      payload.certificateId.trim().length > 0 &&
      typeof payload.data === "string" &&
      payload.data.length > 0
    );
  }

  return true;
};

export const isEimzoBridgeResponse = (
  value: unknown,
): value is EimzoBridgeResponse => {
  if (!value || typeof value !== "object") return false;
  const message = value as Partial<EimzoBridgeResponse>;
  if (
    typeof message.id !== "string" ||
    (message.type !== "EIMZO_SUCCESS" && message.type !== "EIMZO_ERROR")
  ) {
    return false;
  }
  return typeof message.action === "string";
};
