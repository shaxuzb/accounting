import { useCallback, useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router";

type ScrollPosition = {
  top: number;
  left: number;
  updatedAt: number;
};

type Props = {
  storageKey: string;
  enabled?: boolean;
  ready?: boolean;
  saveDelay?: number;
  restoreTtl?: number;
};

const SCROLL_ELEMENT_SELECTORS = [
  ".ant-table-tbody-virtual-holder",
  ".rc-virtual-list-holder",
  ".ant-table-body",
];

const DEFAULT_RESTORE_TTL = 30 * 60 * 1000;
const MAX_RESTORE_FRAMES = 30;

const removeSavedPosition = (key: string) => {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // Storage access errors must not interrupt table interaction.
  }
};

/**
 * Browser historydagi har bir list holati uchun jadval scrollini saqlaydi.
 * React state ishlatilmagani uchun scroll paytida qayta render bo'lmaydi.
 */
export const useTableScrollRestore = ({
  storageKey,
  enabled = true,
  ready = true,
  saveDelay = 120,
  restoreTtl = DEFAULT_RESTORE_TTL,
}: Props) => {
  const tableWrapperRef = useRef<HTMLDivElement | null>(null);
  const scrollElementRef = useRef<HTMLElement | null>(null);
  const latestPositionRef = useRef<ScrollPosition | null>(null);
  const saveTimerRef = useRef<number | null>(null);
  const location = useLocation();

  const scopedStorageKey = useMemo(
    () => `${storageKey}:${location.key}`,
    [location.key, storageKey],
  );

  const getScrollElement = useCallback(() => {
    const wrapper = tableWrapperRef.current;
    const cachedElement = scrollElementRef.current;

    if (wrapper && cachedElement && wrapper.contains(cachedElement)) {
      return cachedElement;
    }
    if (!wrapper) return null;

    const candidates = SCROLL_ELEMENT_SELECTORS.flatMap((selector) =>
      Array.from(wrapper.querySelectorAll<HTMLElement>(selector)),
    );
    const element =
      candidates.find(
        (candidate) =>
          candidate.scrollHeight > candidate.clientHeight + 1 ||
          candidate.scrollWidth > candidate.clientWidth + 1,
      ) ?? candidates[0] ?? null;

    scrollElementRef.current = element;
    return element;
  }, []);

  const persistPosition = useCallback(() => {
    if (saveTimerRef.current !== null) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    const element = getScrollElement();
    const position = element
      ? {
          top: element.scrollTop,
          left: element.scrollLeft,
          updatedAt: Date.now(),
        }
      : latestPositionRef.current;

    if (!position) return;
    latestPositionRef.current = position;
    try {
      sessionStorage.setItem(scopedStorageKey, JSON.stringify(position));
    } catch {
      // Storage access/quota errors must not interrupt table interaction.
    }
  }, [getScrollElement, scopedStorageKey]);

  const schedulePositionSave = useCallback(() => {
    const element = getScrollElement();
    if (!element) return;

    latestPositionRef.current = {
      top: element.scrollTop,
      left: element.scrollLeft,
      updatedAt: Date.now(),
    };

    if (saveTimerRef.current !== null) {
      window.clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = window.setTimeout(persistPosition, saveDelay);
  }, [getScrollElement, persistPosition, saveDelay]);

  useEffect(() => {
    if (!enabled || !ready) return;

    let cancelled = false;
    let frameId = 0;
    let attachedElement: HTMLElement | null = null;
    let listenerAttached = false;

    const readPosition = () => {
      let savedValue: string | null;
      try {
        savedValue = sessionStorage.getItem(scopedStorageKey);
      } catch {
        return null;
      }
      if (!savedValue) return null;

      try {
        const position = JSON.parse(savedValue) as ScrollPosition;
        const isValid =
          Number.isFinite(position.top) &&
          Number.isFinite(position.left) &&
          Number.isFinite(position.updatedAt);

        if (!isValid || Date.now() - position.updatedAt > restoreTtl) {
          removeSavedPosition(scopedStorageKey);
          return null;
        }
        return position;
      } catch {
        removeSavedPosition(scopedStorageKey);
        return null;
      }
    };

    const savedPosition = readPosition();

    const attachListener = (element: HTMLElement) => {
      if (listenerAttached) return;
      attachedElement = element;
      element.addEventListener("scroll", schedulePositionSave, {
        passive: true,
      });
      listenerAttached = true;
    };

    const restore = (frame = 0) => {
      if (cancelled) return;

      const element = getScrollElement();
      if (!element) {
        if (frame < MAX_RESTORE_FRAMES) {
          frameId = window.requestAnimationFrame(() => restore(frame + 1));
        }
        return;
      }

      if (!savedPosition) {
        attachListener(element);
        return;
      }

      const maxTop = Math.max(0, element.scrollHeight - element.clientHeight);
      const maxLeft = Math.max(0, element.scrollWidth - element.clientWidth);
      const tableIsReady =
        maxTop >= savedPosition.top && maxLeft >= savedPosition.left;

      if (!tableIsReady && frame < MAX_RESTORE_FRAMES) {
        frameId = window.requestAnimationFrame(() => restore(frame + 1));
        return;
      }

      element.scrollTop = Math.min(savedPosition.top, maxTop);
      element.scrollLeft = Math.min(savedPosition.left, maxLeft);
      latestPositionRef.current = {
        top: element.scrollTop,
        left: element.scrollLeft,
        updatedAt: Date.now(),
      };
      attachListener(element);
    };

    frameId = window.requestAnimationFrame(() => restore());

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frameId);

      if (attachedElement && listenerAttached) {
        attachedElement.removeEventListener("scroll", schedulePositionSave);
        persistPosition();
      }
      scrollElementRef.current = null;
    };
  }, [
    enabled,
    getScrollElement,
    persistPosition,
    ready,
    restoreTtl,
    schedulePositionSave,
    scopedStorageKey,
  ]);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener("pagehide", persistPosition);
    return () => window.removeEventListener("pagehide", persistPosition);
  }, [enabled, persistPosition]);

  return { tableWrapperRef };
};
