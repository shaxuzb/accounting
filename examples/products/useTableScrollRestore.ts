import { useCallback, useEffect, useRef } from "react";
import { useLocation } from "react-router";

type ScrollPosition = {
  top: number;
  left: number;
  listPath: string;
};

type Props = {
  storageKey: string;
  listPath: string;
  childPathPatterns: RegExp[];
  enabled?: boolean;
  restoreDelay?: number;
};

export const useTableScrollRestore = ({
  storageKey,
  listPath,
  childPathPatterns,
  enabled = true,
  restoreDelay = 100,
}: Props) => {
  const tableWrapperRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();

  const getScrollElement = useCallback(() => {
    const wrapper = tableWrapperRef.current;
    if (!wrapper) return null;

    const selectors = [
      ".ant-table-tbody-virtual-holder",
      ".rc-virtual-list-holder",
      ".ant-table-body",
    ];
    const candidates = selectors.flatMap((selector) =>
      Array.from(wrapper.querySelectorAll<HTMLElement>(selector)),
    );

    return (
      candidates.find(
        (element) =>
          element.scrollHeight > element.clientHeight + 1 ||
          element.scrollWidth > element.clientWidth + 1,
      ) ?? candidates[0] ?? null
    );
  }, []);

  const isChildPath = useCallback(
    (pathname: string) => {
      return childPathPatterns.some((pattern) => pattern.test(pathname));
    },
    [childPathPatterns],
  );

  const saveCurrentScroll = useCallback(() => {
    const scrollElement = getScrollElement();
    if (!scrollElement) return;

    const position: ScrollPosition = {
      top: scrollElement.scrollTop,
      left: scrollElement.scrollLeft,
      listPath,
    };

    sessionStorage.setItem(storageKey, JSON.stringify(position));
  }, [getScrollElement, listPath, storageKey]);

  useEffect(() => {
    if (!enabled) return;
    if (location.pathname !== listPath) return;

    const scrollElement = getScrollElement();
    if (!scrollElement) return;

    let animationFrame = 0;
    const handleScroll = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = 0;
        saveCurrentScroll();
      });
    };

    scrollElement.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      scrollElement.removeEventListener("scroll", handleScroll);
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, [
    enabled,
    location.pathname,
    listPath,
    getScrollElement,
    saveCurrentScroll,
  ]);

  useEffect(() => {
    return () => {
      if (!enabled) return;

      /**
       * Component unmount bo‘layotganda browser URL allaqachon
       * yangi route tomonga o‘tgan bo‘ladi.
       */
      const nextPath = window.location.pathname;

      /**
       * Faqat list page'dan child page'ga ketganda saqlaydi:
       * /sale -> /sale/2
       */
      if (location.pathname === listPath && isChildPath(nextPath)) {
        saveCurrentScroll();
        return;
      }

      /**
       * Boshqa page'ga ketsa eski scroll kerak emas:
       * /sale -> /finance
       * /sale -> /report
       */
      sessionStorage.removeItem(storageKey);
    };
  }, [
    enabled,
    location.pathname,
    listPath,
    isChildPath,
    saveCurrentScroll,
    storageKey,
  ]);

  useEffect(() => {
    if (!enabled) return;
    if (location.pathname !== listPath) return;

    const saved = sessionStorage.getItem(storageKey);
    if (!saved) return;

    const timer = setTimeout(() => {
      const scrollElement = getScrollElement();
      if (!scrollElement) return;

      try {
        const position = JSON.parse(saved) as ScrollPosition;

        if (position.listPath !== listPath) {
          sessionStorage.removeItem(storageKey);
          return;
        }

        scrollElement.scrollTop = position.top;
        scrollElement.scrollLeft = position.left;
      } catch {
        sessionStorage.removeItem(storageKey);
      }
    }, restoreDelay);

    return () => clearTimeout(timer);
  }, [
    enabled,
    location.pathname,
    listPath,
    storageKey,
    getScrollElement,
    restoreDelay,
  ]);

  return {
    tableWrapperRef,
  };
};
