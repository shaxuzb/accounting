import { useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router";
import { hydrateTabs } from "@/store/features/tabListSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { readPersistedTabs, writePersistedTabs } from "./workspaceTabsStorage";
import {
  normalizeWorkspacePath,
  useWorkspaceNavigation,
} from "./useWorkspaceNavigation";

const WorkspaceNavigationManager = () => {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.auth.user?.user?.id ?? 0);
  const organizationId = useAppSelector((state) => state.organization.id);
  const tabs = useAppSelector((state) => state.tabList.tabs);
  const activeTabKey = useAppSelector((state) => state.tabList.activeTabKey);
  const hydratedStorageKey = useAppSelector(
    (state) => state.tabList.hydratedStorageKey,
  );
  const location = useLocation();
  const currentPath = normalizeWorkspacePath(
    `${location.pathname}${location.search}`,
  );
  const previousPathRef = useRef<string | null>(null);
  const { syncFromCurrentRoute } = useWorkspaceNavigation();
  const storageKey = useMemo(
    () => `accounting:pinned-pages:${userId}:${organizationId}`,
    [organizationId, userId],
  );
  useEffect(() => {
    if (hydratedStorageKey === storageKey) return;

    dispatch(
      hydrateTabs({
        ...readPersistedTabs(storageKey),
        storageKey,
      }),
    );
  }, [dispatch, hydratedStorageKey, storageKey]);

  useEffect(() => {
    if (hydratedStorageKey !== storageKey) return;

    syncFromCurrentRoute(previousPathRef.current ?? undefined);
    previousPathRef.current = currentPath;
  }, [
    currentPath,
    hydratedStorageKey,
    storageKey,
    syncFromCurrentRoute,
  ]);

  useEffect(() => {
    if (hydratedStorageKey !== storageKey) return;

    writePersistedTabs(storageKey, { tabs, activeTabKey });
  }, [activeTabKey, hydratedStorageKey, storageKey, tabs]);

  return null;
};

export default WorkspaceNavigationManager;
