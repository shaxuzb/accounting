import type { TabItem } from "@/store/features/tabListSlice";

export type PersistedTabs = {
  tabs: TabItem[];
  activeTabKey: string | null;
};

const emptyPersistedTabs = (): PersistedTabs => ({
  tabs: [],
  activeTabKey: null,
});

const isPersistedTab = (value: unknown): value is TabItem => {
  if (!value || typeof value !== "object") return false;

  const tab = value as Partial<TabItem>;
  return (
    typeof tab.key === "string" &&
    tab.key.length > 0 &&
    typeof tab.path === "string" &&
    tab.path.length > 0 &&
    typeof tab.title === "string" &&
    tab.title.length > 0 &&
    (typeof tab.isPinned === "undefined" || typeof tab.isPinned === "boolean")
  );
};

export const sanitizePersistedTabs = (value: unknown): PersistedTabs => {
  if (!value || typeof value !== "object") {
    return emptyPersistedTabs();
  }

  const candidate = value as Partial<PersistedTabs>;
  if (!Array.isArray(candidate.tabs)) {
    return emptyPersistedTabs();
  }

  const seenKeys = new Set<string>();
  const tabs = candidate.tabs.filter((tab): tab is TabItem => {
    if (!isPersistedTab(tab) || seenKeys.has(tab.key)) return false;
    seenKeys.add(tab.key);
    return true;
  });

  const activeTabKey =
    typeof candidate.activeTabKey === "string" &&
    tabs.some((tab) => tab.key === candidate.activeTabKey)
      ? candidate.activeTabKey
      : null;

  return { tabs, activeTabKey };
};

const getSessionStorage = (): Storage | null => {
  try {
    return typeof window === "undefined" ? null : window.sessionStorage;
  } catch {
    return null;
  }
};

export const readPersistedTabs = (
  storageKey: string,
  storage: Storage | null = getSessionStorage(),
): PersistedTabs => {
  if (!storage) return emptyPersistedTabs();

  try {
    const rawTabs = storage.getItem(storageKey);
    return rawTabs
      ? sanitizePersistedTabs(JSON.parse(rawTabs))
      : emptyPersistedTabs();
  } catch {
    return emptyPersistedTabs();
  }
};

export const writePersistedTabs = (
  storageKey: string,
  tabs: PersistedTabs,
  storage: Storage | null = getSessionStorage(),
): void => {
  if (!storage) return;

  try {
    storage.setItem(storageKey, JSON.stringify(tabs));
  } catch {
    // Storage quota or privacy mode must not break workspace navigation.
  }
};
