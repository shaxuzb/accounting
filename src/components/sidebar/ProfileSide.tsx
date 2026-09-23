import React from "react";
import { Avatar } from "antd";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import ProfileIcon from "@/assets/images/profile/profile.svg";
import ProfileNav from "@/components/navbar/profile";
import { useAppSelector } from "@/store/hooks";

/**
 * Sidebar pastidagi profil tugmasi. Ilgari bu yerda "HisobKitob MCHJ"
 * menyusi turardi, profil esa headerda edi.
 */
const ProfileSide: React.FC = () => {
  const { t } = useTranslation();
  const collapsed = useAppSelector((state) => state.sidebar.sidebar);
  const user = useAppSelector((state) => state.auth?.user);

  return (
    <div className="p-2">
      <ProfileNav placement={collapsed ? "rightBottom" : "topLeft"}>
        <button
          type="button"
          aria-label={t("profile.defaultUser")}
          title={collapsed ? (user?.user?.userName ?? "") : undefined}
          className={`hover:bg-surface-hover flex w-full cursor-pointer items-center rounded-lg border border-transparent p-2 transition-colors ${
            collapsed ? "justify-center" : "gap-3"
          }`}
        >
          <Avatar
            src={ProfileIcon}
            size={collapsed ? 32 : 36}
            className="shrink-0 border border-border shadow-sm"
          />

          {!collapsed && (
            <>
              <div className="min-w-0 flex-1 text-left">
                <div className="text-text truncate text-sm font-semibold">
                  {user?.user?.userName ?? t("profile.defaultUser")}
                </div>
                {user?.user?.phoneNumber && (
                  <div className="text-muted-second truncate text-xs">
                    {user.user.phoneNumber}
                  </div>
                )}
              </div>
              <ChevronRight className="text-muted-second size-4 shrink-0" />
            </>
          )}
        </button>
      </ProfileNav>
    </div>
  );
};

export default ProfileSide;
