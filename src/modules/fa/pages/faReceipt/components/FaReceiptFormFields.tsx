import { useVatPayer } from "@/shared/hooks/useVatPayer";
import { contractTypeIds, takeMainOrOnlyContract } from "@/shared/constants/contractSelect";
import { useContractPriceIncludesVatDefault } from "@/shared/hooks/useContractDefaults";
import SwitchField from "@/components/fields/SwitchField";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Alert, Button, Col, Collapse, Row } from "antd";
import type { CollapseProps } from "antd";
import type { FormikProps } from "formik";
import { useTranslation } from "react-i18next";
import { Copy, Plus, Trash2 } from "lucide-react";
import InputNumber from "@/components/fields/InputNumber";
import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import CounterpartySelect from "@/components/fields/CounterpartySelect";
import SelectDate from "@/components/fields/SelectDate";
import DocumentAccountSelect from "@/components/fields/DocumentAccountSelect";
import Card from "@/components/ui/card/Card";
import { filterIds, selectListEndpoints } from "@/shared/constants/selectLists";
import { formatDateWithOutTime } from "@/utils/helpers";
import dayjs from "dayjs";
import { faDocumentAccountRoleCodes } from "../../../shared/constants/documentAccounts";
import { faAssetKinds, faKindLabel, faKindRole, type FaAssetKindId } from "../../../shared/constants/assetKinds";
import FaAssetKindSwitch from "../../../shared/components/FaAssetKindSwitch";
import useIntangibleSetup from "../../../shared/hooks/useIntangibleSetup";
import { $axiosPrivate } from "@/services/AxiosService";
import {
  documentAccountChartAccountsPath,
  normalizeDocumentAccountOptions,
} from "@/shared/documentAccounts/documentAccounts";
import type {
  FaReceiptAssetValues,
  FaReceiptFormValues,
  FaReceiptLineValues,
} from "../types/form";

const createEmptyAsset = (): FaReceiptAssetValues => ({
  inventoryNumber: "",
  name: "",
  initialCost: 0,
  faGroupId: null,
  okofId: null,
  assetAccountId: null,
});

const createEmptyLine = (): FaReceiptLineValues => ({
  name: "",
  quantity: 1,
  price: 0,
  vatRateId: null,
  capitalInvestmentAccountId: null,
  vatAccountId: null,
  assets: [createEmptyAsset()],
});

interface FaReceiptFormFieldsProps {
  formik: FormikProps<FaReceiptFormValues>;
  isDraft: boolean;
  documentTypeId?: number;
  /** The number of the inventory the document receives the surplus of. */
  inventoryNumber?: string | null;
}

export default function FaReceiptFormFields({
  formik,
  isDraft,
  documentTypeId,
  inventoryNumber,
}: FaReceiptFormFieldsProps) {
  const { t } = useTranslation();
  const vatPayer = useVatPayer(formik.values.docDate);
  const assetKindId = formik.values.assetKindId;
  // a surplus found at an inventory: no supplier and no VAT, credited to other income (9390)
  const isSurplus = Number(formik.values.receiptTypeId) === 4;
  const fromInventory = Boolean(formik.values.inventoryDocId);
  // the contract brings its «Narx QQS bilan» and settlement currency, as on a purchase (1C)
  useContractPriceIncludesVatDefault(formik, !isSurplus);
  const { data: vatRates = [] } = useQuery({
    queryKey: ["fa-receipt", "vat-rates"],
    queryFn: async () =>
      (await $axiosPrivate.get<{ id: number; name: string }[]>(selectListEndpoints.vatRatesSelectList)).data,
    staleTime: 5 * 60 * 1000,
  });
  /** The line's sum without VAT: what its assets' initial costs add up to. */
  const lineNetAmount = (price: number, quantity: number, vatRateId: number | null) => {
    const gross = (Number(price) || 0) * (Number(quantity) || 0);
    if (!formik.values.priceIncludesVat || !vatRateId) return gross;
    const name = vatRates.find((rate) => rate.id === Number(vatRateId))?.name ?? "";
    const percent = Number(name.match(/(\d+(?:[.,]\d+)?)/)?.[1]?.replace(",", ".") ?? 0);
    return Math.round((gross / (1 + percent / 100)) * 100) / 100;
  };
  // the intangible accounts and groups exist once the server has set them up
  const kindReady = useIntangibleSetup(assetKindId);
  const accountsEnabled = Boolean(documentTypeId) && kindReady;

  // 1C: an intangible asset's account follows its kind, the group 0420 takes the account 0420
  const matchAccountToGroup = async (lineIndex: number, assetIndex: number, groupId: unknown) => {
    if (assetKindId !== faAssetKinds.intangible || !groupId || !documentTypeId) return;
    try {
      const [groups, accounts] = await Promise.all([
        $axiosPrivate.get<{ id: number; code?: string }[]>(selectListEndpoints.faGroupsSelectList, {
          params: { assetKindId },
        }),
        $axiosPrivate.get<unknown>(documentAccountChartAccountsPath(documentTypeId), {
          params: { documentRoleCode: faKindRole(assetKindId, faDocumentAccountRoleCodes.fixedAsset) },
        }),
      ]);
      const code = groups.data.find((group) => group.id === Number(groupId))?.code;
      const account = normalizeDocumentAccountOptions(accounts.data).find(
        (option) => code && String(option.number) === code,
      );
      if (account)
        void formik.setFieldValue(`lines[${lineIndex}].assets[${assetIndex}].assetAccountId`, account.id);
    } catch {
      // the account stays as picked: the user chooses it
    }
  };

  // another kind takes other accounts and groups: the ones picked for the old kind go
  const handleKindChange = (kind: FaAssetKindId) => {
    void formik.setFieldValue("assetKindId", kind);
    void formik.setFieldValue(
      "lines",
      formik.values.lines.map((line) => ({
        ...line,
        capitalInvestmentAccountId: null,
        assets: line.assets.map((asset) => ({
          ...asset,
          faGroupId: null,
          okofId: null,
          assetAccountId: null,
        })),
      })),
    );
  };
  const [activeLineKeys, setActiveLineKeys] = useState<string[]>(["line-0"]);
  const [activeAssetKeys, setActiveAssetKeys] = useState<
    Record<number, string[]>
  >({ 0: ["asset-0"] });

  const handleAddLine = () => {
    const lineIndex = formik.values.lines.length;
    void formik.setFieldValue("lines", [
      ...formik.values.lines,
      createEmptyLine(),
    ]);
    setActiveLineKeys((keys) => [...keys, `line-${lineIndex}`]);
    setActiveAssetKeys((keys) => ({ ...keys, [lineIndex]: ["asset-0"] }));
  };

  const handleRemoveLine = (lineIndex: number) => {
    void formik.setFieldValue(
      "lines",
      formik.values.lines.filter((_, index) => index !== lineIndex),
    );
    setActiveLineKeys(["line-0"]);
    setActiveAssetKeys({ 0: ["asset-0"] });
  };

  const handleQuantityChange = (lineIndex: number, value: number | null) => {
    const quantity = Math.max(1, Math.trunc(Number(value || 1)));
    const currentAssets = formik.values.lines[lineIndex].assets;
    const assets = Array.from(
      { length: quantity },
      (_, index) => currentAssets[index] ?? createEmptyAsset(),
    );
    void formik.setFieldValue(`lines[${lineIndex}].quantity`, quantity, false);
    void formik.setFieldValue(`lines[${lineIndex}].assets`, assets, true);
  };

  const handleAddAsset = (lineIndex: number) => {
    const assets = [
      ...formik.values.lines[lineIndex].assets,
      createEmptyAsset(),
    ];
    void formik.setFieldValue(`lines[${lineIndex}].assets`, assets);
    void formik.setFieldValue(`lines[${lineIndex}].quantity`, assets.length);
    setActiveAssetKeys((keys) => ({
      ...keys,
      [lineIndex]: [
        ...(keys[lineIndex] ?? ["asset-0"]),
        `asset-${assets.length - 1}`,
      ],
    }));
  };

  const handleRemoveAsset = (lineIndex: number, assetIndex: number) => {
    const assets = formik.values.lines[lineIndex].assets.filter(
      (_, index) => index !== assetIndex,
    );
    void formik.setFieldValue(`lines[${lineIndex}].assets`, assets);
    void formik.setFieldValue(`lines[${lineIndex}].quantity`, assets.length);
    setActiveAssetKeys((keys) => ({ ...keys, [lineIndex]: ["asset-0"] }));
  };

  const handleApplyCommonAssetData = (lineIndex: number) => {
    const [sourceAsset, ...otherAssets] = formik.values.lines[lineIndex].assets;
    if (!sourceAsset || !otherAssets.length) return;
    const commonValues = {
      faGroupId: sourceAsset.faGroupId,
      okofId: sourceAsset.okofId,
      assetAccountId: sourceAsset.assetAccountId,
    };
    void formik.setFieldValue(`lines[${lineIndex}].assets`, [
      sourceAsset,
      ...otherAssets.map((asset) => ({ ...asset, ...commonValues })),
    ]);
  };

  const renderAssetFields = (lineIndex: number, assetIndex: number) => (
    <div>
      <div className="mb-4 text-sm font-semibold text-foreground">
        {t("fa.sections.assetInformation")}
      </div>
      <Row gutter={[12, 0]}>
        <Col span={6}>
          <InputText
            formik={formik}
            fieldName={`lines[${lineIndex}].assets[${assetIndex}].inventoryNumber`}
            label="fa.fields.inventoryNumber"
            required
          />
        </Col>
        <Col span={6}>
          <InputText
            formik={formik}
            fieldName={`lines[${lineIndex}].assets[${assetIndex}].name`}
            label="fa.fields.name"
            required
          />
        </Col>
        <Col span={6}>
          <InputNumber
            formik={formik}
            fieldName={`lines[${lineIndex}].assets[${assetIndex}].initialCost`}
            label="fa.fields.initialCost"
            min={0}
            required
          />
        </Col>
        <Col span={6}>
          <SelectCustom
            path={selectListEndpoints.faGroupsSelectList}
            queryParams={{ assetKindId }}
            enabled={kindReady}
            onChange={(value) => void matchAccountToGroup(lineIndex, assetIndex, value)}
            formik={formik}
            fieldName={`lines[${lineIndex}].assets[${assetIndex}].faGroupId`}
            label={faKindLabel(assetKindId, "fa.fields.faGroupId")}
            required
          />
        </Col>
        {assetKindId !== faAssetKinds.intangible && (
          <Col span={6}>
            <SelectCustom
              path={selectListEndpoints.okofsSelectList}
              formik={formik}
              fieldName={`lines[${lineIndex}].assets[${assetIndex}].okofId`}
              label="fa.fields.okofId"
              search
              required
            />
          </Col>
        )}
        <Col span={6}>
          <DocumentAccountSelect
            documentTypeId={documentTypeId ?? 0}
            documentRoleCode={faKindRole(assetKindId, faDocumentAccountRoleCodes.fixedAsset)}
            formik={formik}
            fieldName={`lines[${lineIndex}].assets[${assetIndex}].assetAccountId`}
            label={faKindLabel(assetKindId, "fa.fields.assetAccount")}
            search
            required
            enabled={accountsEnabled}
          />
        </Col>
      </Row>
    </div>
  );

  const lineItems: CollapseProps["items"] = formik.values.lines.map(
    (line, lineIndex) => {
      const assetItems: CollapseProps["items"] = line.assets.map(
        (asset, assetIndex) => ({
          key: `asset-${assetIndex}`,
          label: (
            <div className="flex min-w-0 items-center gap-3">
              <span className="shrink-0 font-semibold">
                {t(faKindLabel(assetKindId, "fa.sections.assetNumber"), { number: assetIndex + 1 })}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {asset.name}
              </span>
            </div>
          ),
          extra:
            isDraft && line.assets.length > 1 ? (
              <Button
                type="text"
                danger
                size="small"
                icon={<Trash2 className="size-4" />}
                onClick={(event) => {
                  event.stopPropagation();
                  handleRemoveAsset(lineIndex, assetIndex);
                }}
              />
            ) : null,
          children: renderAssetFields(lineIndex, assetIndex),
        }),
      );

      return {
        key: `line-${lineIndex}`,
        label: (
          <div className="flex min-w-0 flex-1 items-center justify-between gap-4 pr-2">
            <span className="shrink-0 font-semibold">
              {t("fa.sections.lineNumber", { number: lineIndex + 1 })}
            </span>
            <div className="hidden min-w-0 flex-1 grid-cols-5 gap-5 text-xs text-muted-foreground lg:grid">
              <span className="truncate">{line.name}</span>
            </div>
          </div>
        ),
        extra:
          isDraft && formik.values.lines.length > 1 ? (
            <Button
              type="text"
              danger
              size="small"
              icon={<Trash2 className="size-4" />}
              onClick={(event) => {
                event.stopPropagation();
                handleRemoveLine(lineIndex);
              }}
            />
          ) : null,
        children: (
          <div className="space-y-2">
            <Row gutter={[16, 0]}>
              <Col span={6}>
                <InputText
                  formik={formik}
                  fieldName={`lines[${lineIndex}].name`}
                  label="fa.fields.name"
                  required
                />
              </Col>
              <Col span={6}>
                <InputNumber
                  value={line.quantity}
                  onValueChange={(value) =>
                    handleQuantityChange(lineIndex, value)
                  }
                  label="fa.fields.quantity"
                  min={1}
                  precision={0}
                  required
                />
              </Col>
              <Col span={6}>
                <InputNumber
                  formik={formik}
                  fieldName={`lines[${lineIndex}].price`}
                  label="fa.fields.price"
                  min={0}
                  required
                />
              </Col>
              {!isSurplus && (
              <Col span={6}>
                <SelectCustom
                  path={selectListEndpoints.vatRatesSelectList}
                  formik={formik}
                  fieldName={`lines[${lineIndex}].vatRateId`}
                  label={
                    vatPayer.isVatPayer
                      ? "fa.fields.vatRateId"
                      : "fa.fields.vatRateIntoCost"
                  }
                  clearable
                />
              </Col>
              )}
              <Col span={6}>
                <DocumentAccountSelect
                  documentTypeId={documentTypeId ?? 0}
                  documentRoleCode={faKindRole(
                    assetKindId,
                    faDocumentAccountRoleCodes.capitalInvestment,
                  )}
                  formik={formik}
                  fieldName={`lines[${lineIndex}].capitalInvestmentAccountId`}
                  label="fa.fields.capitalInvestmentAccount"
                  search
                  required
                  enabled={accountsEnabled}
                />
              </Col>
              {vatPayer.isVatPayer && !isSurplus && (
                <Col span={6}>
                  <DocumentAccountSelect
                    documentTypeId={documentTypeId ?? 0}
                    documentRoleCode={faDocumentAccountRoleCodes.inputVat}
                    formik={formik}
                    fieldName={`lines[${lineIndex}].vatAccountId`}
                    label="fa.fields.vatAccount"
                    search
                    required={Boolean(line.vatRateId)}
                    clearable
                    enabled={Boolean(documentTypeId)}
                  />
                </Col>
              )}
            </Row>

            {!isSurplus && formik.values.priceIncludesVat && line.vatRateId ? (
              <div className="mb-3 text-sm text-secondary-text">
                {t("fa.messages.lineNetAmount", {
                  amount: lineNetAmount(line.price, line.quantity, line.vatRateId).toLocaleString("ru-RU"),
                })}
              </div>
            ) : null}
            <div className="rounded-lg border border-border bg-background/40">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
                <div className="font-semibold">
                  {t(faKindLabel(assetKindId, "fa.entities.assets"))}: {line.assets.length}
                </div>
                {isDraft && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      icon={<Plus className="size-4" />}
                      onClick={() => handleAddAsset(lineIndex)}
                    >
                      {t("fa.actions.addAsset")}
                    </Button>
                    <Button
                      icon={<Copy className="size-4" />}
                      disabled={line.assets.length < 2}
                      onClick={() => handleApplyCommonAssetData(lineIndex)}
                    >
                      {t("fa.actions.applyCommonData")}
                    </Button>
                  </div>
                )}
              </div>
              <Collapse
                ghost
                activeKey={activeAssetKeys[lineIndex] ?? ["asset-0"]}
                onChange={(keys) =>
                  setActiveAssetKeys((current) => ({
                    ...current,
                    [lineIndex]: Array.isArray(keys) ? keys : [keys],
                  }))
                }
                items={assetItems}
              />
            </div>
          </div>
        ),
      };
    },
  );

  return (
    <div className="space-y-2">
      <Card className="p-3">
        <div className="mb-3">
          <FaAssetKindSwitch
            value={assetKindId}
            onChange={handleKindChange}
            disabled={!isDraft || fromInventory}
          />
        </div>
        {fromInventory && (
          <Alert
            className="mb-3"
            showIcon
            type="info"
            message={t("fa.inventory.basedOn", { id: inventoryNumber ?? formik.values.inventoryDocId })}
            description={t("fa.inventory.surplusHint")}
          />
        )}
        <Row gutter={[16, 0]}>
          <Col span={4}>
            <SelectDate
              formik={formik}
              fieldName="docDate"
              label="fa.fields.docDate"
              required
            />
          </Col>
          {!isSurplus && (
          <Col span={5}>
            <CounterpartySelect
              kind="supplier"
              formik={formik}
              fieldName="counterpartyId"
              label="fa.fields.counterpartyId"
              required
              onChange={() => {
                // a contract belongs to its counterparty
                if (formik.values.contractId != null) void formik.setFieldValue("contractId", null, false);
              }}
            />
          </Col>
          )}
          {!isSurplus && (
          <Col span={5}>
            <SelectCustom
              path={selectListEndpoints.contractsSelectList}
              queryParams={{
                choosedDate: dayjs(formik.values.docDate).format(formatDateWithOutTime),
                [filterIds.counterparty]: formik.values.counterpartyId,
                // an asset is bought under a contract with a supplier (1C «Вид договора»)
                [filterIds.contractType]: contractTypeIds.supplier,
              }}
              enabled={Boolean(formik.values.counterpartyId)}
              disabled={!formik.values.counterpartyId}
              label="fa.fields.contractId"
              fieldName="contractId"
              formik={formik}
              getFirstWhen={takeMainOrOnlyContract}
              required
            />
          </Col>
          )}
          <Col span={5}>
            <SelectCustom
              path={selectListEndpoints.faReceiptTypesSelectList}
              formik={formik}
              fieldName="receiptTypeId"
              label="fa.fields.receiptType"
              required
              disabled={fromInventory}
              onChange={(value) => {
                // the credit account follows the type: the supplier's 6010 or other income 9390
                const surplusNow = Number(value) === 4;
                if (surplusNow !== isSurplus) {
                  void formik.setFieldValue("supplierAccountId", null);
                  if (surplusNow) {
                    void formik.setFieldValue("counterpartyId", null);
                    void formik.setFieldValue("contractId", null);
                  }
                }
              }}
            />
          </Col>
          <Col span={4}>
            <SelectCustom
              path={selectListEndpoints.currenciesSelectList}
              formik={formik}
              fieldName="currencyId"
              label="fa.fields.currencyId"
              required
            />
          </Col>
          <Col span={6} key={isSurplus ? "surplus" : "supplier"}>
            <DocumentAccountSelect
              documentTypeId={documentTypeId ?? 0}
              documentRoleCode={
                isSurplus
                  ? faDocumentAccountRoleCodes.inventorySurplus
                  : faDocumentAccountRoleCodes.supplierSettlement
              }
              formik={formik}
              fieldName="supplierAccountId"
              label={isSurplus ? "fa.fields.surplusAccount" : "fa.fields.supplierAccount"}
              search
              required
              enabled={Boolean(documentTypeId)}
            />
          </Col>
          {!isSurplus && (
            <Col span={6}>
              <SwitchField
                formik={formik}
                fieldName="priceIncludesVat"
                label="purchase.fields.priceIncludesVat"
                description={
                  formik.values.priceIncludesVat
                    ? "purchase.messages.priceIncludesVatOn"
                    : "purchase.messages.priceIncludesVatOff"
                }
                marginBottom="mb-4"
              />
            </Col>
          )}
        </Row>
      </Card>

      <Card className="border border-border p-3 sm:p-5">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-base font-semibold">
              {t("fa.sections.documentLines")}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {t("fa.sections.documentLinesDescription")}
            </div>
          </div>
          {isDraft && (
            <Button
              type="primary"
              ghost
              icon={<Plus className="size-4" />}
              onClick={handleAddLine}
            >
              {t("fa.actions.addLine")}
            </Button>
          )}
        </div>

        <Collapse
          activeKey={activeLineKeys}
          onChange={(keys) =>
            setActiveLineKeys(Array.isArray(keys) ? keys : [keys])
          }
          items={lineItems}
          className="bg-transparent"
        />

        {typeof formik.errors.lines === "string" && (
          <div className="mt-3 text-sm text-red-500">{formik.errors.lines}</div>
        )}
      </Card>
    </div>
  );
}
