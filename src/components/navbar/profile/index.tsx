import React, { useState } from "react";
import { Avatar, Popover, Space } from "antd";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import ProfileIcon from "@/assets/images/profile/profile.svg";
import { useNavigate } from "react-router";
import { ProfilePopoverContent } from "./components/ProfilePopoverContent";
import { logout } from "@/store/features/authSlice";

const ProfileNav: React.FC = () => {
  const navigate = useNavigate();
  // const loading = useAppSelector((state) => state.auth.loading);
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth?.user);
  const [mainPopover, setMainPopover] = useState(false);
  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const content = (
    <ProfilePopoverContent
      fullName={user?.user?.fullName}
      phone={user?.user?.phoneNumber || "+998 -- --- -- --"}
      onProfileClick={() => navigate("/profile")}
      onThemeClick={() => navigate("/settings/theme")}
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
          <Avatar src={ProfileIcon} size="default" />
          {/* <span className="text-sm text-text">{user?.user?.fullName}</span>
          <ChevronDown className="size-4 text-text" /> */}
        </Space>
      </div>
    </Popover>
  );
};

export default ProfileNav;
