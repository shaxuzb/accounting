import type { OpeningInventoryMode } from "../types/type";

export const openingInventoryEndpoints = {
  openingInventory: {
    list: "opening-inventories",
    detail: (id: string | number) => `opening-inventories/${id}`,
    create: "opening-inventories",
    update: (id: string | number) => `opening-inventories/${id}`,
    delete: (id: string | number) => `opening-inventories/${id}`,
  },
} as const;

export const openingInventoryDocumentTypeIds = {
  goods: 1,
  services: 2,
} as const;

export const openingInventoryDocumentTypeId =
  openingInventoryDocumentTypeIds.goods;

export const openingInventoryChartAccountsPath =
  (mode: OpeningInventoryMode = "goods") =>
    `document-account-settings/${openingInventoryDocumentTypeIds[mode]}/chart-accounts`;
