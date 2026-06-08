import React from "react";
import { Dropdown, Button, App } from "antd";
import type { MenuProps } from "antd";
import { EllipsisVertical, Pencil, Trash } from "lucide-react";
import { $axiosPrivate } from "@/services/AxiosService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { errorHandlers } from "@/utils/helpers/errorHandlers";

interface Props {
  record: {
    id: number | string;
    statusId?: number;
  };
  permissions: string[];
  refetch: () => void;
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
  customPatn?: string | null;
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
  customPatn,
  editModal = {
    isModal: false,
  },
  customActions = [],
}) => {
  const { modal } = App.useApp();
  const navigate = useNavigate();
  const actions: MenuProps["items"] = [];
  const handleDelete = async (id: number | string) => {
    try {
      const response = await $axiosPrivate.delete(`/${deletePath}/${id}`);
      if (response) {
        toast.success(`Element ${id} muvaffaqiyatli o'chirildi`);
        refetch();
      }
    } catch (err: unknown) {
      errorHandlers(err);
    }
  };

  if (permissions.includes(permissionsCode?.editCode || "")) {
    actions.push({
      key: "edit",
      label: "O'zgartirish",
      icon: <Pencil className="size-4" />,
      onClick: () => {
        if (!editModal.isModal)
          return navigate(customPatn ? customPatn : `edit/${record.id}`);
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
      label: "O'chirish",
      icon: <Trash className="size-4.5" />,
      danger: true,
      onClick: () => {
        modal.confirm({
          title: "Siz ushbu elementni o'chirishni xohlaysizmi?",
          content: "Bu amalni qaytarib bo'lmaydi!",
          okText: "O'chirish",
          okButtonProps: {
            type: "primary",
            danger: true,
          },
          cancelText: "Bekor qilish",
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
