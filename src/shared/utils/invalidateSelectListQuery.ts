import type { QueryClient } from "@tanstack/react-query";

export const invalidateSelectListQuery = (
  queryClient: QueryClient,
  fieldName: string,
  path: string,
) => {
  queryClient.invalidateQueries({
    queryKey: ["selectlist", fieldName, undefined, path],
    exact: false,
  });
};

