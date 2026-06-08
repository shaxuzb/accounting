import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { store } from "@/store/store";
import { logout } from "@/store/features/authSlice";

const baseURL = `${import.meta.env.VITE_API_BASE_URL_PATH ?? ""}/api`;

export const $axiosPrivate = axios.create({ baseURL, timeout: 50000 });
export const $axiosPublic = axios.create({ baseURL, timeout: 50000 });

$axiosPrivate.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const login = JSON.parse(localStorage.getItem("login") || "null");
  const token = login?.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;

  const orgId = localStorage.getItem("org") || login?.user?.organizationId;
  if (orgId) config.headers["X-Organization-Id"] = String(orgId);

  return config;
});

$axiosPrivate.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      store.dispatch(logout());
      window.location.replace("/login");
    }
    return Promise.reject(error);
  },
);

export default $axiosPrivate;
