import dayjs from "dayjs";
import InputNumber from "@/components/fields/InputNumber";
import InputTextArea from "@/components/fields/InputTextArea";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import SelectStatic from "@/components/fields/SelectStatic";
import Card from "@/components/ui/card/Card";
import SectionCard from "@/components/ui/card/SectionCard";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import PayrollEmployeeSelect from "@/modules/payroll/components/PayrollEmployeeSelect";
import { advanceMethodOptions, employmentTypeOptions, hrOrderTypeOptions } from "@/modules/payroll/constants/options";
import { displayDate, money } from "@/modules/payroll/utils/format";
import { chartAccountSelectDisplayConfig, selectListEndpoints } from "@/shared/constants/selectLists";
import { useAppSelector } from "@/store/hooks";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { Alert, App, Button, Col, Form, Modal, Row, Spin, Table } from "antd";
import { useFormik } from "formik";
import { CheckCircle2, CircleX, Printer, Save, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { hrOrderPermissions } from "../../../constants/permissions";
import { getHrOrderFieldConfig } from "../utils/order";
import { useCancelHrOrder, useConfirmHrOrder, useCreateHrOrder, useDeleteHrOrder, useHrOrderDetail, useHrOrderPrint, useUpdateHrOrder } from "../hooks";
import type { PayrollHrOrderForm } from "../types/form";
import { hrOrderSchema } from "../types/schema";

const LIST_PATH = "/main/hr/orders";
const defaultValues: PayrollHrOrderForm = {
  orderDate: dayjs().format("YYYY-MM-DD"),
  orderType: "HIRE",
  employeeId: null,
  effectiveDate: dayjs().format("YYYY-MM-DD"),
  basis: null,
  note: null,
  departmentId: null,
  positionId: null,
  employmentType: "PRIMARY",
  monthlySalary: null,
  employmentRate: 1,
  weeklyHours: 40,
  currencyId: null,
  expenseAccountId: null,
  advanceMethod: "PERCENT",
  advanceValue: 0,
};

const toPayload = (values: PayrollHrOrderForm): PayrollHrOrderForm => {
  const base = { ...values, basis: values.basis || null, note: values.note || null };
  if (values.orderType === "DISMISSAL") return { ...base, departmentId: null, positionId: null, employmentType: null, monthlySalary: null, employmentRate: null, weeklyHours: null, currencyId: null, expenseAccountId: null, advanceMethod: "PERCENT", advanceValue: null };
  if (values.orderType === "PAY_CHANGE") return { ...base, departmentId: null, positionId: null, employmentType: null, weeklyHours: null, currencyId: null, expenseAccountId: null, advanceMethod: "PERCENT", advanceValue: null };
  if (values.orderType === "TRANSFER") return { ...base, monthlySalary: null, employmentRate: null, weeklyHours: null, currencyId: null, expenseAccountId: null, advanceMethod: "PERCENT", advanceValue: null };
  return base;
};

export default function HrOrderDetailPage() {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { modal } = App.useApp();
  const isCreate = !id;
  const permissions = useAppSelector((state) => state.auth.user?.user.permissions ?? []);
  const { data: record, isLoading } = useHrOrderDetail(id);
  const createMutation = useCreateHrOrder();
  const updateMutation = useUpdateHrOrder();
  const confirmMutation = useConfirmHrOrder();
  const cancelMutation = useCancelHrOrder();
  const deleteMutation = useDeleteHrOrder();
  const [printOpen, setPrintOpen] = useState(searchParams.get("print") === "1");
  const { data: printData, isFetching: isPrintFetching } = useHrOrderPrint(printOpen ? id : null);

  const initialValues = useMemo<PayrollHrOrderForm>(() => {
    if (!record) return defaultValues;
    return {
      orderDate: record.orderDate,
      orderType: record.orderType,
      employeeId: record.employeeId,
      effectiveDate: record.effectiveDate,
      basis: record.basis ?? null,
      note: record.note ?? null,
      departmentId: record.departmentId ?? null,
      positionId: record.positionId ?? null,
      employmentType: record.employmentType ?? null,
      monthlySalary: record.monthlySalary ?? null,
      employmentRate: record.employmentRate ?? 1,
      weeklyHours: record.weeklyHours ?? 40,
      currencyId: record.currencyId ?? null,
      expenseAccountId: record.expenseAccountId ?? null,
      advanceMethod: record.advanceMethod ?? "PERCENT",
      advanceValue: record.advanceValue ?? 0,
    };
  }, [record]);

  const formik = useFormik<PayrollHrOrderForm>({
    initialValues,
    enableReinitialize: true,
    validationSchema: hrOrderSchema,
    onSubmit: async (values) => {
      try {
        if (isCreate) {
          const created = await createMutation.mutateAsync(toPayload(values));
          const createdId = typeof created === "number" ? created : Number(created.id);
          toast.success(t("payroll.messages.hrOrderCreated", { defaultValue: "Kadr buyrug'i yaratildi" }));
          if (createdId > 0) navigate(`${LIST_PATH}/${createdId}`, { replace: true });
        } else {
          await updateMutation.mutateAsync({ id, payload: toPayload(values) });
          toast.success(t("payroll.messages.hrOrderUpdated", { defaultValue: "Kadr buyrug'i yangilandi" }));
        }
      } catch (error) { errorHandlers(error); }
    },
  });

  if (!isCreate && isLoading) return <div className="flex justify-center p-10"><Spin /></div>;
  if (!isCreate && !record) return <Alert type="error" message={t("payroll.hrOrders.notFound", { defaultValue: "Buyruq topilmadi" })} />;

  const statusId = record?.statusId ?? 1;
  const isDraft = isCreate || statusId === 1;
  const fields = getHrOrderFieldConfig(formik.values.orderType);
  const readOnly = !isDraft || (!isCreate && !permissions.includes(hrOrderPermissions.update));
  const isBusy = createMutation.isPending || updateMutation.isPending || confirmMutation.isPending || cancelMutation.isPending || deleteMutation.isPending;
  const run = async (action: () => Promise<unknown>, success: string, redirect = false) => {
    try { await action(); toast.success(t(success, { defaultValue: success })); if (redirect) navigate(LIST_PATH, { replace: true }); }
    catch (error) { errorHandlers(error); }
  };
  const ask = (title: string, action: () => Promise<unknown>, success: string, redirect = false) => {
    modal.confirm({ title, okText: t("common.confirm"), cancelText: t("common.cancel"), okButtonProps: { danger: success.includes("Cancelled") || success.includes("Deleted") }, onOk: () => run(action, success, redirect) });
  };

  return (
    <div className="min-w-0 space-y-4">
      {!isCreate && record && <Alert type={isDraft ? "warning" : statusId === 2 ? "success" : "info"} showIcon message={<span className="flex items-center gap-2"><span>{record.orderNumber}</span><ProcessStatusBadge statusId={record.statusId} /></span>} />}
      <SectionCard title="payroll.hrOrders.formTitle" description="payroll.hrOrders.formHint" icon={<Save className="size-4" />}>
        <Form layout="vertical" onFinish={formik.handleSubmit}>
          <Row gutter={[16, 0]}>
            <Col xs={24} md={8}><SelectStatic formik={formik} fieldName="orderType" label="payroll.fields.orderType" options={hrOrderTypeOptions} required disabled={readOnly} resetFields={["departmentId", "positionId", "employmentType", "monthlySalary", "employmentRate", "weeklyHours", "currencyId", "expenseAccountId", "advanceValue"]} /></Col>
            <Col xs={24} md={8}><PayrollEmployeeSelect formik={formik} fieldName="employeeId" label="payroll.fields.employee" required disabled={readOnly} /></Col>
            <Col xs={24} md={4}><SelectDate formik={formik} fieldName="orderDate" label="payroll.fields.orderDate" valueFormat="YYYY-MM-DD" required disabled={readOnly} /></Col>
            <Col xs={24} md={4}><SelectDate formik={formik} fieldName="effectiveDate" label="payroll.fields.effectiveDate" valueFormat="YYYY-MM-DD" required disabled={readOnly} /></Col>
            {fields.showDepartment && <Col xs={24} md={6}><SelectCustom formik={formik} fieldName="departmentId" label="payroll.fields.department" path={selectListEndpoints.departmentsSelectList} search clearable disabled={readOnly} marginBottom="mb-4" /></Col>}
            {fields.showPosition && <Col xs={24} md={6}><SelectCustom formik={formik} fieldName="positionId" label="payroll.fields.position" path={selectListEndpoints.positionsSelectList} search clearable disabled={readOnly} marginBottom="mb-4" /></Col>}
            {fields.showEmployment && <Col xs={24} md={6}><SelectStatic formik={formik} fieldName="employmentType" label="payroll.fields.employmentType" options={employmentTypeOptions} required disabled={readOnly} marginBottom="mb-4" /></Col>}
            {fields.showSalary && <Col xs={24} md={6}><InputNumber formik={formik} fieldName="monthlySalary" label="payroll.fields.monthlySalary" min={0} precision={2} required disabled={readOnly} /></Col>}
            {fields.showRate && <Col xs={24} md={6}><InputNumber formik={formik} fieldName="employmentRate" label="payroll.fields.employmentRate" min={0} max={2} precision={2} disabled={readOnly} /></Col>}
            {fields.showWeeklyHours && <Col xs={24} md={6}><InputNumber formik={formik} fieldName="weeklyHours" label="payroll.fields.weeklyHours" min={0} max={168} precision={1} disabled={readOnly} /></Col>}
            {fields.showCurrency && <Col xs={24} md={6}><SelectCustom formik={formik} fieldName="currencyId" label="payroll.fields.currency" path={selectListEndpoints.currenciesSelectList} required disabled={readOnly} marginBottom="mb-4" /></Col>}
            {fields.showExpenseAccount && <Col xs={24} md={6}><SelectCustom formik={formik} fieldName="expenseAccountId" label="payroll.fields.expenseAccountOverride" path={selectListEndpoints.chartAccountsSelectList} displayConfig={chartAccountSelectDisplayConfig} search clearable disabled={readOnly} marginBottom="mb-4" /></Col>}
            {fields.showAdvance && <><Col xs={24} md={6}><SelectStatic formik={formik} fieldName="advanceMethod" label="payroll.fields.advanceMethod" options={advanceMethodOptions} disabled={readOnly} marginBottom="mb-4" /></Col><Col xs={24} md={6}><InputNumber formik={formik} fieldName="advanceValue" label={formik.values.advanceMethod === "PERCENT" ? "payroll.fields.advancePercent" : "payroll.fields.advanceAmount"} min={0} max={formik.values.advanceMethod === "PERCENT" ? 100 : undefined} precision={2} disabled={readOnly} /></Col></>}
            <Col xs={24} md={12}><InputTextArea formik={formik} fieldName="basis" label="payroll.fields.basis" rows={2} disabled={readOnly} /></Col>
            <Col xs={24} md={12}><InputTextArea formik={formik} fieldName="note" label="payroll.fields.note" rows={2} disabled={readOnly} /></Col>
          </Row>
          {formik.errors.positionId && <div className="mb-3 text-sm text-red-500">{String(formik.errors.positionId)}</div>}
          {!readOnly && <div className="flex justify-end"><Button type="primary" htmlType="submit" icon={<Save className="size-4" />} loading={createMutation.isPending || updateMutation.isPending}>{t("common.save")}</Button></div>}
        </Form>
      </SectionCard>
      {!isCreate && record && <Card className="sticky bottom-0 z-20 border border-border bg-primary-bg/95 px-4 py-3 shadow-sm"><div className="flex flex-wrap justify-end gap-2">{isDraft && permissions.includes(hrOrderPermissions.confirm) && <Button type="primary" icon={<CheckCircle2 className="size-4" />} loading={confirmMutation.isPending} disabled={isBusy} onClick={() => ask(t("payroll.hrOrders.confirmTitle", { defaultValue: "Buyruqni tasdiqlaysizmi?" }), () => confirmMutation.mutateAsync(id), "payroll.messages.hrOrderConfirmed")}>{t("payroll.actions.confirm")}</Button>}{isDraft && permissions.includes(hrOrderPermissions.delete) && <Button danger icon={<Trash2 className="size-4" />} loading={deleteMutation.isPending} disabled={isBusy} onClick={() => ask(t("payroll.hrOrders.deleteTitle", { defaultValue: "Buyruqni o'chirasizmi?" }), () => deleteMutation.mutateAsync(id), "payroll.messages.hrOrderDeleted", true)}>{t("common.delete")}</Button>}{!isDraft && permissions.includes(hrOrderPermissions.view) && <Button icon={<Printer className="size-4" />} onClick={() => setPrintOpen(true)}>{t("payroll.hrOrders.print", { defaultValue: "Chop etish" })}</Button>}{statusId === 2 && permissions.includes(hrOrderPermissions.cancel) && <Button danger icon={<CircleX className="size-4" />} loading={cancelMutation.isPending} disabled={isBusy} onClick={() => ask(t("payroll.hrOrders.cancelTitle", { defaultValue: "Buyruqni bekor qilasizmi?" }), () => cancelMutation.mutateAsync(id), "payroll.messages.hrOrderCancelled")}>{t("payroll.actions.cancel")}</Button>}</div></Card>}
      <Modal open={printOpen} onCancel={() => setPrintOpen(false)} footer={<Button onClick={() => window.print()} icon={<Printer className="size-4" />}>{t("payroll.hrOrders.print", { defaultValue: "Chop etish" })}</Button>} title={t("payroll.hrOrders.printTitle", { defaultValue: "Kadr buyrug'i" })} width={760}>
        <Spin spinning={isPrintFetching}>{printData ? <div className="space-y-4 text-sm"><div className="text-center text-lg font-semibold">{printData.organizationName}</div><div className="grid grid-cols-2 gap-2"><span>{t("payroll.fields.orderNumber", { defaultValue: "Buyruq raqami" })}: <b>{printData.orderNumber}</b></span><span>{t("payroll.fields.orderDate", { defaultValue: "Buyruq sanasi" })}: <b>{displayDate(printData.orderDate)}</b></span><span>{t("payroll.fields.employee")}: <b>{printData.employeeName}</b></span><span>{t("payroll.fields.effectiveDate", { defaultValue: "Amal qilish sanasi" })}: <b>{displayDate(printData.effectiveDate)}</b></span></div><Table pagination={false} size="small" dataSource={[{ key: 1, label: t("payroll.hrOrders.from", { defaultValue: "Eski" }), department: printData.fromDepartmentName ?? "—", position: printData.fromPositionName ?? "—", salary: printData.fromMonthlySalary }, { key: 2, label: t("payroll.hrOrders.to", { defaultValue: "Yangi" }), department: printData.toDepartmentName ?? "—", position: printData.toPositionName ?? "—", salary: printData.toMonthlySalary }]} columns={[{ title: "", dataIndex: "label" }, { title: t("payroll.fields.department"), dataIndex: "department" }, { title: t("payroll.fields.position"), dataIndex: "position" }, { title: t("payroll.fields.monthlySalary"), dataIndex: "salary", render: (value: number | null) => value == null ? "—" : money(value) }]} /></div> : <Alert type="info" message={t("payroll.hrOrders.printUnavailable", { defaultValue: "Bosma ma'lumotlari mavjud emas" })} />}</Spin>
      </Modal>
    </div>
  );
}
