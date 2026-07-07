import { useMutation } from "@tanstack/react-query";
import { repostService } from "../services/repostService";
import type { RepostFilter } from "../types/type";

export const useRepostAccounting = () =>
  useMutation({
    mutationFn: (body: RepostFilter) => repostService.create(body),
  });
