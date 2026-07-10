import type { FaGenericDocumentForm } from "../../shared/types/form";

export interface FaMovementFormValues extends FaGenericDocumentForm {
  [key: string]: unknown;
  stateId: number;
}

