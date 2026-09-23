import { Button, Popconfirm } from "antd";
import { Ban } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import Card from "@/components/ui/card/Card";
import { useAppSelector } from "@/store/hooks";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { salePermissions } from "../constants/permissions";
import { useCancelSale } from "../hooks";
import type { SaleDoc, SaleDocTable } from "../types/type";
import { groupSaleDocumentLines } from "../utils/saleDocumentGroups";
import SaleConfirmedLinesTable from "./SaleConfirmedLinesTable";
import SaleDocumentSummary from "./SaleDocumentSummary";

/** cmn_document_status: a posted document. */
const POSTED_STATUS_ID = 2;

interface Props {
  document: SaleDoc;
  lines: SaleDocTable[];
  loading: boolean;
  organizationName: string;
}

export default function ConfirmedSaleDocument({
  document,
  lines = [],
  loading,
  organizationName,
}: Props) {
  const { t } = useTranslation();
  const cancelSale = useCancelSale(document.id);
  const permissions = useAppSelector(
    (state) => state.auth.user?.user.permissions ?? [],
  );
  const currency = document.currencyCode || "UZS";
  const totalAmount = groupSaleDocumentLines(lines).reduce(
    (sum, group) => sum + group.totalAmount,
    0,
  );
  const canCancel =
    document.statusId === POSTED_STATUS_ID &&
    permissions.includes(salePermissions.cancel);

  // Cancelling reverses what posting did: the entries are reversed (storno), the
  // goods and their units go back to stock and the customer's debt is taken back.
  const handleCancel = async () => {
    try {
      await cancelSale.mutateAsync();
      toast.success(t("sale.messages.documentCancelled"));
    } catch (error) {
      errorHandlers(error);
    }
  };

  return (
    <div className="space-y-4">
      {canCancel && (
        <div className="flex justify-end">
          <Popconfirm
            title={t("sale.actions.cancelPosted")}
            description={
              <div className="max-w-80">{t("sale.messages.cancelPostedConfirm")}</div>
            }
            okText={t("sale.actions.cancelPosted")}
            okButtonProps={{ danger: true, loading: cancelSale.isPending }}
            cancelText={t("common.close")}
            onConfirm={handleCancel}
          >
            <Button danger icon={<Ban className="size-4" />} loading={cancelSale.isPending}>
              {t("sale.actions.cancelPosted")}
            </Button>
          </Popconfirm>
        </div>
      )}
      <SaleDocumentSummary
        document={document}
        organizationName={organizationName}
        totalAmount={totalAmount || document.totalAmount || 0}
      />
      <Card className="overflow-hidden border border-border">
        <SaleConfirmedLinesTable
          lines={lines}
          loading={loading}
          currency={currency}
        />
      </Card>
    </div>
  );
}
