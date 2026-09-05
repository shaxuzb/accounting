import type { RentalLessorForm } from "../types/form";

export function updateRentalLessorIdentifier(
  lessor: RentalLessorForm,
  value: string,
): RentalLessorForm {
  const normalizedValue = value || null;
  const isPinfl = value.length === 14;

  return {
    ...lessor,
    inn: isPinfl ? null : normalizedValue,
    pinfl: isPinfl ? normalizedValue : null,
  };
}
