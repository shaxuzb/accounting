import { Outlet, useLocation } from "react-router";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import WorkspaceTabs from "./WorkspaceTabs";
import WorkspaceNavigationManager from "@/app/navigation/WorkspaceNavigationManager";
// import SettingSystem from "@/components/navbar/settings";
import { Suspense, useRef } from "react";
import { motion } from "motion/react";
import { usePageScrollRestore } from "@/components/ui/scroll/usePageScrollRestore";
import { useAppSelector } from "@/store/hooks";
import RouteFallback from "@/app/router/RouteFallback";

const MainLayout = () => {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const userId = useAppSelector((state) => state.auth.user?.user?.id ?? 0);
  const organizationId = useAppSelector((state) => state.organization.id);
  usePageScrollRestore({
    containerRef: scrollContainerRef,
    storageKey: "main-layout-scroll-position",
    scopeKey: `${userId}:${organizationId}:${location.pathname}`,
  });

  return (
    <motion.div
      ref={containerRef}
      className="relative h-screen overflow-hidden print:h-auto print:overflow-visible"
    >
      <div className="relative z-10! flex h-full box-border! print:block print:h-auto">
        <Sidebar />
        <div className="relative flex w-full min-w-0 flex-1 flex-col overflow-hidden print:overflow-visible">
          <Navbar />
          <WorkspaceNavigationManager />
          <div className="print:hidden">
            <WorkspaceTabs key={`${userId}:${organizationId}`} />
          </div>

          <div
            ref={scrollContainerRef}
            className="relative min-h-0 flex-1 overflow-auto print:overflow-visible"
          >
            <div className="relative w-full min-w-0 px-4 py-2">
              <Suspense fallback={<RouteFallback />}>
                <Outlet />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
      {/* <SettingSystem ref={containerRef} /> */}
    </motion.div>
  );
};

export default MainLayout;
