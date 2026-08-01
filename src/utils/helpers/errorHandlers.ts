import { AxiosError } from "axios";
import toast from "react-hot-toast";
import i18n from "@/config/i18n";

export const errorHandlers = (err: unknown): void => {
  if (err instanceof AxiosError) {
    toast.error(
      err.response?.data?.detail || err.response?.data?.message || err.message
    );
  } else if (err instanceof Error) {
    toast.error(err.message);
    
  } else {
    toast.error(i18n.t("error.unknown"));
  }
  return;
};


