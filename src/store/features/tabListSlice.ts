import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface TabItem {
  key: string;
  title: string;
  path: string;
  suffix?: string;
  isPinned?: boolean;
  parentPath?: string;
  parentKey?: string;
}

interface TabListState {
  tabs: TabItem[];
  activeTabKey: string | null;
  hydratedStorageKey: string | null;
}

type HydrateTabsPayload = Omit<TabListState, "hydratedStorageKey"> & {
  storageKey: string;
};

const initialState: TabListState = {
  tabs: [],
  activeTabKey: null,
  hydratedStorageKey: null,
};

const tabListSlice = createSlice({
  name: "tabList",
  initialState,
  reducers: {
    upsertTab(state, action: PayloadAction<TabItem>) {
      const existingTab = state.tabs.find(
        (tab) => tab.key === action.payload.key,
      );

      if (existingTab) {
        existingTab.path = action.payload.path;
        existingTab.title = action.payload.title;
        existingTab.suffix = action.payload.suffix;
        existingTab.parentPath = action.payload.parentPath;
        existingTab.parentKey = action.payload.parentKey;
        if (typeof action.payload.isPinned === "boolean") {
          existingTab.isPinned = action.payload.isPinned;
        }
      } else {
        state.tabs.push(action.payload);
      }
    },
    pinTab(state, action: PayloadAction<TabItem>) {
      const existingTab = state.tabs.find(
        (tab) => tab.key === action.payload.key,
      );

      if (existingTab) {
        existingTab.path = action.payload.path;
        existingTab.title = action.payload.title;
        existingTab.suffix = action.payload.suffix;
        existingTab.parentPath = action.payload.parentPath;
        existingTab.parentKey = action.payload.parentKey;
        existingTab.isPinned = true;
      } else {
        state.tabs.push({
          ...action.payload,
          isPinned: true,
        });
      }
    },
    unpinTab(state, action: PayloadAction<string>) {
      const existingTab = state.tabs.find(
        (tab) => tab.key === action.payload,
      );

      if (existingTab) {
        existingTab.isPinned = false;
      }
    },
    removeTab(state, action: PayloadAction<string>) {
      state.tabs = state.tabs.filter((t) => t.key !== action.payload);
      if (state.activeTabKey === action.payload) {
        state.activeTabKey = null;
      }
    },
    setTabs(state, action: PayloadAction<TabItem[]>) {
      state.tabs = action.payload;
    },
    setActiveTab(state, action: PayloadAction<string | null>) {
      state.activeTabKey = action.payload;
    },
    hydrateTabs(state, action: PayloadAction<HydrateTabsPayload>) {
      state.tabs = action.payload.tabs;
      state.activeTabKey = action.payload.activeTabKey;
      state.hydratedStorageKey = action.payload.storageKey;
    },
    clearTabs(state) {
      state.tabs = [];
      state.activeTabKey = null;
    },
  },
});

export const {
  upsertTab,
  pinTab,
  unpinTab,
  removeTab,
  setTabs,
  setActiveTab,
  hydrateTabs,
  clearTabs,
} = tabListSlice.actions;
export default tabListSlice.reducer;
