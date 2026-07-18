import type { QueryClient } from "@tanstack/react-query";

export const invalidateSelectListQuery = (
  queryClient: QueryClient,
  _fieldName: string,
  path: string,
) => {
  queryClient.invalidateQueries({
    predicate: (query) =>
      query.queryKey[0] === "selectlist" && query.queryKey.includes(path),
  });
};
