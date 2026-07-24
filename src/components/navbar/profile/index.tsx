import React, { useState } from "react";
import { Avatar, Popover, Space } from "antd";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import ProfileIcon from "@/assets/images/profile/profile.svg";
import { useNavigate } from "react-router";
import { ProfilePopoverContent } from "./components/ProfilePopoverContent";
import { logout } from "@/store/features/authSlice";
import { setMode } from "@/store/features/modeSlice";
import toast from "react-hot-toast";
import { useEffectiveTheme } from "@/shared/hooks/useEffectiveTheme";
const ProfileNav: React.FC = () => {
  const navigate = useNavigate();
  // const loading = useAppSelector((state) => state.auth.loading);
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth?.user);
  const effectiveTheme = useEffectiveTheme();
  const [mainPopover, setMainPopover] = useState(false);
  const handleLogout = async () => {
    await navigate("/login", { replace: true });
    dispatch(logout());
    toast.success("Tizimdan chiqdingiz!");
  };

  const content = (
    <ProfilePopoverContent
      fullName={user?.user?.userName}
      phone={user?.user?.phoneNumber || "+998 -- --- -- --"}
      onProfileClick={() => navigate("/profile")}
      onThemeClick={() =>
        dispatch(setMode(effectiveTheme === "dark" ? "light" : "dark"))
      }
      onSecurityClick={() => navigate("/settings/security")}
      onLanguageClick={() => {}}
      onWallpaperClick={() => navigate("/settings/wallpaper")}
      onDesktopDownload={() => window.open("/downloads/desktop", "_blank")}
      onMobileDownload={() => window.open("/downloads/mobile", "_blank")}
      onLogout={handleLogout}
    />
  );

  return (
    <Popover
      trigger={["click"]}
      content={content}
      placement="bottomRight"
      open={mainPopover}
      onOpenChange={setMainPopover}
      arrow={false}
      styles={{
        content: {
          padding: 0,
          background: "transparent",
          boxShadow: "none",
        },
      }}
    >
      <div className="cursor-pointer" onClick={(e) => e.preventDefault()}>
        <Space>
          <Avatar
            src={ProfileIcon}
            size={40}
            className="border border-border shadow-sm"
          />
          <div className="flex flex-col justify-center">
            <h2 className="text-[14px] text-text font-bold leading-tight m-0 flex items-center">
              {user?.user?.userName}
            </h2>
            <p className="text-muted-second m-0 mt-0.5 text-[12px] font-medium leading-none">
              {user?.user?.roleName}
            </p>
          </div>
          {/* <ChevronDown className="size-4 text-text" /> */}
        </Space>
      </div>
    </Popover>
  );
};

export default ProfileNav;
