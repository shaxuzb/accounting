import type { RentalContractObjectForm } from "../types/form";

export function appendRentalContractObject(
  objects: RentalContractObjectForm[],
  object: RentalContractObjectForm,
) {
  return [...objects, object];
}

export function replaceRentalContractObject(
  objects: RentalContractObjectForm[],
  index: number,
  object: RentalContractObjectForm,
) {
  return objects.map((currentObject, objectIndex) =>
    objectIndex === index ? object : currentObject,
  );
}

export function removeRentalContractObject(
  objects: RentalContractObjectForm[],
  index: number,
) {
  return objects.filter((_, objectIndex) => objectIndex !== index);
}
