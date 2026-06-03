import * as Yup from "yup";

export const requiredString = (message = "Required") => Yup.string().required(message);

export const loginSchema = Yup.object({
  username: Yup.string().required("Username is required"),
  password: Yup.string().min(4, "Min 4 characters").required("Password is required"),
});
