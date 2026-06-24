import { Spin } from "antd";
import { useParams } from "react-router";
import { useAppSelector } from "@/store/hooks";
import {
  ConfirmedSaleDocument,
  SalePricingEditor,
} from "../components";
import { useGetDetailSale, useGetSaleLines } from "../hooks";

export default function SaleDetailPage() {
  const { id = "" } = useParams();
  const organizationName = useAppSelector(
    (state) => state.organization.name,
  );
  const documentQuery = useGetDetailSale(id);
  const document = documentQuery.data;
  const isConfirmed = document?.statusId === 2;
  const hasDocumentLines = Boolean(document?.lines?.length);
  const linesQuery = useGetSaleLines(
    id,
    Boolean(document) && !isConfirmed && !hasDocumentLines,
  );

  if (documentQuery.isLoading || !document) {
    return (
      <div className="flex justify-center p-10">
        <Spin />
      </div>
    );
  }

  if (isConfirmed) {
    return (
      <ConfirmedSaleDocument
        document={document}
        lines={document.lines}
        loading={documentQuery.isFetching}
        organizationName={organizationName}
      />
    );
  }

  return (
    <SalePricingEditor
      document={document}
      lines={hasDocumentLines ? document.lines : (linesQuery.data?.items ?? [])}
      loading={!hasDocumentLines && linesQuery.isLoading}
      organizationName={organizationName}
    />
  );
}
