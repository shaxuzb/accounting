import type { FormikProps } from "formik";
import { useMemo } from "react";
import { Select } from "antd";
import { useQuery } from "@tanstack/react-query";
import Card from "@/components/ui/card/Card";
import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import { $axiosPrivate } from "@/services/AxiosService";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import type { InventoryAdjustmentForm } from "../types/form";
import { useTranslation } from "react-i18next";

interface AdjustmentTypeOption {
  id: number;
  code: string;
  name: string;
}

interface Props {
  formik: FormikProps<InventoryAdjustmentForm>;
  disabled?: boolean;
}

export default function InventoryAdjustmentFormFields({
  formik,
  disabled = false,
}: Props) {
  const { t } = useTranslation();

  // Turlar ma'lumotnomadan olinadi. Ilgari bu yerda "Increase"/"Decrease" deb
  // qo'lda yozilgan edi, backend esa cmn_inventory_adjustment_type dagi
  // kodlarni kutadi (WRITE_OFF, LOSS, FOUND_STOCK ...) — shuning uchun forma
  // orqali hujjat umuman yaratib bo'lmasdi: 422 InvalidAdjustmentType.
  const typesQuery = useQuery<AdjustmentTypeOption[]>({
    queryKey: ["manuals", "inventory-adjustment-types"],
    queryFn: async () => {
      const { data } = await $axiosPrivate.get<AdjustmentTypeOption[]>(
        "/manuals/inventory-adjustment-types",
      );
      return Array.isArray(data) ? data : [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const adjustmentTypeOptions = useMemo(
    () =>
      (typesQuery.data ?? []).map((type) => ({
        value: type.code,
        label: type.name,
      })),
    [typesQuery.data],
  );

  return (
    <Card className="p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <SelectDate
          formik={formik}
          fieldName="docDate"
          label="bank.fields.date"
          disabled={disabled}
        />
        <SelectCustom
          formik={formik}
          fieldName="warehouseId"
          label="settings.entities.warehouse"
          path={selectListEndpoints.warehousesSelectList}
          disabled={disabled}
        />
        <div>
          <label className="mb-2 block text-sm font-medium">
            {t("warehouse.fields.adjustmentType")}
          </label>
          <Select
            value={formik.values.adjustmentType || undefined}
            options={adjustmentTypeOptions}
            loading={typesQuery.isFetching}
            disabled={disabled}
            showSearch
            optionFilterProp="label"
            placeholder={t("warehouse.fields.adjustmentType")}
            onChange={(value) =>
              formik.setFieldValue("adjustmentType", value, true)
            }
            className="w-full"
          />
        </div>
        <div className="md:col-span-2">
          <InputText
            formik={formik}
            fieldName="comment"
            label="bank.fields.comment"
            disabled={disabled}
          />
        </div>
      </div>
    </Card>
  );
}
