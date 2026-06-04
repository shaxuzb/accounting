import { Outlet } from "react-router";
import { Layout } from "antd";
import Sidebar from "@/components/sidebar/Sidebar";
import Navbar from "@/components/navbar/Navbar";

const { Content } = Layout;

export default function MainLayout() {
  return (
    <Layout className="min-h-screen">
      <Sidebar />
      <Layout>
        <Navbar />
        <Content className="p-4">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
