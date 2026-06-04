import { setMode } from "@/store/features/modeSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Button, Drawer } from "antd";
import { Cpu, Moon, Sun, X } from "lucide-react";
import type { FC, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
interface SettingDetailProps {
  open: boolean;
  setOpen: React.Dispatch<SetStateAction<boolean>>;
}
const SettingDetail: FC<SettingDetailProps> = ({ open, setOpen }) => {
  const { t } = useTranslation();
  const themeMode = useAppSelector((state) => state.mode.mode);
  const dispatch = useAppDispatch();
  const handleChangeTheme = (mode: "light" | "dark" | "system") => {
    dispatch(setMode(mode));
  };
  return (
    <Drawer
      open={open}
      onClose={() => setOpen(!open)}
      className="rounded-lg!"
      title={
        <div className="flex justify-between items-center">
          <h1 className="text-sm font-medium">{t("ThemeSettings.title")}</h1>
          <div className="flex items-center gap-2">
            <Button danger>{t("ThemeSettings.reset")}</Button>
            <Button
              type="text"
              onClick={() => setOpen(false)}
              className="p-0! w-7! h-7! flex! justify-center! items-center! rounded-full!"
            >
              <X className="size-4.5 mb-0!" />
            </Button>
          </div>
        </div>
      }
      closable={false}
      classNames={{
        wrapper: "!right-4 !top-4 !bottom-4",
        body: "!p-0",
      }}
    >
      <div>
        <div className="flex items-center justify-between p-3 px-6 border-b border-b-border">
          <h1 className="text-base font-medium uppercase">
            {t("ThemeSettings.themeMode.title")}
          </h1>
          <div className="flex gap-1">
            <Button
              className="p-0! w-10! h-10! shadow-none!"
              color={themeMode === "light" ? "primary" : "default"}
              variant="outlined"
              onClick={() => handleChangeTheme("light")}
            >
              <Sun className="size-6" />
            </Button>
            <Button
              className="p-0! w-10! h-10! shadow-none!"
              color={themeMode === "dark" ? "primary" : "default"}
              variant="outlined"
              onClick={() => handleChangeTheme("dark")}
            >
              <Moon className="size-6" />
            </Button>
            <Button
              className="p-0! w-10! h-10! shadow-none!"
              color={themeMode === "system" ? "primary" : "default"}
              variant="outlined"
              onClick={() => handleChangeTheme("system")}
            >
              <Cpu className="size-6" />
            </Button>
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default SettingDetail;
