import { Button, Form, Modal, Popconfirm, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import dayjs from "@/config/dayjs";
import Card from "@/components/ui/card/Card";
import ListToolbar from "@/components/ui/filters/ListToolbar";
import InputNumber from "@/components/fields/InputNumber";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { $axiosPrivate } from "@/services/AxiosService";
import { errorHandlers } from "@/utils/helpers/errorHandlers";

interface StaffPosition {
  id: number;
  departmentId?: number | null;
  departmentName?: string | null;
  positionId: number;
  positionName: string;
  units: number;
  occupied: number;
  salaryMin?: number | null;
  salaryMax?: number | null;
  effectiveFrom: string;
  effectiveTo?: string | null;
}

interface StaffForm {
  departmentId: number | null;
  positionId: number | null;
  units: number | null;
  salaryMin: number | null;
  salaryMax: number | null;
  effectiveFrom: string;
  effectiveTo: string | null;
}

const empty = (): StaffForm => ({
  departmentId: null,
  positionId: null,
  units: 1,
  salaryMin: null,
  salaryMax: null,
  effectiveFrom: dayjs().startOf("month").format("YYYY-MM-DD"),
  effectiveTo: null,
});

const money = (value?: number | null) => (value == null ? "—" : Number(value).toLocaleString("ru-RU"));

/**
 * The staff list (1C ЗУП «Штатное расписание»): the units of each position by department and the
 * salary range of one full unit. Once lines exist, a hire, transfer or pay change must fit them.
 */
export default function HrStaffSchedulePage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<StaffPosition | "new" | null>(null);
  const { data = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ["staff-schedule"],
    queryFn: () => $axiosPrivate.get<StaffPosition[]>("hr/staff-schedule").then((r) => r.data),
  });

  const save = useMutation({
    mutationFn: (values: StaffForm) =>
      editing && editing !== "new"
        ? $axiosPrivate.put(`hr/staff-schedule/${editing.id}`, values)
        : $axiosPrivate.post("hr/staff-schedule", values),
    onSuccess: () => {
      toast.success(t("settings.messages.updated"));
      setEditing(null);
      void queryClient.invalidateQueries({ queryKey: ["staff-schedule"] });
    },
    onError: errorHandlers,
  });
  const remove = useMutation({
    mutationFn: (id: number) => $axiosPrivate.delete(`hr/staff-schedule/${id}`),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["staff-schedule"] }),
    onError: errorHandlers,
  });

  const formik = useFormik<StaffForm>({
    initialValues:
      editing && editing !== "new"
        ? {
            departmentId: editing.departmentId ?? null,
            positionId: editing.positionId,
            units: editing.units,
            salaryMin: editing.salaryMin ?? null,
            salaryMax: editing.salaryMax ?? null,
            effectiveFrom: editing.effectiveFrom,
            effectiveTo: editing.effectiveTo ?? null,
          }
        : empty(),
    enableReinitialize: true,
    onSubmit: (values) => save.mutate({ ...values, effectiveTo: values.effectiveTo || null }),
  });

  const columns: TableColumnsType<StaffPosition> = [
    { dataIndex: "departmentName", title: t("payroll.fields.department"), render: (v?: string | null) => v ?? t("hr.staff.anyDepartment") },
    { dataIndex: "positionName", title: t("payroll.fields.position") },
    { dataIndex: "units", title: t("hr.staff.units"), align: "right", width: 90 },
    {
      key: "occupied",
      title: t("hr.staff.occupied"),
      align: "right",
      width: 110,
      render: (_, row) => <Tag color={row.occupied > row.units ? "red" : row.occupied === row.units ? "orange" : "green"}>{row.occupied}</Tag>,
    },
    { key: "free", title: t("hr.staff.free"), align: "right", width: 90, render: (_, row) => Math.max(0, row.units - row.occupied) },
    { key: "salary", title: t("hr.staff.salaryRange"), align: "right", render: (_, row) => `${money(row.salaryMin)} — ${money(row.salaryMax)}` },
    {
      key: "period",
      title: t("payroll.fields.effectiveFrom"),
      render: (_, row) => `${dayjs(row.effectiveFrom).format("DD.MM.YYYY")}${row.effectiveTo ? ` — ${dayjs(row.effectiveTo).format("DD.MM.YYYY")}` : ""}`,
    },
    {
      key: "actions",
      width: 90,
      render: (_, row) => (
        <div className="flex gap-1">
          <Button type="text" size="small" icon={<Pencil className="size-4" />} onClick={() => setEditing(row)} />
          <Popconfirm title={t("common.delete")} onConfirm={() => remove.mutate(row.id)}>
            <Button type="text" danger size="small" icon={<Trash2 className="size-4" />} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full">
      <ListToolbar
        actions={
          <Button type="primary" icon={<Plus className="size-4" />} onClick={() => setEditing("new")}>
            {t("common.add")}
          </Button>
        }
        refreshing={isFetching}
        onRefresh={() => void refetch()}
      />
      <div className="mb-3 text-xs text-secondary-text">{t("hr.staff.hint")}</div>
      <Card className="overflow-hidden border border-border">
        <Table<StaffPosition> rowKey="id" size="middle" loading={isLoading} columns={columns} dataSource={data} pagination={false} scroll={{ x: "max-content" }} />
      </Card>
      <Modal
        open={editing !== null}
        title={t(editing === "new" ? "settings.form.createTitle" : "settings.form.editTitle")}
        onCancel={() => setEditing(null)}
        onOk={() => formik.handleSubmit()}
        confirmLoading={save.isPending}
        okText={t("common.save")}
        cancelText={t("common.cancel")}
        destroyOnHidden
      >
        <Form layout="vertical">
          <SelectCustom formik={formik} fieldName="departmentId" label="payroll.fields.department" path={selectListEndpoints.departmentsSelectList} createWith="department" search clearable marginBottom="mb-4" />
          <SelectCustom formik={formik} fieldName="positionId" label="payroll.fields.position" path={selectListEndpoints.positionsSelectList} createWith="position" search required marginBottom="mb-4" />
          <div className="grid grid-cols-3 gap-3">
            <InputNumber formik={formik} fieldName="units" label="hr.staff.units" min={0.25} precision={2} required />
            <InputNumber formik={formik} fieldName="salaryMin" label="hr.staff.salaryMin" min={0} precision={2} />
            <InputNumber formik={formik} fieldName="salaryMax" label="hr.staff.salaryMax" min={0} precision={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <SelectDate formik={formik} fieldName="effectiveFrom" label="payroll.fields.effectiveFrom" valueFormat="YYYY-MM-DD" required />
            <SelectDate formik={formik} fieldName="effectiveTo" label="payroll.fields.effectiveTo" valueFormat="YYYY-MM-DD" clearable />
          </div>
        </Form>
      </Modal>
    </div>
  );
}
