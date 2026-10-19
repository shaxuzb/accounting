export interface PositionsForm {
  organizationId: number;
  code: string;
  name: string;
  /** For the statistics (1-mehnat): MANAGER, SPECIALIST, TECHNICAL, SERVICE, PRODUCTION. */
  staffCategory?: string | null;
  stateId?: number;
}
