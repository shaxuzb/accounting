import { useQuery } from "@tanstack/react-query";
import { postingTemplateViewsKeys } from "../constants/queryKeys";
import { postingTemplateViewsService } from "../services/postingTemplateViewsService";
import type { PostingTemplateViewsPageParams } from "../types/type";

export const useGetPostingTemplateViews = (params?: PostingTemplateViewsPageParams) =>
  useQuery({
    queryKey: postingTemplateViewsKeys.list(params),
    queryFn: () => postingTemplateViewsService.list(params),
  });
