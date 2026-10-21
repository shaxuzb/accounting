import { Spin } from "antd";
import { useParams } from "react-router";
import type { ReactNode } from "react";
import { useAppSelector } from "@/store/hooks";
import DocumentContractButton from "@/modules/settings/pages/contractTemplates/components/DocumentContractButton";
import TradePrintButton from "@/modules/documentPrint/TradePrintButton";
import CreateReturnButton from "@/modules/returns/CreateReturnButton";
import CreateCorrectionButton from "@/modules/corrections/CreateCorrectionButton";
import DocumentEsfButton from "@/modules/settings/pages/integrations/edo/components/DocumentEsfButton";
import AccountingEntriesButton from "@/modules/accounting/components/AccountingEntriesButton";
import { ProcessStatusBadge } from "@/components/ui/status";
import { useTranslation } from "react-i18next";
import { returnKind } from "@/modules/returns/constants";
import {
  ConfirmedSaleDocument,
  SalePricingEditor,
  SaleWarehouseConfirm,
} from "../components";
import { useGetDetailSale } from "../hooks";
import { getDocumentLines } from "../utils/saleDocumentLines";

export default function SaleDetailPage() {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const organizationName = useAppSelector(
    (state) => state.organization.name,
  );
  const documentQuery = useGetDetailSale(id);
  const document = documentQuery.data;
  // posted or cancelled: shown as it stands, not open for pricing again
  const isConfirmed = document?.statusId === 2 || document?.statusId === 3;
  const isWarehouseConfirm = document?.statusId === 1;
  const isPricing = document?.statusId === 4;
  const documentLines = getDocumentLines(document);

  if (documentQuery.isLoading || !document) {
    return (
      <div className="flex justify-center p-10">
        <Spin />
      </div>
    );
  }

  // every state of the document can print its contract
  const withContract = (content: ReactNode) => (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-end gap-2">
        {/* where the document stands, and its entries once posted */}
        <span className="mr-auto">
          <ProcessStatusBadge statusId={document.statusId} statusName={document.statusName} />
        </span>
        <AccountingEntriesButton documentId={Number(document.id)} documentTypeId={2} statusId={document.statusId}>
          {t("common.accountingEntries")}
        </AccountingEntriesButton>
        {document.statusId === 2 && (
          <CreateReturnButton kind={returnKind.fromCustomer} baseId={Number(document.id)} />
        )}
        {document.statusId === 2 && (
          <CreateCorrectionButton kind="sale" baseId={Number(document.id)} />
        )}
        {/* the ESF of a posted sale (1C «Счет-фактура выданный») */}
        {document.statusId === 2 && (
          <DocumentEsfButton kind="sale" documentId={Number(document.id)} />
        )}
        <TradePrintButton source="sale" documentId={Number(document.id)} />
        <DocumentContractButton
          kind="sale"
          documentId={document.id}
          documentNumber={document.docNumber}
        />
      </div>
      {content}
    </div>
  );

  if (isConfirmed) {
    return withContract(
      <ConfirmedSaleDocument
        document={document}
        lines={documentLines}
        loading={documentQuery.isFetching}
        organizationName={organizationName}
      />,
    );
  }

  if (isWarehouseConfirm) {
    return withContract(<SaleWarehouseConfirm key={document.id} document={document} />);
  }

  if (isPricing) {
    return withContract(
      <SalePricingEditor
        document={document}
        lines={documentLines}
        loading={documentQuery.isFetching}
        organizationName={organizationName}
      />,
    );
  }

  return withContract(
    <SalePricingEditor
      document={document}
      lines={documentLines}
      loading={documentQuery.isFetching}
      organizationName={organizationName}
    />,
  );
}
