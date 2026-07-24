import { Button } from "antd";
import { PackagePlus } from "lucide-react";

interface PurchaseImportMxikActionsProps {
  missingMxikCount: number;
  isLoading: boolean;
  isFetching: boolean;
  linesLength: number;
  purchaseMode: "goods" | "services";
  onDeleteMissingMxiks: () => void;
  onOpenMissingProductsModal: () => void;
}

export default function PurchaseImportMxikActions({
  missingMxikCount,
  isLoading,
  isFetching,
  linesLength,
  purchaseMode,
  onDeleteMissingMxiks,
  onOpenMissingProductsModal,
}: PurchaseImportMxikActionsProps) {
  if (linesLength === 0 || purchaseMode !== "goods") return null;

  const loading = isLoading || isFetching;

  return (
    <div className="mt-1 flex flex-wrap items-center justify-end gap-3">
      <Button
        type="default"
        htmlType="button"
        onClick={onOpenMissingProductsModal}
        icon={<PackagePlus className="size-4" />}
        disabled={loading || missingMxikCount === 0}
      >
        Topilmagan MXIK kodlarni belgilash ({missingMxikCount})
      </Button>
      <Button
        type="primary"
        htmlType="button"
        danger
        onClick={onDeleteMissingMxiks}
        icon={<div>{missingMxikCount}</div>}
        disabled={loading || missingMxikCount === 0}
      >
        Topilmagan MXIK kodlarni o'chirish
      </Button>
    </div>
  );
}
