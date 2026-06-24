import type { ThemeConfig } from "antd";
import { color } from "@/shared/constants/colors";
import { hexToRgb } from "./utils";

const customTheme: ThemeConfig = {
  token: {
    fontSize: 14,
    fontSizeSM: 14,
    fontSizeLG: 18,
    borderRadius: 8,
    fontFamily: '"Inter", sans-serif',
    colorPrimary: color.baseColor,
    colorBgBase: "#f6f7fb",
    colorBgContainer: "#ffffff",
    colorBgElevated: "#ffffff",
    colorText: "#111827",
    colorTextSecondary: "#64748b",
    colorBorder: "#e5e7eb",
  },
  components: {
    Button: {
      algorithm: true,
      colorPrimary: color.baseColor,
      colorPrimaryBg: color.baseColor,
      colorPrimaryText: "#fff",
      colorPrimaryBgHover: `rgba(${hexToRgb(color.baseColor)}, 0.9)`,
    },
    Select: {},
    Input: {
      colorBgContainer: "#ffffff",
      colorBorder: "#e5e7eb",
    },
    DatePicker: {
      colorBgContainer: "#ffffff",
      colorBorder: "#e5e7eb",
    },
    Table: {
      cellPaddingBlock: 6,
      borderColor: "#E2E8F0",
      cellPaddingInline: 10,
      fontWeightStrong: 600,
      headerBg: "#F7F9FE",
      headerColor: color.textColor,
      colorText: color.textColor,
      fontSize: 16,
      borderRadius: 8,
      cellFontSize: 15,
    },
    Pagination: {
      itemActiveBg: color.baseColor,
      colorPrimary: "white",
      colorPrimaryHover: "white",
    },
    Card: {
      padding: 0,
      bodyPadding: 0,
    },
    Segmented: {
      itemSelectedBg: color.baseColor,
      itemSelectedColor: "white",
    },
    Tag: {
      colorBorder: "transparent",
    },
    Menu: {
      itemColor: color.mutedColor,
      fontWeightStrong: 900,
      itemHoverBg: color.menuBg,
      itemHoverColor: color.baseColor,
    },
    Drawer: {
      colorBgElevated: "#ffffff",
    },
    Modal: {
      contentBg: "#ffffff",
      headerBg: "#ffffff",
    },
  },
};

const darkCustomTheme: ThemeConfig = {
  token: {
    fontSize: 14,
    fontSizeSM: 14,
    fontSizeLG: 18,
    borderRadius: 8,
    fontFamily: '"Inter", sans-serif',
    colorPrimary: color.baseColor,
    colorBgBase: "#0f172a",
    colorBgContainer: "#111827",
    colorBgElevated: "#111827",
    colorText: "#e5e7eb",
    colorTextSecondary: "#94a3b8",
    colorBorder: "#334155",
  },
  components: {
    Button: {
      algorithm: true,
      colorPrimary: color.baseColor,
      colorPrimaryBg: color.baseColor,
      boxShadow: "",
      primaryShadow: "",
      colorPrimaryText: "#fff",
      colorPrimaryBgHover: `rgba(${hexToRgb(color.baseColor)}, 0.9)`,
      colorPrimaryActive: "",
    },
    Select: {
      colorBgContainer: "#1f2937",
      colorBorder: "#334155",
      colorText: "#e5e7eb",
    },
    Input: {
      colorBgContainer: "#1f2937",
      colorBorder: "#334155",
      colorText: "#e5e7eb",
    },
    DatePicker: {
      colorBgContainer: "#1f2937",
      colorBorder: "#334155",
      colorText: "#e5e7eb",
    },
    Table: {
      cellPaddingBlock: 8,
      cellPaddingInline: 10,
      fontWeightStrong: 600,
      headerBg: "#1f2937",
      headerColor: "#f8fafc",
      colorText: "#e5e7eb",
      borderColor: "#334155",
      rowHoverBg: "#172554",
      fontSize: 16,
      borderRadius: 8,
      cellFontSize: 15,
    },
    Pagination: {
      itemActiveBg: color.baseColor,
      colorPrimary: "white",
      colorPrimaryHover: "white",
    },
    Card: {
      padding: 0,
      bodyPadding: 0,
    },
    Segmented: {
      itemSelectedBg: color.baseColor,
      itemSelectedColor: "white",
      itemColor: "#cbd5e1",
      trackBg: "#1f2937",
    },
    Menu: {
      itemColor: "#cbd5e1",
      itemHoverBg: "#172554",
      itemHoverColor: "#93c5fd",
      itemSelectedBg: "#172554",
      itemSelectedColor: "#93c5fd",
      subMenuItemBg: "transparent",
    },
    Drawer: {
      colorBgElevated: "#111827",
    },
    Modal: {
      contentBg: "#111827",
      headerBg: "#111827",
    },
  },
};
export default { customTheme, darkCustomTheme };
