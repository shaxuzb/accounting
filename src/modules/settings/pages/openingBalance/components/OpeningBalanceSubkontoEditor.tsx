import { useMemo } from "react";
import { Empty } from "antd";
import SelectCustom from "@/components/fields/SelectCustom";
import {
  counterpartySelectDisplayConfig,
  filterIds,
  selectListEndpoints,
} from "@/shared/constants/selectLists";
import type { SelectCustomDisplayConfig } from "@/components/fields/SelectCustom";
import type { OpeningBalanceSubkontoForm } from "../types/form";
import type { SubkontoTypeOption } from "../types/type";

interface OpeningBalanceSubkontoEditorProps {
  definitions: SubkontoTypeOption[];
  value: OpeningBalanceSubkontoForm[];
  onChange: (value: OpeningBalanceSubkontoForm[]) => void;
}

const normalizeCode = (code?: string) =>
  String(code ?? "")
    .trim()
    .toLowerCase()
    .replaceAll("_", "-");

const endpointByCode: Record<string, string> = {
  counterparties: selectListEndpoints.counterpartiesSelectList,
  counterparty: selectListEndpoints.counterpartiesSelectList,
  contracts: selectListEndpoints.contractsSelectList,
  contract: selectListEndpoints.contractsSelectList,
  products: selectListEndpoints.productsSelectList,
  product: selectListEndpoints.productsSelectList,
  warehouses: selectListEndpoints.warehousesSelectList,
  warehouse: selectListEndpoints.warehousesSelectList,
  departments: selectListEndpoints.departmentsSelectList,
  department: selectListEndpoints.departmentsSelectList,
  branches: selectListEndpoints.branchesSelectList,
  branch: selectListEndpoints.branchesSelectList,
  currencies: selectListEndpoints.currenciesSelectList,
  currency: selectListEndpoints.currenciesSelectList,
  "org-bank-accounts": selectListEndpoints.orgBankAccountsSelectList,
  "cash-boxes": selectListEndpoints.cashBoxesSelectList,
};

const contractDisplayConfig: SelectCustomDisplayConfig = {
  optionLabel: (item) => {
    const number = String(
      item.contractNumber ?? item.number ?? item.code ?? "",
    ).trim();
    const name = String(item.name ?? "").trim();
    return [number, name].filter(Boolean).join(" - ") || String(item.id);
  },
  selectedLabel: (item) =>
    String(item.contractNumber ?? item.number ?? item.name ?? item.id).trim(),
  searchFields: ["contractNumber", "number", "name"],
};

const displayConfigByCode = (
  code: string,
): SelectCustomDisplayConfig | undefined => {
  if (code === "counterparties" || code === "counterparty") {
    return counterpartySelectDisplayConfig;
  }
  if (code === "contracts" || code === "contract") {
    return contractDisplayConfig;
  }
  return undefined;
};

export default function OpeningBalanceSubkontoEditor({
  definitions,
  value,
  onChange,
}: OpeningBalanceSubkontoEditorProps) {
  const sortSubkontos = useMemo(() => {
    const order = new Map(
      definitions.map((definition, index) => [definition.id, index]),
    );

    return (items: OpeningBalanceSubkontoForm[]) =>
      [...items].sort(
        (left, right) =>
          (order.get(left.subkontoTypeId) ?? Number.MAX_SAFE_INTEGER) -
          (order.get(right.subkontoTypeId) ?? Number.MAX_SAFE_INTEGER),
      );
  }, [definitions]);

  if (!definitions.length) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Bu schyot uchun subkonto talab qilinmaydi"
      />
    );
  }

  const counterpartyDefinition = definitions.find((definition) =>
    ["counterparties", "counterparty"].includes(normalizeCode(definition.code)),
  );
  const counterpartyId = value.find(
    (item) => item.subkontoTypeId === counterpartyDefinition?.id,
  )?.subkontoId;

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {definitions.map((definition) => {
        console.log(definition);

        const code = normalizeCode(definition.code);
        const current = value.find(
          (item) => item.subkontoTypeId === definition.id,
        );
        const path = endpointByCode[code] ?? `manuals/${code}`;
        const isContract = code === "contracts" || code === "contract";

        return (
          <SelectCustom
            key={definition.id}
            fieldName={`subkonto-${definition.id}`}
            label={definition.name}
            path={path}
            value={current?.subkontoId ?? null}
            queryParams={
              isContract && counterpartyId
                ? { [filterIds.counterparty]: counterpartyId }
                : undefined
            }
            enabled={!isContract || Boolean(counterpartyId)}
            disabled={isContract && !counterpartyId}
            displayConfig={displayConfigByCode(code)}
            search
            clearable
            required={Boolean(definition.isRequired)}
            marginBottom="mb-0"
            onChange={(nextValue) => {
              const normalizedValue = Number(nextValue);
              const nextItems = value.filter(
                (item) => item.subkontoTypeId !== definition.id,
              );
              if (Number.isFinite(normalizedValue) && normalizedValue > 0) {
                nextItems.push({
                  subkontoTypeId: definition.id,
                  subkontoId: normalizedValue,
                });
              }

              if (
                definition.id === counterpartyDefinition?.id &&
                normalizedValue !== Number(counterpartyId)
              ) {
                const contractIds = new Set(
                  definitions
                    .filter((item) =>
                      ["contracts", "contract"].includes(
                        normalizeCode(item.code),
                      ),
                    )
                    .map((item) => item.id),
                );
                onChange(
                  sortSubkontos(
                    nextItems.filter(
                      (item) => !contractIds.has(item.subkontoTypeId),
                    ),
                  ),
                );
                return;
              }
              onChange(sortSubkontos(nextItems));
            }}
          />
        );
      })}
    </div>
  );
}
