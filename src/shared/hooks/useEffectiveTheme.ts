import { useEffect, useState } from "react";
import { useAppSelector } from "@/store/hooks";
import type { Mode } from "@/store/features/modeSlice";
import type { EffectiveTheme } from "@/utils/customTheme";

const getSystemTheme = (): EffectiveTheme => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const resolveEffectiveTheme = (
  mode: Mode,
  systemTheme: EffectiveTheme = getSystemTheme(),
): EffectiveTheme => (mode === "system" ? systemTheme : mode);

export const useEffectiveTheme = (): EffectiveTheme => {
  const mode = useAppSelector((state) => state.mode.mode);
  const [systemTheme, setSystemTheme] =
    useState<EffectiveTheme>(getSystemTheme);

  useEffect(() => {
    if (mode !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const syncSystemTheme = () => {
      setSystemTheme(mediaQuery.matches ? "dark" : "light");
    };

    syncSystemTheme();
    mediaQuery.addEventListener?.("change", syncSystemTheme);
    return () => mediaQuery.removeEventListener?.("change", syncSystemTheme);
  }, [mode]);

  return resolveEffectiveTheme(mode, systemTheme);
};

