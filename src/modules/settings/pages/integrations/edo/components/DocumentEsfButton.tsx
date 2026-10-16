import { Button } from "antd";
import { FileOutput } from "lucide-react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { getJson } from "@/modules/accountings/services/request";
import EdoStatusBadge from "./EdoStatusBadge";
import type { EdoDocumentStatusDto } from "../types/type";

/** Our documents an ESF is made from (the kinds of api/edo/esf-drafts). */
export type EsfSourceKind = "sale" | "return" | "correction";

const internalTypes: Record<EsfSourceKind, string> = {
  sale: "sale_doc",
  return: "return_doc",
  correction: "correction_doc",
};

interface EsfLink {
  edoDocumentId: number;
  direction: string;
  status: string;
}

const outboxPath = "/main/settings/integrations/edo/outbox";

/**
 * A posted document's ESF (1C «Счет-фактура выданный»): the ESF sent for it with its state, or the
 * button that opens the ESF form filled from it — a standard ESF for a sale, an additional one for
 * a return from a customer or a sale correction.
 */
export default function DocumentEsfButton({ kind, documentId }: { kind: EsfSourceKind; documentId: number }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: link } = useQuery({
    queryKey: ["esf-link", kind, documentId],
    queryFn: () => getJson<EsfLink | null>("/edo/esf-drafts/link", { type: internalTypes[kind], id: documentId }),
    enabled: documentId > 0,
  });

  if (link && link.direction === "OUTBOX")
    return (
      <Button icon={<FileOutput className="size-4" />} onClick={() => navigate(`${outboxPath}/${link.edoDocumentId}`)}>
        {t("sale.esf.open")}
        <EdoStatusBadge status={{ code: link.status } as EdoDocumentStatusDto} />
      </Button>
    );
  return (
    <Button icon={<FileOutput className="size-4" />} onClick={() => navigate(`${outboxPath}/create?${kind}=${documentId}`)}>
      {t(kind === "sale" ? "sale.esf.create" : "sale.esf.createAdditional")}
    </Button>
  );
}
