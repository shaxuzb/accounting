import React from "react";
import { Avatar, Button } from "antd";
import { ShieldCheck, Palette, LogOut } from "lucide-react";
import ProfileIcon from "@/assets/images/profile/profile.svg";
import { useTranslation } from "react-i18next";

type ProfilePopoverContentProps = {
  fullName?: string;
  phone?: string;
  onProfileClick?: () => void;
  onSecurityClick?: () => void;
  onWallpaperClick?: () => void;
  onDesktopDownload?: () => void;
  onMobileDownload?: () => void;
  onLogout?: () => void;
};

const MenuCard = ({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) => {
  const interactive = Boolean(onClick);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!interactive}
      className={`bg-primary-bg flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-transparent py-1 transition-all ${
        interactive
          ? "hover:bg-surface-hover hover:border-border cursor-pointer"
          : "cursor-default opacity-60"
      }`}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-muted-second">
        {icon}
      </div>
      <span className="text-xs font-medium text-muted-second">{label}</span>
    </button>
  );
};

// const DownloadRow = ({
//   icon,
//   title,
//   onClick,
// }: {
//   icon: React.ReactNode;
//   title: string;
//   onClick?: () => void;
// }) => {
//   return (
//     <div className="flex items-center justify-between rounded-lg border border-secondary bg-primary-bg p-2">
//       <div className="flex items-center gap-3">
//         <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-secondary-foreground text-muted-second">
//           {icon}
//         </div>
//         <span className="mr-3 text-xs font-medium text-muted-second">
//           {title}
//         </span>
//       </div>

//       <Button
//         type="primary"
//         onClick={onClick}
//         size="small"
//         className="text-xs! font-medium!"
//       >
//         Yuklab olish
//       </Button>
//     </div>
//   );
// };

export const ProfilePopoverContent: React.FC<ProfilePopoverContentProps> = ({
  fullName,
  phone = "+998 90 123 45 67",
  // onProfileClick,
  // onSecurityClick,
  // onWallpaperClick,
  // onDesktopDownload,
  // onMobileDownload,
  onLogout,
}) => {
  const { t } = useTranslation();

  return (
    <div className="rounded-lg bg-primary-bg p-0">
      <div className="rounded-lg border border-secondary p-2 ">
        {/* Alohida profil sahifasi hali yo'q, shuning uchun bu qator faqat
            ma'lumot ko'rsatadi — bosilmaydi. */}
        <div className="bg-primary-bg flex items-center justify-between rounded-lg border border-secondary p-2">
          <div className="flex items-center gap-3">
            <Avatar src={ProfileIcon} size={30} />
            <div>
              <div className="text-text text-[14px] font-semibold">
                {fullName ?? t("profile.defaultUser")}
              </div>
              <div className="text-xs text-muted-second">{phone}</div>
            </div>
          </div>
        </div>

        <div className="mt-3 rounded-lg bg-primary-bg ">
          <div className="grid grid-cols-2 gap-3">
            <MenuCard
              icon={<ShieldCheck className="size-5" />}
              label={t("profile.security")}
              // onClick={onSecurityClick}
            />

            <MenuCard
              icon={<Palette className="size-5" />}
              label={t("profile.wallpaper")}
              // onClick={onWallpaperClick}
            />
          </div>
        </div>
      </div>

      {/* <div className="mt-3 rounded-lg border border-secondary bg-primary-bg p-2">
        <div className="space-y-2">
          <DownloadRow
            icon={<Monitor className="size-4 fill-muted-second" />}
            title="Desktop ilovani yuklab olish"
            onClick={onDesktopDownload}
          />
          <DownloadRow
            icon={<Smartphone className="size-4 fill-muted-second" />}
            title="Mobil ilovani yuklab olish"
            onClick={onMobileDownload}
          />
        </div>
      </div> */}

      <div className="mt-3 rounded-lg border border-secondary bg-primary-bg p-2  ">
        <Button
          size="middle"
          block
          onClick={onLogout}
          className="font-semibold! "
          icon={<LogOut className="h-4 w-4" />}
        >
          {t("profile.logout")}
        </Button>
      </div>
    </div>
  );
};
