export interface BankTerminal {
  id: number;
  bankAccountId: number | null;
  bankAccountName?: string | null;
  bankAccountNumber?: string | null;
  bankAccount?: string | null;
  name: string | null;
  merchantId: string | null;
  externalTerminalId: string | null;
  serialNumber: string | null;
  stateId?: number | null;
  stateName?: string | null;
  createdDate?: string | null;
}
