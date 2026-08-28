import { useCallback, useMemo, useRef } from "react";
import {
  useLocation,
  useMatches,
  useNavigate,
  useNavigationType,
  type UIMatch,
  resolvePath,
} from "react-router";
import { useTranslation } from "react-i18next";
import {
  clearTabs,
  removeTab,
  setActiveTab,
  unpinTab,
  upsertTab,
  type TabItem,
} from "@/store/features/tabListSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getNavigationSourceTab } from "./backNavigation";

type WorkspaceTitle =
  | string
  | ((params: Record<string, string | undefined>) => string);

type WorkspaceHandle = {
  title?: WorkspaceTitle;
  showBack?: boolean;
  backTo?: string;
  hideNavbarTitle?: boolean;
  tabSuffix?: string;
  workspace?: {
    type?: "root" | "document" | "page" | (string & {});
    tabBehavior?: "manual" | "auto" | (string & {});
    parentPath?: string;
    parentRoute?: string;
    key?: string;
  };
};

export type WorkspaceRouteContext = {
  match: UIMatch | null;
  handle: WorkspaceHandle | null;
  key: string;
  title: string;
  suffix?: string;
  path: string;
  parentPath: string | null;
  parentKey?: string;
  isWorkspace: boolean;
  showBack: boolean;
};

export const normalizePath = (pathname: string): string => {
  const basePath = pathname.split("?")[0].split("#")[0];
  if (!basePath) return "/";

  if (basePath === "/") return "/";
  if (basePath.length === 1) return "/";

  return basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
};

const normalizeSearch = (search: string): string => {
  const query = search.startsWith("?") ? search.slice(1) : search;
  if (!query) return "";

  const params = [...new URLSearchParams(query).entries()].sort(
    ([leftKey, leftValue], [rightKey, rightValue]) =>
      leftKey.localeCompare(rightKey) || leftValue.localeCompare(rightValue),
  );

  return params.length ? `?${new URLSearchParams(params).toString()}` : "";
};

export const normalizeWorkspacePath = (value: string): string => {
  const [pathAndSearch] = value.split("#");
  const queryIndex = pathAndSearch.indexOf("?");
  const pathname =
    queryIndex === -1 ? pathAndSearch : pathAndSearch.slice(0, queryIndex);
  const search = queryIndex === -1 ? "" : pathAndSearch.slice(queryIndex);

  return `${normalizePath(pathname)}${normalizeSearch(search)}`;
};

const hasRelevantHandle = (value: unknown): value is WorkspaceHandle => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const handle = value as Partial<WorkspaceHandle>;
  return (
    typeof handle.title !== "undefined" ||
    typeof handle.showBack !== "undefined" ||
    typeof handle.backTo !== "undefined" ||
    typeof handle.hideNavbarTitle !== "undefined" ||
    typeof handle.workspace !== "undefined"
  );
};

const resolveWorkspaceTitle = (
  title: WorkspaceHandle["title"],
  params: Record<string, string | undefined>,
): string => (typeof title === "function" ? title(params) : (title ?? ""));

const deriveSuffixFromParams = (
  params: Record<string, string | undefined>,
): string | undefined =>
  Object.values(params)
    .filter((value): value is string => Boolean(value))
    .at(-1);

const resolveTabSuffix = (
  handle: WorkspaceHandle,
  params: Record<string, string | undefined>,
  search: string,
): string | undefined => {
  if (handle.tabSuffix) {
    const searchParams = new URLSearchParams(search);
    const querySuffix = searchParams.get(handle.tabSuffix);
    if (querySuffix) {
      return querySuffix;
    }

    const paramSuffix = params[handle.tabSuffix];
    if (paramSuffix) {
      return paramSuffix;
    }
  }

  return deriveSuffixFromParams(params);
};

const resolveParentPath = (
  match: UIMatch,
  handle: WorkspaceHandle,
  fallbackPath: string,
): string | null => {
  if (handle.workspace?.parentPath) {
    return normalizePath(handle.workspace.parentPath);
  }

  if (handle.backTo) {
    return normalizePath(resolvePath(handle.backTo, match.pathname).pathname);
  }

  if (handle.workspace?.parentRoute) {
    return normalizePath(
      resolvePath(handle.workspace.parentRoute, fallbackPath).pathname,
    );
  }

  const fallback = normalizePath(fallbackPath);
  const trimIndex = fallback.lastIndexOf("/");
  if (trimIndex < 1) {
    return null;
  }

  return normalizePath(fallback.slice(0, trimIndex));
};

const getActiveRouteContext = (
  matches: ReturnType<typeof useMatches>,
  pathname: string,
  search: string,
): WorkspaceRouteContext => {
  const workspacePath = normalizeWorkspacePath(`${pathname}${search}`);
  const reverseMatches = [...matches].reverse();
  const activeMatch =
    reverseMatches.find((match) => hasRelevantHandle(match.handle)) ?? null;

  if (!activeMatch) {
    return {
      match: null,
      handle: null,
      key: workspacePath,
      title: "",
      suffix: undefined,
      path: workspacePath,
      parentPath: null,
      isWorkspace: false,
      showBack: false,
    };
  }

  const activeHandle = activeMatch.handle as WorkspaceHandle;
  const title = resolveWorkspaceTitle(activeHandle.title, activeMatch.params);
  const suffix = resolveTabSuffix(activeHandle, activeMatch.params, search);
  const explicitType = activeHandle.workspace?.tabBehavior;
  const isWorkspace =
    explicitType === "auto" || explicitType === "manual"
      ? explicitType === "auto"
      : Boolean(activeHandle.showBack);
  const parentPath = isWorkspace
    ? resolveParentPath(activeMatch, activeHandle, activeMatch.pathname)
    : null;
  const parentKey = parentPath ? parentPath : undefined;

  return {
    match: activeMatch,
    handle: activeHandle,
    key: workspacePath,
    title: title,
    suffix,
    path: workspacePath,
    parentPath,
    parentKey,
    isWorkspace,
    showBack: Boolean(activeHandle.showBack && parentPath),
  };
};

export const useWorkspaceNavigation = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const matches = useMatches();
  const navigationType = useNavigationType();
  const path = normalizeWorkspacePath(`${location.pathname}${location.search}`);
  const tabs = useAppSelector((state) => state.tabList.tabs);
  const activeTabKey = useAppSelector((state) => state.tabList.activeTabKey);
  const previousActiveTabKey = useRef<string | null>(null);
  const skipNextSyncFromCurrentRoute = useRef(false);
  const routeContext = useMemo(
    () => getActiveRouteContext(matches, location.pathname, location.search),
    [location.pathname, location.search, matches],
  );
  const sidebarTitle = routeContext.match?.handle
    ? resolveWorkspaceTitle(
        (routeContext.match.handle as WorkspaceHandle).title,
        (routeContext.match.params as Record<string, string | undefined>) ??
          ({} as Record<string, string | undefined>),
      )
    : "";

  const syncFromCurrentRoute = useCallback((previousPath?: string) => {
    if (skipNextSyncFromCurrentRoute.current) {
      skipNextSyncFromCurrentRoute.current = false;
      return;
    }

    if (!routeContext.match) {
      return;
    }

    if (!routeContext.isWorkspace) {
      const existingTab = tabs.find(
        (tab) => normalizeWorkspacePath(tab.path) === path,
      );
      if (existingTab && activeTabKey !== existingTab.key) {
        previousActiveTabKey.current = activeTabKey;
        dispatch(setActiveTab(existingTab.key));
      }
      return;
    }

    const existingTab = tabs.find((tab) => tab.key === routeContext.key);
    const sourceTab = getNavigationSourceTab(
      navigationType,
      previousPath
        ? tabs.find((tab) => normalizeWorkspacePath(tab.path) === previousPath) ??
            { path: previousPath }
        : undefined,
      path,
    );
    const parentPath =
      sourceTab?.path ?? existingTab?.parentPath ?? routeContext.parentPath;
    const parentKey =
      sourceTab?.key ?? existingTab?.parentKey ?? routeContext.parentKey;

    const payload: TabItem = {
      key: routeContext.key,
      title: routeContext.title || routeContext.path,
      path: routeContext.path,
      suffix: routeContext.suffix,
      parentPath: parentPath ?? undefined,
      parentKey,
      isPinned: undefined,
    };

    if (existingTab) {
      if (
        existingTab.path !== payload.path ||
        existingTab.title !== payload.title ||
        existingTab.suffix !== payload.suffix ||
        existingTab.parentPath !== payload.parentPath ||
        existingTab.parentKey !== payload.parentKey
      ) {
        dispatch(
          upsertTab({
            ...existingTab,
            ...payload,
          }),
        );
      }
      if (activeTabKey !== routeContext.key) {
        previousActiveTabKey.current = activeTabKey;
        dispatch(setActiveTab(routeContext.key));
      }
      return;
    }

    dispatch(upsertTab(payload));
    previousActiveTabKey.current = activeTabKey;
    dispatch(setActiveTab(routeContext.key));
  }, [activeTabKey, dispatch, navigationType, path, routeContext, tabs]);

  const activateWorkspace = useCallback(
    (tabKey: string) => {
      const targetTab = tabs.find((tab) => tab.key === tabKey);
      if (!targetTab) return;

      if (activeTabKey && activeTabKey !== tabKey) {
        previousActiveTabKey.current = activeTabKey;
      }
      dispatch(setActiveTab(tabKey));
      if (normalizeWorkspacePath(targetTab.path) !== path) {
        navigate(targetTab.path, { replace: true });
      }
    },
    [activeTabKey, dispatch, navigate, path, tabs],
  );

  const closeWorkspace = useCallback(
    (tabKey: string) => {
      const closingTab = tabs.find((tab) => tab.key === tabKey);
      if (!closingTab) return;

      const closingIndex = tabs.findIndex((tab) => tab.key === tabKey);
      const isClosingActiveTab = activeTabKey === tabKey;

      dispatch(removeTab(tabKey));

      if (!isClosingActiveTab) {
        return;
      }

      const existingTabs = tabs.filter((tab) => tab.key !== tabKey);
      let nextTarget = existingTabs.find(
        (tab) => tab.key === previousActiveTabKey.current,
      );

      if (!nextTarget && closingTab.parentPath) {
        const parentMatch =
          existingTabs.find(
            (tab) =>
              tab.key === closingTab.parentKey ||
              tab.path === closingTab.parentPath,
          ) ?? null;
        if (parentMatch) {
          nextTarget = parentMatch;
          if (path !== normalizeWorkspacePath(parentMatch.path)) {
            dispatch(setActiveTab(parentMatch.key));
            navigate(parentMatch.path, { replace: true });
            return;
          }
        } else {
          dispatch(setActiveTab(null));
          navigate(closingTab.parentPath, { replace: true });
          return;
        }
      }

      if (!nextTarget && existingTabs.length > 0) {
        nextTarget =
          existingTabs[closingIndex] ??
          existingTabs[closingIndex - 1] ??
          existingTabs[0] ??
          null;
      }

      if (nextTarget) {
        dispatch(setActiveTab(nextTarget.key));
        navigate(nextTarget.path, { replace: true });
        return;
      }

      dispatch(setActiveTab(null));
      navigate("/main", { replace: true });
    },
    [activeTabKey, dispatch, navigate, path, tabs],
  );

  const pinWorkspace = useCallback(
    (tab: Omit<TabItem, "isPinned">) => {
      dispatch(
        upsertTab({
          ...tab,
          isPinned: true,
        }),
      );
    },
    [dispatch],
  );

  const unpinWorkspace = useCallback(
    (tabKey: string) => {
      dispatch(unpinTab(tabKey));
    },
    [dispatch],
  );

  const clearWorkspaces = useCallback(() => {
    skipNextSyncFromCurrentRoute.current = true;
    dispatch(clearTabs());
    dispatch(setActiveTab(null));
  }, [dispatch]);

  const goBack = useCallback(() => {
    if (!routeContext.isWorkspace || !routeContext.showBack) {
      return false;
    }

    const currentTab = tabs.find((tab) => tab.key === routeContext.key);
    const parentTab = currentTab?.parentKey
      ? tabs.find((tab) => tab.key === currentTab.parentKey)
      : undefined;

    if (parentTab) {
      dispatch(setActiveTab(parentTab.key));
      navigate(parentTab.path, { replace: true });
      return true;
    }

    const parentPath = currentTab?.parentPath ?? routeContext.parentPath;
    if (!parentPath) {
      return false;
    }

    navigate(parentPath, { replace: true });
    return true;
  }, [
    dispatch,
    navigate,
    routeContext.isWorkspace,
    routeContext.key,
    routeContext.parentPath,
    routeContext.showBack,
    tabs,
  ]);

  const currentTitle = sidebarTitle || "";
  const titleText = t(currentTitle);

  return {
    tabs,
    activeTabKey,
    routeContext,
    currentTitle,
    titleText,
    isBackAvailable: routeContext.showBack,
    hideNavbarTitle: Boolean(routeContext.handle?.hideNavbarTitle),
    syncFromCurrentRoute,
    activateWorkspace,
    closeWorkspace,
    pinWorkspace,
    unpinWorkspace,
    clearWorkspaces,
    goBack,
  };
};
