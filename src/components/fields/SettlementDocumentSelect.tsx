import { useQuery } from "@tanstack/react-query";
import { Col, Form, Select } from "antd";
import { getIn, type FormikProps } from "formik";
import React from "react";
import { useTranslation } from "react-i18next";
import dayjs from "@/config/dayjs";
import { $axiosPrivate } from "@/services/AxiosService";
import { numberSpacing } from "@/utils/utils";

export interface OpenSettlementDocument {
  /** The cmn_document_registry id the payment names. */
  id: number;
  documentTypeId: number;
  documentTypeName: string;
  docNumber: string;
  docDate: string;
  /** What is still owed on it, in the payment's currency. */
  debt: number;
}

interface OpenSettlementDocuments {
  enabled: boolean;
  items: OpenSettlementDocument[];
}

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formik: FormikProps<any>;
  fieldName?: string;
  counterpartyId?: number | null;
  contractId?: number | null;
  /** 1: money in (a customer's debts), -1: money out (our debts to a supplier). */
  directionId?: number | null;
  currencyId?: number | null;
  date?: string | null;
  /** The payment being edited: its own settlement does not count against the debts. */
  excludeDocumentTypeId?: number;
  excludeDocumentId?: number | null;
  disabled?: boolean;
  /** Rendered in a grid column of this span (nothing at all while it is hidden). */
  colSpan?: number;
}

/**
 * The settlement document a payment settles (1C «Документ расчетов», «Погашение
 * задолженности: По документу»): one of the counterparty's documents with a debt still open.
 * Left empty, the payment settles the oldest debts first. Shown only when the organization
 * keeps its settlements by document.
 */
const SettlementDocumentSelect: React.FC<Props> = ({
  formik,
  fieldName = "relatedDocumentId",
  counterpartyId,
  contractId,
  directionId,
  currencyId,
  date,
  excludeDocumentTypeId,
  excludeDocumentId,
  disabled = false,
  colSpan,
}) => {
  const { t } = useTranslation();
  const value = getIn(formik.values, fieldName) as number | null | undefined;
  const ready = Boolean(counterpartyId) && (directionId === 1 || directionId === -1);

  const { data, isFetching } = useQuery({
    queryKey: [
      "settlement-documents-open",
      counterpartyId,
      contractId,
      directionId,
      currencyId,
      date,
      excludeDocumentTypeId,
      excludeDocumentId,
      value,
    ],
    queryFn: async () =>
      (
        await $axiosPrivate.get<OpenSettlementDocuments>("register/settlement-documents/open", {
          params: {
            CounterpartyId: counterpartyId,
            ContractId: contractId ?? undefined,
            DirectionId: directionId,
            CurrencyId: currencyId ?? undefined,
            Date: date ? dayjs(date).format("YYYY-MM-DD") : undefined,
            ExcludeDocumentTypeId: excludeDocumentId ? excludeDocumentTypeId : undefined,
            ExcludeDocumentId: excludeDocumentId ?? undefined,
            IncludeId: value ?? undefined,
          },
        })
      ).data,
    enabled: ready,
  });

  const options = React.useMemo(
    () =>
      (data?.items ?? []).map((item) => ({
        value: item.id,
        label: `${item.documentTypeName} №${item.docNumber} (${dayjs(item.docDate).format("DD.MM.YYYY")})`,
        debt: item.debt,
      })),
    [data],
  );

  if (!ready || !data?.enabled) return null;

  const field = (
    <Form.Item
      className="flex! flex-col! mb-4"
      label={t("settlementDocuments.field")}
      tooltip={t("settlementDocuments.hint")}
    >
      <Select
        value={value ?? undefined}
        onChange={(next: number | undefined) => formik.setFieldValue(fieldName, next ?? null, true)}
        allowClear
        showSearch
        loading={isFetching}
        disabled={disabled}
        optionFilterProp="label"
        // the debt beside each document is cut off in a list as narrow as the field
        popupMatchSelectWidth={false}
        placeholder={t("settlementDocuments.automatic")}
        notFoundContent={t("settlementDocuments.none")}
        options={options}
        optionRender={(option) => {
          const item = option.data as { label: string; debt: number };
          return (
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm">{item.label}</span>
              <span className="text-xs text-secondary-text">
                {t("settlementDocuments.debt")}: {numberSpacing(item.debt)}
              </span>
            </div>
          );
        }}
        style={{ width: "100%", height: 38, backgroundColor: "transparent" }}
      />
    </Form.Item>
  );

  return colSpan ? <Col span={colSpan}>{field}</Col> : field;
};

export default SettlementDocumentSelect;
