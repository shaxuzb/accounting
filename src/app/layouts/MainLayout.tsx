import { Outlet } from "react-router";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
// import SettingSystem from "@/components/navbar/settings";
import { useRef } from "react";
import { motion } from "motion/react";
const MainLayout = () => {
  const containerRef = useRef(null);
  return (
    <motion.div ref={containerRef} className="relative">
      <div className="flex relative box-border! z-10!">
        <Sidebar />
        <div className="w-full relative overflow-auto h-screen">
          <Navbar />

          <div className="py-2 px-4 w-full relative">
            <div className="">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
      {/* <SettingSystem ref={containerRef} /> */}
    </motion.div>
  );
};

export default MainLayout;
