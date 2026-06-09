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
    Table: {
      cellPaddingBlock: 6,
      borderColor: "#EFF1F5",
      cellPaddingInline: 10,
      fontWeightStrong: 600,
      headerBg: "#FAFBFD",
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
    Select: {},
    Table: {
      cellPaddingBlock: 8,
      cellPaddingInline: 10,
      fontWeightStrong: 600,
      headerBg: "#303030",
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
  },
};
export default { customTheme, darkCustomTheme };
