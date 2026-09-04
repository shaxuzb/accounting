import type { RentalLessor } from "../types/type.ts";

export const formatRentalLessors = (
  lessors: Array<Pick<RentalLessor, "fullName">>,
) => lessors.map((lessor) => lessor.fullName).filter(Boolean).join(", ") || "-";
