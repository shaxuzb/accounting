import React, { useRef, useState } from "react";
import { Avatar, Button, Popover } from "antd";
import {
  ChevronRight,
  Moon,
  ShieldCheck,
  Palette,
  LogOut,
  Sun,
} from "lucide-react";
import ProfileIcon from "@/assets/images/profile/profile.svg";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useTranslation } from "react-i18next";
import { UzbFlagIcon } from "@/components/widget/customicons/UzbFlagIcon";
import { RusFlagIcon } from "@/components/widget/customicons/RusFlagIcon";
import { EngFlagIcon } from "@/components/widget/customicons/EngFlagIcon";
import { setLang, type Lang } from "@/store/features/langSlice";
import { useEffectiveTheme } from "@/shared/hooks/useEffectiveTheme";

type ProfilePopoverContentProps = {
  fullName?: string;
  phone?: string;
  onProfileClick?: () => void;
  onThemeClick?: () => void;
  onSecurityClick?: () => void;
  onLanguageClick?: () => void;
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
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-primary-bg hover:bg-surface-hover hover:border-border flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-transparent py-1 transition-all"
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

const LanguagePopoverContent = ({ onSelect }: { onSelect?: () => void }) => {
  const dispatch = useAppDispatch();
  const lang = useAppSelector((state) => state.lang.lang);
  const { i18n, t } = useTranslation();

  const languages: { key: Lang; label: string; icon: React.ReactNode }[] = [
    {
      key: "uz",
      label: t("profile.languages.uz"),
      icon: <UzbFlagIcon className="h-5 w-5" />,
    },
    {
      key: "ru",
      label: t("profile.languages.ru"),
      icon: <RusFlagIcon className="h-5 w-5" />,
    },
    {
      key: "en",
      label: t("profile.languages.en"),
      icon: <EngFlagIcon className="h-5 w-5" />,
    },
  ];

  const handleChangeLanguage = async (value: Lang) => {
    dispatch(setLang(value));
    await i18n.changeLanguage(value);
    onSelect?.();
  };

  return (
    <div className="min-w-40 rounded-lg bg-primary-bg p-1">
      {languages.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => handleChangeLanguage(item.key)}
          className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition ${
            lang === item.key
              ? "bg-secondary text-foreground font-semibold"
              : "hover:bg-surface-hover text-text"
          }`}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export default LanguagePopoverContent;

export const ProfilePopoverContent: React.FC<ProfilePopoverContentProps> = ({
  fullName,
  phone = "+998 90 123 45 67",
  onProfileClick,
  onThemeClick,
  // onSecurityClick,
  // onWallpaperClick,
  // onDesktopDownload,
  // onMobileDownload,
  onLogout,
}) => {
  const { t } = useTranslation();
  const lang = useAppSelector((state) => state.lang.lang);
  const effectiveTheme = useEffectiveTheme();
  const [langPopover, setLangPopover] = useState(false);
  const langTriggerRef = useRef<HTMLDivElement | null>(null);
  const isDarkMode = effectiveTheme === "dark";

  return (
    <div className="rounded-lg bg-primary-bg p-0">
      <div className="rounded-lg border border-secondary p-2 ">
        <div
          onClick={onProfileClick}
          className="bg-primary-bg hover:bg-surface-hover flex cursor-pointer items-center justify-between rounded-lg border border-secondary p-2"
        >
          <div className="flex items-center gap-3">
            <Avatar src={ProfileIcon} size={30} />
            <div>
              <div className="text-text text-[14px] font-semibold">
                {fullName ?? t("profile.defaultUser")}
              </div>
              <div className="text-xs text-muted-second">{phone}</div>
            </div>
          </div>

          <ChevronRight className="h-5 w-5 text-muted-second " />
        </div>

        <div className="mt-3 rounded-lg bg-primary-bg ">
          <div className="grid grid-cols-4 gap-3 ">
            <MenuCard
              icon={
                isDarkMode ? (
                  <Sun className="size-5" />
                ) : (
                  <Moon className="size-5" />
                )
              }
              label={`${t("profile.theme")} ${t(
                isDarkMode ? "profile.themeModes.dark" : "profile.themeModes.light",
              )}`}
              onClick={onThemeClick}
            />

            <MenuCard
              icon={<ShieldCheck className="size-5" />}
              label={t("profile.security")}
              // onClick={onSecurityClick}
            />

            <div
              ref={langTriggerRef}
              onClick={(e) => e.stopPropagation()}
              className="w-full"
            >
              <Popover
                open={langPopover}
                onOpenChange={setLangPopover}
                trigger="hover"
                placement="bottom"
                arrow={false}
                destroyOnHidden
                getPopupContainer={() =>
                  langTriggerRef.current ?? document.body
                }
                content={
                  <LanguagePopoverContent
                    onSelect={() => setLangPopover(false)}
                  />
                }
                styles={{
                  content: {
                    padding: 0,
                  },
                }}
              >
                <div>
                  <MenuCard
                    icon={
                      lang === "uz" ? (
                        <UzbFlagIcon className="w-3/4" />
                      ) : lang === "ru" ? (
                        <RusFlagIcon className="w-3/4" />
                      ) : (
                        <EngFlagIcon className="w-3/4" />
                      )
                    }
                    label={t("profile.language")}
                  />
                </div>
              </Popover>
            </div>

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
