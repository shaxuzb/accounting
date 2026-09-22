// Backend mahsulot guruhidan bo'sh bo'lmagan, noyob `code` talab qiladi
// (ProductGroupBaseDtoValidator), lekin bu maydon UI'ning hech qayerida
// ko'rsatilmaydi. Shuning uchun yangi guruh uchun kod avtomatik yaratiladi:
// vaqt belgisi + tasodifiy qism, jami 100 belgidan ancha qisqa.
const randomPart = () =>
  Math.random().toString(36).slice(2, 6).toUpperCase().padEnd(4, "0");

export const buildProductGroupCode = (prefix = "PG") =>
  `${prefix}-${Date.now().toString(36).toUpperCase()}-${randomPart()}`;
