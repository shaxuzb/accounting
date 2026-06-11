export interface Counterparty {
  id: number;
  organizationId: number;
  organizationName: string;
  counterpartyTypeId: number;
  counterpartyTypeName: string;
  shortName: string;
  fullName: string;
  inn: string;
  phoneNumber: string;
  regionId: number;
  regionName: string;
  districtId: number;
  districtName: string;
  stateId: number;
  stateName: string;
  createdDate: string;
}

export interface CounterpartyModule {
  id: number;
  code: string;
  fullName: string;
  shortName: string;
}

export interface CounterpartyModuleGroup {
  id: number;
  fullName: string;
  shortName?: string;
  modules: CounterpartyModule[];
}

export interface CounterpartyDetail extends Counterparty {
  counterpartyModules: Array<{
    id?: number;
    moduleId: number;
  }>;
}
