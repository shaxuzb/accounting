import { useMutation } from "@tanstack/react-query";
import { edoService } from "../api";

export const useEdoAuthChallenge = () =>
  useMutation({ mutationFn: edoService.authChallenge });

export const useEdoAuthComplete = () =>
  useMutation({ mutationFn: edoService.authComplete });
