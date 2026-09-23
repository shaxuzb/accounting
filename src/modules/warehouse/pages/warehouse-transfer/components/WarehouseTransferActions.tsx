import { Button } from "antd";
import { CheckCircle2, CircleX, Save } from "lucide-react";
import Card from "@/components/ui/card/Card";
import { useTranslation } from "react-i18next";

interface Props {
  isDraft: boolean;
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
    </Card>
  );
}
