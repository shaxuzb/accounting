import { DatePicker, Form, Modal } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface ContractActionDateModalProps {
  open: boolean;
  action: "activate" | "cancel";
  loading?: boolean;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  onClose: () => void;
  onSubmit: (date: string | null) => void;
}

export default function ContractActionDateModal({
  open,
  action,
  loading = false,
  minDate,
  maxDate,
  onClose,
  onSubmit,
}: ContractActionDateModalProps) {
  const { t } = useTranslation();
  const [date, setDate] = useState<Dayjs | null>(dayjs());

  const dateLabel =
    action === "activate"
      ? t("rental.fields.confirmationDate")
      : t("rental.fields.terminationDate");

  return (
    <Modal
      open={open}
      title={
        action === "activate"
          ? t("rental.actions.activate")
          : t("rental.actions.cancel")
      }
      confirmLoading={loading}
      okText={t("common.confirm")}
      cancelText={t("common.cancel")}
      onCancel={onClose}
      onOk={() => onSubmit(date?.format("YYYY-MM-DD") ?? null)}
    >
      <Form layout="vertical">
        <Form.Item label={dateLabel}>
          <DatePicker
            className="w-full!"
            value={date}
            onChange={setDate}
            format="DD.MM.YYYY"
            minDate={minDate}
            maxDate={maxDate}
            allowClear
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
