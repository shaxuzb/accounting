import * as Yup from "yup";

export const cashBoxSchema = (isEdit = false) =>
  Yup.object({
    name: Yup.string().required("Nomi kiritilishi shart"),
    code: Yup.string().required("Kodi kiritilishi shart"),
    organizationId: Yup.number().nullable().required("Tashkilotni tanlang"),
    branchId: Yup.number().nullable().required("Filialni tanlang"),
    currencyId: Yup.number().required("Valyutani tanlang"),
    stateId: isEdit
      ? Yup.number().nullable().required("Holatini tanlang")
      : Yup.number().nullable(),
  });
