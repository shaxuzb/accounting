// import type { organizations } from "./form";

import type { organizations } from "./form";

export interface Users {
  id: number;
  userName: string;
  phoneNumber: string;
  email: string;
  firstName: string;
  lastName: string;
  roleId: number;
  lastAccessTime: string;
  stateId: number;
  createdDate: string;
  roleName: string;
  stateName: string;
  organizations: organizations[];
}
