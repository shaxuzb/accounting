import { useTranslation } from "react-i18next";
import { Checkbox, Tag } from "antd";
import type { ResolvedBankAccount } from "./accounts";

interface TaxpayerAccountsPickerProps {
  accounts: ResolvedBankAccount[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

/** The bank accounts found by INN, ticked to be saved with the card. */
export default function TaxpayerAccountsPicker({
  accounts,
  selected,
  onChange,
}: TaxpayerAccountsPickerProps) {
  const { t } = useTranslation();
  if (accounts.length === 0) return null;

  const toggle = (accountNumber: string, checked: boolean) =>
    onChange(
      checked
        ? [...selected, accountNumber]
        : selected.filter((number) => number !== accountNumber),
    );

  return (
    <div className="mb-4 rounded-lg border border-border p-3">
      <div className="mb-1 font-medium">{t("settings.lookup.accountsTitle")}</div>
      <div className="mb-2 text-xs text-gray-500">
        {t("settings.lookup.accountsHint")}
      </div>
      {accounts.map((account) => (
        <div
          key={account.accountNumber}
          className="flex items-start gap-2 border-t border-border py-2 first:border-t-0"
        >
          <Checkbox
            disabled={!account.isResolved}
            checked={selected.includes(account.accountNumber)}
            onChange={(event) =>
              toggle(account.accountNumber, event.target.checked)
            }
          />
          <div className="min-w-0 flex-1">
            <div className="font-mono">
              {account.accountNumber}
              {account.currencyCode && (
                <span className="ml-2 text-gray-500">{account.currencyCode}</span>
              )}
              {account.isMain && (
                <Tag className="ml-2" color="blue">
                  {t("settings.lookup.mainAccount")}
                </Tag>
              )}
            </div>
            <div className="text-sm text-gray-600">
              {account.mfo ? `${account.mfo} — ` : ""}
              {account.bankBranchName ?? account.bankName ?? "-"}
            </div>
            {!account.isResolved && (
              <div className="text-xs text-red-500">
                {t("settings.lookup.accountUnresolved")}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
