import { Alert, Button, Popconfirm } from "antd";
import { Link } from "react-router";
import { CheckCircle2, CircleX, Save } from "lucide-react";
import Card from "@/components/ui/card/Card";
import { useTranslation } from "react-i18next";

interface Props {
  isDraft: boolean;
  /** A posted document is cancelled with a storno (asked first); a draft simply. */
  isPosted?: boolean;
  /** A count's own surplus/shortage: cancelled through the count, not here. */
  countId?: number | null;
  countNumber?: string | null;
  saving: boolean;
  confirming: boolean;
  cancelling: boolean;
  onSave: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function InventoryAdjustmentActions({
  isDraft,
  isPosted = false,
  countId = null,
  countNumber = null,
  saving,
  confirming,
  cancelling,
  onSave,
  onConfirm,
  onCancel,
}: Props) {
  const { t } = useTranslation();

  return (
    <Card className="space-y-3 p-4">
      <div className="text-sm font-semibold">{t("common.actions")}</div>
      <Button
        block
        icon={<Save className="size-4" />}
        onClick={onSave}
        disabled={!isDraft}
        loading={saving}
      >
        {t("common.save")}
      </Button>
      <Button
        type="primary"
        block
        icon={<CheckCircle2 className="size-4" />}
        onClick={onConfirm}
        disabled={!isDraft}
        loading={confirming}
      >
        {t("common.confirm")}
      </Button>
      {isPosted && countId ? (
        <Alert
          type="info"
          showIcon
          message={
            <span>
              {t("warehouse.adjustment.fromCount", { number: countNumber ?? countId })}{" "}
              <Link to={`/main/warehouses/inventory-counts/${countId}`}>
                {t("warehouse.adjustment.openCount")}
              </Link>
            </span>
          }
        />
      ) : isPosted ? (
        <Popconfirm
          title={t("warehouse.messages.cancelPostedTitle")}
          description={t("warehouse.messages.cancelPostedHint")}
          okText={t("common.cancel")}
          okButtonProps={{ danger: true }}
          cancelText={t("common.close")}
          onConfirm={onCancel}
        >
          <Button danger block icon={<CircleX className="size-4" />} loading={cancelling}>
            {t("common.cancel")}
          </Button>
        </Popconfirm>
      ) : (
        <Button
          danger
          block
          icon={<CircleX className="size-4" />}
          onClick={onCancel}
          disabled={!isDraft}
          loading={cancelling}
        >
          {t("common.cancel")}
        </Button>
      )}
    </Card>
  );
}
