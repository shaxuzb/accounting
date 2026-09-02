import { useQuery } from "@tanstack/react-query";
import { documentService } from "../api";

export const useGetDocuments = (params?: URLSearchParams) =>
  useQuery({
    queryKey: ["documents", params?.toString?.() ?? params],
    queryFn: () => documentService.list(params),
  });
