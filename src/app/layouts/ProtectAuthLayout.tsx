import { useEffect, useCallback, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import toast from "react-hot-toast";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import Error from "@/components/Error";
import LoadingScreen from "@/components/LoadingScreen";

import type { AuthToken } from "@/shared/types";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { isLoading, logout } from "@/store/features/authSlice";
import { authService } from "@/services/authService";
import { menuPermissions, settingsViewPermissions } from "../config/menuPermissions";

const ProtectAuthLayout = () => {
  const [error, setError] = useState(false);
  const [load, setLoad] = useState(true);

  const user = useAppSelector((state) => state.auth.user) as AuthToken | null;

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const pathname = location.pathname;

  const isLoginPage = pathname === "/login";
  const isRootPage = pathname === "/";
  const isMainPage = pathname === "/main" || pathname.startsWith("/main/");

  const redirectToLogin = useCallback(
    (showMessage = false) => {
      dispatch(logout());

      if (pathname !== "/login") {
        navigate("/login", { replace: true });
      }

      if (showMessage) {
        toast.error("Sessiya vaqti tugadi!");
      }
    },
    [dispatch, navigate, pathname],
  );

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

  const checkState = useCallback(async () => {
    try {
      await authService.authCheck();
      return true;
    } catch (err: unknown) {
      errorHandlers(err);
      return false;
    }
  }, []);

  const initAuth = useCallback(async () => {
    // 1. Agar user yo'q bo'lsa — faqat login
    if (!user) {
      if (!isLoginPage) {
        navigate("/login", { replace: true });
      }

      return;
    }

    // 2. User bor bo'lsa, token/session backenddan tekshiriladi
    const isValidSession = await checkState();

    if (!isValidSession) {
      redirectToLogin(true);
      return;
    }

    // 3. User login yoki root page'da turgan bo'lsa — birinchi ruxsat berilgan page'ga yuboramiz
    if (isLoginPage || isRootPage || pathname === "/main") {
      const firstAllowedPath = getFirstAllowedPath();

      if (firstAllowedPath) {
        navigate(firstAllowedPath, { replace: true });
        return;
      }

      // Permission umuman yo'q bo'lsa
      redirectToLogin(false);
      // toast.error("Sizda tizimga kirish uchun ruxsat yo'q!");
      return;
    }

    // 4. Agar user allaqachon /main/... ichida bo'lsa — joyida qoladi
    if (isMainPage) {
      return;
    }

    // 5. Boshqa noma'lum protected route bo'lsa — main ichidagi birinchi page'ga yuboramiz
    const firstAllowedPath = getFirstAllowedPath();

    if (firstAllowedPath) {
      navigate(firstAllowedPath, { replace: true });
      return;
    }

    redirectToLogin(false);
  }, [
    user,
    pathname,
    isLoginPage,
    isRootPage,
    isMainPage,
    checkState,
    redirectToLogin,
    getFirstAllowedPath,
    navigate,
  ]);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        dispatch(isLoading(true));
        setError(false);

        await initAuth();
      } catch {
        setError(true);
      } finally {
        if (mounted) {
          setLoad(false);
          dispatch(isLoading(false));
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [initAuth, dispatch]);

  return (
    <AnimatePresence mode="wait">
      {load ? (
        <motion.div
          key="loading"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
        >
          <LoadingScreen />
        </motion.div>
      ) : error ? (
        <Error />
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProtectAuthLayout;
