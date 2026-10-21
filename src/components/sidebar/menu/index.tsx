// import LineClampAnimation from "@/components/widget/text/LineClampAnimation";
import type { AuthToken, MenuRole } from "@/shared/types";
import { useWorkspaceNavigation } from "@/app/navigation/useWorkspaceNavigation";
import type { TabItem } from "@/store/features/tabListSlice";
import { useAppSelector } from "@/store/hooks";
import { cn } from "@/utils/utils";
import { Badge, Menu } from "antd";
import type { MenuProps } from "antd/lib/menu";
import dayjs from "dayjs";
import { ChevronDown, Pin } from "lucide-react";
import { useEffect, useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";

interface LinkProps {
  route: MenuRole[];
}
interface LevelKeysProps {
  key?: string;
  children?: LevelKeysProps[];
}
type MenuItem = Required<MenuProps>["items"][number];

/** A path is the key's page or one under it — by whole segments (purchase-returns is not under purchase). */
const isUnder = (pathname: string, key: string) =>
  pathname === key || pathname.startsWith(`${key}/`);

/** Pages outside the menu that belong to an item of it (the trial balance's drill-down). */
const selectedAliases: Record<string, string> = {
  "main/accountings/account-analysis": "main/accountings/trial-balance",
};

const menuClassName = cn(
  "sidebar-menu border-e-0! bg-transparent! px-0!",
  "[&_.ant-menu-sub]:relative [&_.ant-menu-sub]:!ml-[26px] [&_.ant-menu-sub]:!bg-transparent",
  "[&_.ant-menu-sub]:before:absolute [&_.ant-menu-sub]:before:bottom-2 [&_.ant-menu-sub]:before:left-3 [&_.ant-menu-sub]:before:top-1 [&_.ant-menu-sub]:before:w-px [&_.ant-menu-sub]:before:bg-[#d7e0ea] [&_.ant-menu-sub]:before:content-['']",
  "[&.ant-menu-inline-collapsed_.ant-menu-item]:!mx-2 [&.ant-menu-inline-collapsed_.ant-menu-item]:!flex [&.ant-menu-inline-collapsed_.ant-menu-item]:!w-[calc(100%-16px)] [&.ant-menu-inline-collapsed_.ant-menu-item]:!justify-center [&.ant-menu-inline-collapsed_.ant-menu-item]:!px-0",
  "[&.ant-menu-inline-collapsed_.ant-menu-submenu-title]:!mx-2 [&.ant-menu-inline-collapsed_.ant-menu-submenu-title]:!flex [&.ant-menu-inline-collapsed_.ant-menu-submenu-title]:!w-[calc(100%-16px)] [&.ant-menu-inline-collapsed_.ant-menu-submenu-title]:!justify-center [&.ant-menu-inline-collapsed_.ant-menu-submenu-title]:!px-0",
  "[&.ant-menu-inline-collapsed_.ant-menu-sub]:before:hidden [&.ant-menu-inline-collapsed_.sidebar-menu-dot]:hidden",
);

const menuItemClassName = cn(
  "!mx-3 !my-1 !h-11 !w-[calc(100%-24px)] !rounded-lg !leading-[44px] !text-muted-second",
  "hover:!bg-surface-hover hover:!text-primary",
  "[&.ant-menu-item-selected]:!bg-surface-hover [&.ant-menu-item-selected]:!font-bold [&.ant-menu-item-selected]:!text-primary",
  "[&.ant-menu-item-selected_.ant-menu-item-icon]:!text-[#1554d1]",
);

// a section is marked when one of its pages is open, not merely because it is expanded
const dropdownClassName = cn(
  "[&>.ant-menu-submenu-title]:!mx-3 [&>.ant-menu-submenu-title]:!my-1 [&>.ant-menu-submenu-title]:!h-11 [&>.ant-menu-submenu-title]:!w-[calc(100%-24px)] [&>.ant-menu-submenu-title]:!rounded-lg [&>.ant-menu-submenu-title]:!leading-[44px] [&>.ant-menu-submenu-title]:!text-muted-second",
  "[&>.ant-menu-submenu-title:hover]:!bg-surface-hover [&>.ant-menu-submenu-title:hover]:!text-primary",
  "[&.ant-menu-submenu-selected>.ant-menu-submenu-title]:!bg-surface-hover [&.ant-menu-submenu-selected>.ant-menu-submenu-title]:!font-bold [&.ant-menu-submenu-selected>.ant-menu-submenu-title]:!text-primary",
  "[&.ant-menu-submenu-selected>.ant-menu-submenu-title_.ant-menu-item-icon]:!text-[#1554d1] [&.ant-menu-submenu-selected>.ant-menu-submenu-title_.sidebar-menu-arrow]:!text-[#1554d1]",
);

const subItemClassName = cn(
  "group text-animation-trick-parent !relative !mx-0 !my-1.5 !flex !h-8 !w-[calc(100%-12px)] !items-center !bg-transparent !pl-8 !pr-0 !leading-8 !text-muted-second",
  "hover:!bg-transparent hover:!text-primary",
  "[&_.ant-menu-item-icon]:!absolute [&_.ant-menu-item-icon]:!left-2 [&_.ant-menu-item-icon]:!m-0 [&_.ant-menu-item-icon]:!h-2 [&_.ant-menu-item-icon]:!min-w-2 [&_.ant-menu-item-icon]:!w-2",
  "[&.ant-menu-item-selected]:!bg-transparent [&.ant-menu-item-selected]:!text-primary",
);

const MenuCustom: FC<LinkProps> = ({ route }) => {
  const user = useAppSelector((state) => state.auth?.user) as AuthToken | null;
  const pinnedTabs = useAppSelector((state) => state.tabList.tabs);
  const params = new URLSearchParams();
  params.set("statusId", "1");
  params.set("startDate", "1999-1-1");
  params.set("endDate", dayjs().format("YYYY-MM-DD"));
  // const { data } = useGetListSale(params);
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarInline = useAppSelector((state) => state.sidebar);
  const { pinWorkspace, unpinWorkspace } = useWorkspaceNavigation();
  /**
   * The menu item of a page: the item whose path the page is (or is under), the longest when
   * several fit; a page of a group the menu shows by one of its pages ("reports/…",
   * "tax-reports/…") selects that item; a section's own page ("" path) takes the rest of it.
   */
  const getSelectedKey = (pathname: string) => {
    for (const [from, to] of Object.entries(selectedAliases))
      if (isUnder(pathname, from)) return to;
    for (const item of route) {
      const sectionKey = `main/${item.linkData?.path}`;
      if (!(item.dropdown && item.items?.length)) {
        if (isUnder(pathname, sectionKey)) return sectionKey;
        continue;
      }
      if (!isUnder(pathname, sectionKey)) continue;
      let best: string | null = null;
      let groupFallback: string | null = null;
      let sectionFallback: string | null = null;
      for (const subItem of item.items) {
        const subPath = subItem.linkData?.path ?? "";
        const childKey = `${sectionKey}/${subPath}`;
        if (!subPath) {
          sectionFallback ??= childKey;
          continue;
        }
        if (isUnder(pathname, childKey)) {
          if (!best || childKey.length > best.length) best = childKey;
          continue;
        }
        const slash = subPath.lastIndexOf("/");
        if (slash > 0 && isUnder(pathname, `${sectionKey}/${subPath.slice(0, slash)}`))
          groupFallback ??= childKey;
      }
      const found = best ?? groupFallback ?? sectionFallback;
      if (found) return found;
    }
    if (pathname.startsWith("main/settings")) {
      return "main/settings";
    }
    return pathname;
  };
  const currentPath = location.pathname.slice(1);
  const selectedKey = getSelectedKey(currentPath);
  // the section of the page, open whether or not one of its items is the page
  const selectedParentKey = route.find(
    (item) =>
      item.dropdown &&
      (selectedKey.startsWith(`main/${item.linkData?.path}/`) ||
        isUnder(currentPath, `main/${item.linkData?.path}`)),
  )?.linkData?.path;
  const [stateOpenKeys, setStateOpenKeys] = useState<string[]>(() =>
    selectedParentKey ? [`main/${selectedParentKey}`] : [],
  );
  // a page opened from a tab or a link opens its section (the others close, as on a click)
  useEffect(() => {
    if (!selectedParentKey || sidebarInline.sidebar) return;
    const sectionKey = `main/${selectedParentKey}`;
    setStateOpenKeys((current) => (current.includes(sectionKey) ? current : [sectionKey]));
  }, [selectedParentKey, sidebarInline.sidebar]);
  const renderPinButton = (tab: TabItem) => {
    const isPinned = pinnedTabs.some(
      (pinnedTab) => pinnedTab.key === tab.key && pinnedTab.isPinned === true,
    );
    const accessibleLabel = isPinned
      ? t("app.tabs.unpin", { defaultValue: "Tabdan olib tashlash" })
      : t("app.tabs.pin", { defaultValue: "Tabga biriktirish" });

    return (
      <button
        type="button"
        aria-label={accessibleLabel}
        title={accessibleLabel}
        onMouseDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();

          if (isPinned) {
            unpinWorkspace(tab.key);
            return;
          }

          pinWorkspace({
            ...tab,
          });
        }}
        className={cn(
          "inline-flex size-6 shrink-0 items-center justify-center rounded-md opacity-0 outline-none transition-all duration-150 group-hover/sidebar-item:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-brand",
          isPinned
            ? "bg-brand-soft text-brand"
            : "text-muted hover:bg-brand-soft hover:text-brand",
        )}
      >
        <Pin className="size-3.5" fill={isPinned ? "currentColor" : "none"} />
      </button>
    );
  };

  const items: MenuItem[] = route.map((itemParent) => {
    const isDropdown = itemParent.dropdown && itemParent.items?.length;
    const parentPath = `/main/${itemParent.linkData.path}`;
    return {
      key: "main/" + itemParent.linkData?.path,
      className: isDropdown ? dropdownClassName : menuItemClassName,
      label: isDropdown ? (
        <div className="flex items-center justify-between w-full text-sm font-semibold">
          {t(String(itemParent.dropdownName ?? ""))}
        </div>
      ) : (
        <div className="group/sidebar-item flex w-full min-w-0 items-center justify-between gap-2">
          <span className="truncate">
            {t(String(itemParent.linkData.title ?? ""))}
          </span>
          {!sidebarInline.sidebar &&
            renderPinButton({
              key: parentPath,
              path: parentPath,
              title: String(itemParent.linkData.title ?? ""),
            })}
        </div>
      ),
      onClick: () => {
        if (!isDropdown) {
          const targetPath =
            itemParent.linkData.path === "settings"
              ? "settings"
              : itemParent.linkData.path;
          if (currentPath !== `main/${targetPath}`) {
            navigate(`/main/${targetPath}`);
          }
        }
      },
      icon: (
        <Badge
          size="small"
          classNames={{
            indicator: "!shadow-none",
          }}
          className="inline-block!"
          // dot={itemParent.linkData.path === "sales" && data && data?.count > 0}
          offset={[0, sidebarInline.sidebar ? 7 : 0]}
        >
          {itemParent.iconName}
        </Badge>
      ),
      ...(isDropdown
        ? {
            children: itemParent.items
              ?.filter(
                (item) =>
                  !user?.user?.permissions?.length ||
                  user.user?.permissions?.some((perm) => perm === item.code),
              )
              ?.map((item) => {
                const childKey = `main/${itemParent.linkData.path}/${item.linkData?.path}`;
                const childPath = `/${childKey}`;
                const isSelected = selectedKey === childKey;

                return {
                  key: childKey,
                  className: subItemClassName,
                  label: (
                    <div className="group/sidebar-item flex w-full min-w-0 items-center justify-between gap-2">
                      <span
                        className={cn(
                          "truncate",
                          isSelected
                            ? "font-semibold text-[#1554d1]"
                            : "text-inherit",
                        )}
                      >
                        {t(item.linkData?.title || "")}
                      </span>
                      {!sidebarInline.sidebar &&
                        renderPinButton({
                          key: childPath,
                          path: childPath,
                          title: item.linkData?.title || "",
                        })}
                    </div>
                  ),
                  onClick: () => {
                    if (currentPath !== childKey) {
                      navigate(`/${childKey}`);
                    }
                  },
                  icon: (
                    <span
                      className={cn(
                        "sidebar-menu-dot bg-border group-hover:bg-primary block size-2 rounded-full transition-colors duration-150",
                        isSelected ? "bg-primary" : "bg-border",
                      )}
                    />
                  ),
                };
              }),
          }
        : {}),
    };
  });
  const getLevelKeys = (items1: LevelKeysProps[]) => {
    const key: Record<string, number> = {};
    const func = (items2: LevelKeysProps[], level = 1) => {
      items2.forEach((item) => {
        if (item.key) {
          key[item.key] = level;
        }
        if (item.children) {
          func(item.children, level + 1);
        }
      });
    };
    func(items1);
    return key;
  };

  const levelKeys = getLevelKeys(items as LevelKeysProps[]);
  const onOpenChange: MenuProps["onOpenChange"] = (openKeys) => {
    const currentOpenKey = openKeys.find(
      (key) => stateOpenKeys.indexOf(key) === -1,
    );

    if (currentOpenKey !== undefined) {
      const repeatIndex = openKeys
        .filter((key) => key !== currentOpenKey)
        .findIndex((key) => levelKeys[key] === levelKeys[currentOpenKey]);

      setStateOpenKeys(
        openKeys

          .filter((_, index) => index !== repeatIndex)

          .filter((key) => levelKeys[key] <= levelKeys[currentOpenKey]),
      );
    } else {
      setStateOpenKeys(openKeys);
    }
  };
  return (
    <>
      <Menu
        className={cn(
          menuClassName,
          sidebarInline.sidebar ? "w-15! p-0!" : "p-2.5!",
        )}
        expandIcon={({ isOpen }) =>
          sidebarInline.sidebar ? null : (
            <ChevronDown
              className={`sidebar-menu-arrow size-4 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          )
        }
        forceSubMenuRender={true}
        mode="inline"
        inlineCollapsed={sidebarInline.sidebar}
        openKeys={stateOpenKeys}
        onOpenChange={onOpenChange}
        selectedKeys={[selectedKey]}
        items={items}
      />
    </>
  );
};

export default MenuCustom;
