import { cashOperationPermissions } from "../../cashoperation/constants/permissions";

export const cashBookPermissions = {
  view: cashOperationPermissions.view,
  detail: cashOperationPermissions.view,
} as const;
