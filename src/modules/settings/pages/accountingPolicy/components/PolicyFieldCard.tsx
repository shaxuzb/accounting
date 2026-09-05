import { Card, Tag, Tooltip } from "antd";
import { Info } from "lucide-react";
import PolicyStatusBadge from "./PolicyStatusBadge";
import type { PolicyFieldMetadata, SourceStatus } from "../types/type";
import { formatAccountingPolicyValue, type PolicyDisplayKind } from "../utils/display";

interface PolicyFieldCardProps<T> {
  label: string;
  field?: PolicyFieldMetadata<T> | null;
  fallback?: T | null;
  kind?: PolicyDisplayKind;
  status?: SourceStatus;
}

export default function PolicyFieldCard<T>({
  label,
  field,
  fallback = null,
  kind = "text",
  status,
}: PolicyFieldCardProps<T>) {
  const value = field ? field.value : fallback;
  const displayValue = formatAccountingPolicyValue(value, {
    kind,
    status: field?.sourceStatus ?? status ?? 3,
  });
  const metadata = field
    ? [
        field.sourceEvidence && `Manba: ${field.sourceEvidence}`,
        field.affectedModule && `Modul: ${field.affectedModule}`,
        field.implementationDependency && `Bog‘liqlik: ${field.implementationDependency}`,
      ].filter(Boolean).join("\n")
    : null;

  return (
    <Card size="small" className="h-full border-border! shadow-none!">
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm text-muted-second">{label}</span>
        {metadata && (
          <Tooltip title={<span className="whitespace-pre-line">{metadata}</span>}>
            <Info className="mt-0.5 size-4 shrink-0 text-muted-second" />
          </Tooltip>
        )}
      </div>
      <div className="mt-2 text-base font-semibold text-primary-text">
        {displayValue}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {field && <PolicyStatusBadge status={field.sourceStatus} />}
        {field?.requiresBusinessDecision && (
          <Tag color="warning">Business approval</Tag>
        )}
      </div>
    </Card>
  );
}
