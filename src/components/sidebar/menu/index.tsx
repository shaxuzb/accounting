import LineClampAnimation from "@/components/widget/text/LineClampAnimation";
import type { AuthToken, MenuRole } from "@/shared/types";
import { useAppSelector } from "@/store/hooks";
import { Badge, Menu } from "antd";
import type { MenuProps } from "antd/lib/menu";
import dayjs from "dayjs";
import { useState, type FC } from "react";
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

const MenuCustom: FC<LinkProps> = ({ route }) => {
  const user = useAppSelector((state) => state.auth?.user) as AuthToken | null;
  const params = new URLSearchParams();
  params.set("statusId", "1");
  params.set("startDate", "1999-1-1");
  params.set("endDate", dayjs().format("YYYY-MM-DD"));
  // const { data } = useGetListSale(params);
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [stateOpenKeys, setStateOpenKeys] = useState([""]);
  const sidebarInline = useAppSelector((state) => state.sidebar);
  const getSelectedKey = (pathname: string) => {
    for (const item of route) {
      const basePath = item.linkData?.path;

      if (item.dropdown && item.items?.length) {
        for (const subItem of item.items) {
          const fullPath = `main/${basePath}/${subItem.linkData?.path}`;
          if (pathname.startsWith(fullPath)) {
            return fullPath;
          }
        }
      }
      if (pathname.startsWith(basePath)) {
        return basePath;
      }
    }
    if (pathname.startsWith("main/settings")) {
      return "main/settings";
    }
    return pathname;
  };
  // const handleAddTabItem = (path: string, item: SideBarItems) => {
  //   dispatch(
  //     setAddTab({
  //       path: "main/" + path,
  //       code: item.code ?? "",
  //       title: item.linkData?.title ?? "",
  //     }),
  //   );
  // };
  const items: MenuItem[] = route.map((itemParent) => {
    const isDropdown = itemParent.dropdown && itemParent.items?.length;
    return {
      key: "main/" + itemParent.linkData?.path,
      // className: `${itemParent.code === "SETTINGS" ? "!mt-10" : ""}`,
      label: isDropdown ? (
        <div className="flex items-center justify-between w-[85%]">
          {t(String(itemParent.dropdownName ?? ""))}
        </div>
      ) : (
        t(String(itemParent.linkData.title ?? ""))
      ),
      onClick: () => {
        if (
          !isDropdown &&
          location.pathname.slice(1) !== itemParent.linkData.path
        ) {
          navigate(itemParent.linkData.path);
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
              ?.filter((item) =>
                user?.user?.permissions?.some((perm) => perm === item.code),
              )
              ?.map((item) => ({
                key: `main/${itemParent.linkData.path}/${item.linkData?.path}`,
                className:
                  "!pl-[25px] !pr-0 !flex !items-center text-animation-trick-parent",

                label: (
                  <div className="flex! w-full! relative">
                    {/* {!sidebarInline.sidebar && (
                      <div className="w-4 flex justify-center items-center relative mr-3">
                        <div className="w-2 h-2 bg-muted-second rounded-full"></div>
                        <div
                          className={`absolute left-1/2 -translate-x-1/2 bg-muted-second w-[0.5px] top-0 ${
                            (itemParent.items?.length ?? 0) - 1 === index
                              ? "h-1/2"
                              : "h-full"
                          }`}
                        ></div>
                      </div>
                    )} */}
                    <div className="flex items-center relative justify-between w-full pr-5">
                      <div className="w-35">
                        <LineClampAnimation
                          text={t(item.linkData?.title || "")}
                        />
                      </div>
                    </div>
                    <div className="absolute -top-2.5 left-0">
                      <Badge
                        size="small"
                        classNames={{
                          indicator: "!text-[10px] !shadow-none",
                        }}
                        // count={
                        //   item.linkData?.path === "sale" ? data?.count : null
                        // }
                        offset={[sidebarInline.sidebar ? -15 : 11, -3]}
                      ></Badge>
                    </div>
                    {/* <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        // handleAddTabItem(
                        //   `${itemParent.linkData.path}/${item.linkData?.path}`,
                        //   item,
                        // );
                      }}
                      type="text"
                      className="w-5! h-5! z-20! absolute! right-0 top-1/2 -translate-y-1/2 menu-pin-button"
                      icon={
                        tabList.find(
                          (tabItem) =>
                            tabItem.path ===
                            `main/${itemParent.linkData.path}/${item.linkData?.path}`,
                        ) ? (
                          <Pin className="size-2.5 fill-white" />
                        ) : (
                          <Pin className="size-2.5" />
                        )
                      }
                    /> */}
                  </div>
                ),
                onClick: () => {
                  //   if (responseSidebar) {
                  //     dispatch(setResponseOpen(!responseSidebar));
                  //   }
                  if (
                    location.pathname.slice(1) !==
                    `${itemParent.linkData.path}/${item.linkData?.path}`
                  ) {
                    navigate(
                      `${itemParent.linkData.path}/${item.linkData?.path}`,
                    );
                  }
                },
                icon: item.iconName,
              })),
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
    // open
    if (currentOpenKey !== undefined) {
      const repeatIndex = openKeys
        .filter((key) => key !== currentOpenKey)
        .findIndex((key) => levelKeys[key] === levelKeys[currentOpenKey]);

      setStateOpenKeys(
        openKeys
          // remove repeat key
          .filter((_, index) => index !== repeatIndex)
          // remove current level all child
          .filter((key) => levelKeys[key] <= levelKeys[currentOpenKey]),
      );
    } else {
      // close
      setStateOpenKeys(openKeys);
    }
  };
  return (
    <Menu
      className="px-0!"
      forceSubMenuRender={true}
      mode="inline"
      inlineCollapsed={sidebarInline.sidebar}
      openKeys={stateOpenKeys}
      onOpenChange={onOpenChange}
      style={{ padding: 10 }}
      selectedKeys={[getSelectedKey(location.pathname.slice(1))]} // Aktiv menyu yo‘nalishi
      items={items}
    />
  );
};

export default MenuCustom;
