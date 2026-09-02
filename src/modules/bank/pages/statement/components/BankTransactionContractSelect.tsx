import dayjs from "@/config/dayjs";
import SelectCustom from "@/components/fields/SelectCustom";
import { contractPermissions } from "@/modules/contract/constants/permissions";
import { filterIds, selectListEndpoints } from "@/shared/constants/selectLists";

type ContractOption = Record<string, unknown> & {
  id: number;
  name?: string;
  number?: string | number;
  contractNumber?: string | number;
};

const contractOptionLabel = (option: ContractOption) =>
  String(
    option.contractNumber ??
      option.number ??
      option.name ??
      option.title ??
      option.id,
  );

interface BankTransactionContractSelectProps {
  counterpartyId?: number | null;
  transactionDate?: string;
  value?: number | null;
  disabled?: boolean;
  onChange: (contractId: number | null) => void;
  onAdd: () => void;
}

export default function BankTransactionContractSelect({
  counterpartyId,
  transactionDate,
  value,
  disabled = false,
  onChange,
  onAdd,
}: BankTransactionContractSelectProps) {
  const selectedDate =
    transactionDate && dayjs(transactionDate).isValid()
      ? dayjs(transactionDate).format("YYYY-MM-DD")
      : undefined;

  return (
    <SelectCustom
      fieldName="contractId"
      value={value}
      path={selectListEndpoints.contractsSelectList}
      queryParams={{
        [filterIds.counterparty]: counterpartyId,
        ...(selectedDate ? { choosedDate: selectedDate } : {}),
      }}
      refetchSync={`${counterpartyId ?? ""}-${selectedDate ?? ""}`}
      enabled={Boolean(counterpartyId)}
      disabled={disabled || !counterpartyId}
      search
      clearable
      getFirst
      optionLabel={contractOptionLabel}
      selectedLabel={contractOptionLabel}
      marginBottom="mb-0"
      placeholder={
        counterpartyId
          ? "bank.placeholders.selectContract"
          : "bank.placeholders.selectCounterpartyFirst"
      }
      addOption={{
        bool: true,
        permissionCode: contractPermissions.create,
        onClick: onAdd,
      }}
      onChange={(contractId) => {
        const normalizedId = Number(contractId);
        onChange(
          Number.isFinite(normalizedId) && normalizedId > 0
            ? normalizedId
            : null,
        );
      }}
    />
  );
}
