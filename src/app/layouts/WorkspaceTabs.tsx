import { useAppSelector } from "@/store/hooks";
import type { TabItem } from "@/store/features/tabListSlice";
import { useWorkspaceNavigation } from "@/app/navigation/useWorkspaceNavigation";
import { cn } from "@/utils/utils";
import { Button, Dropdown } from "antd";
import { Check, ChevronLeft, ChevronRight, FileText, Menu, X } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import type { WheelEvent } from "react";

const WorkspaceTabs = () => {
  const { t } = useTranslation();
  const tabs = useAppSelector((state) => state.tabList.tabs);
  const activeTabKey = useAppSelector((state) => state.tabList.activeTabKey);
  const { activateWorkspace, closeWorkspace, clearWorkspaces } = useWorkspaceNavigation();
  const tabsViewportRef = useRef<HTMLDivElement | null>(null);
  const tabElementsRef = useRef(new Map<string, HTMLDivElement>());

  useEffect(() => {
    const activeTabElement = activeTabKey
      ? tabElementsRef.current.get(activeTabKey)
      : null;

    activeTabElement?.scrollIntoView({
      behavior: "auto",
      block: "nearest",
      inline: "nearest",
    });
  }, [activeTabKey]);

  const openTab = useCallback(
    (tab: TabItem) => {
      activateWorkspace(tab.key);
    },
    [activateWorkspace],
  );

  const closeTab = useCallback(
    (tabKey: string) => {
      closeWorkspace(tabKey);
    },
    [closeWorkspace],
  );

  const scrollTabs = useCallback((direction: -1 | 1) => {
    tabsViewportRef.current?.scrollBy({
      left: direction * 280,
      behavior: "auto",
    });
  }, []);

  const handleWheel = useCallback((event: WheelEvent<HTMLDivElement>) => {
    if (Math.abs(event.deltaY) < 1) return;

    const viewport = tabsViewportRef.current;
    if (!viewport || viewport.scrollWidth <= viewport.clientWidth) return;

    event.preventDefault();
    viewport.scrollLeft += event.deltaY;
  }, []);

  const clearAllTabs = useCallback(() => {
    clearWorkspaces();
  }, [clearWorkspaces]);

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

  const menuItems = [
    {
      key: "clear-all-tabs",
      label: "Barcha tablarni yopish",
      danger: true,
      onClick: clearAllTabs,
    },
    {
      type: "divider" as const,
    },
    ...dropdownItems,
  ];

  if (!tabs.length) return null;

  return (
    <div className="flex h-11 shrink-0 border-b border-border bg-surface-muted">
      <div
        ref={tabsViewportRef}
        onWheel={handleWheel}
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
        <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
          <Button
            type="text"
            size="small"
            aria-label="Barcha ochiq tablar"
            icon={<Menu className="size-4" />}
          />
        </Dropdown>
      </div>
    </div>
  );
};

export default WorkspaceTabs;
