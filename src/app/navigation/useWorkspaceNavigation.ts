import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  useLocation,
  useMatches,
  useNavigate,
  type UIMatch,
  resolvePath,
} from "react-router";
import { useTranslation } from "react-i18next";
import {
  clearTabs,
  removeTab,
  setActiveTab,
  upsertTab,
  type TabItem,
} from "@/store/features/tabListSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

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
): string =>
  typeof title === "function"
    ? title(params)
    : title ?? "";

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
      return normalizePath(
        resolvePath(
          handle.backTo,
          match.pathname,
        ).pathname,
      );
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
  const normalizedPath = normalizePath(pathname);
  const reverseMatches = [...matches].reverse();
  const activeMatch =
    reverseMatches.find((match) => hasRelevantHandle(match.handle)) ?? null;

  if (!activeMatch) {
    return {
      match: null,
      handle: null,
      key: normalizedPath,
      title: "",
      suffix: undefined,
      path: normalizedPath,
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
    explicitType === "auto" || explicitType === "manual" ? explicitType === "auto" : Boolean(activeHandle.showBack);
  const parentPath = isWorkspace
    ? resolveParentPath(
        activeMatch,
        activeHandle,
        activeMatch.pathname,
      )
    : null;
  const parentKey = parentPath ? parentPath : undefined;

  return {
    match: activeMatch,
    handle: activeHandle,
    key: normalizedPath,
    title: title,
    suffix,
    path: normalizedPath,
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
  const path = normalizePath(location.pathname);
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

  useEffect(() => {
    if (
      activeTabKey &&
      activeTabKey !== previousActiveTabKey.current
    ) {
      previousActiveTabKey.current = activeTabKey;
    }
  }, [activeTabKey]);

  const syncFromCurrentRoute = useCallback(() => {
    if (skipNextSyncFromCurrentRoute.current) {
      skipNextSyncFromCurrentRoute.current = false;
      return;
    }

    if (!routeContext.match || !routeContext.isWorkspace) {
      return;
    }

    const payload: TabItem = {
      key: routeContext.key,
      title: routeContext.title || routeContext.path,
      path: routeContext.path,
      suffix: routeContext.suffix,
      parentPath: routeContext.parentPath ?? undefined,
      parentKey: routeContext.parentKey,
      isPinned: undefined,
    };

    const existingTab = tabs.find((tab) => tab.key === payload.key);
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
        dispatch(setActiveTab(routeContext.key));
      }
      return;
    }

    dispatch(upsertTab(payload));
    dispatch(setActiveTab(routeContext.key));
  }, [dispatch, routeContext, activeTabKey, tabs]);

  const activateWorkspace = useCallback(
    (tabKey: string) => {
      const targetTab = tabs.find((tab) => tab.key === tabKey);
      if (!targetTab) return;

      dispatch(setActiveTab(tabKey));
      if (normalizePath(targetTab.path) !== path) {
        navigate(targetTab.path, { replace: true });
      }
    },
    [dispatch, navigate, path, tabs],
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
      let nextTarget = existingTabs.find((tab) => tab.key === previousActiveTabKey.current);

      if (!nextTarget && closingTab.parentPath) {
        const parentMatch =
          existingTabs.find(
            (tab) => tab.key === closingTab.parentKey || tab.path === closingTab.parentPath,
          ) ?? null;
        if (parentMatch) {
          nextTarget = parentMatch;
          if (normalizePath(path) !== normalizePath(parentMatch.path)) {
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
      dispatch(removeTab(tabKey));
    },
    [dispatch],
  );

  const clearWorkspaces = useCallback(() => {
    skipNextSyncFromCurrentRoute.current = true;
    dispatch(clearTabs());
    dispatch(setActiveTab(null));
  }, [dispatch]);

  const goBack = useCallback(() => {
    if (!routeContext.isWorkspace || !routeContext.showBack || !routeContext.parentPath) {
      return false;
    }

    navigate(routeContext.parentPath, { replace: true });
    return true;
  }, [navigate, routeContext.isWorkspace, routeContext.parentPath, routeContext.showBack]);

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
