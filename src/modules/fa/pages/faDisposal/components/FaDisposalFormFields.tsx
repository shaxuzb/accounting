import { useCallback, useMemo } from "react";
import { Alert, Button, Col, Row, Table } from "antd";
import type { TableColumnsType } from "antd";
import type { FormikProps } from "formik";
import { Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import InputNumber from "@/components/fields/InputNumber";
import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import CounterpartySelect from "@/components/fields/CounterpartySelect";
import ContractSelect from "@/components/fields/ContractSelect";
import SelectDate from "@/components/fields/SelectDate";
import DocumentAccountSelect from "@/components/fields/DocumentAccountSelect";
import Card from "@/components/ui/card/Card";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { useVatPayer } from "@/shared/hooks/useVatPayer";
import { numberSpacing } from "@/utils/utils";
import { faDocumentAccountRoleCodes } from "../../../shared/constants/documentAccounts";
import { faKindLabel, faKindRole, type FaAssetKindId } from "../../../shared/constants/assetKinds";
import FaAssetKindSwitch from "../../../shared/components/FaAssetKindSwitch";
import useIntangibleSetup from "../../../shared/hooks/useIntangibleSetup";
import { faDisposalTypeIds } from "../constants/disposalTypes";
import type {
  FaDisposalFormValues,
  FaDisposalLineValues,
} from "../types/form";
import { faDisposalAssetDisplayConfig } from "./useFaDisposalLookups";

const emptyLine: FaDisposalLineValues = {
  faAssetId: null,
  saleAmount: 0,
  vatRateId: null,
  note: "",
};

interface DisposalLineRow extends FaDisposalLineValues {
  key: number;
  index: number;
}

interface FaDisposalFormFieldsProps {
  formik: FormikProps<FaDisposalFormValues>;
  isDraft: boolean;
  documentTypeId?: number;
  /** The number of the inventory the document books the shortage of. */
  inventoryNumber?: string | null;
}

export default function FaDisposalFormFields({
  formik,
  isDraft,
  documentTypeId,
  inventoryNumber,
}: FaDisposalFormFieldsProps) {
  const { t } = useTranslation();
  const vatPayer = useVatPayer(formik.values.disposalDate);
  // 1C «Продажа ОС»: a sale has a buyer and a price (with output VAT for a payer);
  // a write-off has neither
  const isSale = Number(formik.values.disposalTypeId) === faDisposalTypeIds.sale;
  const isShortage = Number(formik.values.disposalTypeId) === faDisposalTypeIds.shortage;
  // a gratuitous transfer (NSBU 5, 53): a recipient, and output VAT on the value only where a rate is named
  const isGratuitous = Number(formik.values.disposalTypeId) === faDisposalTypeIds.gratuitous;
  const valued = isSale || isGratuitous;
  const fromInventory = Boolean(formik.values.inventoryDocId);
  const chargesVat = valued && vatPayer.isVatPayer;
  const counterpartyId = formik.values.counterpartyId;
  const assetKindId = formik.values.assetKindId;
  const kindReady = useIntangibleSetup(assetKindId);
  const accountsEnabled = Boolean(documentTypeId) && kindReady;
  // another kind takes other assets and accounts
  const handleKindChange = (kind: FaAssetKindId) => {
    void formik.setFieldValue("assetKindId", kind);
    void formik.setFieldValue("disposalAccountId", null);
    void formik.setFieldValue("gainAccountId", null);
    void formik.setFieldValue(
      "lines",
      formik.values.lines.map((line) => ({ ...line, faAssetId: null })),
    );
  };

  const handleAddLine = useCallback(() => {
    void formik.setFieldValue("lines", [
      ...formik.values.lines,
      { ...emptyLine },
    ]);
  }, [formik]);

  const handleRemoveLine = useCallback(
    (index: number) => {
      void formik.setFieldValue(
        "lines",
        formik.values.lines.filter((_, lineIndex) => lineIndex !== index),
      );
    },
    [formik],
  );

  const rows = useMemo<DisposalLineRow[]>(
    () =>
      formik.values.lines.map((line, index) => ({
        ...line,
        key: index,
        index,
      })),
    [formik.values.lines],
  );

  const totalSaleAmount = useMemo(
    () =>
      formik.values.lines.reduce(
        (total, line) => total + Number(line.saleAmount || 0),
        0,
      ),
    [formik.values.lines],
  );

  const columns = useMemo<TableColumnsType<DisposalLineRow>>(
    () => [
      {
        title: t("common.rowNumber"),
        dataIndex: "index",
        align: "center",
        render: (index: number) => index + 1,
      },
      {
        title: t(faKindLabel(assetKindId, "fa.fields.faAssetId")),
        dataIndex: "faAssetId",
        minWidth: 300,
        render: (_, row) => (
          <div className="[&_.ant-form-item]:mb-0!">
            <SelectCustom
              path={selectListEndpoints.faAssetsSelectList}
              queryParams={{ statusId: 2, assetKindId }}
              displayConfig={faDisposalAssetDisplayConfig}
              formik={formik}
              fieldName={`lines[${row.index}].faAssetId`}
              search
              required
              marginBottom="mb-0"
            />
          </div>
        ),
      },
      ...(valued
        ? [
            {
              title: t(
                isGratuitous
                  ? "fa.fields.gratuitousValue"
                  : chargesVat
                    ? "fa.fields.saleAmountWithVat"
                    : "fa.fields.saleAmount",
              ),
              dataIndex: "saleAmount",
              minWidth: 170,
              render: (_: unknown, row: DisposalLineRow) => (
                <div className="[&_.ant-form-item]:mb-0!">
                  <InputNumber
                    formik={formik}
                    fieldName={`lines[${row.index}].saleAmount`}
                    min={0}
                    emptyZero
                    required={isSale}
                  />
                </div>
              ),
            },
          ]
        : []),
      ...(chargesVat
        ? [
            {
              title: t("fa.fields.vatRateId"),
              dataIndex: "vatRateId",
              minWidth: 150,
              render: (_: unknown, row: DisposalLineRow) => (
                <div className="[&_.ant-form-item]:mb-0!">
                  <SelectCustom
                    path={selectListEndpoints.vatRatesSelectList}
                    formik={formik}
                    fieldName={`lines[${row.index}].vatRateId`}
                    // the standard rate, as a sale of goods starts from; a gratuitous transfer names one itself
                    autoSelectValue={isSale ? "vat_12" : undefined}
                    autoSelectKeys={["code"]}
                    clearable={isGratuitous}
                    marginBottom="mb-0"
                  />
                </div>
              ),
            },
          ]
        : []),
      ...(!isShortage
        ? [
            {
              title: t("fa.fields.partPercent"),
              dataIndex: "partPercent",
              minWidth: 130,
              render: (_: unknown, row: DisposalLineRow) => (
                <div className="[&_.ant-form-item]:mb-0!">
                  <InputNumber
                    formik={formik}
                    fieldName={`lines[${row.index}].partPercent`}
                    min={0}
                    max={99.9999}
                    precision={4}
                    placeholder={t("fa.fields.partPercentWhole")}
                  />
                </div>
              ),
            },
          ]
        : []),
      {
        title: t("fa.fields.note"),
        dataIndex: "note",
        minWidth: 220,
        render: (_, row) => (
          <div className="[&_.ant-form-item]:mb-0!">
            <InputText formik={formik} fieldName={`lines[${row.index}].note`} />
          </div>
        ),
      },
      {
        dataIndex: "actions",
        align: "center",
        width: 64,
        render: (_, row) =>
          isDraft && formik.values.lines.length > 1 ? (
            <Button
              type="text"
              danger
              icon={<Trash2 className="size-4" />}
              aria-label={t("common.delete")}
              onClick={() => handleRemoveLine(row.index)}
            />
          ) : null,
      },
    ],
    [assetKindId, chargesVat, formik, handleRemoveLine, isDraft, isGratuitous, isShortage, isSale, t, valued],
  );

  return (
    <div className="min-w-0 space-y-2">
      <Card className="p-3">
        <div className="mb-3">
          <FaAssetKindSwitch value={assetKindId} onChange={handleKindChange} disabled={!isDraft || fromInventory} />
        </div>
        {fromInventory && (
          <Alert
            className="mb-3"
            showIcon
            type="info"
            message={t("fa.inventory.basedOn", { id: inventoryNumber ?? formik.values.inventoryDocId })}
            description={t("fa.inventory.shortageHint")}
          />
        )}
        <Row gutter={[16, 0]}>
          <Col span={6}>
            <SelectDate
              formik={formik}
              fieldName="disposalDate"
              label="fa.fields.disposalDate"
              required
            />
          </Col>
          <Col span={6}>
            <SelectCustom
              path={selectListEndpoints.faDisposalTypesSelectList}
              formik={formik}
              fieldName="disposalTypeId"
              label="fa.fields.disposalType"
              required
              disabled={fromInventory}
              onChange={(value) => {
                // a shortage goes to 5910, any other loss to 9430: the account is taken again
                const shortageNow = Number(value) === faDisposalTypeIds.shortage;
                if (shortageNow !== isShortage) void formik.setFieldValue("lossAccountId", null);
              }}
            />
          </Col>
          <Col span={6}>
            <InputText
              formik={formik}
              fieldName="reason"
              label="fa.fields.reason"
              required
            />
          </Col>

          {valued && (
            <>
              <Col span={6}>
                <CounterpartySelect
                  kind="client"
                  formik={formik}
                  fieldName="counterpartyId"
                  label={isGratuitous ? "fa.fields.recipient" : "fa.fields.buyer"}
                  required={isSale}
                  autoSelectSingle={false}
                  onChange={(value) => {
                    if (Number(value) !== Number(formik.values.counterpartyId))
                      void formik.setFieldValue("contractId", null, false);
                  }}
                />
              </Col>
              <Col span={6}>
                <ContractSelect
                  formik={formik}
                  fieldName="contractId"
                  label="fa.fields.contract"
                  counterpartyId={counterpartyId}
                  date={formik.values.disposalDate}
                  contractTypeId={2}
                  clearable
                />
              </Col>
            </>
          )}

          {(
            [
              ["disposalAccountId", "fa.fields.disposalAccount", faDocumentAccountRoleCodes.disposal, true],
              ["customerAccountId", "fa.fields.customerAccount", faDocumentAccountRoleCodes.customerSettlement, isSale],
              ["vatAccountId", "fa.fields.vatAccount", faDocumentAccountRoleCodes.saleVat, chargesVat],
              ["gainAccountId", "fa.fields.gainAccount", faDocumentAccountRoleCodes.disposalGain, isSale],
              isShortage
                ? (["lossAccountId", "fa.fields.shortageAccount", faDocumentAccountRoleCodes.inventoryShortage, true] as const)
                : (["lossAccountId", "fa.fields.lossAccount", faDocumentAccountRoleCodes.disposalLoss, true] as const),
            ] as const
          )
            .filter(([, , , shown]) => shown)
            .map(([fieldName, label, roleCode]) => (
            <Col key={`${fieldName}-${roleCode}`} span={6}>
              <DocumentAccountSelect
                documentTypeId={documentTypeId ?? 0}
                documentRoleCode={faKindRole(assetKindId, roleCode)}
                formik={formik}
                fieldName={fieldName}
                label={label}
                search
                required
                enabled={accountsEnabled}
              />
            </Col>
          ))}
        </Row>
      </Card>

      <Card className="min-w-0 overflow-hidden border border-border">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
          <div>
            <div className="text-base font-semibold text-heading">
              {t("fa.disposal.assetsToDispose")}
            </div>
            <div className="mt-1 text-sm text-secondary-text">
              {t("fa.disposal.assetsDescription")}
            </div>
          </div>
          {isDraft && (
            <Button
              type="primary"
              ghost
              icon={<Plus className="size-4" />}
              onClick={handleAddLine}
            >
              {t("fa.actions.addAsset")}
            </Button>
          )}
        </div>

        <Table<DisposalLineRow>
          columns={columns}
          dataSource={rows}
          pagination={false}
          size="middle"
          scroll={{ x: "max-content" }}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm sm:px-5">
          <span className="text-secondary-text">
            {t("fa.disposal.selectedAssets", {
              count: formik.values.lines.length,
            })}
          </span>
          {isSale && (
            <span className="font-semibold tabular-nums text-text">
              {t("fa.sections.totalSaleAmount")}: {numberSpacing(totalSaleAmount)}
            </span>
          )}
        </div>

        {typeof formik.errors.lines === "string" && (
          <div className="border-t border-border px-4 py-3 text-sm text-red-500">
            {formik.errors.lines}
          </div>
        )}
      </Card>
    </div>
  );
}
