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
import { useEffectiveTheme } from "./shared/hooks/useEffectiveTheme";
import "react-custom-scroller/dist/index.css";
import "./components/ui/scroll/customscroll.css";
dayjs.extend(isoWeek);
dayjs.locale("uz");

const Root = () => {
  const lang = useAppSelector((state) => state.lang.lang);
  const effectiveTheme = useEffectiveTheme();
  const localeMap = {
    uz: uzUz,
    ru: ruRU,
    en: enUS,
  } as const;
  const customLocale = {
    ...localeMap[lang],
    week: 1,
  };
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: false,
          },
        },
      }),
  );
  useEffect(() => {
    dayjs.locale(lang);
  }, [lang]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = effectiveTheme;
    root.classList.toggle("dark", effectiveTheme === "dark");
    root.classList.toggle("light", effectiveTheme === "light");
    root.style.colorScheme = effectiveTheme;
  }, [effectiveTheme]);

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
          <Toaster
            toastOptions={{
              style: {
                background: "var(--theme-bg-elevated)",
                color: "var(--theme-text-primary)",
                border: "1px solid var(--theme-border)",
                boxShadow: "var(--theme-shadow-elevated)",
              },
            }}
          />
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
          </QueryClientProvider>
        </App>
      </div>
    </ConfigProvider>
  );
};

export default Root;
