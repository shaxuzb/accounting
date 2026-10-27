import type { Middleware } from "@reduxjs/toolkit";
import { logout } from "../features/authSlice";
import { stopPresence } from "@/services/presence";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL_PATH + "/api";

/**
 * A logout ends the sign-in's session on the server too (the users' activity shows it as a
 * logout, not as an idle timeout) and closes the presence socket. It runs before the reducer
 * clears the token; keepalive lets the request finish while the app navigates away.
 */
export const sessionLogoutMiddleware: Middleware =
  (api) => (next) => (action) => {
    if (logout.match(action)) {
      const token = (api.getState() as { auth?: { user?: { token?: string } | null } })
        .auth?.user?.token;
      if (token) {
        void fetch(`${apiBaseUrl}/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          keepalive: true,
        }).catch(() => null);
      }
      void stopPresence();
    }

    return next(action);
  };
