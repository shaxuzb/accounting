import { AxiosError } from "axios";
import toast from "react-hot-toast";

export const errorHandlers = (err: unknown): void => {
  if (err instanceof AxiosError) {
    toast.error(
      err.response?.data?.detail || err.response?.data?.message || err.message
    );
  } else if (err instanceof Error) {
    toast.error(err.message);
    
  } else {
    toast.error("Unknown error occurred");
  }
  return;
};


