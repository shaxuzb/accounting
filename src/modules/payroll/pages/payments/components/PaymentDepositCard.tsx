import { Button, Checkbox, Table, Tag } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import Card from "@/components/ui/card/Card";
import { $axiosPrivate } from "@/services/AxiosService";
import { money } from "@/modules/payroll/utils/format";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { payrollPaymentEndpoints } from "../constants/endpoints";
import { payrollPaymentKeys } from "../constants/queryKeys";
import type { PayrollPayment, PayrollPaymentLine } from "../types/type";

/**
 * The pay a cash statement's employees did not take (1C «Депонирование зарплаты»): marked on
 * the draft, it is left out of the cash paid out and posted Dt 6710 Kt 6720 by the employee; it
 * is paid out later by a cash «Deponentlangan ish haqini berish».
 */
export default function PaymentDepositCard({ record, canEdit }: { record: PayrollPayment; canEdit: boolean }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const lines = record.lines ?? [];
  const isDraft = record.statusId === 1;
  const [selected, setSelected] = useState<number[]>([]);
  useEffect(() => {
    setSelected(lines.filter((line) => line.isDeposited).map((line) => line.employeeId));
  }, [record]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = useMutation({
    mutationFn: () =>
      $axiosPrivate.put(`${payrollPaymentEndpoints.detail(record.id)}/deposited`, { employeeIds: selected }),
    onSuccess: () => {
      toast.success(t("payroll.deposit.saved"));
      void queryClient.invalidateQueries({ queryKey: payrollPaymentKeys.detail(String(record.id)) });
      void queryClient.invalidateQueries({ queryKey: payrollPaymentKeys.detail(record.id) });
    },
    onError: (error: unknown) => errorHandlers(error),
  });

  const deposited = lines.filter((line) => selected.includes(line.employeeId));
  const depositedSum = deposited.reduce((sum, line) => sum + Number(line.amount || 0), 0);
  const editable = isDraft && canEdit;
  if (!editable && deposited.length === 0) return null;

  return (
    <Card className="border border-border p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-base font-semibold text-heading">
            {t("payroll.deposit.title")} {deposited.length > 0 && <Tag color="orange">{money(depositedSum)}</Tag>}
          </div>
          <div className="max-w-3xl text-sm text-secondary-text">{t("payroll.deposit.hint")}</div>
        </div>
        {editable && (
          <Button type="primary" icon={<Save className="size-4" />} loading={save.isPending} onClick={() => save.mutate()}>
            {t("payroll.deposit.save")}
          </Button>
        )}
      </div>
      <Table<PayrollPaymentLine>
        rowKey={(line) => `${line.employeeId}-${line.id ?? ""}`}
        size="small"
        pagination={false}
        scroll={{ y: 300 }}
        dataSource={editable ? lines : deposited}
        columns={[
          {
            key: "deposited",
            width: 120,
            title: t("payroll.deposit.notTaken"),
            render: (_, line) => (
              <Checkbox
                checked={selected.includes(line.employeeId)}
                disabled={!editable}
                onChange={(event) =>
                  setSelected((current) =>
                    event.target.checked
                      ? [...current, line.employeeId]
                      : current.filter((id) => id !== line.employeeId),
                  )
                }
              />
            ),
          },
          { key: "employee", title: t("payroll.fields.employee"), render: (_, line) => line.employeeName },
          { key: "amount", title: t("payroll.fields.amount"), align: "right", render: (_, line) => money(line.amount) },
        ]}
      />
    </Card>
  );
}
