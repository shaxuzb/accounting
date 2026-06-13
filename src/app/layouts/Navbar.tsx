import Messages from "@/components/navbar/messages";
import OrgSwitcher from "@/components/navbar/org-switcher";
import ProfileNav from "@/components/navbar/profile";
import { setClose } from "@/store/features/sidebarCloseSlice";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Button } from "antd";
import { ArrowLeft, PanelLeft, PanelLeftOpen } from "lucide-react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useMatches, useNavigate } from "react-router";

type NavbarRouteHandle = {
  title?: string;
  showBack?: boolean;
  backTo?: string;
  hideNavbarTitle?: boolean;
};

const Navbar = () => {
  const { t } = useTranslation();
  const matches = useMatches();
  const sidebarInline = useAppSelector((state) => state.sidebar);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const currentRouteHandle = [...matches].reverse().find((item) => {
    const handle = item.handle as NavbarRouteHandle | undefined;
    return (
      handle?.title ||
      handle?.showBack ||
      handle?.backTo ||
      handle?.hideNavbarTitle
    );
  })?.handle as NavbarRouteHandle | undefined;

  const pageTitle = currentRouteHandle?.title
    ? t(currentRouteHandle.title)
    : "";
  const showBack = !!currentRouteHandle?.showBack;
  const hideNavbarTitle = !!currentRouteHandle?.hideNavbarTitle;

  const handleClickMenu = useCallback(() => {
    dispatch(setClose(!sidebarInline.sidebar));
  }, [dispatch, sidebarInline.sidebar]);

  const handleGoBack = useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    if (currentRouteHandle?.backTo) {
      navigate(currentRouteHandle.backTo);
    }
  }, [currentRouteHandle?.backTo, navigate]);

  return (
    <div className="bg-primary-bg top-0 sticky z-10 border-b border-b-border border-[#e5e7eb] h-16 flex items-center">
      <div className={`flex justify-between py-1.5 items-center w-full px-4`}>
        <div className="flex gap-3 items-center">
          <Button onClick={handleClickMenu} className="p-0!" type="link">
            {!sidebarInline.sidebar ? (
              <PanelLeft strokeWidth={2} className="size-5 text-primary-text" />
            ) : (
              <PanelLeftOpen
                strokeWidth={2}
                className="size-5 text-primary-text"
              />
            )}
          </Button>
          {showBack && (
            <Button
              type="text"
              onClick={handleGoBack}
              className="px-1! py-3.5!"
              size="small"
            >
              <ArrowLeft className="size-5" />
            </Button>
          )}
          {pageTitle && !hideNavbarTitle && (
            <div>
              <span className="text-lg font-medium text-wrap text-text">
                {pageTitle}
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-2 items-center grow justify-end">
          <OrgSwitcher />
          <Messages />
          <ProfileNav />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
