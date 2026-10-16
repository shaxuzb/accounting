import { useQuery } from "@tanstack/react-query";
import { Col, Form, Select } from "antd";
import { getIn, type FormikProps } from "formik";
import React from "react";
import { useTranslation } from "react-i18next";
import dayjs from "@/config/dayjs";
import { $axiosPrivate } from "@/services/AxiosService";
import { numberSpacing } from "@/utils/utils";

export interface OpenSettlementDocument {
  /** The cmn_document_registry id the document names. */
  id: number;
  documentTypeId: number;
  documentTypeName: string;
  docNumber: string;
  docDate: string;
  /** What is still open on it (a debt, or an advance), in the document's currency. */
  debt: number;
}

interface OpenSettlementDocuments {
  enabled: boolean;
  items: OpenSettlementDocument[];
}

/** DebtSettlementModeConst / AdvanceOffsetModeConst: the same three ways. */
const settlementModes = {
  automatic: 1,
  byDocument: 2,
  none: 3,
} as const;

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formik: FormikProps<any>;
  /**
   * debt: how a payment settles the debt (1C «Погашение задолженности»);
   * advance: how a sale or purchase offsets the advances (1C «Способ зачета аванса»).
   */
  kind?: "debt" | "advance";
  modeFieldName?: string;
  fieldName?: string;
  counterpartyId?: number | null;
  contractId?: number | null;
  /** 1: a customer (money in, a sale), -1: a supplier (money out, a purchase). */
  directionId?: number | null;
  currencyId?: number | null;
  date?: string | null;
  /** The document being edited: its own entries do not count. */
  excludeDocumentTypeId?: number;
  excludeDocumentId?: number | null;
  disabled?: boolean;
  /** Each field is rendered in a grid column of this span. */
  colSpan?: number;
}

/**
 * How the document settles with the counterparty, as 1C asks on it: automatically (the
 * oldest first), by the document chosen, or not at all. A payment names the debt it settles
 * (1C «Документ расчетов»), a sale or purchase the advance it offsets (1C «Документ аванса»);
 * choosing a document needs settlements kept by document.
 */
const SettlementDocumentSelect: React.FC<Props> = ({
  formik,
  kind = "debt",
  modeFieldName,
  fieldName,
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
  const isAdvance = kind === "advance";
  const modeField = modeFieldName ?? (isAdvance ? "advanceOffsetMode" : "debtSettlementMode");
  const documentField = fieldName ?? (isAdvance ? "advanceDocumentId" : "relatedDocumentId");
  const mode = Number(getIn(formik.values, modeField)) || settlementModes.automatic;
  const value = getIn(formik.values, documentField) as number | null | undefined;
  const ready = Boolean(counterpartyId) && (directionId === 1 || directionId === -1);

  const { data, isFetching } = useQuery({
    queryKey: [
      "settlement-documents-open",
      kind,
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
            Advances: isAdvance || undefined,
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

  if (!ready) return null;

  const prefix = isAdvance ? "settlementDocuments.advance" : "settlementDocuments.debt";
  const byDocumentAvailable = Boolean(data?.enabled) || mode === settlementModes.byDocument;
  const modeOptions = [
    { value: settlementModes.automatic, label: t(`${prefix}Modes.automatic`) },
    ...(byDocumentAvailable
      ? [{ value: settlementModes.byDocument, label: t(`${prefix}Modes.byDocument`) }]
      : []),
    { value: settlementModes.none, label: t(`${prefix}Modes.none`) },
  ];
  const documentError =
    getIn(formik.touched, documentField) && getIn(formik.errors, documentField);

  const wrap = (node: React.ReactNode) => (colSpan ? <Col span={colSpan}>{node}</Col> : node);

  return (
    <>
      {wrap(
        <Form.Item
          className="flex! flex-col! mb-4"
          label={t(`${prefix}Mode`)}
          tooltip={t(`${prefix}ModeHint`)}
        >
          <Select
            value={mode}
            disabled={disabled}
            options={modeOptions}
            popupMatchSelectWidth={false}
            onChange={(next: number) => {
              formik.setFieldValue(modeField, next, true);
              // the document belongs to «by document» alone
              if (next !== settlementModes.byDocument) formik.setFieldValue(documentField, null, true);
            }}
            style={{ width: "100%", height: 38, backgroundColor: "transparent" }}
          />
        </Form.Item>,
      )}
      {mode === settlementModes.byDocument &&
        wrap(
          <Form.Item
            className="flex! flex-col! mb-4"
            label={
              <span>
                {t(isAdvance ? "settlementDocuments.advanceField" : "settlementDocuments.field")}{" "}
                <span className="text-red-500">*</span>
              </span>
            }
            tooltip={t(isAdvance ? "settlementDocuments.advanceHint" : "settlementDocuments.hint")}
            validateStatus={documentError ? "error" : ""}
            help={documentError ? String(documentError) : undefined}
          >
            <Select
              value={value ?? undefined}
              onChange={(next: number | undefined) => formik.setFieldValue(documentField, next ?? null, true)}
              allowClear
              showSearch
              loading={isFetching}
              disabled={disabled}
              optionFilterProp="label"
              // the amount beside each document is cut off in a list as narrow as the field
              popupMatchSelectWidth={false}
              placeholder={t("settlementDocuments.choose")}
              notFoundContent={t(isAdvance ? "settlementDocuments.noAdvance" : "settlementDocuments.none")}
              options={options}
              optionRender={(option) => {
                const item = option.data as { label: string; debt: number };
                return (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm">{item.label}</span>
                    <span className="text-xs text-secondary-text">
                      {t(isAdvance ? "settlementDocuments.advanceAmount" : "settlementDocuments.debt")}:{" "}
                      {numberSpacing(item.debt)}
                    </span>
                  </div>
                );
              }}
              style={{ width: "100%", height: 38, backgroundColor: "transparent" }}
            />
          </Form.Item>,
        )}
    </>
  );
};

export default SettlementDocumentSelect;
