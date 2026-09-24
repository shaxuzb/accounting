import { Button, Popconfirm } from "antd";
import { CheckCircle2, CircleX, Save } from "lucide-react";
import Card from "@/components/ui/card/Card";
import { useTranslation } from "react-i18next";

interface Props {
  isDraft: boolean;
  /** A posted transfer can be cancelled: its entries are reversed and the goods go back. */
  isPosted: boolean;
  /** False until the document exists; confirming or cancelling one that was never saved has no id to act on. */
  isSaved: boolean;
  saving: boolean;
  confirming: boolean;
  cancelling: boolean;
  onSave: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function WarehouseTransferActions({
  isDraft,
  isPosted,
  isSaved,
  saving,
  confirming,
  cancelling,
  onSave,
  onConfirm,
  onCancel,
}: Props) {
  const { t } = useTranslation();

  return (
    <Card className="space-y-3 p-4 ">
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
        disabled={!isDraft || !isSaved}
        loading={confirming}
      >
        {t("common.confirm")}
      </Button>
      {isPosted ? (
        <Popconfirm
          title={t("warehouse.actions.cancelPosted")}
          description={
            <div className="max-w-72">
              {t("warehouse.messages.cancelPostedConfirm")}
            </div>
          }
          okText={t("warehouse.actions.cancelPosted")}
          okButtonProps={{ danger: true, loading: cancelling }}
          cancelText={t("common.close")}
          onConfirm={onCancel}
        >
          <Button danger block icon={<CircleX className="size-4" />} loading={cancelling}>
            {t("warehouse.actions.cancelPosted")}
          </Button>
        </Popconfirm>
      ) : (
        <Button
          danger
          block
          icon={<CircleX className="size-4" />}
          onClick={onCancel}
          disabled={!isDraft || !isSaved}
          loading={cancelling}
        >
          {t("common.cancel")}
        </Button>
      )}
    </Card>
  );
}
