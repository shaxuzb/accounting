export type ID = string | number;

export interface OrgListItem {
  id: number;
  name: string;
  code: string;
  organizationTypeCode?: string;
  useContractAccounting?: boolean;
}



export interface AuthToken {
  token: string;
  user: User | null
}
export interface User {
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
  permissions: string[]
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
