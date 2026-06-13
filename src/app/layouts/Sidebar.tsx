import LogoSide from "@/components/sidebar/LogoSide";
import MenuCustom from "@/components/sidebar/menu";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useMemo } from "react";
import { menuPermissions } from "../config/menuPermissions";
// import { logout } from "@/store/features/authSlice";
import { getEffectiveTheme } from "@/utils/utils";
import CustomScroller from "react-custom-scroller";
import OrgSwitcher from "@/components/navbar/org-switcher";
const Sidebar = () => {
  const themeMode = useAppSelector((state) => state.mode.mode);
  const sidebarInline = useAppSelector((state) => state.sidebar);
  // const user = useAppSelector((state) => state.auth?.user);
  const dispatch = useAppDispatch();
  const memoizedMenus = useMemo(() => {
    // if (!user && !user.user) {
    const topMenus = [];
    const bottomMenus = [];
    for (let index = 0; index < menuPermissions.TOP.length; index++) {
      // if (!user?.user?.permissions) {
      //   dispatch(logout());
      // }
      // if (
      //   user.user.permissions.find(
      //     (item) => item === menuPermissions.TOP[index].code,
      //   ) ||
      //   menuPermissions.TOP[index].code === "SETTINGS" ||
      //   (menuPermissions.TOP[index].code === "DROPDOWN" &&
      //     menuPermissions.TOP[index].items?.some((item) =>
      //       user.user.permissions.find((item2) => item2 === item.code),
      //     ))
      // ) {
      topMenus.push({
        ...menuPermissions.TOP[index],
      });
      // }
    }
    for (let index = 0; index < menuPermissions.BOTTOM.length; index++) {
      // if (!user?.user?.permissions) {
      //   dispatch(logout());
      // }
      // if (
      //   user.user.permissions.find(
      //     (item) => item === menuPermissions.BOTTOM[index].code,
      //   ) ||
      //   menuPermissions.BOTTOM[index].code === "SETTINGS"
      // ) {
      bottomMenus.push({
        ...menuPermissions.BOTTOM[index],
      });
    }
    // }
    return {
      TOP: topMenus,
      BOTTOM: bottomMenus,
    };
    // }
    return {
      TOP: [],
      BOTTOM: [],
    };
  }, [dispatch]);
  // const snowflakeImages = useMemo(() => {
  //   const img = new Image();
  //   const img2 = new Image();
  //   img.src = snowStyled;
  //   img2.src = snowRounded;
  //   return [img, img2];
  // }, [dispatch, user]);

  return (
    <div
      className={`${sidebarInline.sidebar ? "w-16" : "w-70"} h-screen sticky overflow-hidden top-0 border-r border-[#e5e7eb] ${getEffectiveTheme(themeMode) === "light" ? "bg-white" : "bg-secondary"} flex flex-col`}
    >
      <LogoSide />
      <CustomScroller className={`duration-300 flex-1 overflow-auto`}>
        {/* {!sidebarInline.sidebar && <ProfileSide />} */}
        <MenuCustom route={memoizedMenus.TOP} />
      </CustomScroller>
      <MenuCustom route={memoizedMenus.BOTTOM} />
      <OrgSwitcher />
    </div>
  );
};

export default Sidebar;
