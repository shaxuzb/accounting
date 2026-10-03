import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { contractTemplateService, type ContractTemplateForm } from "./api";
import { contractTemplateKeys } from "./constants";

export const useContractTemplates = (params?: { kind?: string; search?: string }) =>
  useQuery({
    queryKey: contractTemplateKeys.list(params),
    queryFn: () => contractTemplateService.list(params),
  });

export const useContractTemplateKeys = () =>
  useQuery({
    queryKey: contractTemplateKeys.keys,
    queryFn: contractTemplateService.keys,
    staleTime: Infinity,
  });

export const useContractTemplateEditor = (id: number | string) =>
  useQuery({
    queryKey: contractTemplateKeys.editor(id),
    queryFn: () => contractTemplateService.editor(id),
    // a fresh signed config each time the page opens: the key follows the stored version
    gcTime: 0,
    staleTime: 0,
    retry: false,
  });

const useInvalidate = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: contractTemplateKeys.all });
};

export const useCreateContractTemplate = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (form: ContractTemplateForm) => contractTemplateService.create(form),
    onSuccess: invalidate,
  });
};

export const useUpdateContractTemplate = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, ...payload }: Omit<ContractTemplateForm, "file"> & { id: number }) =>
      contractTemplateService.update(id, payload),
    onSuccess: invalidate,
  });
};

export const useReplaceContractTemplateFile = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      contractTemplateService.replaceFile(id, file),
    onSuccess: invalidate,
  });
};

export const useDeleteContractTemplate = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: number) => contractTemplateService.remove(id),
    onSuccess: invalidate,
  });
};
