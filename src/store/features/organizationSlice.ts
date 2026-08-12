import type { OrgListItem } from "@/shared/types";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { login } from "./authSlice";

export interface OrganizationState {
  id: number;
  name: string;
  code: string;
  organizationTypeCode?: string;
  // useContractAccounting?: boolean;
  selectListType: "selectable" | "disabled" | "hidden" | "loading";
}

const getInitialState = (): OrganizationState => {
  try {
    const stored = localStorage.getItem("org");
    if (stored) {
      return JSON.parse(stored) as OrganizationState;
    }
    const loginData = localStorage.getItem("login");
    if (loginData) {
      const parsed = JSON.parse(loginData);
      const user = parsed?.user;

      if (user) {
        const fromOrgs = user.organizations?.[0];
        if (fromOrgs) {
          return {
            id: fromOrgs.organizationId,
            name: fromOrgs.organizationName,
            code: fromOrgs.organizationTypeCode ?? "",
            // useContractAccounting: fromOrgs.useContractAccounting ?? false,
            selectListType: "selectable",
          };
        }
        return {
          id: user.organizationId ?? 0,
          name: user.organizationName ?? "",
          code: user.organizationTypeCode ?? "",
          // useContractAccounting: user.useContractAccounting ?? false,
          selectListType: "selectable",
        };
      }
    }
  } catch {
    // ignore
  }
  return {
    id: 0,
    name: "",
    code: "",
    // useContractAccounting: false,
    selectListType: "selectable",
  };
};

const organizationSlice = createSlice({
  name: "organization",
  initialState: getInitialState(),
  reducers: {
    setOrganization: (_, action: PayloadAction<OrgListItem>) => {
      const next: OrganizationState = {
        id: action.payload.organizationId,
        name: action.payload.organizationName,
        code: action.payload.code,
        // useContractAccounting: action.payload.useContractAccounting ?? false,
        selectListType: "selectable",
      };
      localStorage.setItem("org", JSON.stringify(next));
      return next;
    },
    changeSelectListType: (
      state,
      action: PayloadAction<OrganizationState["selectListType"]>,
    ) => {
      const next = { ...state, selectListType: action.payload };
      localStorage.setItem("org", JSON.stringify(next));
      return next;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(login, (_, action) => {
      const user = action.payload.user;
      const fromOrgs = user.organizations?.[0];
      const next: OrganizationState = fromOrgs
        ? {
            id: fromOrgs.organizationId,
            name: fromOrgs.organizationName,
            code: fromOrgs.organizationTypeCode,
            // useContractAccounting: fromOrgs.useContractAccounting ?? false,
            selectListType: "selectable",
          }
        : {
            id: user.organizationId ?? 0,
            name: user.organizationName ?? "",
            // useContractAccounting: user.useContractAccounting ?? false,
            code: user.organizationTypeCode ?? "",
            selectListType: "selectable",
          };
      localStorage.setItem("org", JSON.stringify(next));
      return next;
    });
  },
});

export const { setOrganization, changeSelectListType } =
  organizationSlice.actions;
export default organizationSlice.reducer;
