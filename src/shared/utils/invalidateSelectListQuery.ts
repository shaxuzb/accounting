import type { QueryClient } from "@tanstack/react-query";

export const invalidateSelectListQuery = (
  queryClient: QueryClient,
  _fieldName: string,
  path: string,
) => {
  queryClient.invalidateQueries({
    queryKey: ["selectlist", path],
    exact: false,
  });
};
