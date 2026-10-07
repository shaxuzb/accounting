import * as Yup from "yup";
import { requiredNumber, requiredString } from "../../../shared/validation";

export const saleConditionSchema = () =>
  Yup.object({
    vatRateId: requiredNumber("settings.fields.vatRate"),
    startDate: requiredString("settings.fields.startDate"),
    endDate: Yup.string().nullable(),
  });
