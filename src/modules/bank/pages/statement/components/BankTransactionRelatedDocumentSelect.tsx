import dayjs from "@/config/dayjs";
import SelectCustom, {
  type SelectOptionItem,
} from "@/components/fields/SelectCustom";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { numberSpacing } from "@/utils/utils";
import {
  buildBankDocumentQueryParams,
  getBankRelatedDocumentTypeCode,
  type BankDocumentMappingContext,
} from "../utils/bankImportRules";

type DocumentOption = SelectOptionItem & {
  docNumber?: string | number | null;
  docDate?: string | null;
  amount?: number | null;
  documentTypeName?: string | null;
};

const documentOptionLabel = (option: DocumentOption) => {
  const number = String(option.docNumber ?? "").trim();
  const date =
    option.docDate && dayjs(option.docDate).isValid()
      ? dayjs(option.docDate).format("DD.MM.YYYY")
      : "";
  const amount =
    option.amount === null || option.amount === undefined
      ? ""
      : numberSpacing(option.amount);
  const description = [number, date, amount].filter(Boolean).join(" • ");

  return description || option.documentTypeName || String(option.id);
};

interface BankTransactionRelatedDocumentSelectProps {
  classificationCode?: string | null;
  directionId?: number | null;
  debit?: number;
  credit?: number;
  value?: number | null;
  disabled?: boolean;
  onChange: (documentId: number | null) => void;
}

export default function BankTransactionRelatedDocumentSelect({
  classificationCode,
  directionId,
  debit,
  credit,
  value,
  disabled = false,
  onChange,
}: BankTransactionRelatedDocumentSelectProps) {
  const mappingContext: BankDocumentMappingContext = {
    directionId,
    debit,
    credit,
  };
  const documentTypeCode = getBankRelatedDocumentTypeCode(
    classificationCode,
    mappingContext,
  );

  if (!documentTypeCode) return <span>-</span>;

  const queryParams = buildBankDocumentQueryParams(
    classificationCode,
    mappingContext,
  );

  return (
    <SelectCustom
      fieldName="relatedDocumentId"
      value={value}
      disabled={disabled}
      path={selectListEndpoints.documentsSelectList}
      queryParams={queryParams}
      refetchSync={classificationCode ?? ""}
      search
      clearable
      optionLabel={documentOptionLabel}
      selectedLabel={documentOptionLabel}
      displayConfig={{
        searchFields: [
          "docNumber",
          "docDate",
          "amount",
          "documentTypeName",
          "documentTypeCode",
        ],
      }}
      marginBottom="mb-0"
      placeholder="documents.relatedDocument"
      onChange={(documentId) => {
        const normalizedId = Number(documentId);
        onChange(
          Number.isFinite(normalizedId) && normalizedId > 0
            ? normalizedId
            : null,
        );
      }}
    />
  );
}
