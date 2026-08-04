const encodeUtf8ToBase64 = (value: string) => {
  const bytes = new TextEncoder().encode(value);
  const chunkSize = 0x8000;
  let binary = "";

  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }

  return window.btoa(binary);
};

export const getEimzoSigningDataBase64 = (
  payload: string,
  payloadFormat?: string,
) => {
  const normalizedFormat = payloadFormat
    ?.replace(/[-_\s]/g, "")
    .toLowerCase();

  if (normalizedFormat === "base64") {
    return payload.replace(/\s/g, "");
  }

  return encodeUtf8ToBase64(payload);
};
