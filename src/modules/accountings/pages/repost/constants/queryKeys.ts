import type { RepostFilter } from "../types/type";

export const repostKeys = {
  all: ["accountings", "repost"] as const,
  create: (params?: RepostFilter) => [...repostKeys.all, params] as const,
};
