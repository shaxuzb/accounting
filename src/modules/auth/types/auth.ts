import * as Yup from "yup";

export interface Auth {
  id: string | number;
  name: string;
  createdAt?: string;
}

export interface AuthForm {
  name: string;
}

export const authSchema = Yup.object({
  userName: Yup.string().required("Userni kiriting"),
  password: Yup.string().required("Parolni kiriting")
});

