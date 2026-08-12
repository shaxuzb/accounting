import {
  useCallback,
  useMemo,
  useSyncExternalStore,
  type SetStateAction,
} from "react";
import { useAppSelector } from "@/store/hooks";
import {
  readPersistedValue,
  removePersistedValue,
  scopedStorageKey,
  writePersistedValue,
  type PersistStorage,
} from "./storage";

interface PersistedStateOptions {
  storage?: PersistStorage;
  debounceMs?: number;
}

export const useScopedStorageKey = (namespace: string, scope: string) => {
  const userId = useAppSelector((state) => state.auth.user?.user?.id);
  const organizationId = useAppSelector((state) => state.organization.id);

  return scopedStorageKey(namespace, userId, organizationId, scope);
};

interface PersistedStore<T> {
  getSnapshot: () => T;
  subscribe: (listener: () => void) => () => void;
  set: (value: SetStateAction<T>) => void;
  clear: (value: T) => void;
}

const createStore = <T,>(
  key: string,
  initialValue: T,
  storage: PersistStorage,
  debounceMs: number,
): PersistedStore<T> => {
  let value = readPersistedValue(key, initialValue, storage);
  let timeoutId: number | undefined;
  const listeners = new Set<() => void>();

  const persist = () => {
    writePersistedValue(key, value, storage);
  };

  const schedulePersist = () => {
    if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    if (debounceMs <= 0) {
      persist();
      return;
    }
    timeoutId = window.setTimeout(persist, debounceMs);
  };

  return {
    getSnapshot: () => value,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    set: (nextValue) => {
      const next =
        typeof nextValue === "function"
          ? (nextValue as (previous: T) => T)(value)
          : nextValue;
      if (Object.is(next, value)) return;
      value = next;
      listeners.forEach((listener) => listener());
      schedulePersist();
    },
    clear: (nextValue) => {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      removePersistedValue(key, storage);
      value = nextValue;
      listeners.forEach((listener) => listener());
    },
  };
};

export const usePersistedState = <T,>(
  key: string,
  initialValue: T,
  options: PersistedStateOptions = {},
) => {
  const { storage = "session", debounceMs = 250 } = options;
  const store = useMemo(() => {
    return createStore(key, initialValue, storage, debounceMs);
  // The first value is only used when this scoped store is created. Keeping the
  // store stable prevents a new object default from resetting state each render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounceMs, key, storage]);
  const value = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot,
  );
  const setValue = useCallback(
    (nextValue: SetStateAction<T>) => store.set(nextValue),
    [store],
  );

  const clear = useCallback(() => {
    store.clear(initialValue);
  }, [initialValue, store]);

  return [value, setValue, clear] as const;
};
