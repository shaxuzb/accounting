import { useQuery } from "@tanstack/react-query";
import { documentService } from "../api";

export const useGetDocument = (id: string | number) =>
  useQuery({
    queryKey: ["documents", "detail", id],
    queryFn: () => documentService.detail(id),
    enabled: Boolean(id),
  });
