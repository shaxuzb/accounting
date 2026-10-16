import { Button } from "antd";
import { FileOutput } from "lucide-react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import EdoStatusBadge from "@/modules/settings/pages/integrations/edo/components/EdoStatusBadge";
import type { EdoDocumentStatusCode } from "@/modules/settings/pages/integrations/edo/types/type";

export interface EdoSourceMetadata {
  edoDocumentId: number;
  providerCode: string;
  providerDocumentId?: string | null;
  documentNumber?: string | null;
  direction: string;
  status: string;
}

const outboxPath = "/main/settings/integrations/edo/outbox";

/**
 * The sale's ESF (1C «Счет-фактура выданный» → ЭСФ): the ESF sent for it with its state, or the
 * button that opens the ESF form filled from the sale.
 */
export default function SaleEsfButton({ saleId, edoSource }: { saleId: number; edoSource?: EdoSourceMetadata | null }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  if (edoSource && edoSource.direction === "OUTBOX")
    return (
      <Button icon={<FileOutput className="size-4" />} onClick={() => navigate(`${outboxPath}/${edoSource.edoDocumentId}`)}>
        {t("sale.esf.open")}
        <EdoStatusBadge status={{ code: edoSource.status as EdoDocumentStatusCode } as never} />
      </Button>
    );
  return (
    <Button icon={<FileOutput className="size-4" />} onClick={() => navigate(`${outboxPath}/create?sale=${saleId}`)}>
      {t("sale.esf.create")}
    </Button>
  );
}
