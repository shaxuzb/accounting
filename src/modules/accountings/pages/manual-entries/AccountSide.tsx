import SelectCustom from "@/components/fields/SelectCustom";
import {
  chartAccountSelectDisplayConfig,
  selectListEndpoints,
} from "@/shared/constants/selectLists";
import OpeningBalanceSubkontoEditor from "@/modules/settings/pages/openingBalance/components/OpeningBalanceSubkontoEditor";
import { manualEntryPermissions, type ManualEntrySubkonto } from "./types";
import { useAccountDefinitions } from "./useAccountDefinitions";

interface Props {
  label: string;
  accountId?: number | null;
  subkontos: ManualEntrySubkonto[];
  disabled?: boolean;
  onAccountChange: (accountId: number | null) => void;
  onSubkontosChange: (subkontos: ManualEntrySubkonto[]) => void;
}

/** One side (Dt or Kt) of a manual entry line: the account and its analytics. */
export default function AccountSide({
  label,
  accountId,
  subkontos,
  disabled,
  onAccountChange,
  onSubkontosChange,
}: Props) {
  const { definitions } = useAccountDefinitions(accountId);

  return (
    <div className="min-w-0 space-y-2">
      <SelectCustom
        label={label}
        fieldName={`account-${label}`}
        path={selectListEndpoints.chartAccountsSelectList}
        displayConfig={chartAccountSelectDisplayConfig}
        value={accountId ?? null}
        search
        required
        disabled={disabled}
        marginBottom="mb-0"
        onChange={(value) => {
          const next = Number(value);
          onAccountChange(Number.isFinite(next) && next > 0 ? next : null);
        }}
      />
      {accountId && definitions.length > 0 && (
        <div className={disabled ? "pointer-events-none opacity-70" : undefined}>
          <OpeningBalanceSubkontoEditor
            definitions={definitions}
            addPermission={manualEntryPermissions.create}
            compact
            value={subkontos.map((x) => ({ subkontoTypeId: x.subkontoTypeId, subkontoId: x.entityId }))}
            onChange={(next) =>
              onSubkontosChange(
                next
                  .filter((x) => x.subkontoId)
                  .map((x) => ({ subkontoTypeId: x.subkontoTypeId, entityId: Number(x.subkontoId) })),
              )
            }
          />
        </div>
      )}
    </div>
  );
}
