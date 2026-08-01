import SelectCustom from "@/components/fields/SelectCustom";
import { counterpartybankaccountPermissions } from "@/modules/settings/pages/counterpartybankaccount/constants/permissions";
import {
  filterIds,
  selectListEndpoints,
} from "@/shared/constants/selectLists";

type AccountOption = Record<string, unknown> & {
  id: number;
  accountNumber?: string | number;
  number?: string | number;
  name?: string;
};

interface BankTransactionCounterpartyAccountSelectProps {
  counterpartyId?: number | null;
  importedAccountNumber?: string | null;
  value?: number | null;
  onChange: (accountId: number | null) => void;
  onAdd: () => void;
}

const accountOptionLabel = (option: AccountOption) =>
  String(option.accountNumber ?? option.number ?? option.name ?? option.id);

export default function BankTransactionCounterpartyAccountSelect({
  counterpartyId,
  importedAccountNumber,
  value,
  onChange,
  onAdd,
}: BankTransactionCounterpartyAccountSelectProps) {
  return (
    <SelectCustom
      fieldName="counterpartyBankAccountId"
      value={value}
      path={selectListEndpoints.counterPartyBankAccounts}
      queryParams={{
        [filterIds.counterparty]: counterpartyId,
      }}
      refetchSync={String(counterpartyId ?? "")}
      enabled={Boolean(counterpartyId)}
      disabled={!counterpartyId}
      search
      clearable
      marginBottom="mb-0"
      placeholder={
        counterpartyId
          ? "bank.placeholders.selectCounterpartyAccount"
          : "bank.placeholders.selectCounterpartyFirst"
      }
      optionLabel={accountOptionLabel}
      selectedLabel={accountOptionLabel}
      autoSelectValue={importedAccountNumber}
      autoSelectKeys={["accountNumber", "number"]}
      getFirstOnlyWhenSingle
      addOption={{
        bool: true,
        permissionCode: counterpartybankaccountPermissions.create,
        onClick: onAdd,
      }}
      onChange={(accountId) => {
        const normalizedId = Number(accountId);
        onChange(
          Number.isFinite(normalizedId) && normalizedId > 0
            ? normalizedId
            : null,
        );
      }}
    />
  );
}
