import { useQuery } from "@tanstack/react-query";
import { postingTemplateViewsKeys } from "../constants/queryKeys";
import { postingTemplateViewsService } from "../services/postingTemplateViewsService";

export const useGetPostingTemplateViewDetail = (id?: string) =>
  useQuery({
    queryKey: postingTemplateViewsKeys.detail(id ?? ""),
    queryFn: () => postingTemplateViewsService.detail(id ?? ""),
    enabled: Boolean(id),
  });
