import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { store } from "@/store/store";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import type { AuthToken } from "@/shared/types";
import { logout } from "@/store/features/authSlice";

const addToken = (config: InternalAxiosRequestConfig) => {
  try {
    const userData = localStorage.getItem("login");
    if (userData) {
      const { token } = JSON.parse(userData) as AuthToken;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (error) {
    errorHandlers(error);
  }
  try {
    const orgData = localStorage.getItem("org");
    console.log(orgData);

    if (orgData) {
      const { id } = JSON.parse(orgData) as { id: number };
      if (id) {
        config.headers["X-Organization-Id"] = id;
      }
    } else {
      const userData = localStorage.getItem("login");
      if (userData) {
        const parsed = JSON.parse(userData) as AuthToken;
        const orgId = parsed?.user?.organizationId;
        if (orgId) {
          config.headers["X-Organization-Id"] = orgId;
        }
      }
    }
  } catch (error) {
    errorHandlers(error);
  }
  return config;
};

const handleResponseError = (error: AxiosError) => {
  if (error.response?.status === 401) {
    store.dispatch(logout());
    window.location.href = "/login";
  }
  return Promise.reject(error);
};

export const $axiosPrivate = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL_PATH + "/api",
  timeout: 50000,
});
export const $axiosPublic = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL_PATH + "/api",
  timeout: 50000,
});
$axiosPrivate.interceptors.request.use(addToken);
$axiosPrivate.interceptors.response.use((res) => res, handleResponseError);
