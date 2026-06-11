import * as Yup from "yup";

export interface Products {
  id: string | number;
  name: string;
  createdAt?: string;
}

export interface ProductsForm {
  name: string;
}

export const productsSchema = Yup.object({
  name: Yup.string().required("Name is required"),
});

/* modux:types */
