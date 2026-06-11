import * as Yup from "yup";

export interface Purchase {
  id: string | number;
  name: string;
  createdAt?: string;
}

export interface PurchaseForm {
  name: string;
}

export const purchaseSchema = Yup.object({
  name: Yup.string().required("Name is required"),
});

/* modux:types */
