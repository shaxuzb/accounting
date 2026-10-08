import { Button } from "antd";
import { Landmark } from "lucide-react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import PermissionCard from "@/components/ui/card/PermissionCard";
import { customsPath, customsPermissions } from "./constants";

/** «Создать на основании → Таможенная декларация»: the duties and import VAT of this purchase's goods. */
export default function CreateCustomsButton({ purchaseId }: { purchaseId: number }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <PermissionCard permission={customsPermissions.create}>
      <Button icon={<Landmark className="size-4" />} onClick={() => navigate(`${customsPath}/new?purchase=${purchaseId}`)}>
        {t("customs.createFromPurchase")}
      </Button>
    </PermissionCard>
  );
}
