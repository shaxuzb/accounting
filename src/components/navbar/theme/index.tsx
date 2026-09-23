import React from "react";
import { Tooltip } from "antd";
import { Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "@/store/hooks";
import { setMode } from "@/store/features/modeSlice";
import { useEffectiveTheme } from "@/shared/hooks/useEffectiveTheme";

/** Headerdagi mavzu almashtirgich. Ilgari profil popoveri ichida edi. */
const ThemeToggle: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isDark = useEffectiveTheme() === "dark";
  const label = `${t("profile.theme")} ${t(
    isDark ? "profile.themeModes.dark" : "profile.themeModes.light",
  )}`;

  return (
    <Tooltip title={label}>
      <button
        type="button"
        aria-label={label}
        onClick={() => dispatch(setMode(isDark ? "light" : "dark"))}
        className="hover:bg-surface-hover text-muted-second flex size-9 cursor-pointer items-center justify-center rounded-lg border border-transparent transition-colors"
      >
        {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
      </button>
    </Tooltip>
  );
};

export default ThemeToggle;
