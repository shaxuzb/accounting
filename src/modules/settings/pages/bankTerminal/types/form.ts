export interface BankTerminalCreatePayload {
  bankAccountId: number | null;
  name: string;
  merchantId: string;
  externalTerminalId: string;
  serialNumber: string;
}

export interface BankTerminalForm extends BankTerminalCreatePayload {
  stateId?: number | null;
}
