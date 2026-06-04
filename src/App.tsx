import { RouterProvider } from "react-router";
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
  // useEffect(() => {
  //   dispatch(sinchronius(themeMode));
  // }, [dispatch, themeMode]);
  return (
    <ConfigProvider
      theme={{
        algorithm:
          getEffectiveTheme(themeMode) === "light"
            ? theme.defaultAlgorithm
            : theme.darkAlgorithm,
        ...(getEffectiveTheme(themeMode) === "light"
          ? customTheme.customTheme
          : customTheme.darkCustomTheme),
      }}
      locale={customLocale}
    >
      <App>
        <Toaster />
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </App>
    </ConfigProvider>
  );
};

export default Root;
