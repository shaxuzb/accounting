interface CapiWsSignatureResponse {
  success?: boolean;
  reason?: string;
  pkcs7_64?: string;
  signature_hex?: string;
}

interface CapiWsClient {
  callFunction: (
    request: {
      plugin: "pkcs7";
      name: "create_pkcs7";
      arguments: [string, string, "no"];
    },
    success: (event: unknown, response: CapiWsSignatureResponse) => void,
    failure: (error: unknown) => void,
  ) => void;
}

type EimzoGlobal = typeof globalThis & {
  CAPIWS?: CapiWsClient;
};

export interface EimzoSignatureResult {
  preparedPkcs7: string;
  signatureHex: string;
}

const toError = (cause: unknown, fallback: string) => {
  if (cause instanceof Error) return cause;
  if (typeof cause === "string" && cause) return new Error(cause);
  return new Error(fallback);
};

export const createEimzoSignature = (
  keyId: string,
  dataBase64: string,
): Promise<EimzoSignatureResult> =>
  new Promise((resolve, reject) => {
    const capiws = (globalThis as EimzoGlobal).CAPIWS;
    if (!capiws) {
      reject(new Error("E-IMZO SDK ishga tushmagan"));
      return;
    }

    capiws.callFunction(
      {
        plugin: "pkcs7",
        name: "create_pkcs7",
        arguments: [dataBase64, keyId, "no"],
      },
      (_event, response) => {
        if (!response.success) {
          reject(toError(response.reason, "E-IMZO imzolashni rad etdi"));
          return;
        }

        if (!response.pkcs7_64 || !response.signature_hex) {
          reject(
            new Error(
              "E-IMZO javobida PKCS7 yoki signatureHex mavjud emas",
            ),
          );
          return;
        }

        resolve({
          preparedPkcs7: response.pkcs7_64,
          signatureHex: response.signature_hex,
        });
      },
      (cause) => reject(toError(cause, "E-IMZO bilan aloqa uzildi")),
    );
  });
