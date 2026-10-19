import { AxiosError } from "axios";
import toast from "react-hot-toast";
import i18n from "@/config/i18n";

/**
 * The messages of a validation problem («errors»: field → messages): the general detail alone
 * («One or more validation errors occurred») does not say what to fix.
 */
export const validationMessages = (data: unknown): string[] => {
  const errors = (data as { errors?: Record<string, unknown> } | undefined)?.errors;
  if (!errors || typeof errors !== "object") return [];
  return Object.values(errors)
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .filter((value): value is string => typeof value === "string" && value.length > 0);
};

export const errorHandlers = (err: unknown): void => {
  if (err instanceof AxiosError) {
    if (err.response?.data?.title === "IntegrationUnauthorized") return;
    const details = validationMessages(err.response?.data);
    toast.error(
      details.length > 0
        ? details.slice(0, 5).join(" · ")
        : err.response?.data?.detail || err.response?.data?.message || err.message,
      // a refusal is read, not glanced at: it stays longer than the default 4 s
      { duration: 8000 }
    );
  } else if (err instanceof Error) {
    toast.error(err.message, { duration: 8000 });
    
  } else {
    toast.error(i18n.t("error.unknown"));
  }
  return;
};


