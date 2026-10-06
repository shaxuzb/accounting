import { useState } from "react";
import { Alert, Button, Modal, Radio } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import Card from "@/components/ui/card/Card";
import InputNumberFormat from "@/components/fields/InputNumber";
import SelectCustom from "@/components/fields/SelectCustom";
import PayrollEmployeeSelect from "@/modules/payroll/components/PayrollEmployeeSelect";
import { $axiosPrivate } from "@/services/AxiosService";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { inventoryAdjustmentEndpoints } from "../constants/endpoints";

/** 1 — losses (9430), 2 — the responsible employee (4730), 3 — a supplier or carrier (4860). */
type Target = 1 | 2 | 3;

interface ShortageStatus {
  shortage: number;
  settled: number;
  remaining: number;
}

const money = (value: number) =>
  value.toLocaleString("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/**
 * The second step of a shortage (NSBU 21, 1C): what a write-off put on 5910 goes, once the
 * inventory commission has decided, to losses, to the employee responsible or to the
 * supplier. The settlement is posted as a manual entry.
 */
export default function InventoryShortageSettlement({
  adjustmentId,
}: {
  adjustmentId: string | number;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<Target>(1);
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [counterpartyId, setCounterpartyId] = useState<number | null>(null);
  const [amount, setAmount] = useState<number | null>(null);

  const statusQuery = useQuery({
    queryKey: ["inventory-adjustment-shortage", String(adjustmentId)],
    queryFn: async () =>
      (
        await $axiosPrivate.get<ShortageStatus>(
          inventoryAdjustmentEndpoints.shortage(adjustmentId),
        )
      ).data,
  });
  const settle = useMutation({
    mutationFn: async () =>
      (
        await $axiosPrivate.post<number>(
          inventoryAdjustmentEndpoints.settleShortage(adjustmentId),
          {
            target,
            employeeId: target === 2 ? employeeId : null,
            counterpartyId: target === 3 ? counterpartyId : null,
            amount,
          },
        )
      ).data,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["inventory-adjustment-shortage", String(adjustmentId)],
      }),
  });

  const status = statusQuery.data;
  if (!status || status.shortage <= 0) return null;

  const openModal = () => {
    setTarget(1);
    setEmployeeId(null);
    setCounterpartyId(null);
    setAmount(status.remaining);
    setOpen(true);
  };

  const submit = async () => {
    try {
      await settle.mutateAsync();
      toast.success(t("warehouse.shortage.settled"));
      setOpen(false);
    } catch (error) {
      errorHandlers(error);
    }
  };

  const needsParty =
    (target === 2 && !employeeId) || (target === 3 && !counterpartyId);

  return (
    <Card className="space-y-2 p-4">
      <div className="text-sm font-semibold">{t("warehouse.shortage.title")}</div>
      <div className="flex justify-between text-sm">
        <span className="text-secondary-text">{t("warehouse.shortage.onAccount")}</span>
        <b>{money(status.shortage)}</b>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-secondary-text">{t("warehouse.shortage.settledLabel")}</span>
        <b>{money(status.settled)}</b>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-secondary-text">{t("warehouse.shortage.remaining")}</span>
        <b className={status.remaining > 0 ? "text-warning" : "text-success"}>
          {money(status.remaining)}
        </b>
      </div>
      {status.remaining > 0 && (
        <Button block type="primary" onClick={openModal}>
          {t("warehouse.shortage.settle")}
        </Button>
      )}

      <Modal
        open={open}
        title={t("warehouse.shortage.settle")}
        okText={t("warehouse.shortage.settle")}
        cancelText={t("common.cancel")}
        confirmLoading={settle.isPending}
        okButtonProps={{ disabled: needsParty || !amount }}
        onOk={() => void submit()}
        onCancel={() => setOpen(false)}
        destroyOnHidden
      >
        <div className="space-y-3 pt-2">
          <Alert showIcon type="info" message={t("warehouse.shortage.hint")} />
          <Radio.Group
            value={target}
            onChange={(event) => setTarget(event.target.value as Target)}
            className="flex flex-col gap-2"
          >
            <Radio value={1}>{t("warehouse.shortage.targetLoss")}</Radio>
            <Radio value={2}>{t("warehouse.shortage.targetEmployee")}</Radio>
            <Radio value={3}>{t("warehouse.shortage.targetSupplier")}</Radio>
          </Radio.Group>
          {target === 2 && (
            <PayrollEmployeeSelect
              label="warehouse.shortage.employee"
              value={employeeId}
              required
              onChange={setEmployeeId}
            />
          )}
          {target === 3 && (
            <SelectCustom
              label={t("warehouse.shortage.counterparty")}
              fieldName="shortage-counterparty"
              path={selectListEndpoints.counterpartiesSelectList}
              value={counterpartyId}
              search
              required
              marginBottom="mb-0"
              onChange={(value) => setCounterpartyId(Number(value) || null)}
            />
          )}
          <div>
            <div className="mb-1 text-sm">{t("warehouse.shortage.amount")}</div>
            <InputNumberFormat
              standalone
              min={0}
              max={status.remaining}
              precision={2}
              value={amount}
              onValueChange={(value) =>
                setAmount(value == null ? null : Number(value))
              }
            />
          </div>
        </div>
      </Modal>
    </Card>
  );
}
