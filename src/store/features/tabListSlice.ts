import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface TabItem {
  key: string;
  label: string;
  path: string;
}

interface TabListState {
  tabs: TabItem[];
}

const initialState: TabListState = { tabs: [] };

const tabListSlice = createSlice({
  name: "tabList",
  initialState,
  reducers: {
    addTab(state, action: PayloadAction<TabItem>) {
      if (!state.tabs.some((t) => t.key === action.payload.key)) state.tabs.push(action.payload);
    },
    removeTab(state, action: PayloadAction<string>) {
      state.tabs = state.tabs.filter((t) => t.key !== action.payload);
    },
    setTabs(state, action: PayloadAction<TabItem[]>) {
      state.tabs = action.payload;
    },
  },
});

export const { addTab, removeTab, setTabs } = tabListSlice.actions;
export default tabListSlice.reducer;
