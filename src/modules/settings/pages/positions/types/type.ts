export interface Positions {
  id: number;
  organizationId: number;
  organizationName: string;
  code: string;
  name: string;
  staffCategory?: string | null;
  stateId: number;
  stateName: string;
  createdDate: string;
}
