import { $axiosPrivate } from "./AxiosService";

export const imageService = {
  upload: (file: File) => {
    const data = new FormData();
    data.append("file", file);
    return $axiosPrivate
      .post<{ id: string; url: string }>("/files/upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => res.data);
  },
  url: (id: string) => `${import.meta.env.VITE_API_BASE_URL_PATH ?? ""}/api/files/${id}`,
};
