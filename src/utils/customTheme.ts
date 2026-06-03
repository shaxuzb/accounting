import { theme } from "antd";
import type { ThemeConfig } from "antd";
import type { Mode } from "@/store/features/modeSlice";

export const getAntdTheme = (mode: Mode): ThemeConfig => ({
  algorithm: mode === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
  token: {
    colorPrimary: "#2563eb",
    borderRadius: 8,
    fontFamily: "Inter, system-ui, sans-serif",
  },
});
