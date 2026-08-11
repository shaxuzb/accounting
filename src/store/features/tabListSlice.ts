import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface TabItem {
  key: string;
  title: string;
  path: string;
  suffix?: string;
}

interface TabListState {
  tabs: TabItem[];
  activeTabKey: string | null;
}

const initialState: TabListState = {
  tabs: [],
  activeTabKey: null,
};

const tabListSlice = createSlice({
  name: "tabList",
  initialState,
  reducers: {
    addTab(state, action: PayloadAction<TabItem>) {
      const existingTab = state.tabs.find(
        (tab) => tab.key === action.payload.key,
      );

      if (existingTab) {
        existingTab.path = action.payload.path;
        existingTab.title = action.payload.title;
        existingTab.suffix = action.payload.suffix;
      } else {
        state.tabs.push(action.payload);
      }

      state.activeTabKey = action.payload.key;
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
    hydrateTabs(state, action: PayloadAction<TabListState>) {
      state.tabs = action.payload.tabs;
      state.activeTabKey = action.payload.activeTabKey;
    },
    clearTabs(state) {
      state.tabs = [];
      state.activeTabKey = null;
    },
  },
});

export const {
  addTab,
  removeTab,
  setTabs,
  setActiveTab,
  hydrateTabs,
  clearTabs,
} = tabListSlice.actions;
export default tabListSlice.reducer;
