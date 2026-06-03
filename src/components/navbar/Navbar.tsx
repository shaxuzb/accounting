import { Button, Layout, Segmented, Space, Tooltip } from "antd";
import { LogOut, Menu as MenuIcon, Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setLang } from "@/store/features/langSlice";
import type { Lang } from "@/store/features/langSlice";
import { toggleMode } from "@/store/features/modeSlice";
import { toggleSidebar } from "@/store/features/sidebarCloseSlice";
import { logout } from "@/store/actions";

const { Header } = Layout;

export default function Navbar() {
  const dispatch = useAppDispatch();
  const { i18n } = useTranslation();
  const mode = useAppSelector((s) => s.mode.mode);
  const lang = useAppSelector((s) => s.lang.lang);

  const changeLang = (value: string | number) => {
    const next = value as Lang;
    dispatch(setLang(next));
    void i18n.changeLanguage(next);
  };

  return (
    <Header className="flex items-center justify-between px-4" style={{ background: "transparent" }}>
      <Button type="text" icon={<MenuIcon size={18} />} onClick={() => dispatch(toggleSidebar())} />
      <Space>
        <Segmented
          value={lang}
          onChange={changeLang}
          options={[
            { label: "UZ", value: "uz" },
            { label: "RU", value: "ru" },
          ]}
        />
        <Tooltip title="Theme">
          <Button
            type="text"
            icon={mode === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            onClick={() => dispatch(toggleMode())}
          />
        </Tooltip>
        <Tooltip title="Logout">
          <Button type="text" danger icon={<LogOut size={18} />} onClick={() => dispatch(logout())} />
        </Tooltip>
      </Space>
    </Header>
  );
}
