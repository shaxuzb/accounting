import { Descriptions, Modal, Spin } from "antd";
import { useTranslation } from "react-i18next";
import { formatDate } from "@/utils/utils";
import { stateStatus } from "@/utils/helpers/statusHelper";
import { useGetDetailContract } from "../hooks/useGetDetailContract";

interface ContractDetailModalProps {
  id: number | null;
  contractTypeId: number;
  onClose: () => void;
}

export default function ContractDetailModal({
  id,
  contractTypeId,
  onClose,
}: ContractDetailModalProps) {
  const { t } = useTranslation();
  const { data, isLoading, isFetching } = useGetDetailContract(id ?? "");
  const isSaleContract = (data?.contractTypeId ?? contractTypeId) === 2;

  return (
    <Modal maskClosable={false}
      title={`${t("contract.title")}${data?.contractNumber ? `: ${data.contractNumber}` : ""}`}
      open={Boolean(id)}
      onCancel={onClose}
      footer={null}
      centered
      width={1200}
      destroyOnHidden
    >
      <Spin spinning={isLoading || isFetching}>
        <Descriptions
          bordered
          size="small"
          column={2}
          items={[
            {
              key: "organization",
              label: t("settings.fields.organization"),
              children: data?.organizationName || "-",
            },
            {
              key: "counterparty",
              label: t(
                isSaleContract
                  ? "contract.fields.customerName"
                  : "contract.fields.supplierName",
              ),
              children: data?.counterpartyName || "-",
            },
            {
              key: "contractType",
              label: t("contract.fields.contractType"),
              children: data?.contractTypeName || data?.contractType || "-",
            },
            {
              key: "responsiblePerson",
              label: t("contract.fields.responsiblePerson"),
              children: data?.responsiblePersonName || "-",
            },
            {
              key: "contractDate",
              label: t("contract.fields.contractDate"),
              children: formatDate(data?.contractDate),
            },
            {
              key: "startDate",
              label: t("contract.fields.startDate"),
              children: formatDate(data?.startDate),
            },
            {
              key: "endDate",
              label: t("contract.fields.endDate"),
              children: formatDate(data?.endDate),
            },
            {
              key: "state",
              label: t("contract.fields.stateName"),
              children: data ? stateStatus(data.stateId, data.stateName) : "-",
            },
            {
              key: "comment",
              label: t("contract.fields.comment"),
              children: data?.comment || "-",
              span: 2,
            },
          ]}
        />
      </Spin>
    </Modal>
  );
}
