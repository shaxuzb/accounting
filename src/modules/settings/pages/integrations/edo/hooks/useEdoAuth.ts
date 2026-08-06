import { useMutation } from "@tanstack/react-query";
import { edoService } from "../api";

export const useEdoAuthChallenge = () =>
  useMutation({ mutationFn: edoService.authChallenge });

export const useEdoAuthComplete = () =>
  useMutation({
    mutationFn: ({
      providerCode,
      payload,
    }: {
      providerCode: Parameters<typeof edoService.authComplete>[0];
      payload: Parameters<typeof edoService.authComplete>[1];
    }) => edoService.authComplete(providerCode, payload),
  });
