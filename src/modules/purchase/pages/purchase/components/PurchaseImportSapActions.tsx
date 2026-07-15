import { Button } from "antd";
import { PackagePlus } from "lucide-react";

interface PurchaseImportSapActionsProps {
  foundedSapCodes: number;
  isLoading: boolean;
  isFetching: boolean;
  linesLength: number;
  purchaseMode: "goods" | "services";
  onDeleteSapCodes: () => void;
  onOpenMissingProductsModal: () => void;
}

export default function PurchaseImportSapActions({
  foundedSapCodes,
  isLoading,
  isFetching,
  linesLength,
  purchaseMode,
  onDeleteSapCodes,
  onOpenMissingProductsModal,
}: PurchaseImportSapActionsProps) {
  if (linesLength === 0 || purchaseMode !== "goods") return null;

  const loading = isLoading || isFetching;

  return (
    <div className="mt-1 flex flex-wrap items-center justify-end gap-3">
      <Button
        type="default"
        htmlType="button"
        onClick={onOpenMissingProductsModal}
        icon={<PackagePlus className="size-4" />}
        disabled={loading || foundedSapCodes === 0}
      >
        Topilmagan SAP kodlarni belgilash ({foundedSapCodes})
      </Button>
      <Button
        type="primary"
        htmlType="button"
        danger
        onClick={onDeleteSapCodes}
        icon={<div>{foundedSapCodes}</div>}
        disabled={loading || foundedSapCodes === 0}
      >
        Topilmagan SAP kodlarni o'chirish
      </Button>
    </div>
  );
}
