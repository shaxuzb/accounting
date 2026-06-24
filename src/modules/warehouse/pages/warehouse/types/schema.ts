import * as Yup from "yup";

export const warehouseSchema = Yup.object({
  name: Yup.string().required("Name is required"),
});