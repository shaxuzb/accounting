import { useSyncExternalStore } from "react";

/**
 * Which record's history is open: a document page's header and a list row's menu open it, the
 * drawer mounted once in the layout shows it. By table (a document) or by the list's API resource.
 */
export interface RecordHistoryTarget {
  table?: string;
  resource?: string;
  id: string | number;
  title?: string;
}

let current: RecordHistoryTarget | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

export const openRecordHistory = (target: RecordHistoryTarget) => {
  current = target;
  emit();
};

export const closeRecordHistory = () => {
  current = null;
  emit();
};

export const useRecordHistoryTarget = () =>
  useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => current,
  );
