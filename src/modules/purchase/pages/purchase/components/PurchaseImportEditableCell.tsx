import { memo, useCallback, useEffect, useState } from "react";
import { Button, Input } from "antd";
import { Plus } from "lucide-react";
import LineClampCell from "@/components/widget/text/LineClampCell";

const numericColumns = new Set([
  "qty",
  "price",
  "pricePerUom",
  "discount",
  "vatRates",
]);

interface PurchaseImportEditableCellProps {
  value: unknown;
  dataIndex: string;
  rowIndex: number;
  isInvalid?: boolean;
  onCommit: (rowIndex: number, dataIndex: string, value: string) => void;
  onAddClick?: () => void;
}

function PurchaseImportEditableCell({
  value,
  dataIndex,
  rowIndex,
  onCommit,
  isInvalid = false,
  onAddClick,
}: PurchaseImportEditableCellProps) {
  const [localValue, setLocalValue] = useState(String(value ?? ""));
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setLocalValue(String(value ?? ""));
    }
  }, [isEditing, value]);

  const startEditing = useCallback(() => setIsEditing(true), []);

  const commit = useCallback(() => {
    onCommit(rowIndex, dataIndex, localValue);
    setIsEditing(false);
  }, [dataIndex, localValue, onCommit, rowIndex]);

  const cancelEdit = useCallback(() => {
    setLocalValue(String(value ?? ""));
    setIsEditing(false);
  }, [value]);

  if (isEditing) {
    return (
      <Input
        autoFocus
        size="small"
        status={isInvalid ? "error" : undefined}
        value={localValue}
        inputMode={numericColumns.has(dataIndex) ? "decimal" : "text"}
        onChange={(event) => setLocalValue(event.target.value)}
        onBlur={commit}
        onPressEnter={commit}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            cancelEdit();
          }
        }}
      />
    );
  }

  return (
    <div
      className={`flex min-h-8 items-center gap-1 rounded border px-1 transition-colors ${
        isInvalid
          ? "border-red-300 bg-red-50"
          : "border-transparent hover:border-slate-300"
      }`}
    >
      <button
        type="button"
        className={`w-full bg-transparent px-1 py-1 text-left text-sm outline-none ${
          isInvalid ? "text-red-600" : "text-inherit"
        }`}
        onClick={startEditing}
        onFocus={startEditing}
      >
        <LineClampCell text={localValue || null} />
      </button>
      {isInvalid && onAddClick && (
        <Button
          type="link"
          size="small"
          className="h-6! px-1!"
          icon={<Plus className="size-3" />}
          onMouseDown={(event) => event.preventDefault()}
          onClick={(event) => {
            event.stopPropagation();
            onAddClick();
          }}
        />
      )}
    </div>
  );
}

export default memo(PurchaseImportEditableCell);
