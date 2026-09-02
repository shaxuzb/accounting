import { Spin } from "antd";
import { useEffect } from "react";
import { useParams } from "react-router";
import BankReadonlyDetailsCard from "@/modules/bank/components/BankReadonlyDetailsCard";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { useGetDetailBankOperation } from "../hooks";

export default function BankOperationDetailPage() {
  const { id = "" } = useParams();
  const detailQuery = useGetDetailBankOperation(id);

  useEffect(() => {
    if (!detailQuery.error) return;
    errorHandlers(detailQuery.error);
  }, [detailQuery.error]);

  if (detailQuery.isLoading || !detailQuery.data) {
    return (
      <div className="flex justify-center p-10">
        <Spin />
      </div>
    );
  }

  return <BankReadonlyDetailsCard record={detailQuery.data} />;
}
