/** A bank of the organization. */
export interface SettingsBank {
  id: number;
  code: string;
  name: string;
  inn: string | null;
  mfo: string | null;
  stateId: number;
  stateName: string;
  /** Picked from the directory by hand: can be taken off the list. */
  isPicked: boolean;
  /** Bank accounts of the organization or its counterparties use it: it stays on the list. */
  isUsed: boolean;
}

/** A bank of the common directory (the Central Bank's register). */
export interface DirectoryBank {
  id: number;
  code: string;
  name: string;
  inn: string | null;
  mfo: string | null;
  stateId: number;
  stateName: string;
}
