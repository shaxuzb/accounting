import type { QueryParams } from "@/shared/types/api";

export const hrAbsenceKeys = {
  all: ["hr", "absences"] as const,
  lists: () => [...hrAbsenceKeys.all, "list"] as const,
  list: (params?: QueryParams) =>
    [...hrAbsenceKeys.lists(), params?.toString() ?? ""] as const,
  details: () => [...hrAbsenceKeys.all, "detail"] as const,
  detail: (id: string | number) =>
    [...hrAbsenceKeys.details(), String(id)] as const,
  types: ["hr", "absence-types"] as const,
};
