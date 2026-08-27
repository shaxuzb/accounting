export const normalizeLookupPhone = (value: string) => {
  const digits = value.replace(/\D/g, "");
  const localDigits =
    digits.length === 12 && digits.startsWith("998")
      ? digits.slice(3)
      : digits.length === 9
        ? digits
        : "";

  if (localDigits.length !== 9) return value.trim();

  return `+998 ${localDigits.slice(0, 2)} ${localDigits.slice(2, 5)}-${localDigits.slice(5, 7)}-${localDigits.slice(7, 9)}`;
};
