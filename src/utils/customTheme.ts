import type { ThemeConfig } from "antd";

export type EffectiveTheme = "light" | "dark";

const themePalettes = {
  light: {
    brand: "#005cf3",
    brandHover: "#004acc",
    brandSoft: "#e7f0ff",
    page: "#f6f7fb",
    card: "#ffffff",
    elevated: "#ffffff",
    muted: "#f8fafc",
    hover: "#eef5ff",
    active: "#dbeafe",
    text: "#111827",
    heading: "#0f172a",
    textSecondary: "#64748b",
    textDisabled: "#9ca3af",
    border: "#e2e8f0",
    success: "#15803d",
    warning: "#b45309",
    danger: "#b91c1c",
    shadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
    shadowElevated: "0 18px 45px rgba(15, 23, 42, 0.14)",
  },
  dark: {
    brand: "#3b82f6",
    brandHover: "#2563eb",
    brandSoft: "#172554",
    page: "#0f172a",
    card: "#111827",
    elevated: "#182235",
    muted: "#1f2937",
    hover: "#1e293b",
    active: "#172554",
    text: "#e5e7eb",
    heading: "#f8fafc",
    textSecondary: "#94a3b8",
    textDisabled: "#64748b",
    border: "#334155",
    success: "#4ade80",
    warning: "#fbbf24",
    danger: "#f87171",
    shadow: "0 1px 3px rgba(0, 0, 0, 0.24)",
    shadowElevated: "0 18px 45px rgba(0, 0, 0, 0.35)",
  },
} as const;

const createThemeConfig = (mode: EffectiveTheme): ThemeConfig => {
  const palette = themePalettes[mode];

  return {
    token: {
      fontSize: 14,
      fontSizeSM: 14,
      fontSizeLG: 18,
      borderRadius: 8,
      fontFamily: '"Google Sans Flex", "Inter", sans-serif',
      colorPrimary: palette.brand,
      colorPrimaryHover: palette.brandHover,
      colorPrimaryBg: palette.brandSoft,
      colorBgBase: palette.page,
      colorBgLayout: palette.page,
      colorBgContainer: palette.card,
      colorBgElevated: palette.elevated,
      colorFillAlter: palette.muted,
      colorFillSecondary: palette.muted,
      colorText: palette.text,
      colorTextHeading: palette.heading,
      colorTextSecondary: palette.textSecondary,
      colorTextDisabled: palette.textDisabled,
      colorBorder: palette.border,
      colorBorderSecondary: palette.border,
      colorSuccess: palette.success,
      colorWarning: palette.warning,
      colorError: palette.danger,
      boxShadow: palette.shadow,
      boxShadowSecondary: palette.shadowElevated,
    },
    components: {
      Button: {
        algorithm: true,
        colorPrimary: palette.brand,
        colorPrimaryBg: palette.brand,
        colorPrimaryText: "#ffffff",
        colorPrimaryHover: palette.brandHover,
        colorPrimaryActive: palette.brandHover,
        primaryShadow: "none",
      },
      Select: {
        colorBgContainer: palette.muted,
        colorBorder: palette.border,
        colorText: palette.text,
        optionActiveBg: palette.hover,
        optionSelectedBg: palette.active,
      },
      Input: {
        colorBgContainer: palette.muted,
        colorBorder: palette.border,
        colorText: palette.text,
      },
      InputNumber: {
        colorBgContainer: palette.muted,
        colorBorder: palette.border,
        colorText: palette.text,
      },
      DatePicker: {
        colorBgContainer: palette.muted,
        colorBorder: palette.border,
        colorText: palette.text,
      },
      Table: {
        cellPaddingBlock: mode === "dark" ? 8 : 6,
        cellPaddingInline: 10,
        fontWeightStrong: 600,
        headerBg: palette.muted,
        headerColor: palette.heading,
        colorText: palette.text,
        borderColor: palette.border,
        rowHoverBg: palette.hover,
        fontSize: 16,
        borderRadius: 8,
        cellFontSize: 15,
      },
      Pagination: {
        itemActiveBg: palette.brand,
        colorPrimary: "#ffffff",
        colorPrimaryHover: "#ffffff",
      },
      Card: {
        padding: 0,
        bodyPadding: 0,
        colorBgContainer: palette.card,
        colorBorderSecondary: palette.border,
      },
      Segmented: {
        itemSelectedBg: palette.brand,
        itemSelectedColor: "#ffffff",
        itemColor: palette.textSecondary,
        trackBg: palette.muted,
      },
      Tag: {
        colorBorder: "transparent",
      },
      Menu: {
        itemColor: palette.textSecondary,
        fontWeightStrong: 900,
        itemHoverBg: palette.hover,
        itemHoverColor: palette.brand,
        itemSelectedBg: palette.active,
        itemSelectedColor: palette.brand,
        subMenuItemBg: "transparent",
      },
      Drawer: {
        colorBgElevated: palette.card,
      },
      Modal: {
        contentBg: palette.card,
        headerBg: palette.card,
        titleColor: palette.heading,
      },
      Popover: {
        colorBgElevated: palette.elevated,
      },
    },
  };
};

const customTheme = createThemeConfig("light");
const darkCustomTheme = createThemeConfig("dark");

export { createThemeConfig, themePalettes };
export default { customTheme, darkCustomTheme };
