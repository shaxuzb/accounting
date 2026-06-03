import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type Lang = "uz" | "ru";

const initialState = { lang: (localStorage.getItem("lang") as Lang) || "uz" };

const langSlice = createSlice({
  name: "lang",
  initialState,
  reducers: {
    setLang(state, action: PayloadAction<Lang>) {
      state.lang = action.payload;
      localStorage.setItem("lang", action.payload);
    },
  },
});

export const { setLang } = langSlice.actions;
export default langSlice.reducer;
