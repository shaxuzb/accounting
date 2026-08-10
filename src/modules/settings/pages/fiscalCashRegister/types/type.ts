export interface FiscalCashRegister {
  id: number;
  warehouseId: number | null;
  warehouseName?: string | null;
  warehouse?: string | null;
  registerTypeId: number;
  registerTypeName?: string | null;
  registerType?: string | null;
  name: string | null;
  externalRegisterId: string | null;
  model: string | null;
  serialNumber: string | null;
  fiscalModuleNumber: string | null;
  stateId?: number | null;
  stateName?: string | null;
  createdDate?: string | null;
}
