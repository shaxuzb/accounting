import { Button, Spin } from "antd";
import { Printer } from "lucide-react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import BankReadonlyDetailsCard from "@/modules/bank/components/BankReadonlyDetailsCard";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { useGetDetailBankOperation } from "../hooks";

export default function BankOperationDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
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

  return (
    <div className="space-y-2">
      {detailQuery.data.directionId === -1 && (
        <div className="flex justify-end">
          <Button
            icon={<Printer className="size-4" />}
            onClick={() => navigate("payment-order")}
          >
            {t("paymentOrder.print")}
          </Button>
        </div>
      )}
      <BankReadonlyDetailsCard record={detailQuery.data} />
    </div>
  );
}
