import { Button, Popconfirm, Space } from "antd";
import { Pencil, Play, Trash2, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { rentalContractPermissions } from "../constants/permissions";
import {
  isRentalDraft,
  isRentalPosted,
} from "@/modules/rental/shared/constants/statuses";

interface ContractActionsProps {
  statusId: number;
  permissions: string[];
  loading?: boolean;
  onEdit: () => void;
  onActivate: () => void;
  onCancel: () => void;
  onDelete: () => void;
  canActivate?: boolean;
}

export default function ContractActions({
  statusId,
  permissions,
  loading,
  onEdit,
  onActivate,
  onCancel,
  onDelete,
  canActivate = true,
}: ContractActionsProps) {
  const { t } = useTranslation();
  const can = (permission: string) => permissions.includes(permission);

  return (
    <Space wrap>
      {isRentalDraft(statusId) && can(rentalContractPermissions.update) && (
        <Button icon={<Pencil className="size-4" />} onClick={onEdit}>
          {t("common.edit")}
        </Button>
      )}
      {isRentalDraft(statusId) && can(rentalContractPermissions.activate) && (
        <Popconfirm
          title={t("rental.actions.activateConfirm")}
          onConfirm={onActivate}
          okText={t("rental.actions.activate")}
          cancelText={t("common.cancel")}
        >
          <Button
            type="primary"
            icon={<Play className="size-4" />}
            loading={loading}
            disabled={!canActivate}
          >
            {t("rental.actions.activate")}
          </Button>
        </Popconfirm>
      )}
      {(isRentalDraft(statusId) || isRentalPosted(statusId)) &&
        can(rentalContractPermissions.cancel) && (
          <Popconfirm
            title={t("rental.actions.cancelConfirm")}
            onConfirm={onCancel}
            okText={t("rental.actions.cancel")}
            cancelText={t("common.cancel")}
          >
            <Button danger icon={<X className="size-4" />} loading={loading}>
              {t("rental.actions.cancel")}
            </Button>
          </Popconfirm>
        )}
      {isRentalDraft(statusId) && can(rentalContractPermissions.delete) && (
        <Popconfirm
          title={t("rental.actions.deleteConfirm")}
          onConfirm={onDelete}
          okText={t("common.delete")}
          cancelText={t("common.cancel")}
        >
          <Button
            danger
            type="text"
            icon={<Trash2 className="size-4" />}
            loading={loading}
          >
            {t("common.delete")}
          </Button>
        </Popconfirm>
      )}
    </Space>
  );
}
