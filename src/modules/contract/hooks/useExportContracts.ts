import { useMutation } from "@tanstack/react-query";
import type { QueryParams } from "@/shared/types/api";
import { downloadBlob } from "@/shared/utils/downloadBlob";
import { contractService } from "../services/contractService";

/** Ro'yxatdagi ayni filterlar bilan .xlsx yuklab oladi. */
export const useExportContracts = () =>
  useMutation({
    mutationFn: (params?: QueryParams) => contractService.export(params),
    onSuccess: (file) => downloadBlob(file.blob, file.fileName),
  });
