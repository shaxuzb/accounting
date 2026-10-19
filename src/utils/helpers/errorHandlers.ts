import { AxiosError } from "axios";
import toast from "react-hot-toast";
import i18n from "@/config/i18n";

export const errorHandlers = (err: unknown): void => {
  if (err instanceof AxiosError) {
    if (err.response?.data?.title === "IntegrationUnauthorized") return;
    toast.error(
      err.response?.data?.detail || err.response?.data?.message || err.message,
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


