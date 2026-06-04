import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  sidebar: false as boolean,
  responseSidebar: false as boolean,
};

const sidebarCloseSlice = createSlice({
  name: "sideBarSlice",
  initialState,
  reducers: {
    setClose: (state, action: PayloadAction<boolean>) => {
      state.sidebar = action.payload;
    },
    setResponseOpen: (state, action: PayloadAction<boolean>) => {
      state.responseSidebar = action.payload;
    },
  },
});
export const { setClose, setResponseOpen } = sidebarCloseSlice.actions;
export default sidebarCloseSlice.reducer;
