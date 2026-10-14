import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, DatePicker, Input, Popconfirm, Select, Table } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import toast from "react-hot-toast";
import { $axiosPrivate } from "@/services/AxiosService";
import { errorHandlers } from "@/utils/helpers/errorHandlers";

interface ResponsiblePerson {
  id: number;
  roleId: number;
  fullName: string;
  position?: string | null;
  pinfl?: string | null;
  startDate: string;
}

const roleOptions = [
  { value: 1, label: "settings.responsible.director" },
  { value: 2, label: "settings.responsible.chiefAccountant" },
  { value: 3, label: "settings.responsible.cashier" },
];

/**
 * «Ответственные лица организаций» of 1C: who signs as director, chief accountant or cashier,
 * each from a date — a document is signed by whoever held the post on its date.
 */
export default function ResponsiblePersons({ organizationId }: { organizationId: number }) {
  const { t } = useTranslation();
  const [rows, setRows] = useState<ResponsiblePerson[]>([]);
  const [loading, setLoading] = useState(false);
  const [roleId, setRoleId] = useState<number>(2);
  const [fullName, setFullName] = useState("");
  const [position, setPosition] = useState("");
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs());
  const base = `/organizations/${organizationId}/responsible-persons`;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await $axiosPrivate.get<ResponsiblePerson[]>(base);
      setRows(data);
    } catch (error) {
      errorHandlers(error);
    } finally {
      setLoading(false);
    }
  }, [base]);

  useEffect(() => {
    void load();
  }, [load]);

  const add = async () => {
    if (!fullName.trim() || !startDate) return;
    try {
      await $axiosPrivate.post(base, {
        roleId,
        fullName: fullName.trim(),
        position: position.trim() || null,
        startDate: startDate.format("YYYY-MM-DD"),
      });
      setFullName("");
      setPosition("");
      toast.success(t("settings.messages.created"));
      await load();
    } catch (error) {
      errorHandlers(error);
    }
  };

  const remove = async (id: number) => {
    try {
      await $axiosPrivate.delete(`${base}/${id}`);
      await load();
    } catch (error) {
      errorHandlers(error);
    }
  };

  const roleName = (id: number) => t(roleOptions.find((option) => option.value === id)?.label ?? "");

  return (
    <div className="flex flex-col gap-2">
      <div className="font-semibold">{t("settings.responsible.title")}</div>
      <div className="text-xs text-secondary-text">{t("settings.responsible.hint")}</div>
      <Table<ResponsiblePerson>
        size="small"
        rowKey="id"
        loading={loading}
        pagination={false}
        dataSource={rows}
        locale={{ emptyText: t("settings.responsible.empty") }}
        columns={[
          { title: t("settings.responsible.role"), dataIndex: "roleId", render: roleName },
          { title: t("settings.responsible.fullName"), dataIndex: "fullName" },
          { title: t("settings.responsible.position"), dataIndex: "position" },
          {
            title: t("settings.responsible.startDate"),
            dataIndex: "startDate",
            render: (value: string) => dayjs(value).format("DD.MM.YYYY"),
          },
          {
            key: "actions",
            width: 40,
            render: (_, row) => (
              <Popconfirm title={t("common.delete")} onConfirm={() => remove(row.id)}>
                <Button size="small" danger type="text">
                  ×
                </Button>
              </Popconfirm>
            ),
          },
        ]}
      />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[150px_1fr_1fr_130px_auto]">
        <Select
          value={roleId}
          onChange={setRoleId}
          options={roleOptions.map((option) => ({ value: option.value, label: t(option.label) }))}
        />
        <Input
          value={fullName}
          placeholder={t("settings.responsible.fullName")}
          onChange={(event) => setFullName(event.target.value)}
        />
        <Input
          value={position}
          placeholder={t("settings.responsible.position")}
          onChange={(event) => setPosition(event.target.value)}
        />
        <DatePicker value={startDate} format="DD.MM.YYYY" onChange={setStartDate} />
        <Button type="primary" onClick={add} disabled={!fullName.trim() || !startDate}>
          {t("settings.responsible.add")}
        </Button>
      </div>
    </div>
  );
}
