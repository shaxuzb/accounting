export interface FiscalCashRegisterForm {
  warehouseId: number | null;
  registerTypeId: number | null;
  name: string;
  externalRegisterId: string;
  model: string;
  serialNumber: string;
  fiscalModuleNumber: string;
  stateId?: number | null;
}
