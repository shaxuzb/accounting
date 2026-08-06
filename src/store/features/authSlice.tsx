import type { AuthToken } from "@/shared/types";
import { clearLocalStorageExcept } from "@/utils/utils";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface AuthState {
  user: AuthToken | null;
  loading: boolean;
  sessionChecked: boolean;
}

const getInitialState = (): AuthState => {
  try {
    const storedUser = localStorage.getItem("login");

    return {
      user: storedUser ? (JSON.parse(storedUser) as AuthToken) : null,
      loading: false,
      sessionChecked: !storedUser,
    };
  } catch (error) {
    console.error("Invalid login JSON:", error);

    localStorage.removeItem("login");

    return {
      user: null,
      loading: false,
      sessionChecked: true,
    };
  }
};

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {
    login: (state, action: PayloadAction<AuthToken>) => {
      state.user = action.payload;
      state.sessionChecked = true;
      localStorage.setItem("login", JSON.stringify(action.payload));
    },

    isLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setSessionChecked: (state, action: PayloadAction<boolean>) => {
      state.sessionChecked = action.payload;
    },

    logout: () => {
      clearLocalStorageExcept(["mode", "lang", "theme"]);
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("accounting:edo:auth:")) {
          localStorage.removeItem(key);
        }
      });
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith("accounting:edo:auth:")) {
          sessionStorage.removeItem(key);
        }
      });
      return getInitialState();
    },
  },
});

export const { login, logout, isLoading, setSessionChecked } =
  authSlice.actions;
export default authSlice.reducer;
