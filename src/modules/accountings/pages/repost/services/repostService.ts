import { postJson } from "@/modules/accountings/services/request";
import { repostEndpoints } from "../constants/endpoints";
import type { RepostFilter, RepostResult } from "../types/type";

export const repostService = {
  create: (body: RepostFilter) =>
    postJson<RepostResult>(repostEndpoints.create, body),
};
