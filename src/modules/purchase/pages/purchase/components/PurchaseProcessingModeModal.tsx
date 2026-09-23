import DocumentProcessingModeModal from "@/components/ui/DocumentProcessingModeModal";
import type { PurchaseProcessingMode } from "../types/form";
import { useTranslation } from "react-i18next";

interface PurchaseProcessingModeModalProps {
  open: boolean;
  loading?: boolean;
  canConfirm?: boolean;
  onClose: () => void;
  onSelect: (mode: PurchaseProcessingMode) => void;
}

export default function PurchaseProcessingModeModal({
  open,
  loading = false,
  canConfirm = false,
  onClose,
  onSelect,
}: PurchaseProcessingModeModalProps) {
  const { t } = useTranslation();
  return (
    <DocumentProcessingModeModal
      open={open}
      title={t("purchase.actions.saveDocument")}
      description={t("purchase.messages.chooseSaveMode")}
      saveLabel={t("purchase.actions.saveAsDraft")}
      saveAndConfirmLabel={t("purchase.actions.saveAndConfirm")}
      loading={loading}
      canConfirm={canConfirm}
      onClose={onClose}
      onSelect={onSelect}
    />
  );
}
