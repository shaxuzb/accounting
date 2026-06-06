import { toast, type ToastOptions } from "react-toastify";
const toastConfig: ToastOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "light",
};

export const notifySuccess = (message: string) => {
  toast.success(message, toastConfig);
};

export const notifyError = (message: string) => {
  toast.error(message, toastConfig);
};

export const notifyWarning = (message: string) => {
  toast.warning(message, toastConfig);
};
