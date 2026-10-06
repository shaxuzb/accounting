import { useAccountDefinitions } from "@/modules/accountings/pages/manual-entries/useAccountDefinitions";

/** subkonto types «Работники организации» (balance and turnover) */
const EMPLOYEE_SUBKONTO_TYPE_IDS = new Set([12, 38]);

/**
 * Whether an account is kept by employee (4220 accountable persons, 4730, 67xx ...): a money
 * document posting to it has to name the employee, as 1C asks for «Работник» there.
 */
export function useAccountKeptByEmployee(accountId?: number | null) {
  const { definitions } = useAccountDefinitions(accountId);
  return Boolean(accountId) && definitions.some((definition) => EMPLOYEE_SUBKONTO_TYPE_IDS.has(definition.id));
}
