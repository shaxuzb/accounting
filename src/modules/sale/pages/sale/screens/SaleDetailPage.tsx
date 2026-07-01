import { Spin } from "antd";
import { useParams } from "react-router";
import { useAppSelector } from "@/store/hooks";
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
  const isConfirmed = document?.statusId === 2;
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

  if (isConfirmed) {
    return (
      <ConfirmedSaleDocument
        document={document}
        lines={documentLines}
        loading={documentQuery.isFetching}
        organizationName={organizationName}
      />
    );
  }

  if (isWarehouseConfirm) {
    return <SaleWarehouseConfirm key={document.id} document={document} />;
  }

  if (isPricing) {
    return (
      <SalePricingEditor
        document={document}
        lines={documentLines}
        loading={documentQuery.isFetching}
        organizationName={organizationName}
      />
    );
  }

  return (
    <SalePricingEditor
      document={document}
      lines={documentLines}
      loading={documentQuery.isFetching}
      organizationName={organizationName}
    />
  );
}
