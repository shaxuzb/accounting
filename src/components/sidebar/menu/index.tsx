// import LineClampAnimation from "@/components/widget/text/LineClampAnimation";
import type { AuthToken, MenuRole } from "@/shared/types";
import { useAppSelector } from "@/store/hooks";
import { Badge, ConfigProvider, Menu } from "antd";
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
  const [stateOpenKeys, setStateOpenKeys] = useState<string[]>([]);
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
        <div className="flex items-center justify-between w-full text-sm font-medium">
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
              ?.filter(
                (item) =>
                  !user?.user?.permissions?.length ||
                  user.user?.permissions?.some((perm) => perm === item.code),
              )
              ?.map((item) => ({
                key: `main/${itemParent.linkData.path}/${item.linkData?.path}`,
                className:
                  "!pl-[25px] !pr-0 !flex !items-center text-animation-trick-parent",
                label: t(item.linkData?.title || ""),
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
    <ConfigProvider
      theme={{
        components: {
          Menu: {         
            itemHoverBg: "#e7f0ff",        
            itemHoverColor: "#005cf3",     
            subMenuItemBg: "e7f0ff",
            // itemSelectedBg: "#effff",     
            // itemSelectedColor: "#2563eb",  
          },
        },
      }}
    >
    <Menu
      className="sidebar-menu px-0!"
      forceSubMenuRender={true}
      mode="inline"
      inlineCollapsed={sidebarInline.sidebar}
      openKeys={stateOpenKeys}
      onOpenChange={onOpenChange}
      style={
        sidebarInline.sidebar ? { padding: 0, width: 60 } : { padding: 10 }
      }
      selectedKeys={[getSelectedKey(location.pathname.slice(1))]} // Aktiv menyu yo‘nalishi
      items={items}
    
    />
    </ConfigProvider>
    </>
  );
};

export default MenuCustom;
