import { useEffect, useState, useCallback } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import toast from "react-hot-toast";
import Error from "@/components/Error";
import { logout } from "@/store/actions";
import type { AuthToken } from "@/shared/types";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { menuPermissions } from "../config/menuPermissions";
import { isLoading } from "@/store/features/authSlice";
import LoadingScreen from "@/components/LoadingScreen";

const ProtectAuthLayout = () => {
  const [error, setError] = useState(false);
  const [load, setLoad] = useState(true);
  const user = useAppSelector((state) => state.auth.user) as AuthToken | null;
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const redirectToLogin = useCallback(() => {
    dispatch(logout());
    navigate("/login", { replace: true });
    toast.error("Sessiya vaqti tugadi!");
  }, [dispatch, navigate]);

  const checkState = useCallback(async () => {
    try {
      // await authService.authCheck();
      return true;
    } catch (err: unknown) {
      errorHandlers(err);
    }
  }, [redirectToLogin]);

  const initAuth = useCallback(async () => {
    if (location.pathname === "/") return navigate("/login", { replace: true });
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    if (!location.pathname.includes("/login")) {
      const ok = await checkState();
      if (!ok) return;
    }

    if (!location.pathname.includes("/main")) {
      const filterItem = menuPermissions.TOP.filter((item) => {
        if (item.dropdown && item.items) {
          return item.items.some(
            (subItem) =>
              subItem.code && user.user?.permissions.includes(subItem.code),
          );
        }
        return user.user?.permissions.includes(item.code);
      });
      if (filterItem.length > 0) {
        if (filterItem[0].items?.length) {
          return navigate(
            `main/${filterItem[0].linkData?.path}/${filterItem[0].items[0]?.linkData?.path}`,
            { replace: true },
          );
        }
        navigate(`main/${filterItem[0]?.linkData?.path}`, { replace: true });
      }
    }
  }, [user, checkState, navigate]);

  useEffect(() => {
    let mounted = true;
    dispatch(isLoading(true));
    const loadData = async () => {
      try {
        setError(false);
        await new Promise((resolve) => setTimeout(resolve, 0));
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
  }, [initAuth, dispatch, user]);

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
