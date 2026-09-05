import { useQuery } from "@tanstack/react-query";
import { Form, Spin } from "antd";
import type { FormikProps } from "formik";
import {
  CircleHelp,
  Droplets,
  Flame,
  Radiation,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { $axiosPrivate } from "@/services/AxiosService";
import SelectStatic from "@/components/fields/SelectStatic";
import { useAppSelector } from "@/store/hooks";
import {
  normalizeDocumentAccountOptions,
  type DocumentAccountOption,
} from "@/shared/documentAccounts";
import { getLocalizedLabel } from "@/shared/utils/localizedLabel";
import type { RentalContractForm } from "../types/form";
import {
  getRentalUtilitySelections,
  mergeRentalUtilityServiceOptions,
  toggleRentalUtilitySelection,
  type RentalUtilitySelection,
} from "../utils/utilitySelection";

type UtilityServiceOption = DocumentAccountOption;

const getUtilityIcon = (service: UtilityServiceOption): LucideIcon => {
  const text = `${service.code ?? ""} ${service.name ?? ""}`.toLowerCase();

  if (text.includes("electric") || text.includes("elektr")) return Zap;
  if (text.includes("water") || text.includes("suv")) return Droplets;
  if (text.includes("gas") || text.includes("gaz")) return Flame;
  if (text.includes("heat") || text.includes("issiqlik")) return Radiation;
  return CircleHelp;
};

interface RentalUtilityServiceCardsProps {
  formik?: FormikProps<RentalContractForm>;
  objectIndex?: number;
  utilities?: RentalUtilitySelection[];
  disabled?: boolean;
  readOnly?: boolean;
}

export default function RentalUtilityServiceCards({
  formik,
  objectIndex,
  utilities,
  disabled = false,
  readOnly = false,
}: RentalUtilityServiceCardsProps) {
  const { t } = useTranslation();
  const lang = useAppSelector((state) => state.lang.lang);
  const organizationId = useAppSelector((state) => state.organization.id || null);
  const object =
    formik && objectIndex !== undefined
      ? formik.values.objects[objectIndex]
      : undefined;
  const selectedUtilities = getRentalUtilitySelections(
    object?.utilities,
    utilities,
  );
  const { data: catalogServices = [], isLoading } = useQuery<UtilityServiceOption[]>({
    queryKey: ["rental-utility-services", lang, organizationId],
    queryFn: async () => {
      const { data } = await $axiosPrivate.get<unknown>(
        "manuals/utility-services",
      );
      return normalizeDocumentAccountOptions<UtilityServiceOption>(data);
    },
    staleTime: 5 * 60 * 1000,
  });

  const services = useMemo(
    () => mergeRentalUtilityServiceOptions(catalogServices, selectedUtilities),
    [catalogServices, selectedUtilities],
  );

  if (!object && !utilities) return null;

  const handleServiceToggle = (serviceId: number) => {
    if (
      disabled ||
      readOnly ||
      !formik ||
      objectIndex === undefined ||
      !object
    )
      return;
    void formik.setFieldValue(
      `objects[${objectIndex}].utilities`,
      toggleRentalUtilitySelection(object.utilities, serviceId),
      true,
    );
  };

  return (
    <div className="mt-1 rounded-lg border border-border/50 p-3">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">
            {t("rental.fields.utilities")}
          </div>
          <div className="mt-0.5 text-xs text-secondary-text">
            {t("rental.fields.utilitySelectionHint", {
              defaultValue: "Kerakli kommunal xizmatlarni tanlang",
            })}
          </div>
        </div>
        <span className="text-xs text-secondary-text">
          {selectedUtilities.length} / {services.length || 4}
        </span>
      </div>

      {isLoading ? (
        <div className="flex min-h-24 items-center justify-center">
          <Spin size="small" />
        </div>
      ) : services.length ? (
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {services.map((service) => {
            const utilityIndex = selectedUtilities.findIndex(
              (utility) => utility.utilityServiceId === service.id,
            );
            const isSelected = utilityIndex >= 0;
            const selectedUtility = selectedUtilities[utilityIndex];
            const Icon = getUtilityIcon(service);
            const serviceLabel =
              getLocalizedLabel(service, lang) || String(service.code ?? service.id);

            return (
              <div
                key={service.id}
                role={!readOnly ? "button" : undefined}
                tabIndex={!readOnly && !disabled ? 0 : -1}
                aria-pressed={!readOnly ? isSelected : undefined}
                aria-label={serviceLabel}
                onClick={() => !readOnly && handleServiceToggle(service.id)}
                onKeyDown={(event) => {
                  if (readOnly || disabled) return;
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleServiceToggle(service.id);
                  }
                }}
                className={`rounded-lg border p-3 transition-colors ${
                  isSelected
                    ? "border-success bg-success/10"
                    : "border-border bg-primary-bg hover:border-primary/60 hover:bg-primary-bg/70"
                } ${disabled ? "cursor-not-allowed opacity-70" : readOnly ? "" : "cursor-pointer"}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div
                    className={`flex size-8 items-center justify-center rounded-md ${
                      isSelected
                        ? "bg-success/15 text-success"
                        : "bg-background text-secondary-text"
                    }`}
                  >
                    <Icon className="size-5" />
                  </div>
                  {isSelected && (
                    <span className="flex size-5 items-center justify-center rounded-full bg-success text-xs text-white">
                      ✓
                    </span>
                  )}
                </div>
                <div
                  className={`mt-3 min-h-10 text-sm font-semibold ${
                    isSelected ? "text-success" : "text-text"
                  }`}
                >
                  {serviceLabel}
                </div>

                {isSelected && readOnly && selectedUtility && (
                  <div className="mt-2 border-t border-success/20 pt-2">
                    <div className="text-xs text-secondary-text">
                      {t("rental.fields.utilityPayer")}
                    </div>
                    <div className="mt-1 text-sm font-medium text-success">
                      {selectedUtility.payerCode === "LESSEE"
                        ? t("rental.utility.lessee")
                        : t("rental.utility.lessor")}
                    </div>
                  </div>
                )}

                {isSelected && !readOnly && formik && objectIndex !== undefined && (
                  <div
                    className="mt-2 border-t border-success/20 pt-2"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <Form.Item
                      label={t("rental.fields.utilityPayer")}
                      className="mb-0!"
                    >
                      <SelectStatic
                        formik={formik as FormikProps<object>}
                        fieldName={`objects[${objectIndex}].utilities[${utilityIndex}].payerCode`}
                        options={[
                          { value: "LESSOR", label: "rental.utility.lessor" },
                          { value: "LESSEE", label: "rental.utility.lessee" },
                        ]}
                        disabled={disabled}
                        standalone
                      />
                    </Form.Item>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-border p-4 text-sm text-secondary-text">
          {t("rental.contracts.noUtilityServices", {
            defaultValue: "Kommunal xizmatlar topilmadi",
          })}
        </div>
      )}
    </div>
  );
}
