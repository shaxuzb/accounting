import CreateReturnButton from "@/modules/returns/CreateReturnButton";
import { returnKind } from "@/modules/returns/constants";
import PermissionCard from "@/components/ui/card/PermissionCard";
import DocumentContractButton from "@/modules/settings/pages/contractTemplates/components/DocumentContractButton";
import Card from "@/components/ui/card/Card";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import { useAppSelector } from "@/store/hooks";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { Button, Popconfirm, Spin } from "antd";
import { CheckCircle2, CircleX, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router";
import SaleConfirmedLinesTable from "../../sale/components/SaleConfirmedLinesTable";
import SaleDocumentSummary from "../../sale/components/SaleDocumentSummary";
import { getDocumentLines } from "../../sale/utils/saleDocumentLines";
import type { SaleDoc } from "../../sale/types/type";
import { RetailSalePaymentDetails } from "../components";
import { retailSalePermissions } from "../constants/permissions";
import {
  useCancelRetailSale,
  useConfirmRetailSale,
  useGetRetailSale,
} from "../hooks";
import { toRetailSalePaymentPayloads } from "../utils/payload";

export default function RetailSaleDetailPage() {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const organizationName = useAppSelector(
    (state) => state.organization.name,
  );
  const documentQuery = useGetRetailSale(id);
  const confirmMutation = useConfirmRetailSale(id);
  const cancelMutation = useCancelRetailSale(id);
  const document = documentQuery.data;

  if (documentQuery.isLoading || !document) {
    return (
      <div className="flex justify-center p-10">
        <Spin />
      </div>
    );
  }

  const lines = getDocumentLines(document as SaleDoc);
  const isDraft = document.statusId === 1;
  const payments = document.payments ?? [];

  const handleConfirm = async () => {
    try {
      // One entry per product line, keyed by the line id the server stores.
      // `lines` above is the display list: a marked line is spread into one row per
      // unit there, each carrying the unit row's id, which the server rejects.
      const productLines = document.lines ?? [];
      await confirmMutation.mutateAsync({
        lines: productLines.map((line) => ({
          id: line.id,
          unitPrice: Number(line.unitPrice ?? line.price ?? line.amount ?? 0),
          costPrice: Number(line.costPrice ?? 0),
        })),
        payments: toRetailSalePaymentPayloads(
          payments.map((payment) => ({
            id: payment.id,
            paymentMethodId: payment.paymentMethodId,
            paymentMethodCode: payment.paymentMethodCode,
            paymentMethodName: payment.paymentMethodName,
            paymentAcceptancePointId: payment.paymentAcceptancePointId,
            debitAccountId: payment.debitAccountId,
            amount: payment.amount,
            transactionNumber: payment.transactionNumber ?? "",
          })),
        ),
      });
      toast.success(t("retailSale.messages.confirmed"));
    } catch (error) {
      errorHandlers(error);
    }
  };

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync();
      toast.success(t("retailSale.messages.cancelled"));
    } catch (error) {
      errorHandlers(error);
    }
  };

  return (
    <div className="space-y-3">
      <Card className="p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div>
              <div className="text-xs text-secondary-text">
                {t("retailSale.fields.docNumber")}
              </div>
              <div className="text-lg font-semibold">
                {document.docNumber || `#${document.id}`}
              </div>
            </div>
            <ProcessStatusBadge
              statusId={document.statusId}
              statusName={document.statusName}
            />
            <DocumentContractButton
              kind="retail"
              documentId={document.id}
              documentNumber={document.docNumber}
            />
          </div>
          {isDraft && (
            <div className="flex flex-wrap gap-2">
              <PermissionCard permission={retailSalePermissions.update}>
                <Link to={`../edit/${document.id}`}>
                  <Button icon={<Pencil className="size-4" />}>
                    {t("common.edit")}
                  </Button>
                </Link>
              </PermissionCard>
              <PermissionCard permission={retailSalePermissions.cancel}>
                <Button
                  danger
                  icon={<CircleX className="size-4" />}
                  loading={cancelMutation.isPending}
                  onClick={() => void handleCancel()}
                >
                  {t("common.cancel")}
                </Button>
              </PermissionCard>
              <PermissionCard permission={retailSalePermissions.confirm}>
                <Button
                  type="primary"
                  icon={<CheckCircle2 className="size-4" />}
                  loading={confirmMutation.isPending}
                  onClick={() => void handleConfirm()}
                >
                  {t("common.confirm")}
                </Button>
              </PermissionCard>
            </div>
          )}
          {document.statusId === 2 && (
            <CreateReturnButton kind={returnKind.fromRetail} baseId={Number(document.id)} />
          )}
          {document.statusId === 2 && (
            // A posted check is undone like in 1C («Отмена проведения»): the
            // postings are reversed and the units return to stock.
            <PermissionCard permission={retailSalePermissions.cancel}>
              <Popconfirm
                title={t("retailSale.messages.cancelPostedConfirm")}
                okText={t("common.cancel")}
                cancelText={t("common.close")}
                okButtonProps={{ danger: true }}
                onConfirm={() => void handleCancel()}
              >
                <Button
                  danger
                  icon={<CircleX className="size-4" />}
                  loading={cancelMutation.isPending}
                >
                  {t("common.cancel")}
                </Button>
              </Popconfirm>
            </PermissionCard>
          )}
        </div>
      </Card>
      <SaleDocumentSummary
        document={document as SaleDoc}
        organizationName={organizationName}
        totalAmount={document.finalAmount ?? document.totalAmount ?? 0}
      />
      <Card className="overflow-hidden border border-border">
        <SaleConfirmedLinesTable
          lines={lines}
          loading={documentQuery.isFetching}
          currency={document.currencyCode || "UZS"}
          docDate={document.docDate}
        />
      </Card>
      <RetailSalePaymentDetails
        payments={payments}
        currency={document.currencyCode || "UZS"}
      />
    </div>
  );
}
