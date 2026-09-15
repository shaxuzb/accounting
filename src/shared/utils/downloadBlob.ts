/**
 * Serverdan blob sifatida kelgan faylni foydalanuvchiga saqlatadi.
 *
 * Eksport endpointlari faylni `Content-Disposition` sarlavhasi bilan qaytaradi,
 * lekin `$axiosPrivate` Authorization sarlavhasini qo'yishi kerakligi uchun
 * oddiy `<a href>` bilan ochib bo'lmaydi: javob blob sifatida olinadi va shu
 * yerda vaqtinchalik object URL orqali saqlanadi.
 */
export const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

/**
 * `Content-Disposition` dan fayl nomini oladi. RFC 5987 ko'rinishidagi
 * `filename*=UTF-8''...` birinchi o'rinda tekshiriladi, chunki kirill yoki
 * o'zbek harflari faqat o'sha yerda to'g'ri keladi.
 */
export const fileNameFromContentDisposition = (
  header: unknown,
  fallback: string,
): string => {
  if (typeof header !== "string") return fallback;

  const encoded = /filename\*=(?:UTF-8|utf-8)''([^;]+)/i.exec(header)?.[1];
  if (encoded) {
    try {
      return decodeURIComponent(encoded.trim());
    } catch {
      // Noto'g'ri kodlangan sarlavha faylni yuklab olishga to'sqinlik qilmasin.
    }
  }

  const plain = /filename="?([^";]+)"?/i.exec(header)?.[1];
  return plain?.trim() || fallback;
};
