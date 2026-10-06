import { useMemo, useState } from "react";
import { Empty, Input, Modal } from "antd";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { $axiosPrivate } from "@/services/AxiosService";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import SelectCustom from "@/components/fields/SelectCustom";
import {
  counterpartySelectDisplayConfig,
  filterIds,
  selectListEndpoints,
} from "@/shared/constants/selectLists";
import type { SelectCustomDisplayConfig } from "@/components/fields/SelectCustom";
import type { OpeningBalanceSubkontoForm } from "../types/form";
import type { SubkontoTypeOption } from "../types/type";
import { useTranslation } from "react-i18next";

interface OpeningBalanceSubkontoEditorProps {
  definitions: SubkontoTypeOption[];
  value: OpeningBalanceSubkontoForm[];
  onChange: (value: OpeningBalanceSubkontoForm[]) => void;
  /** Lets a user with this permission add an item to a plain catalog kind from its select. */
  addPermission?: string;
  /** In a half-width block (a manual entry's debit or credit side): at most two per row. */
  compact?: boolean;
}

/** Values of any analytics kind: its own entity, or a plain catalog (1C «Прочие доходы и расходы» ...). */
const subkontoValuesPath = (subkontoTypeId: number) =>
  `subkonto-values/${subkontoTypeId}`;

const normalizeCode = (code?: string) =>
  String(code ?? "")
    .trim()
    .toLowerCase()
    .replaceAll("_", "-");

// Counterparties and contracts keep their own lists (display, the contract's counterparty
// filter); every other kind is read through subkonto-values.
const endpointByCode: Record<string, string> = {
  counterparties: selectListEndpoints.counterpartiesSelectList,
  counterparty: selectListEndpoints.counterpartiesSelectList,
  contracts: selectListEndpoints.contractsSelectList,
  contract: selectListEndpoints.contractsSelectList,
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
  addPermission,
  compact = false,
}: OpeningBalanceSubkontoEditorProps) {
  const { t } = useTranslation();
  const [creating, setCreating] = useState<SubkontoTypeOption | null>(null);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();
  const { data: catalogTypeIds } = useQuery({
    queryKey: ["subkonto-type-kinds"],
    queryFn: async () => {
      const { data } = await $axiosPrivate.get<
        { id: number; isCatalog?: boolean }[]
      >(selectListEndpoints.subkontoTypes);
      return new Set(
        (Array.isArray(data) ? data : [])
          .filter((item) => item.isCatalog)
          .map((item) => item.id),
      );
    },
    staleTime: 30 * 60 * 1000,
  });

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

  const setItem = (subkontoTypeId: number, subkontoId: number) =>
    onChange(
      sortSubkontos([
        ...value.filter((item) => item.subkontoTypeId !== subkontoTypeId),
        { subkontoTypeId, subkontoId },
      ]),
    );

  const createItem = async () => {
    if (!creating || !newName.trim()) return;
    setSaving(true);
    try {
      const { data: id } = await $axiosPrivate.post<number>(
        subkontoValuesPath(creating.id),
        { name: newName.trim() },
      );
      // every select of this kind (on any page) has to see the new item
      const path = subkontoValuesPath(creating.id);
      await queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "selectlist" && query.queryKey.includes(path),
      });
      setItem(creating.id, Number(id));
      setCreating(null);
    } catch (error) {
      errorHandlers(error);
    } finally {
      setSaving(false);
    }
  };

  if (!definitions.length) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={t("settings.openingBalance.noSubkontoRequired")}
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
    <div
      className={
        compact
          ? "grid grid-cols-1 gap-3 2xl:grid-cols-2"
          : "grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3"
      }
    >
      {definitions.map((definition) => {
        const code = normalizeCode(definition.code);
        const current = value.find(
          (item) => item.subkontoTypeId === definition.id,
        );
        const path = endpointByCode[code] ?? subkontoValuesPath(definition.id);
        const canAdd = Boolean(addPermission && catalogTypeIds?.has(definition.id));
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
            addOption={
              canAdd
                ? {
                    bool: true,
                    permissionCode: addPermission!,
                    onClick: () => {
                      setNewName("");
                      setCreating(definition);
                    },
                  }
                : undefined
            }
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
      <Modal
        open={Boolean(creating)}
        title={t("settings.openingBalance.subkontoItem.title", {
          name: creating?.name ?? "",
        })}
        okText={t("common.save")}
        cancelText={t("common.cancel")}
        confirmLoading={saving}
        okButtonProps={{ disabled: !newName.trim() }}
        onOk={() => void createItem()}
        onCancel={() => setCreating(null)}
        destroyOnHidden
      >
        <Input
          autoFocus
          value={newName}
          maxLength={300}
          placeholder={t("settings.openingBalance.subkontoItem.name")}
          onChange={(event) => setNewName(event.target.value)}
          onPressEnter={() => void createItem()}
        />
      </Modal>
    </div>
  );
}
