import { Button, Tooltip } from "antd";
import { History } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import { useAppSelector } from "@/store/hooks";
import { recordFromPath } from "@/shared/audit/auditTables";
import { openRecordHistory } from "./recordHistory";
import { canSeeRecordHistory } from "./permissions";

/** In the header of a document's page: who entered it and who changed what. */
export default function RecordHistoryButton({ title }: { title?: string }) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const permissions = useAppSelector((state) => state.auth.user?.user.permissions ?? []);
  const record = recordFromPath(pathname);

  if (!record || !canSeeRecordHistory(permissions)) return null;

  return (
    <Tooltip title={t("audit.history.title")}>
      <Button
        type="text"
        icon={<History className="size-5" />}
        onClick={() => openRecordHistory({ table: record.table, id: record.id, title })}
      />
    </Tooltip>
  );
}
