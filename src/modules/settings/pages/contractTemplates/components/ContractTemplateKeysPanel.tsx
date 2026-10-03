import { Collapse, Empty, Input, Spin, Tooltip } from "antd";
import { Copy, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useContractTemplateKeys } from "../hooks";

interface ContractTemplateKeysPanelProps {
  className?: string;
}

/**
 * The keys a template may hold. A click copies the key; it is then pasted (Ctrl+V) where it
 * belongs in the document, and the system replaces it when it builds a contract.
 */
export default function ContractTemplateKeysPanel({
  className,
}: ContractTemplateKeysPanelProps) {
  const { t } = useTranslation();
  const { data: groups = [], isLoading } = useContractTemplateKeys();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return groups;
    return groups
      .map((group) => ({
        ...group,
        keys: group.keys.filter(
          (key) =>
            key.key.toLowerCase().includes(term) ||
            key.description.toLowerCase().includes(term),
        ),
      }))
      .filter((group) => group.keys.length > 0);
  }, [groups, search]);

  const copy = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      toast.success(t("contractTemplates.messages.copied", { key }));
    } catch {
      toast.error(t("contractTemplates.messages.copyFailed"));
    }
  };

  return (
    <div className={`flex min-h-0 flex-col gap-2 ${className ?? ""}`}>
      <div className="text-sm font-semibold text-text">
        {t("contractTemplates.keys.title")}
      </div>
      <div className="text-xs text-secondary-text">
        {t("contractTemplates.keys.hint", {
          start: "{{#Tovarlar}}",
          end: "{{/Tovarlar}}",
          interpolation: { escapeValue: false },
        })}
      </div>
      <Input
        allowClear
        size="small"
        prefix={<Search className="size-3.5 text-muted-second" />}
        placeholder={t("common.search")}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Spin size="small" />
          </div>
        ) : filtered.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <Collapse
            size="small"
            ghost
            defaultActiveKey={groups.map((group) => group.group)}
            activeKey={search ? filtered.map((group) => group.group) : undefined}
            items={filtered.map((group) => ({
              key: group.group,
              label: <span className="font-medium">{group.title}</span>,
              children: (
                <div className="flex flex-col gap-1">
                  {group.keys.map((key) => (
                    <Tooltip
                      key={key.key}
                      placement="left"
                      title={key.example ? `${t("contractTemplates.keys.example")}: ${key.example}` : undefined}
                    >
                      <button
                        type="button"
                        onClick={() => void copy(key.key)}
                        className="group flex w-full cursor-pointer items-start justify-between gap-2 rounded-md border border-border px-2 py-1 text-left hover:border-primary hover:bg-primary/5"
                      >
                        <span className="min-w-0">
                          <code className="block break-all text-xs text-primary">
                            {key.key}
                          </code>
                          <span className="block text-xs text-secondary-text">
                            {key.description}
                          </span>
                        </span>
                        <Copy className="mt-0.5 size-3.5 shrink-0 text-muted-second group-hover:text-primary" />
                      </button>
                    </Tooltip>
                  ))}
                </div>
              ),
            }))}
          />
        )}
      </div>
    </div>
  );
}
