import type { ComponentProps } from "react";

import {
  counterpartySelectDisplayConfig,
  selectListEndpoints,
} from "@/shared/constants/selectLists";

import SelectCustom from "./SelectCustom";

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
};

const endpointByKind: Record<CounterpartyKind, string> = {
  supplier: selectListEndpoints.counterpartiesSelectList,
  client: selectListEndpoints.counterpartiesSelectList,
};

export default function CounterpartySelect({
  kind,
  ...props
}: CounterpartySelectProps) {
  return (
    <SelectCustom
      {...props}
      path={endpointByKind[kind]}
      search
      displayConfig={counterpartySelectDisplayConfig}
    />
  );
}
