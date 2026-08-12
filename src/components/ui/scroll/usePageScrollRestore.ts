import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type RefObject,
} from "react";
import { useLocation } from "react-router";

type SavedScrollPosition = {
  path: string;
  top: number;
  left: number;
};

type StoredScrollPosition = {
  updatedAt: number;
  positions: SavedScrollPosition[];
};

type Props = {
  containerRef: RefObject<HTMLElement | null>;
  storageKey?: string;
  scopeKey?: string;
  enabled?: boolean;
  restoreTtl?: number;
};

const RESTORE_ATTEMPTS = 40;
const RESTORE_INTERVAL = 50;
const SAVE_DELAY = 120;
const DEFAULT_TTL = 30 * 60 * 1000;

const SCROLLABLE_SELECTORS = [
  "[data-scroll-restore]",
  ".ant-table-body",
  ".ant-table-content",
  ".ant-table-tbody-virtual-holder",
  ".rc-virtual-list-holder",
];

const getScrollableElements = (root: HTMLElement) => {
  const elements = SCROLLABLE_SELECTORS.flatMap((selector) =>
    Array.from(root.querySelectorAll<HTMLElement>(selector)),
  );

  return [root, ...Array.from(new Set(elements))];
};

const getDomPath = (element: HTMLElement, root: HTMLElement) => {
  const segments: string[] = [];
  let current: HTMLElement | null = element;

  while (current && current !== root) {
    const parent = current.parentElement;
    if (!parent) break;
    const index = Array.from(parent.children).indexOf(current) + 1;
    segments.unshift(`${current.tagName.toLowerCase()}:nth-child(${index})`);
    current = parent;
  }

  return segments.join(" > ");
};

const findByPath = (root: HTMLElement, path: string) => {
  if (!path) return root;
  try {
    return root.querySelector<HTMLElement>(`:scope > ${path}`);
  } catch {
    return null;
  }
};

export const usePageScrollRestore = ({
  containerRef,
  storageKey = "app-page-scroll-position",
  scopeKey,
  enabled = true,
  restoreTtl = DEFAULT_TTL,
}: Props) => {
  const location = useLocation();
  const scopedStorageKey = useMemo(
    () =>
      `${storageKey}:${scopeKey ?? `${location.key}:${location.pathname}${location.search}`}`,
    [
      location.key,
      location.pathname,
      location.search,
      scopeKey,
      storageKey,
    ],
  );

  const latestPositionsRef = useRef<SavedScrollPosition[] | null>(null);

  const collectCurrentScroll = useCallback(() => {
    const root = containerRef.current;
    if (!root) return [];

    return getScrollableElements(root).map((element) => ({
      path: getDomPath(element, root),
      top: element.scrollTop,
      left: element.scrollLeft,
    }));
  }, [containerRef]);

  const writePositions = useCallback(
    (positions: SavedScrollPosition[]) => {
      try {
        sessionStorage.setItem(
          scopedStorageKey,
          JSON.stringify({ updatedAt: Date.now(), positions }),
        );
      } catch {
        // Storage quota or privacy mode should not break page scrolling.
      }
    },
    [scopedStorageKey],
  );

  const saveCurrentScroll = useCallback(() => {
    const positions = collectCurrentScroll();
    latestPositionsRef.current = positions;
    writePositions(positions);
  }, [collectCurrentScroll, writePositions]);

  const flushLatestScroll = useCallback(() => {
    const positions = latestPositionsRef.current ?? collectCurrentScroll();
    writePositions(positions);
  }, [collectCurrentScroll, writePositions]);

  const updateLatestPosition = useCallback(
    (element: HTMLElement) => {
      const root = containerRef.current;
      if (!root) return;

      const path = getDomPath(element, root);
      const positions = latestPositionsRef.current ?? [];
      const existingPosition = positions.find((position) => position.path === path);
      if (existingPosition) {
        existingPosition.top = element.scrollTop;
        existingPosition.left = element.scrollLeft;
      } else {
        positions.push({
          path,
          top: element.scrollTop,
          left: element.scrollLeft,
        });
      }
      latestPositionsRef.current = positions;
    },
    [containerRef],
  );

  useEffect(() => {
    if (!enabled) return;

    const root = containerRef.current;
    if (!root) return;

    let saveTimer = 0;
    const scheduleSave = (event: Event) => {
      const target = event.target;
      if (target instanceof HTMLElement) {
        updateLatestPosition(target);
      }
      window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(flushLatestScroll, SAVE_DELAY);
    };

    latestPositionsRef.current = collectCurrentScroll();
    root.addEventListener("scroll", scheduleSave, true);

    return () => {
      root.removeEventListener("scroll", scheduleSave, true);
      window.clearTimeout(saveTimer);
      flushLatestScroll();
    };
  }, [
    collectCurrentScroll,
    containerRef,
    enabled,
    flushLatestScroll,
    updateLatestPosition,
  ]);

  useEffect(() => {
    if (!enabled) return;

    const onPageHide = () => saveCurrentScroll();
    window.addEventListener("pagehide", onPageHide);
    return () => window.removeEventListener("pagehide", onPageHide);
  }, [enabled, saveCurrentScroll]);

  useEffect(() => {
    if (!enabled) return;

    const root = containerRef.current;
    if (!root) return;

    let saved: SavedScrollPosition[];
    try {
      const raw = sessionStorage.getItem(scopedStorageKey);
      if (!raw) return;
      const stored = JSON.parse(raw) as StoredScrollPosition;
      if (
        !Number.isFinite(stored.updatedAt) ||
        Date.now() - stored.updatedAt > restoreTtl
      ) {
        return;
      }
      saved = stored.positions;
    } catch {
      return;
    }

    let attempt = 0;
    let timer = 0;
    const restore = () => {
      const restored = saved.filter((position) => {
        const element = findByPath(root, position.path);
        if (!element) return false;
        element.scrollTop = position.top;
        element.scrollLeft = position.left;
        return true;
      }).length;

      attempt += 1;
      if (restored < saved.length && attempt < RESTORE_ATTEMPTS) {
        timer = window.setTimeout(restore, RESTORE_INTERVAL);
      }
    };

    restore();
    return () => window.clearTimeout(timer);
  }, [containerRef, enabled, restoreTtl, scopedStorageKey]);
};
