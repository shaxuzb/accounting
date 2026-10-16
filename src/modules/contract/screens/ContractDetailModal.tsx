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
            ...(data && data.contractTypeId !== 3
              ? [
                  {
                    key: "isDefault",
                    label: t("contract.fields.isDefault"),
                    children: t(data.isDefault ? "app.common.yes" : "app.common.no"),
                  },
                  {
                    key: "paymentTermDays",
                    label: t("contract.fields.paymentTermDays"),
                    children:
                      data.paymentTermDays != null
                        ? data.paymentTermDays
                        : t("contract.messages.paymentTermPlaceholder"),
                  },
                ]
              : []),
            ...(data && !isSaleContract
              ? [
                  {
                    key: "priceIncludesVat",
                    label: t("contract.fields.priceIncludesVat"),
                    children: t(
                      data.priceIncludesVat ? "app.common.yes" : "app.common.no",
                    ),
                    span: 2,
                  },
                ]
              : []),
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
