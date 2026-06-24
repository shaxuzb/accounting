import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import { bankStatementEndpoints } from "../constants/endpoints";
import type {
  BankOperationData,
  BankOperationsCreatePayload,
} from "../types/type";

export const bankStatementParserService = {
  parse: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await $axiosPrivate.post<unknown>(
      bankStatementEndpoints.parser.parse,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return data;
  },
  listOperations: async (params?: QueryParams) => {
    const { data } = await $axiosPrivate.get<Paginated<BankOperationData>>(
      bankStatementEndpoints.operations.list,
      { params },
    );
    return data;
  },
  createManyOperations: async (payload: BankOperationsCreatePayload) => {
    const { data } = await $axiosPrivate.post<BankOperationData[]>(
      bankStatementEndpoints.operations.createMany,
      payload,
    );
    return data;
  },
};
