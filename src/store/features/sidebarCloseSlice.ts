import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface SidebarState {
  collapsed: boolean;
}

const initialState: SidebarState = { collapsed: false };

const sidebarCloseSlice = createSlice({
  name: "sidebar",
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.collapsed = !state.collapsed;
    },
    setCollapsed(state, action: PayloadAction<boolean>) {
      state.collapsed = action.payload;
    },
  },
});

export const { toggleSidebar, setCollapsed } = sidebarCloseSlice.actions;
export default sidebarCloseSlice.reducer;
