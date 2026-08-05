import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { store } from "@/store/store";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import type { AuthToken } from "@/shared/types";
import { logout } from "@/store/features/authSlice";
import toast from "react-hot-toast";
import i18n from "@/config/i18n";

let isHandlingUnauthorized = false;

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
    const lang = localStorage.getItem("lang");
    const orgData = localStorage.getItem("org");
    const edoOrganizationIdOverride = Number(
      import.meta.env.VITE_EDO_ORGANIZATION_ID_OVERRIDE,
    );
    const shouldOverrideEdoOrganization =
      config.url?.startsWith("/edo/") &&
      Number.isSafeInteger(edoOrganizationIdOverride) &&
      edoOrganizationIdOverride > 0;

    config.headers["X-Language"] = lang ?? "uz";
    if (shouldOverrideEdoOrganization) {
      config.headers["X-OrganizationId"] = edoOrganizationIdOverride;
    } else if (orgData) {
      const { id } = JSON.parse(orgData) as { id: number };
      if (id) {
        config.headers["X-OrganizationId"] = id;
      }
    } else {
      const userData = localStorage.getItem("login");
      if (userData) {
        const parsed = JSON.parse(userData) as AuthToken;
        const orgId = parsed?.user?.organizationId;
        if (orgId) {
          config.headers["X-OrganizationId"] = orgId;
        }
      }
    }
  } catch (error) {
    errorHandlers(error);
  }
  return config;
};

const handleResponseError = (error: AxiosError) => {
  const responseData = error.response?.data as { title?: string } | undefined;
  const isProviderAuthenticationError =
    responseData?.title === "IntegrationUnauthorized";

  if (error.response?.status === 401 && !isProviderAuthenticationError) {
    if (!isHandlingUnauthorized) {
      isHandlingUnauthorized = true;

      toast.error(i18n.t("auth.sessionExpired"), {
        id: "session-expired",
      });

      store.dispatch(logout());

      window.setTimeout(() => {
        isHandlingUnauthorized = false;
      }, 1000);
    }
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
