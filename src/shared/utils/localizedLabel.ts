import type { Lang } from "@/store/features/langSlice";

type LocalizedRecord = Record<string, unknown>;

const LANGUAGE_KEYS: Record<Lang, string[]> = {
  uz: ["uz", "uzbek", "nameUz", "nameUZ", "uzName", "name_uz", "titleUz", "labelUz"],
  ru: ["ru", "russian", "nameRu", "nameRU", "ruName", "name_ru", "titleRu", "labelRu"],
  en: ["en", "english", "nameEn", "nameEN", "enName", "name_en", "titleEn", "labelEn"],
};

const toText = (value: unknown): string =>
  typeof value === "string" || typeof value === "number" ? String(value).trim() : "";

/** Returns the best label for an API option in the currently selected UI language. */
export const getLocalizedLabel = (
  item: object,
  lang: Lang,
  fallbackKeys: string[] = ["name", "title", "label", "code"],
) => {
  const record = item as LocalizedRecord;
  for (const key of [...LANGUAGE_KEYS[lang], ...fallbackKeys]) {
    const value = toText(record[key]);
    if (value) return value;
  }
  return "";
};
