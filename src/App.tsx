import { RouterProvider } from "react-router";
import { useEffect, useState } from "react";
import { App, ConfigProvider, theme } from "antd";
import uzUz from "antd/es/locale/uz_UZ";
import "dayjs/locale/uz";
import isoWeek from "dayjs/plugin/isoWeek";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import dayjs from "dayjs";
import { router } from "./app/router";
import customTheme from "./utils/customTheme";
import { useAppSelector } from "./store/hooks";
import { getEffectiveTheme } from "./utils/utils";
// import { useEffect } from "react";
// import { sinchronius } from "./store/features/modeSlice";
dayjs.extend(isoWeek);
dayjs.locale("uz");
const Root = () => {
  const themeMode = useAppSelector((state) => state.mode.mode);
  const [effectiveTheme, setEffectiveTheme] = useState(() =>
    getEffectiveTheme(themeMode),
  );
  // const dispatch = useAppDispatch();
  const customLocale = {
    ...uzUz,
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
    setEffectiveTheme(getEffectiveTheme(themeMode));
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleSystemThemeChange = () => {
      if (themeMode === "system") {
        setEffectiveTheme(getEffectiveTheme(themeMode));
      }
    };

    mediaQuery.addEventListener?.("change", handleSystemThemeChange);
    return () => mediaQuery.removeEventListener?.("change", handleSystemThemeChange);
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
      <div className={`theme-${effectiveTheme} `}>        
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
