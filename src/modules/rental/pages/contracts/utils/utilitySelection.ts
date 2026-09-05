import type { RentalUtilityForm } from "../types/form";
import type { RentalUtility } from "../types/type";

export type RentalUtilitySelection = {
  utilityServiceId: number | null;
  payerCode: string;
  utilityServiceCode?: string | null;
  utilityServiceName?: string | null;
};

export type RentalUtilityServiceOption = {
  id: number;
  code?: string | number | null;
  name?: string | null;
};

const preferredUtilityCodes = [
  "NATURAL_GAS",
  "HOT_WATER",
  "COLD_WATER",
  "ELECTRICITY",
];

export function mergeRentalUtilityServiceOptions(
  catalogServices: RentalUtilityServiceOption[],
  selectedUtilities: Array<RentalUtilitySelection | RentalUtility>,
): RentalUtilityServiceOption[] {
  const servicesById = new Map<number, RentalUtilityServiceOption>();

  catalogServices.forEach((service) => {
    if (Number.isFinite(service.id) && service.id > 0) {
      servicesById.set(service.id, service);
    }
  });

  selectedUtilities.forEach((utility) => {
    const id = Number(utility.utilityServiceId);
    if (!Number.isFinite(id) || id <= 0 || servicesById.has(id)) return;

    servicesById.set(id, {
      id,
      code: utility.utilityServiceCode,
      name: utility.utilityServiceName,
    });
  });

  const services = Array.from(servicesById.values());
  const preferred = preferredUtilityCodes
    .map((code) =>
      services.find(
        (service) => String(service.code ?? "").toUpperCase() === code,
      ),
    )
    .filter((service): service is RentalUtilityServiceOption => Boolean(service));
  const preferredIds = new Set(preferred.map((service) => service.id));

  return [...preferred, ...services.filter((service) => !preferredIds.has(service.id))].slice(
    0,
    4,
  );
}

export function getRentalUtilitySelections(
  objectUtilities: RentalUtilityForm[] | undefined,
  readonlyUtilities: RentalUtilitySelection[] | undefined,
): RentalUtilitySelection[] {
  return objectUtilities ?? readonlyUtilities ?? [];
}

export function toggleRentalUtilitySelection(
  utilities: RentalUtilityForm[],
  utilityServiceId: number,
): RentalUtilityForm[] {
  const isSelected = utilities.some(
    (utility) => utility.utilityServiceId === utilityServiceId,
  );

  if (isSelected) {
    return utilities.filter(
      (utility) => utility.utilityServiceId !== utilityServiceId,
    );
  }

  return [
    ...utilities,
    { utilityServiceId, payerCode: "LESSOR" },
  ];
}
