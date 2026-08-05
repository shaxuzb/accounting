export interface UserOrganizationForm {
  organizationId: number | null;
  roleId: number | null;
  isDefault: boolean;
  isOwner: boolean;
}

export interface UserOrganizationPayload {
  organizationId: number;
  roleId: number;
  isDefault: boolean;
  isOwner: boolean;
}

export interface UsersForm {
  userName: string;
  phoneNumber: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  stateId?: number | null;
  organizations: UserOrganizationForm[];
}

export interface CreateUserPayload {
  userName: string;
  phoneNumber: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: false;
  timezone: null;
  organizations: UserOrganizationPayload[];
  password: string;
}

export interface UpdateUserPayload extends Omit<CreateUserPayload, "password"> {
  password?: string;
  stateId?: number | null;
}
