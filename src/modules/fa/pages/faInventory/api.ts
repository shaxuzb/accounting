import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { $axiosPrivate } from "@/services/AxiosService";
import { getJson } from "@/modules/accountings/services/request";

export interface FaInventoryListItem {
  id: number;
  docNumber: string;
  docDate: string;
  assetKindId: number;
  departmentName?: string | null;
  responsibleUserName?: string | null;
  reason?: string | null;
  assetCount: number;
  shortageCount: number;
  shortageValue: number;
  surplusCount: number;
  surplusValue: number;
  statusId: number;
}

export interface FaInventoryMember {
  fullName: string;
  position?: string | null;
  isChairman: boolean;
}

/** An asset on the books (found or not) or one found beyond them (no faAssetId). */
export interface FaInventoryLine {
  id?: number | null;
  faAssetId?: number | null;
  inventoryNumber?: string | null;
  name: string;
  groupName?: string | null;
  departmentName?: string | null;
  responsibleUserName?: string | null;
  isOnBooks: boolean;
  isFound: boolean;
  bookCost: number;
  bookValue: number;
  actualValue: number;
  note?: string | null;
}

export interface FaInventoryResultDoc {
  id: number;
  docNumber: string;
  docDate: string;
  statusId: number;
}

export interface FaInventoryDocument {
  id: number;
  docNumber: string;
  docDate: string;
  assetKindId: number;
  departmentId?: number | null;
  departmentName?: string | null;
  responsibleUserId?: number | null;
  responsibleUserName?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  reason?: string | null;
  basis?: string | null;
  comment?: string | null;
  statusId: number;
  members: FaInventoryMember[];
  lines: FaInventoryLine[];
  shortageDisposals: FaInventoryResultDoc[];
  surplusReceipts: FaInventoryResultDoc[];
}

export interface FaInventorySave {
  docDate: string;
  assetKindId: number;
  departmentId?: number | null;
  responsibleUserId?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  reason?: string | null;
  basis?: string | null;
  comment?: string | null;
  members: FaInventoryMember[];
  lines: {
    faAssetId?: number | null;
    name?: string | null;
    inventoryNumber?: string | null;
    isFound: boolean;
    actualValue: number;
    note?: string | null;
  }[];
}

const base = "/fa-inventories";
const key = ["fa-inventories"];

export const useFaInventories = (params: { dateFrom?: string; dateTo?: string; assetKindId?: string }) =>
  useQuery({
    queryKey: [...key, params],
    queryFn: () => getJson<FaInventoryListItem[]>(base, params),
  });

export const useFaInventory = (id: number | null) =>
  useQuery({
    queryKey: [...key, "detail", id],
    queryFn: () => getJson<FaInventoryDocument>(`${base}/${id}`),
    enabled: Boolean(id),
  });

/** 1C «Заполнить»: what the books hold as of the date for the place and the person. */
export const fetchFaInventoryFill = (params: {
  date: string;
  assetKindId: number;
  departmentId?: number | null;
  responsibleUserId?: number | null;
}) => getJson<FaInventoryLine[]>(`${base}/fill`, params);

export const useSaveFaInventory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: number | null; body: FaInventorySave }) => {
      if (id) {
        await $axiosPrivate.put(`${base}/${id}`, body);
        return id;
      }
      const { data } = await $axiosPrivate.post<number>(base, body);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  });
};

export const useFaInventoryAction = (action: "confirm" | "cancel" | "delete") => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      action === "delete" ? $axiosPrivate.delete(`${base}/${id}`) : $axiosPrivate.post(`${base}/${id}/${action}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  });
};
