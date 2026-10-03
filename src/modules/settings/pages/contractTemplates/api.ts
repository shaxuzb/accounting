import { $axiosPrivate } from "@/services/AxiosService";
import { fileNameFromContentDisposition } from "@/shared/utils/downloadBlob";
import { contractTemplateEndpoints as endpoints } from "./constants";
import type {
  ContractTemplate,
  ContractTemplateEditor,
  ContractTemplateDocumentRenderPayload,
  ContractTemplateKeyGroup,
  ContractTemplateSaved,
} from "./types";

export interface ContractTemplateForm {
  name: string;
  kind: string;
  isDefault: boolean;
  file?: File | null;
}

const toFile = (res: { data: Blob; headers: Record<string, unknown> }, fallback: string) => ({
  blob: res.data,
  fileName: fileNameFromContentDisposition(
    res.headers["content-disposition"] as string | undefined,
    fallback,
  ),
});

export const contractTemplateService = {
  list: (params?: { kind?: string; search?: string }) =>
    $axiosPrivate
      .get<ContractTemplate[]>(endpoints.list, { params })
      .then((res) => res.data),
  keys: () =>
    $axiosPrivate
      .get<ContractTemplateKeyGroup[]>(endpoints.keys)
      .then((res) => res.data),
  create: ({ name, kind, isDefault, file }: ContractTemplateForm) => {
    const form = new FormData();
    form.append("Name", name);
    form.append("Kind", kind);
    form.append("IsDefault", String(isDefault));
    if (file) form.append("File", file);
    return $axiosPrivate
      .post<ContractTemplateSaved>(endpoints.list, form)
      .then((res) => res.data);
  },
  update: (id: number, payload: Omit<ContractTemplateForm, "file">) =>
    $axiosPrivate.put(endpoints.item(id), payload).then((res) => res.data),
  replaceFile: (id: number, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return $axiosPrivate
      .put<ContractTemplateSaved>(endpoints.file(id), form)
      .then((res) => res.data);
  },
  remove: (id: number) =>
    $axiosPrivate.delete(endpoints.item(id)).then((res) => res.data),
  download: (id: number, fallback: string) =>
    $axiosPrivate
      .get<Blob>(endpoints.file(id), { responseType: "blob" })
      .then((res) => toFile(res, fallback)),
  unknownKeys: (id: number) =>
    $axiosPrivate
      .get<string[]>(endpoints.unknownKeys(id))
      .then((res) => res.data),
  editor: (id: number | string) =>
    $axiosPrivate
      .get<ContractTemplateEditor>(endpoints.editor(id))
      .then((res) => res.data),
  saveEditor: (id: number, key: string) =>
    $axiosPrivate
      .post<{ saved: boolean }>(endpoints.editorSave(id), { key }, { timeout: 60_000 })
      .then((res) => res.data),
  discardEditor: (id: number, key: string) =>
    $axiosPrivate.post(endpoints.editorDiscard(id), { key }).then((res) => res.data),
  preview: (id: number) =>
    $axiosPrivate
      .get<Blob>(endpoints.preview(id), { responseType: "blob" })
      .then((res) => res.data),
  renderDocument: (id: number, payload: ContractTemplateDocumentRenderPayload) =>
    $axiosPrivate
      .post<Blob>(endpoints.renderDocument(id), payload, { responseType: "blob" })
      .then((res) =>
        toFile(res, payload.format === "pdf" ? "shartnoma.pdf" : "shartnoma.docx"),
      ),
};
