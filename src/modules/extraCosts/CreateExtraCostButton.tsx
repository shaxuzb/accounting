import { Button } from "antd";
import { Truck } from "lucide-react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import PermissionCard from "@/components/ui/card/PermissionCard";
import { extraCostPath, extraCostPermissions } from "./constants";

/** «Создать на основании → Поступление доп. расходов»: costs put on this posted purchase's goods. */
export default function CreateExtraCostButton({ purchaseId }: { purchaseId: number }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <PermissionCard permission={extraCostPermissions.create}>
      <Button icon={<Truck className="size-4" />} onClick={() => navigate(`${extraCostPath}/new?purchase=${purchaseId}`)}>
        {t("extraCost.createFromPurchase")}
      </Button>
    </PermissionCard>
  );
}
