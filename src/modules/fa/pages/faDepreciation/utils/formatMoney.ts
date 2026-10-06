export const formatMoney = (value?: number | null) =>
  Number(value ?? 0).toLocaleString("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
