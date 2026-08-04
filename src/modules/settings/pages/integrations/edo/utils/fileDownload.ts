import type { EdoDownloadedFile } from "../types/type";

export const saveDownloadedEdoFile = (file: EdoDownloadedFile) => {
  const url = URL.createObjectURL(file.blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = file.fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};
