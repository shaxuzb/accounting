import { Button, Tooltip } from "antd";
import { FileSignature } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import PermissionCard from "@/components/ui/card/PermissionCard";
import { contractTemplatePermissions } from "../constants";
import type { ContractDocumentKind } from "../types";
import DocumentContractModal from "./DocumentContractModal";

interface DocumentContractButtonProps {
  kind: ContractDocumentKind;
  documentId: number;
  documentNumber?: string;
  size?: "small" | "middle" | "large";
  /** Only the icon, with the label as a tooltip — for list rows. */
  iconOnly?: boolean;
}

/** "Shartnoma" on a purchase, sale or retail document: build its contract from a template. */
export default function DocumentContractButton({
  kind,
  documentId,
  documentNumber,
  size,
  iconOnly = false,
}: DocumentContractButtonProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <PermissionCard permission={contractTemplatePermissions.view}>
      {iconOnly ? (
        <Tooltip title={t("contractTemplates.document.button")}>
          <Button
            size={size}
            icon={<FileSignature className="size-4" />}
            onClick={() => setOpen(true)}
          />
        </Tooltip>
      ) : (
        <Button
          size={size}
          icon={<FileSignature className="size-4" />}
          onClick={() => setOpen(true)}
        >
          {t("contractTemplates.document.button")}
        </Button>
      )}
      <DocumentContractModal
        open={open}
        onClose={() => setOpen(false)}
        kind={kind}
        documentId={documentId}
        documentNumber={documentNumber}
      />
    </PermissionCard>
  );
}
