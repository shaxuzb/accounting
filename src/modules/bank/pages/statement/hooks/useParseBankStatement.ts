import { useMutation } from "@tanstack/react-query";
import { bankStatementParserService } from "../services/bankStatementParserService";

export const useParseBankStatement = () =>
  useMutation({
    mutationFn: (file: File) => bankStatementParserService.parse(file),
  });
