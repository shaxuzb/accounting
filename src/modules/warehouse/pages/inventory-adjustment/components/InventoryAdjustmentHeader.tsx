import { Button } from "antd";
import { ArrowLeft } from "lucide-react";
import Card from "@/components/ui/card/Card";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import type { InventoryAdjustmentDocument } from "../types/type";
import { useTranslation } from "react-i18next";

interface Props {
  record?: InventoryAdjustmentDocument | null;
  isCreate: boolean;
  onBack: () => void;
}

export default function InventoryAdjustmentHeader({
  record,
  isCreate,
  onBack,
}: Props) {
  const { t } = useTranslation();

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm text-muted-foreground">
            {t("warehouse.adjustment.title")}
          </div>
          <div className="text-lg font-semibold">
            {record?.docNumber ?? t("payroll.common.newDocument")}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isCreate && (
            <ProcessStatusBadge
              statusId={record?.statusId}
              statusName={record?.statusName}
            />
          )}
          <Button icon={<ArrowLeft className="size-4" />} onClick={onBack}>
            {t("common.back")}
          </Button>
        </div>
      </div>
    </Card>
  );
}
