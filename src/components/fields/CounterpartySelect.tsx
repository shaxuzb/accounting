import { lazy, Suspense, useState, type ComponentProps } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  counterpartySelectDisplayConfig,
  selectListEndpoints,
} from "@/shared/constants/selectLists";
import { invalidateSelectListQuery } from "@/shared/utils/invalidateSelectListQuery";
import { counterpartyPermissions } from "@/modules/settings/pages/counterparty/constants/permissions";

import SelectCustom from "./SelectCustom";

// the counterparty form is loaded only when it is opened from a field
const CounterpartyAddEditPage = lazy(
  () => import("@/modules/settings/pages/counterparty/screens/CounterpartyAddEditPage"),
);

type SelectCustomProps = ComponentProps<typeof SelectCustom>;
type CounterpartyKind = "supplier" | "client";

type CounterpartySelectProps = Omit<
  SelectCustomProps,
  | "path"
  | "search"
  | "displayConfig"
  | "optionLabel"
  | "selectedLabel"
> & {
  kind: CounterpartyKind;
  /**
   * A «+» beside the field opens the counterparty form in a modal and picks the new one
   * (1C: «Создать» from the field). On by default; a caller's own `addOption` replaces it.
   */
  allowCreate?: boolean;
};

const endpointByKind: Record<CounterpartyKind, string> = {
  supplier: selectListEndpoints.counterpartiesSelectList,
  client: selectListEndpoints.counterpartiesSelectList,
};

export default function CounterpartySelect({
  kind,
  allowCreate = true,
  ...props
}: CounterpartySelectProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const queryClient = useQueryClient();
  const { formik, fieldName, onChange } = props;
  const ownCreate = allowCreate && !props.addOption && Boolean((formik && fieldName) || onChange);

  return (
    <>
      <SelectCustom
        {...props}
        path={endpointByKind[kind]}
        search
        displayConfig={counterpartySelectDisplayConfig}
        addOption={
          props.addOption ??
          (ownCreate
            ? {
                bool: true,
                permissionCode: counterpartyPermissions.create,
                onClick: () => setCreateOpen(true),
              }
            : undefined)
        }
      />
      {ownCreate && createOpen && (
        <Suspense fallback={null}>
          <CounterpartyAddEditPage
            open={createOpen}
            onCreated={(counterparty) => {
              if (formik && fieldName) void formik.setFieldValue(fieldName, counterparty.id, true);
              onChange?.(counterparty.id);
              invalidateSelectListQuery(queryClient, fieldName as string, endpointByKind[kind]);
            }}
            onClose={() => setCreateOpen(false)}
          />
        </Suspense>
      )}
    </>
  );
}
