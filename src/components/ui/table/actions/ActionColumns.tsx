import React from "react";
import { Dropdown, Button, App } from "antd";
import type { MenuProps } from "antd";
import { EllipsisVertical, Pencil, Trash } from "lucide-react";
import { $axiosPrivate } from "@/services/AxiosService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { useTranslation } from "react-i18next";

interface Props {
  record: {
    id: number | string;
    statusId?: number;
  };
  permissions: string[];
  refetch: () => void;
  onDeleteSuccess?: () => void | Promise<void>;
  permissionsCode?: {
    editCode?: string;
    deleteCode?: string;
    acceptIncashCode?: string;
    acceptPayment?: string;
  };
  deletePath: string;
  customActions?: {
    setOpenModal?: React.Dispatch<React.SetStateAction<boolean>>;
    setData?: React.Dispatch<React.SetStateAction<unknown>>;
    // path?: string;
    label: string;
    permissionCode?: string;
    icon: React.ReactNode;
  }[];
  customPath?: string | null;
  deleteLabel?: string;
  deleteConfirmTitle?: string;
  deleteConfirmContent?: string;
  editModal?: {
    isModal?: boolean;
    setOpenEditModal?: React.Dispatch<React.SetStateAction<boolean>>;
    setEditData?: React.Dispatch<React.SetStateAction<unknown>>;
  };
}

const ActionColumn: React.FC<Props> = ({
  record,
  permissions,
  refetch,
  permissionsCode,
  deletePath,
  onDeleteSuccess,
  customPath,
  editModal = {
    isModal: false,
  },
  customActions = [],
  deleteLabel,
  deleteConfirmTitle,
  deleteConfirmContent,
}) => {
  const { modal } = App.useApp();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const actions: MenuProps["items"] = [];
  const handleDelete = async (id: number | string) => {
    try {
      const response = await $axiosPrivate.delete(`/${deletePath}/${id}`);
      if (response) {
        toast.success(t("actions.deleteSuccess", { id }));
        refetch();
        await onDeleteSuccess?.();
      }
    } catch (err: unknown) {
      errorHandlers(err);
    }
  };

  if (permissions.includes(permissionsCode?.editCode || "")) {
    actions.push({
      key: "edit",
      label: t("common.edit"),
      icon: <Pencil className="size-4" />,
      onClick: () => {
        if (!editModal.isModal)
          return navigate(customPath ? customPath : `edit/${record.id}`);
        editModal.setOpenEditModal?.(true);
        editModal.setEditData?.(record);
      },
    });
  }
  if (customActions.length > 0) {
    customActions.forEach((action, index) => {
      if (permissions.includes(action.permissionCode || "")) {
        actions.push({
          key: action.label ?? index.toString(),
          label: action.label,
          icon: action.icon,
          onClick: () => {
            action.setOpenModal?.(true);
            action.setData?.(record);
            // if (action.path) navigate(action.path);
          },
        });
      }
    });
  }
  if (permissions.includes(permissionsCode?.deleteCode || "")) {
    actions.push({
      key: "delete",
      label: deleteLabel ?? t("common.delete"),
      icon: <Trash className="size-4.5" />,
      danger: true,
      onClick: () => {
        modal.confirm({
          title: deleteConfirmTitle ?? t("actions.deleteConfirmTitle"),
          content: deleteConfirmContent ?? t("actions.deleteConfirmContent"),
          okText: deleteLabel ?? t("common.delete"),
          okButtonProps: {
            type: "primary",
            danger: true,
          },
          cancelText: t("common.cancel"),
          onOk: () => handleDelete(record.id),
        });
      },
    });
  }

  if (!actions.length) return null;

  return (
    <Dropdown menu={{ items: actions }} placement="bottom">
      <Button type="text" className="px-2!">
        <EllipsisVertical className="size-5" />
      </Button>
    </Dropdown>
  );
};

export default ActionColumn;
