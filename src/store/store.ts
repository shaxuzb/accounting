import { combineReducers, configureStore } from "@reduxjs/toolkit";
import type { Action } from "@reduxjs/toolkit";
import authReducer, { logout } from "./features/authSlice";
import langReducer from "./features/langSlice";
import modeReducer from "./features/modeSlice";
import organizationReducer from "./features/organizationSlice";
import sidebarReducer from "./features/sidebarCloseSlice";
import tabListReducer from "./features/tabListSlice";
import { edoImportLogoutCleanupMiddleware } from "./middleware/edoImportLogoutCleanup";

const combined = combineReducers({
  lang: langReducer,
  mode: modeReducer,
  organization: organizationReducer,
  sidebar: sidebarReducer,
  tabList: tabListReducer,
  auth: authReducer,
});

export type RootState = ReturnType<typeof combined>;

const rootReducer = (
  state: RootState | undefined,
  action: Action,
): RootState => {
  if (action.type === logout.type) {
    localStorage.removeItem("login");
    localStorage.removeItem("org");
    state = undefined;
  }
  return combined(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(edoImportLogoutCleanupMiddleware),
});
export type AppDispatch = typeof store.dispatch;
