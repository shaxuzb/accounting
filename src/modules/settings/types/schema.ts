import * as Yup from "yup";

// Settings
export const settingsSchema = Yup.object({
  name: Yup.string().required("Name is required"),
});

// Role
export const roleSchema = (isEdit = false) =>
  Yup.object({
    fullName: Yup.string().required("To'liq nomini kiriting"),
    shortName: Yup.string().required("Qisqacha nomini kiriting"),
    roleModules: Yup.array()
      .of(Yup.number().required())
      .min(1, "Kamida bitta modul tanlang")
      .required("Modullarni tanlang"),
    stateId: isEdit
      ? Yup.number().nullable().required("Holatini tanlang")
      : Yup.number().nullable(),
  });

// Users
export const usersSchema = Yup.object({
  name: Yup.string().required("Name is required"),
});

// Organizations
export const organizationsSchema = (isEdit = false) =>
  Yup.object({
    fullName: Yup.string().required("To'liq nomini kiriting"),
    shortName: Yup.string().required("Qisqacha nomini kiriting"),
    stateId: isEdit
      ? Yup.number().nullable().required("Holatini tanlang")
      : Yup.number().nullable(),
  });

// Country
export const counterpartySchema = (isEdit = false) =>
  Yup.object({
    fullName: Yup.string().required("To'liq nomini kiriting"),
    shortName: Yup.string().required("Qisqacha nomini kiriting"),
    stateId: isEdit
      ? Yup.number().nullable().required("Holatini tanlang")
      : Yup.number().nullable(),
  });

// Departments

export const departmentsSchema = (isEdit = false) =>
  Yup.object({
    stateId: isEdit
      ? Yup.number().nullable().required("Holatini tanlang")
      : Yup.number().nullable(),
  });

// Branches
export const branchesSchema = (isEdit = false) =>
  Yup.object({
    name: Yup.string().required("To'liq nomini kiriting"),
    stateId: isEdit
      ? Yup.number().nullable().required("Holatini tanlang")
      : Yup.number().nullable(),
  });

// Chartaccounts
export const chartAccountsSchema = (isEdit = false) =>
  Yup.object({
    name: Yup.string().required("To'liq nomini kiriting"),
    stateId: isEdit
      ? Yup.number().nullable().required("Holatini tanlang")
      : Yup.number().nullable(),
  });

// Counterpartybankaccount
export const counterpartybankaccountSchema = (isEdit = false) =>
  Yup.object({
    accountNumber: Yup.string().required("Account number is required"),
    stateId: isEdit
      ? Yup.number().nullable().required("Holatini tanlang")
      : Yup.number().nullable(),
  });

// OrgBankAccounts
export const orgBankAccountsSchema = (isEdit = false) =>
  Yup.object({
    accountNumber: Yup.string().required("Account number is required"),
    stateId: isEdit
      ? Yup.number().nullable().required("Holatini tanlang")
      : Yup.number().nullable(),
  });

// Positions
export const positionsSchema = (isEdit = false) =>
  Yup.object({
    name: Yup.string().required("To'liq nomini kiriting"),
    stateId: isEdit
      ? Yup.number().nullable().required("Holatini tanlang")
      : Yup.number().nullable(),
  });

// Product-groups
export const productGroupsSchema = (isEdit = false) =>
  Yup.object({
    name: Yup.string().required("To'liq nomini kiriting"),
    organizationId: Yup.number().required("Tashkilotni tanlang"),
    parentId: Yup.number().nullable(),
    code: Yup.string().required("Code is required"),
    stateId: isEdit
      ? Yup.number().nullable().required("Holatini tanlang")
      : Yup.number().nullable(),
  });
