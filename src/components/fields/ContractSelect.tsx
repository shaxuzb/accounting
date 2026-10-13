import { lazy, Suspense, useState, type ComponentProps } from "react";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";

import { filterIds, selectListEndpoints } from "@/shared/constants/selectLists";
import { invalidateSelectListQuery } from "@/shared/utils/invalidateSelectListQuery";
import { formatDate, formatDateWithOutTime } from "@/utils/helpers";
import { contractPermissions } from "@/modules/contract/constants/permissions";

import SelectCustom from "./SelectCustom";

// the contract form is loaded only when it is opened from a field
const ContractAddEditPage = lazy(() => import("@/modules/contract/screens/ContractAddEditPage"));

type SelectCustomProps = ComponentProps<typeof SelectCustom>;

type ContractSelectProps = Omit<
  SelectCustomProps,
  "path" | "queryParams" | "enabled" | "refetchSync" | "addOption"
> & {
  /** The counterparty whose contracts are offered; the field waits for it. */
  counterpartyId: number | null | undefined;
  /** The document's date: only the contracts in force on it are offered, and a new one starts on it. */
  date: string | null | undefined;
  /** 1 — with a supplier, 2 — with a buyer; left out, the form lets the user choose. */
  contractTypeId?: number;
  /** A «+» beside the field opens the contract form in a modal (1C: «Создать» from the field). */
  allowCreate?: boolean;
};

export default function ContractSelect({
  counterpartyId,
  date,
  contractTypeId,
  allowCreate = true,
  disabled,
  ...props
}: ContractSelectProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const queryClient = useQueryClient();
  const { formik, fieldName, onChange } = props;
  const hasCounterparty = Boolean(counterpartyId);
  const ownCreate = allowCreate && Boolean((formik && fieldName) || onChange);

  return (
    <>
      <SelectCustom
        {...props}
        path={selectListEndpoints.contractsSelectList}
        queryParams={{
          choosedDate: date ? dayjs(date).format(formatDateWithOutTime) : undefined,
          [filterIds.counterparty]: counterpartyId,
        }}
        enabled={hasCounterparty}
        refetchSync={`${counterpartyId ?? ""}${date ?? ""}`}
        disabled={!hasCounterparty || disabled}
        addOption={
          ownCreate
            ? {
                bool: true,
                permissionCode: contractPermissions.create,
                onClick: () => setCreateOpen(true),
              }
            : undefined
        }
      />
      {ownCreate && createOpen && (
        <Suspense fallback={null}>
          <ContractAddEditPage
            open={createOpen}
            contractTypeId={contractTypeId}
            initialCounterpartyId={counterpartyId ?? null}
            initialContractDate={date ? dayjs(date).format(formatDate) : undefined}
            onCreated={(contract) => {
              if (formik && fieldName) void formik.setFieldValue(fieldName, contract.id, true);
              onChange?.(contract.id);
              invalidateSelectListQuery(queryClient, fieldName as string, selectListEndpoints.contractsSelectList);
            }}
            onClose={() => setCreateOpen(false)}
          />
        </Suspense>
      )}
    </>
  );
}
