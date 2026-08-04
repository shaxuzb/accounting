import type { EdoDocumentDto } from "../types/type";

const storageKey = (id: string | number) => `accounting:edo:outbox:${id}`;

export const saveEdoOutboxDocument = (document: EdoDocumentDto) => {
  sessionStorage.setItem(storageKey(document.id), JSON.stringify(document));
};

export const readEdoOutboxDocument = (id: string | number) => {
  try {
    const raw = sessionStorage.getItem(storageKey(id));
    return raw ? (JSON.parse(raw) as EdoDocumentDto) : null;
  } catch {
    return null;
  }
};
