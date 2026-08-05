import type { UserOrganizationPayload } from "./form";

export interface Users {
  id: number;
  userName: string;
  phoneNumber: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified?: boolean;
  timezone?: string | null;
  roleId: number;
  lastAccessTime: string;
  stateId: number;
  createdDate: string;
  roleName: string;
  stateName: string;
  organizations: UserOrganizationPayload[];
}
