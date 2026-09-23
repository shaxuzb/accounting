import React, { useState, type ReactNode } from "react";
import { Avatar, Popover, Space } from "antd";
import type { TooltipPlacement } from "antd/es/tooltip";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import ProfileIcon from "@/assets/images/profile/profile.svg";
import { useNavigate } from "react-router";
import { ProfilePopoverContent } from "./components/ProfilePopoverContent";
import { logout } from "@/store/features/authSlice";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

type ProfileMenuProps = {
  /** Popoverni ochadigan element. Berilmasa oddiy avatar ishlatiladi. */
  children?: ReactNode;
  placement?: TooltipPlacement;
};

/**
 * Profil popoveri. Mavzu va til bu yerdan headerga ko'chirildi
 * (components/navbar/theme va components/navbar/language).
 */
const ProfileNav: React.FC<ProfileMenuProps> = ({
  children,
  placement = "bottomRight",
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth?.user);
  const [mainPopover, setMainPopover] = useState(false);

  const handleLogout = () => {
    // The logout middleware cancels the active EDO import before auth state is cleared.
    dispatch(logout());
    void navigate("/login", { replace: true });

    toast.success(t("auth.loggedOut"));
  };

  const content = (
    <ProfilePopoverContent
      fullName={user?.user?.userName}
      phone={user?.user?.phoneNumber || "+998 -- --- -- --"}
      onSecurityClick={() => navigate("/settings/security")}
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
      placement={placement}
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
      {children ?? (
        <div className="cursor-pointer" onClick={(e) => e.preventDefault()}>
          <Space>
            <Avatar
              src={ProfileIcon}
              size={40}
              className="border border-border shadow-sm"
            />
          </Space>
        </div>
      )}
    </Popover>
  );
};

export default ProfileNav;
