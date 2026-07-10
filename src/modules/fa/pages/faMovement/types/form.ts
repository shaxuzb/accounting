import type { FaGenericDocumentForm } from "../../shared/types/form";

export interface FaMovementFormValues extends FaGenericDocumentForm {
  [key: string]: unknown;
  stateId?: number;
  documentNumber: string;
  documentDate: string;
  comment: string;
}
