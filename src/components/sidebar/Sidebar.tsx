import { useLocation, useNavigate } from "react-router";
import { Layout, Menu } from "antd";
import { useAppSelector } from "@/store/hooks";
import { menuPermissions } from "@/app/config/menuPermissions";

const { Sider } = Layout;

export default function Sidebar() {
  const collapsed = useAppSelector((s) => s.sidebar.collapsed);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const items = menuPermissions.map((m) => ({ key: m.path, icon: m.icon, label: m.label }));

  return (
    <Sider collapsible collapsed={collapsed} trigger={null} theme="light" width={240}>
      <div className="flex h-14 items-center justify-center text-lg font-bold">ERP</div>
      <Menu mode="inline" selectedKeys={[pathname]} items={items} onClick={({ key }) => navigate(key)} />
    </Sider>
  );
}
