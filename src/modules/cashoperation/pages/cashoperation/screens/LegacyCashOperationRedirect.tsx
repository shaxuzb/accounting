import { Spin } from "antd";
import { Navigate, useParams } from "react-router";
import { useGetDetailCashOperation } from "../hooks/useGetDetailCashOperation";

/** OperationTypeIdConst.IN = 1 — kassaga kirim (PKO), qolgani chiqim (RKO). */
const INCOME_OPERATION_TYPE_ID = 1;

/**
 * Old cash-operation links (reports, bookmarks) open the PKO/RKO document: it is the same
 * record, and that form keeps every field (employee, receiving cash box, rate) on save.
 */
export default function LegacyCashOperationRedirect() {
  const { id } = useParams();
  const { data, isLoading, isError } = useGetDetailCashOperation(id);

  if (isLoading) return <Spin className="flex! justify-center py-10" />;
  if (isError || !data)
    return <Navigate to="/main/cash-operationses/cash-documents/pko" replace />;

  const kind = data.operationTypeId === INCOME_OPERATION_TYPE_ID ? "pko" : "rko";
  return (
    <Navigate
      to={`/main/cash-operationses/cash-documents/${kind}/${data.id ?? id}`}
      replace
    />
  );
}
