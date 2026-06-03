export type ID = string | number;

export interface OrgListItem {
  id: number;
  name: string;
  code: string;
  organizationTypeCode?: string;
  useContractAccounting?: boolean;
}

export interface User {
  id: number;
  userName: string;
  phoneNumber: string;
  useContractAccounting?: boolean;
  organizationId: number;
  organizationTypeCode: string;
  organizationName: string;
  fullName: string;
  role: string;
  roleId: number;
  state: string;
  stateId: number;
  isParent: boolean;
  modules: number[];
  permissions: string[];
  organizations?: OrgListItem[];
}

export interface AuthToken {
  token: string;
  user: User;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page?: number;
  pageSize?: number;
}

export interface ListParams {
  search?: string;
  page?: number;
  pageSize?: number;
  [key: string]: unknown;
}

//menu

export interface MenuRole {
  code: string;
  filterCode?: string;
  dropdown?: boolean;
  tabCode?: string;
  dropdownName?: string;
  linkData: {
    path: string;
    title?: string;
    description?: string;
    img?: string;
  };
  iconName?: React.ReactNode;
  items?: SideBarItems[];
  order?: number;
}
export interface SideBarItems {
  code?: string;
  tabCode?: string;
  dropdown?: boolean;
  linkData?: {
    path?: string;
    title?: string;
  };
  items?: SideBarItems[];
  iconName?: React.ReactNode;
  order?: number;
}
