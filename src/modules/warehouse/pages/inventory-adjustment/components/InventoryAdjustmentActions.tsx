import { Button } from "antd";
import { CheckCircle2, CircleX, Save } from "lucide-react";
import Card from "@/components/ui/card/Card";

interface Props {
  isDraft: boolean;
  saving: boolean;
  confirming: boolean;
  cancelling: boolean;
  onSave: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function InventoryAdjustmentActions({
  isDraft,
  saving,
  confirming,
  cancelling,
  onSave,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Card className="space-y-3 p-4">
      <div className="text-sm font-semibold">Amallar</div>
      <Button
        block
        icon={<Save className="size-4" />}
        onClick={onSave}
        disabled={!isDraft}
        loading={saving}
      >
        Saqlash
      </Button>
      <Button
        type="primary"
        block
        icon={<CheckCircle2 className="size-4" />}
        onClick={onConfirm}
        disabled={!isDraft}
        loading={confirming}
      >
        Tasdiqlash
      </Button>
      <Button
        danger
        block
        icon={<CircleX className="size-4" />}
        onClick={onCancel}
        disabled={!isDraft}
        loading={cancelling}
      >
        Bekor qilish
      </Button>
    </Card>
  );
}
