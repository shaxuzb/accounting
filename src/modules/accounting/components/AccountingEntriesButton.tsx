import type { ButtonProps } from "antd";
import { Button, Tooltip } from "antd";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

export const POSTED_DOCUMENT_STATUS_ID = 2;

interface AccountingEntriesButtonProps extends ButtonProps {
  documentId: string | number;
  documentTypeId?: string | number;
  statusId?: number | null;
}

export default function AccountingEntriesButton({
  documentId,
  documentTypeId,
  statusId,
  block,
  ...buttonProps
}: AccountingEntriesButtonProps) {
  const { t } = useTranslation();
  const isPosted = statusId === POSTED_DOCUMENT_STATUS_ID;
  const query = new URLSearchParams({ documentId: String(documentId) });

  if (documentTypeId !== undefined) {
    query.set("documentTypeId", String(documentTypeId));
  }

  const button = (
    <Button {...buttonProps} block={block} disabled={!isPosted} />
  );

  if (isPosted) {
    return (
      <Link
        to={`/main/accountingentriesreport?${query.toString()}`}
        className={block ? "block" : undefined}
      >
        {button}
      </Link>
    );
  }

  return (
    <Tooltip title={t("common.accountingEntriesPostedOnly")}>
      <span className={block ? "block" : "inline-flex"}>{button}</span>
    </Tooltip>
  );
}
