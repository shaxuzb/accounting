import { Spin } from "antd";
import { useParams } from "react-router";
import type { ReactNode } from "react";
import { useAppSelector } from "@/store/hooks";
import DocumentContractButton from "@/modules/settings/pages/contractTemplates/components/DocumentContractButton";
import {
  ConfirmedSaleDocument,
  SalePricingEditor,
  SaleWarehouseConfirm,
} from "../components";
import { useGetDetailSale } from "../hooks";
import { getDocumentLines } from "../utils/saleDocumentLines";

export default function SaleDetailPage() {
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
      <div className="flex justify-end">
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
