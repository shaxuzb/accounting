import * as Yup from "yup";

export const userSchema = Yup.object({
  userName: Yup.string().required("Username majburiy"),

  phoneNumber: Yup.string().required("Telefon raqam majburiy"),

  email: Yup
    .string()
    .email("Email noto‘g‘ri formatda")
    .required("Email majburiy"),

  firstName: Yup.string().required("Ism majburiy"),

  lastName: Yup.string().required("Familiya majburiy"),

  roleId: Yup
    .number()
    .typeError("Rol majburiy")
    .moreThan(0, "Rol tanlang")
    .required("Rol majburiy"),

  password: Yup
    .string()
    .min(6, "Parol kamida 6 ta belgidan iborat bo‘lishi kerak")
    .required("Parol majburiy"),
});
