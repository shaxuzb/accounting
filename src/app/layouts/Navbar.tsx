import Messages from "@/components/navbar/messages";
import OrgSwitcher from "@/components/navbar/org-switcher";
import ThemeToggle from "@/components/navbar/theme";
import LanguageSwitcher from "@/components/navbar/language";
import { useWorkspaceNavigation } from "@/app/navigation/useWorkspaceNavigation";
import { setClose } from "@/store/features/sidebarCloseSlice";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Button } from "antd";
import { ArrowLeft, PanelLeft, PanelLeftOpen } from "lucide-react";
import { useCallback } from "react";

const Navbar = () => {
  const {
    isBackAvailable,
    hideNavbarTitle,
    titleText,
    goBack,
  } = useWorkspaceNavigation();
  const sidebarInline = useAppSelector((state) => state.sidebar);
  const dispatch = useAppDispatch();

  const handleClickMenu = useCallback(() => {
    dispatch(setClose(!sidebarInline.sidebar));
  }, [dispatch, sidebarInline.sidebar]);

  const handleGoBack = useCallback(() => {
    goBack();
  }, [goBack]);

  return (
    <div className="flex h-16 shrink-0 items-center border-b border-border bg-primary-bg">
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
          {isBackAvailable && (
            <Button
              type="text"
              onClick={handleGoBack}
              className="px-1! py-3.5!"
              size="small"
            >
              <ArrowLeft className="size-5" />
            </Button>
          )}
          {titleText && !hideNavbarTitle && (
            <div>
              <span className="text-lg font-medium text-wrap text-text">
                {titleText}
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-2 items-center grow justify-end">
          <OrgSwitcher />
          <ThemeToggle />
          <LanguageSwitcher />
          <Messages />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
