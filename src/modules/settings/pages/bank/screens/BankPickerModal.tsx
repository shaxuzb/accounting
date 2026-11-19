import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Input, Modal, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import toast from "react-hot-toast";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { useAttachBanks, useGetDirectoryBanks } from "../hooks";
import type { DirectoryBank } from "../types/type";

interface BankPickerModalProps {
  open: boolean;
  onClose: () => void;
  /** Banks already on the organization's list. */
  attachedIds: number[];
}

/** Picks banks from the common directory (the Central Bank's register) onto the organization's list. */
export default function BankPickerModal({
  open,
  onClose,
  attachedIds,
}: BankPickerModalProps) {
  const { t } = useTranslation();
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const { data, isLoading, isFetching } = useGetDirectoryBanks(search, open);
  const attach = useAttachBanks();

  useEffect(() => {
    const timer = setTimeout(() => setSearch(text.trim()), 300);
    return () => clearTimeout(timer);
  }, [text]);

  const close = () => {
    setText("");
    setSearch("");
    setSelected([]);
    onClose();
  };

  const isAttached = (bank: DirectoryBank) => attachedIds.includes(bank.id);

  const toggle = (bank: DirectoryBank) => {
    if (isAttached(bank)) return;
    setSelected((current) =>
      current.includes(bank.id)
        ? current.filter((id) => id !== bank.id)
        : [...current, bank.id],
    );
  };

  const handleAttach = () =>
    attach.mutate(selected, {
      onSuccess: () => {
        toast.success(
          t("settings.orgBanks.attachedCount", { count: selected.length }),
        );
        close();
      },
      onError: errorHandlers,
    });

  const columns: TableColumnsType<DirectoryBank> = [
    { dataIndex: "name", title: t("settings.fields.name") },
    {
      dataIndex: "mfo",
      title: t("settings.fields.mfo"),
      width: 100,
      render: (value: string | null) => value || "-",
    },
    {
      dataIndex: "inn",
      title: t("settings.orgBanks.inn"),
      width: 120,
      render: (value: string | null) => value || "-",
    },
    {
      key: "attached",
      width: 130,
      render: (_value, record) =>
        isAttached(record) ? (
          <Tag color="green">{t("settings.orgBanks.attached")}</Tag>
        ) : null,
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={close}
      title={t("settings.orgBanks.pickTitle")}
      width={820}
      okText={t("settings.orgBanks.attach")}
      cancelText={t("common.cancel")}
      okButtonProps={{
        disabled: selected.length === 0,
        loading: attach.isPending,
      }}
      onOk={handleAttach}
    >
      <Alert
        className="mb-3"
        type="info"
        showIcon
        message={t("settings.orgBanks.pickHint")}
      />
      <Input.Search
        className="mb-3"
        allowClear
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder={t("common.search")}
      />
      <Table<DirectoryBank>
        rowKey="id"
        size="small"
        loading={isLoading || isFetching}
        columns={columns}
        dataSource={data?.items ?? []}
        pagination={false}
        scroll={{ y: 420 }}
        rowSelection={{
          selectedRowKeys: selected,
          onChange: (keys) => setSelected(keys as number[]),
          getCheckboxProps: (record) => ({ disabled: isAttached(record) }),
        }}
        onRow={(record) => ({
          onClick: () => toggle(record),
          className: isAttached(record) ? "" : "cursor-pointer",
        })}
      />
    </Modal>
  );
}
