import { useMutation } from "@tanstack/react-query";
import { bankStatementParserService } from "../services/bankStatementParserService";
import type { BankCounterpartiesCreatePayload } from "../types/form";

export const useCreateBankCounterparties = () =>
  useMutation({
    mutationFn: (payload: BankCounterpartiesCreatePayload) =>
      bankStatementParserService.createManyCounterparties(payload),
  });
