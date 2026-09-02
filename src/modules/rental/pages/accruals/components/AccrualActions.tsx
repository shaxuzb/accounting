import { Button, Popconfirm, Space } from "antd";
import { Check, Pencil, Save, Trash2, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { rentalAccrualPermissions } from "../constants/permissions";
import { isRentalDraft, isRentalPosted } from "@/modules/rental/shared/constants/statuses";

interface AccrualActionsProps {
  statusId: number;
  permissions: string[];
  editing: boolean;
  loading?: boolean;
  onEdit: () => void;
  onSave: () => void;
  onDiscard: () => void;
  onPost: () => void;
  onCancel: () => void;
  onDelete: () => void;
}

export default function AccrualActions({ statusId, permissions, editing, loading, onEdit, onSave, onDiscard, onPost, onCancel, onDelete }: AccrualActionsProps) {
  const { t } = useTranslation();
  const can = (permission: string) => permissions.includes(permission);
  if (editing) return <Space wrap><Button type="primary" icon={<Save className="size-4" />} loading={loading} onClick={onSave}>{t("common.save")}</Button><Button icon={<X className="size-4" />} onClick={onDiscard}>{t("common.cancel")}</Button></Space>;
  return (
    <Space wrap>
      {isRentalDraft(statusId) && can(rentalAccrualPermissions.update) && <Button icon={<Pencil className="size-4" />} onClick={onEdit}>{t("common.edit")}</Button>}
      {isRentalDraft(statusId) && can(rentalAccrualPermissions.post) && <Popconfirm title={t("rental.actions.postConfirm")} onConfirm={onPost} okText={t("rental.actions.post")} cancelText={t("common.cancel")}><Button type="primary" icon={<Check className="size-4" />} loading={loading}>{t("rental.actions.post")}</Button></Popconfirm>}
      {(isRentalDraft(statusId) || isRentalPosted(statusId)) && can(rentalAccrualPermissions.cancel) && <Popconfirm title={t("rental.actions.cancelConfirm")} onConfirm={onCancel} okText={t("rental.actions.cancel")} cancelText={t("common.cancel")}><Button danger icon={<X className="size-4" />} loading={loading}>{t("rental.actions.cancel")}</Button></Popconfirm>}
      {isRentalDraft(statusId) && can(rentalAccrualPermissions.delete) && <Popconfirm title={t("rental.actions.deleteConfirm")} onConfirm={onDelete} okText={t("common.delete")} cancelText={t("common.cancel")}><Button danger type="text" icon={<Trash2 className="size-4" />} loading={loading}>{t("common.delete")}</Button></Popconfirm>}
    </Space>
  );
}
