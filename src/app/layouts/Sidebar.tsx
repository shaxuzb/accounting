import LogoSide from "@/components/sidebar/LogoSide";
import MenuCustom from "@/components/sidebar/menu";
import ProfileSide from "@/components/sidebar/ProfileSide";
import { useAppSelector } from "@/store/hooks";
import { useMemo } from "react";
import { menuPermissions } from "../config/menuPermissions";
import { logout } from "@/store/features/authSlice";
import { useDispatch } from "react-redux";
const Sidebar = () => {
  const sidebarInline = useAppSelector((state) => state.sidebar);
  const user = useAppSelector((state) => state.auth?.user);
  const dispatch = useDispatch();
  const memoizedMenus = useMemo(() => {
    if (user && user.user) {
      const topMenus = [];
      for (let index = 0; index < menuPermissions.TOP.length; index++) {
        if (!user?.user?.permissions) {
          dispatch(logout());
        }
        if (
          user.user.permissions.find(
            (item) => item === menuPermissions.TOP[index].code,
          ) ||
          menuPermissions.TOP[index].code === "SETTINGS" ||
          (menuPermissions.TOP[index].code === "DROPDOWN" &&
            menuPermissions.TOP[index].items?.some((item) =>
              user.user.permissions.find((item2) => item2 === item.code),
            ))
        ) {
          topMenus.push({
            ...menuPermissions.TOP[index],
          });
        }
      }
      return { TOP: topMenus };
    }
    return { TOP: [] };
  }, [dispatch, user]);
  // const snowflakeImages = useMemo(() => {
  //   const img = new Image();
  //   const img2 = new Image();
  //   img.src = snowStyled;
  //   img2.src = snowRounded;
  //   return [img, img2];
  // }, [dispatch, user]);

  return (
    <div
      // flex-col bo'lmasa o'rtadagi `flex-1 min-h-0` ishlamaydi: menyu
      // balandlikka sig'maganda scroll o'rniga kesilib qolardi.
      className={`${sidebarInline.sidebar ? "w-16" : "w-[280px]"} sticky top-0 flex h-screen shrink-0 flex-col overflow-hidden border-r border-border bg-primary-bg transition-[width] duration-200 ease-out`}
    >
      <div className="shrink-0">
        <LogoSide />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        {/* {!sidebarInline.sidebar && <ProfileSide />} */}
        <MenuCustom route={memoizedMenus.TOP} />
      </div>
      <div className="shrink-0 border-t border-border">
        <ProfileSide />
      </div>
    </div>
  );
};

export default Sidebar;
