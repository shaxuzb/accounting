import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { store } from "@/store/store";
import { logout } from "@/store/features/authSlice";

const baseURL = `${import.meta.env.VITE_API_BASE_URL_PATH ?? ""}api`;

export const $axiosPrivate = axios.create({ baseURL, timeout: 50000 });

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



// import { notifyError } from "@/utils/notification";
// import axios from "axios";

// const api = axios.create({
//   baseURL: `${import.meta.env.VITE_API_BASE_URL_PATH ?? ""}/api`,
// });
// api.interceptors.request.use(
//   (config) => {
//     const userData = localStorage.getItem("login");
//     if (userData) {
//       try {
//         const parsed = JSON.parse(userData);
//         // API response strukturasi uchun turli variantlarni tekshiramiz
//         const token = parsed.token || parsed.accessToken || parsed.access_token;
//         if (token) {
//           config.headers.Authorization = `Bearer ${token}`;
//         }
//       } catch (e) {
//         console.error("Token parse qilishda xato:", e);
//       }
//     }

//     config.headers["Content-Type"] = "application/json";
//     return config;
//   },
//   (error) => Promise.reject(error),
// );

// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem("login");
//     }

//     if (error.code === "ERR_NETWORK") {
//       notifyError("Server bilan aloqa uzildi");
//       console.error("Server bilan aloqa uzildi!");
//     }

//     return Promise.reject(error);
//   },
// );
// export default api;

