import { Suspense, useCallback, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { AnimatePresence, motion } from "motion/react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import LoadingScreen from "@/components/LoadingScreen";
import RouteFallback from "@/app/router/RouteFallback";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import {
  isLoading,
  logout,
  setSessionChecked,
} from "@/store/features/authSlice";
import { authService } from "@/services/authService";
import {
  menuPermissions,
  settingsViewPermissions,
} from "../config/menuPermissions";

const ProtectAuthLayout = () => {
  const user = useAppSelector((state) => state.auth.user);
  const sessionChecked = useAppSelector((state) => state.auth.sessionChecked);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const pathname = location.pathname;
  const isLoginPage = pathname === "/login";
  const isRootPage = pathname === "/";
  const isMainPage = pathname === "/main" || pathname.startsWith("/main/");
  const token = user?.token;
  const isCheckingSession = Boolean(token && !sessionChecked);

  const redirectToLogin = useCallback(() => {
    dispatch(logout());
    navigate("/login", { replace: true });
  }, [dispatch, navigate]);

  const getFirstAllowedPath = useCallback(() => {
    if (!user?.user?.permissions?.length) return null;

    const permissions = user.user.permissions;
    const hasAnySettingPermission = settingsViewPermissions.some((permission) =>
      permissions.includes(permission),
    );

    const allowedMenu = menuPermissions.TOP.find((item) => {
      if (item.linkData.path === "settings") {
        return hasAnySettingPermission;
      }

      if (item.dropdown && item.items?.length) {
        return item.items.some(
          (subItem) => subItem.code && permissions.includes(subItem.code),
        );
      }

      return item.code && permissions.includes(item.code);
    });

    if (!allowedMenu?.linkData?.path) return null;

    if (allowedMenu.items?.length) {
      const allowedSubItem = allowedMenu.items.find(
        (subItem) => subItem.code && permissions.includes(subItem.code),
      );

      if (!allowedSubItem?.linkData?.path) return null;

      return `/main/${allowedMenu.linkData.path}/${allowedSubItem.linkData.path}`;
    }

    return `/main/${allowedMenu.linkData.path}`;
  }, [user]);

  useEffect(() => {
    if (!token || sessionChecked) return;

    let active = true;

    const validateSession = async () => {
      try {
        dispatch(isLoading(true));
        await authService.authCheck();

        if (active) {
          dispatch(setSessionChecked(true));
        }
      } catch (err: unknown) {
        if (!active) return;

        // Only the server saying the session is over ends it. A check that failed for
        // any other reason — the API restarting, the database unreachable (500), the
        // network dropping — says nothing about the token, and treating it as a
        // rejection threw the user out of a session that was still valid.
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 401 || status === 403) {
          errorHandlers(err);
          redirectToLogin();
          return;
        }

        dispatch(setSessionChecked(true));
      } finally {
        if (active) {
          dispatch(isLoading(false));
        }
      }
    };

    validateSession();

    return () => {
      active = false;
    };
  }, [dispatch, redirectToLogin, sessionChecked, token]);

  useEffect(() => {
    if (isCheckingSession) return;

    if (!user) {
      if (!isLoginPage) {
        navigate("/login", { replace: true });
      }
      return;
    }

    if (isLoginPage || isRootPage || pathname === "/main") {
      const firstAllowedPath = getFirstAllowedPath();

      if (firstAllowedPath) {
        navigate(firstAllowedPath, { replace: true });
      } else {
        redirectToLogin();
      }
      return;
    }

    if (isMainPage) return;

    const firstAllowedPath = getFirstAllowedPath();

    if (firstAllowedPath) {
      navigate(firstAllowedPath, { replace: true });
    } else {
      redirectToLogin();
    }
  }, [
    getFirstAllowedPath,
    isCheckingSession,
    isLoginPage,
    isMainPage,
    isRootPage,
    navigate,
    pathname,
    redirectToLogin,
    user,
  ]);

  return (
    // Not mode="wait": that held the page back until the splash's exit animation ended,
    // and animations do not run in a background tab — a page opened there stayed on the
    // splash. The splash is an overlay instead, so the page mounts at once beneath it.
    <AnimatePresence>
      {isCheckingSession ? (
        <motion.div
          key="loading"
          className="fixed inset-0 z-[1000]"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
        >
          <LoadingScreen />
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Suspense fallback={<RouteFallback />}>
            <Outlet />
          </Suspense>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProtectAuthLayout;
