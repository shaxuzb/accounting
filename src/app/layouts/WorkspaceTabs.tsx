import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  hydrateTabs,
  removeTab,
  setActiveTab,
  type TabItem,
} from "@/store/features/tabListSlice";
import { cn } from "@/utils/utils";
import { Button, Dropdown } from "antd";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  List,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";

type PersistedTabs = {
  tabs: TabItem[];
  activeTabKey: string | null;
};

const normalizePath = (pathname: string) =>
  pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;

const findActiveTabKey = (tabs: TabItem[], pathname: string) => {
  const normalizedPathname = normalizePath(pathname);

  return (
    tabs
      .filter(
        (tab) =>
          normalizedPathname === tab.key ||
          normalizedPathname.startsWith(`${tab.key}/`),
      )
      .sort((firstTab, secondTab) => secondTab.key.length - firstTab.key.length)
      .at(0)?.key ?? null
  );
};

const isPersistedTabs = (value: unknown): value is PersistedTabs => {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<PersistedTabs>;
  return (
    Array.isArray(candidate.tabs) &&
    candidate.tabs.every(
      (tab) =>
        !!tab &&
        typeof tab.key === "string" &&
        typeof tab.path === "string" &&
        typeof tab.title === "string",
    ) &&
    (candidate.activeTabKey === null ||
      typeof candidate.activeTabKey === "string")
  );
};

const WorkspaceTabs = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const tabs = useAppSelector((state) => state.tabList.tabs);
  const activeTabKey = useAppSelector((state) => state.tabList.activeTabKey);
  const userId = useAppSelector((state) => state.auth.user?.user?.id ?? 0);
  const organizationId = useAppSelector((state) => state.organization.id);
  const tabsViewportRef = useRef<HTMLDivElement | null>(null);
  const tabElementsRef = useRef(new Map<string, HTMLDivElement>());
  const hydratedStorageKeyRef = useRef<string | null>(null);
  const skipNextPersistenceRef = useRef(false);
  const skipNextRouteSyncRef = useRef(false);
  const [initialPathname] = useState(location.pathname);

  const storageKey = useMemo(
    () => `accounting:pinned-pages:${userId}:${organizationId}`,
    [organizationId, userId],
  );

  useEffect(() => {
    let restoredTabs: PersistedTabs = {
      tabs: [],
      activeTabKey: null,
    };

    try {
      const rawTabs = sessionStorage.getItem(storageKey);
      if (rawTabs) {
        const parsedTabs = JSON.parse(rawTabs) as unknown;
        if (isPersistedTabs(parsedTabs)) {
          restoredTabs = parsedTabs;
        }
      }
    } catch {
      // Invalid or unavailable session storage must not block navigation.
    }

    skipNextPersistenceRef.current = true;
    skipNextRouteSyncRef.current = true;
    hydratedStorageKeyRef.current = storageKey;
    dispatch(
      hydrateTabs({
        tabs: restoredTabs.tabs,
        activeTabKey: findActiveTabKey(restoredTabs.tabs, initialPathname),
      }),
    );
  }, [dispatch, initialPathname, storageKey]);

  useEffect(() => {
    if (hydratedStorageKeyRef.current !== storageKey) return;
    if (skipNextRouteSyncRef.current) {
      skipNextRouteSyncRef.current = false;
      return;
    }

    const nextActiveTabKey = findActiveTabKey(tabs, location.pathname);
    if (nextActiveTabKey !== activeTabKey) {
      dispatch(setActiveTab(nextActiveTabKey));
    }
  }, [activeTabKey, dispatch, location.pathname, storageKey, tabs]);

  useEffect(() => {
    if (hydratedStorageKeyRef.current !== storageKey) return;
    if (skipNextPersistenceRef.current) {
      skipNextPersistenceRef.current = false;
      return;
    }

    try {
      sessionStorage.setItem(
        storageKey,
        JSON.stringify({ tabs, activeTabKey } satisfies PersistedTabs),
      );
    } catch {
      // Storage quota or privacy mode should not break workspace tabs.
    }
  }, [activeTabKey, storageKey, tabs]);

  useEffect(() => {
    const activeTabElement = activeTabKey
      ? tabElementsRef.current.get(activeTabKey)
      : null;

    activeTabElement?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  }, [activeTabKey]);

  const openTab = useCallback(
    (tab: TabItem) => {
      dispatch(setActiveTab(tab.key));
      navigate(tab.path);
    },
    [dispatch, navigate],
  );

  const closeTab = useCallback(
    (tabKey: string) => {
      const closingTabIndex = tabs.findIndex((tab) => tab.key === tabKey);
      if (closingTabIndex < 0) return;

      const isClosingActiveTab = activeTabKey === tabKey;
      const nextTab =
        tabs[closingTabIndex + 1] ?? tabs[closingTabIndex - 1] ?? null;

      dispatch(removeTab(tabKey));

      if (isClosingActiveTab && nextTab) {
        dispatch(setActiveTab(nextTab.key));
        navigate(nextTab.path, { replace: true });
      } else if (isClosingActiveTab) {
        navigate("/main", { replace: true });
      }
    },
    [activeTabKey, dispatch, navigate, tabs],
  );

  const scrollTabs = useCallback((direction: -1 | 1) => {
    tabsViewportRef.current?.scrollBy({
      left: direction * 280,
      behavior: "smooth",
    });
  }, []);

  const dropdownItems = tabs.map((tab) => ({
    key: tab.key,
    icon:
      activeTabKey === tab.key ? (
        <Check className="size-4 text-brand" />
      ) : (
        <FileText className="size-4 text-secondary-text" />
      ),
    label: (
      <span className="inline-flex max-w-64 items-center gap-1">
        <span className="truncate">{t(tab.title)}</span>
        {tab.suffix && (
          <span className="shrink-0 text-secondary-text">{tab.suffix}</span>
        )}
      </span>
    ),
    onClick: () => openTab(tab),
  }));

  if (!tabs.length) return null;

  return (
    <div className="flex h-11 shrink-0 border-b border-border bg-surface-muted">
      <div
        ref={tabsViewportRef}
        className="min-w-0 flex-1 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex h-full w-max items-center gap-1 px-2">
          {tabs.map((tab) => {
            const isActive = tab.key === activeTabKey;

            return (
              <div
                key={tab.key}
                ref={(element) => {
                  if (element) {
                    tabElementsRef.current.set(tab.key, element);
                  } else {
                    tabElementsRef.current.delete(tab.key);
                  }
                }}
                className={cn(
                  "flex h-9 min-w-36 max-w-56 shrink-0 items-center rounded-lg border transition-colors duration-150",
                  isActive
                    ? "border-brand bg-brand-soft text-brand shadow-sm"
                    : "border-border bg-primary-bg text-secondary-text hover:border-brand hover:bg-surface-hover hover:text-text",
                )}
              >
                <button
                  type="button"
                  onClick={() => openTab(tab)}
                  onAuxClick={(event) => {
                    if (event.button === 1) closeTab(tab.key);
                  }}
                  className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2 text-left text-sm outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset"
                >
                  <FileText className="size-4 shrink-0" />
                  <span className="truncate font-medium">{t(tab.title)}</span>
                  {tab.suffix && (
                    <span className="shrink-0 text-xs text-secondary-text">
                      {tab.suffix}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  aria-label="Tabni yopish"
                  onClick={() => closeTab(tab.key)}
                  className="mr-1 rounded p-1 text-secondary-text outline-none hover:bg-surface-hover hover:text-text focus-visible:ring-2 focus-visible:ring-brand"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex shrink-0 items-center border-l border-border bg-surface-muted px-1">
        <Button
          type="text"
          size="small"
          aria-label="Tablarni chapga surish"
          icon={<ChevronLeft className="size-4" />}
          onClick={() => scrollTabs(-1)}
        />
        <Button
          type="text"
          size="small"
          aria-label="Tablarni o‘ngga surish"
          icon={<ChevronRight className="size-4" />}
          onClick={() => scrollTabs(1)}
        />
        <Dropdown menu={{ items: dropdownItems }} trigger={["click"]}>
          <Button
            type="text"
            size="small"
            aria-label="Barcha ochiq tablar"
            icon={<List className="size-4" />}
          />
        </Dropdown>
      </div>
    </div>
  );
};

export default WorkspaceTabs;
