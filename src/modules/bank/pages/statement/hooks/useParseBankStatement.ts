import { useMutation } from "@tanstack/react-query";
import {
  bankStatementParserService,
  type BankStatementParsePayload,
} from "../services/bankStatementParserService";

export const useParseBankStatement = () =>
  useMutation({
    mutationFn: (payload: BankStatementParsePayload) =>
      bankStatementParserService.parse(payload),
  });
