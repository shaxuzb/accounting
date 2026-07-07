import { $axiosPrivate } from "@/services/AxiosService";

const cleanParams = (params: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      if (value === undefined || value === null || value === "") return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    }),
  );

export const getJson = async <T = unknown>(
  url: string,
  params?: object,
) => {
  const { data } = await $axiosPrivate.get<T>(url, {
    params: cleanParams((params ?? {}) as Record<string, unknown>),
  });
  return data;
};

export const postJson = async <T = unknown>(url: string, body?: unknown) => {
  const { data } = await $axiosPrivate.post<T>(url, body);
  return data;
};
