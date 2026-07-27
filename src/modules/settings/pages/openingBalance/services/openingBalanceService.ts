import axios from "axios";
import dayjs from "dayjs";
import { $axiosPrivate } from "@/services/AxiosService";
import { openingBalanceEndpoints } from "../constants/endpoints";
import type {
  OpeningBalance,
  OpeningBalanceAccountDetail,
} from "../types/type";
import type {
  OpeningBalanceAccountPayload,
  OpeningBalanceHeaderForm,
} from "../types/form";

const normalizeHeaderPayload = (payload: OpeningBalanceHeaderForm) => ({
  balanceDate: dayjs(payload.balanceDate).format("YYYY-MM-DD"),
  description: payload.description,
});

export const openingBalanceService = {
  current: async () => {
    try {
      const response = await $axiosPrivate.get<OpeningBalance | null>(
        openingBalanceEndpoints.current,
      );
      return response.data ?? null;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },
  create: (payload: OpeningBalanceHeaderForm) =>
    $axiosPrivate
      .post<OpeningBalance>(openingBalanceEndpoints.create, {
        ...normalizeHeaderPayload(payload),
        stateId: 1,
      })
      .then((response) => response.data),
  update: (id: string | number, payload: OpeningBalanceHeaderForm) =>
    $axiosPrivate
      .put<OpeningBalance>(openingBalanceEndpoints.update(id), {
        ...normalizeHeaderPayload(payload),
        stateId: Number(payload.stateId),
      })
      .then((response) => response.data),
  delete: (id: string | number) =>
    $axiosPrivate
      .delete(openingBalanceEndpoints.delete(id))
      .then((response) => response.data),
  accountDetail: (
    openingBalanceId: string | number,
    accountId: string | number,
  ) =>
    $axiosPrivate
      .get<OpeningBalanceAccountDetail>(
        openingBalanceEndpoints.accountDetail(openingBalanceId, accountId),
      )
      .then((response) => response.data),
  saveAccount: (
    openingBalanceId: string | number,
    payload: OpeningBalanceAccountPayload,
  ) =>
    $axiosPrivate
      .put<OpeningBalanceAccountDetail>(
        openingBalanceEndpoints.saveAccount(openingBalanceId),
        payload,
      )
      .then((response) => response.data),
};
