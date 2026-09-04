export type SearchInnMode = "inn" | "pinfl" | "auto";

export const getSearchInnMaxLength = (mode: SearchInnMode) =>
  mode === "inn" ? 9 : 14;

export const normalizeSearchIdentifier = (value: string, mode: SearchInnMode) =>
  value.replace(/\D/g, "").slice(0, getSearchInnMaxLength(mode));

export const isValidSearchIdentifier = (value: string, mode: SearchInnMode) => {
  const digitsLength = value.replace(/\D/g, "").length;

  if (mode === "inn") return digitsLength === 9;
  if (mode === "pinfl") return digitsLength === 14;
  return digitsLength === 9 || digitsLength === 14;
};
