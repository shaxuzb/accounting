import { RouterProvider } from "react-router";
import { useEffect, useState } from "react";
import { App, ConfigProvider, theme } from "antd";
import uzUz from "antd/es/locale/uz_UZ";
import ruRU from "antd/es/locale/ru_RU";
import enUS from "antd/es/locale/en_US";
import "dayjs/locale/uz";
import "dayjs/locale/ru";
import "dayjs/locale/en";
import isoWeek from "dayjs/plugin/isoWeek";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import dayjs from "dayjs";
import { router } from "./app/router";
import customTheme from "./utils/customTheme";
import { useAppSelector } from "./store/hooks";
import { getEffectiveTheme } from "./utils/utils";
import "react-custom-scroller/dist/index.css";
// import { useEffect } from "react";
// import { sinchronius } from "./store/features/modeSlice";
dayjs.extend(isoWeek);
dayjs.locale("uz");

const Root = () => {
  const themeMode = useAppSelector((state) => state.mode.mode);
  const lang = useAppSelector((state) => state.lang.lang);
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light",
  );
  const effectiveTheme =
    themeMode === "system" ? systemTheme : getEffectiveTheme(themeMode);
  // const dispatch = useAppDispatch();
  const localeMap = {
    uz: uzUz,
    ru: ruRU,
    en: enUS,
  } as const;
  const customLocale = {
    ...localeMap[lang],
    week: 1,
  };
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: false,
      },
    },
  });
  useEffect(() => {
    dayjs.locale(lang);
  }, [lang]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleSystemThemeChange = () => {
      if (themeMode === "system") {
        setSystemTheme(mediaQuery.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener?.("change", handleSystemThemeChange);
    return () =>
      mediaQuery.removeEventListener?.("change", handleSystemThemeChange);
  }, [themeMode]);

  return (
    <ConfigProvider
      theme={{
        algorithm:
          effectiveTheme === "light"
            ? theme.defaultAlgorithm
            : theme.darkAlgorithm,
        ...(effectiveTheme === "light"
          ? customTheme.customTheme
          : customTheme.darkCustomTheme),
      }}
      locale={customLocale}
    >
      <div className={`theme-${effectiveTheme} ${effectiveTheme}`}>
        <App>
          <Toaster />
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
          </QueryClientProvider>
        </App>
      </div>
    </ConfigProvider>
  );
};

export default Root;
