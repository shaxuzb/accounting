import { Button, Popconfirm } from "antd";
import { CheckCircle2, Save, Trash2, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import Card from "@/components/ui/card/Card";

interface FaDraftActionsBarProps {
  isCreate: boolean;
  canSave: boolean;
  canConfirm: boolean;
  canCancel: boolean;
  saving: boolean;
  confirming: boolean;
  cancelling: boolean;
  onExit: () => void;
  onConfirm: () => void | Promise<void>;
  onCancelDocument: () => void | Promise<void>;
}

export default function FaDraftActionsBar({
  isCreate,
  canSave,
  canConfirm,
  canCancel,
  saving,
  confirming,
  cancelling,
  onExit,
  onConfirm,
  onCancelDocument,
}: FaDraftActionsBarProps) {
  const { t } = useTranslation();
  const isBusy = saving || confirming || cancelling;

  return (
    <Card className="sticky bottom-0 z-20 mt-4 border border-border bg-primary-bg/95 px-4 py-3 shadow-sm backdrop-blur sm:px-5">
      <div className="flex flex-wrap justify-end gap-3">
        {isCreate ? (
          <Button
            icon={<X className="size-4" />}
            disabled={isBusy}
            onClick={onExit}
          >
            {t("common.cancel")}
          </Button>
        ) : (
          canCancel && (
            <Popconfirm
              title={t("actions.cancelConfirmTitle")}
              description={t("actions.cancelConfirmContent")}
              okText={t("actions.cancel")}
              cancelText={t("common.cancel")}
              okButtonProps={{ danger: true }}
              onConfirm={onCancelDocument}
            >
              <Button
                danger
                icon={<Trash2 className="size-4" />}
                loading={cancelling}
                disabled={saving || confirming}
              >
                {t("fa.actions.cancelDocument")}
              </Button>
            </Popconfirm>
          )
        )}

        {canSave && (
          <Button
            type={isCreate || !canConfirm ? "primary" : "default"}
            htmlType="submit"
            icon={<Save className="size-4" />}
            loading={saving}
            disabled={confirming || cancelling}
          >
            {t("common.save")}
          </Button>
        )}

        {!isCreate && canConfirm && (
          <Popconfirm
            title={t("actions.confirmConfirmTitle")}
            description={t("actions.confirmConfirmContent")}
            okText={t("common.confirm")}
            cancelText={t("common.cancel")}
            onConfirm={onConfirm}
          >
            <Button
              type="primary"
              icon={<CheckCircle2 className="size-4" />}
              loading={confirming}
              disabled={saving || cancelling}
            >
              {t("common.confirm")}
            </Button>
          </Popconfirm>
        )}
      </div>
    </Card>
  );
}
