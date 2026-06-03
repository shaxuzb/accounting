import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type Mode = "light" | "dark";

const initialState = { mode: (localStorage.getItem("mode") as Mode) || "light" };

const modeSlice = createSlice({
  name: "mode",
  initialState,
  reducers: {
    setMode(state, action: PayloadAction<Mode>) {
      state.mode = action.payload;
      localStorage.setItem("mode", action.payload);
    },
    toggleMode(state) {
      state.mode = state.mode === "light" ? "dark" : "light";
      localStorage.setItem("mode", state.mode);
    },
  },
});

export const { setMode, toggleMode } = modeSlice.actions;
export default modeSlice.reducer;
