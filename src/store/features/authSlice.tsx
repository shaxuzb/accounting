import type { AuthToken } from "@/shared/types";
import { clearLocalStorageExcept } from "@/utils/utils";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface AuthState {
  user: AuthToken | null;
  loading: boolean;
}

const getInitialState = (): AuthState => {
  try {
    const storedUser = localStorage.getItem("login");

    return {
      user: storedUser ? (JSON.parse(storedUser) as AuthToken) : null,
      loading: false,
    };
  } catch (error) {
    console.error("Invalid login JSON:", error);

    localStorage.removeItem("login");

    return {
      user: null,
      loading: false,
    };
  }
};

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {
    login: (state, action: PayloadAction<AuthToken>) => {
      state.user = action.payload;
      localStorage.setItem("login", JSON.stringify(action.payload));
    },

    isLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    logout: () => {
      clearLocalStorageExcept(["mode", "lang", "theme"]);
      return getInitialState();
    },
  },
});

export const { login, logout, isLoading } = authSlice.actions;
export default authSlice.reducer;
