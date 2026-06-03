import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { ID } from "@/shared/types";

interface OrganizationState {
  organizationId: ID | null;
}

const initialState: OrganizationState = { organizationId: localStorage.getItem("org") };

const organizationSlice = createSlice({
  name: "organization",
  initialState,
  reducers: {
    setOrganization(state, action: PayloadAction<ID | null>) {
      state.organizationId = action.payload;
      if (action.payload == null) localStorage.removeItem("org");
      else localStorage.setItem("org", String(action.payload));
    },
  },
});

export const { setOrganization } = organizationSlice.actions;
export default organizationSlice.reducer;
