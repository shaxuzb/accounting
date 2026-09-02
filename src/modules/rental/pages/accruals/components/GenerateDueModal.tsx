import { DatePicker, Form, Modal } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface GenerateDueModalProps {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (asOfDate: string | null) => void;
}

export default function GenerateDueModal({ open, loading, onClose, onSubmit }: GenerateDueModalProps) {
  const { t } = useTranslation();
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  return (
    <Modal open={open} title={t("rental.accruals.generateTitle")} onCancel={onClose} confirmLoading={loading} okText={t("rental.actions.generate")} cancelText={t("common.cancel")} onOk={() => onSubmit(date?.format("YYYY-MM-DDT00:00:00") ?? null)}>
      <Form layout="vertical">
        <Form.Item label={t("rental.fields.asOfDate")}>
          <DatePicker className="w-full!" value={date} onChange={setDate} format="DD.MM.YYYY" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
