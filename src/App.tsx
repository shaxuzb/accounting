import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider } from "antd";
import uzUZ from "antd/locale/uz_UZ";
import { RouterProvider } from "react-router";
import { Toaster } from "react-hot-toast";
import { useAppSelector } from "@/store/hooks";
import { router } from "@/app/router";
import { getAntdTheme } from "@/utils/customTheme";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30_000 } },
});

export default function App() {
  const mode = useAppSelector((s) => s.mode.mode);

  return (
    <ConfigProvider locale={uzUZ} theme={getAntdTheme(mode)}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster position="top-right" />
      </QueryClientProvider>
    </ConfigProvider>
  );
}
