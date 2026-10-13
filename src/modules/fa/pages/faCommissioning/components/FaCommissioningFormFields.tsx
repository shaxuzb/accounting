import { useEffect, useRef, useState } from "react";
import { Button, Col, Collapse, Row } from "antd";
import type { CollapseProps } from "antd";
import type { FormikProps } from "formik";
import { Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import dayjs from "@/config/dayjs";
import InputNumber from "@/components/fields/InputNumber";
import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import DocumentAccountSelect from "@/components/fields/DocumentAccountSelect";
import Card from "@/components/ui/card/Card";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { faAssetStatusIds } from "../../../shared/constants/statuses";
import { faDocumentAccountRoleCodes } from "../../../shared/constants/documentAccounts";
import { faAssetKinds, faKindLabel, faKindRole, type FaAssetKindId } from "../../../shared/constants/assetKinds";
import FaAssetKindSwitch from "../../../shared/components/FaAssetKindSwitch";
import useIntangibleSetup from "../../../shared/hooks/useIntangibleSetup";
import { $axiosPrivate } from "@/services/AxiosService";
import {
  documentAccountChartAccountsPath,
  normalizeDocumentAccountOptions,
} from "@/shared/documentAccounts/documentAccounts";
import { faMovementAssetDisplayConfig } from "../../faMovement/components/useFaMovementLookups";
import type {
  FaCommissioningFormValues,
  FaCommissioningLineValues,
} from "../types/form";

const emptyLine = (
  responsibleUserId: number | null = null,
): FaCommissioningLineValues => ({
  faAssetId: null,
  // NSBU 5 / 1C: depreciation starts on the 1st of the month after commissioning.
  deprStartDate: dayjs().add(1, "month").startOf("month").format("YYYY-MM-DDTHH:mm:ss"),
  salvageValue: 0,
  usefulLifeMonths: 1,
  depreciationMethodId: null,
  plannedUnitsTotal: null,
  departmentId: null,
  responsibleUserId,
  accumulatedDepreciationAccountId: null,
  depreciationExpenseAccountId: null,
  note: "",
});

interface FaCommissioningFormFieldsProps {
  formik: FormikProps<FaCommissioningFormValues>;
  isDraft: boolean;
  currentUserId: number | null;
  documentTypeId?: number;
}

export default function FaCommissioningFormFields({
  formik,
  isDraft,
  currentUserId,
  documentTypeId,
}: FaCommissioningFormFieldsProps) {
  const { t } = useTranslation();
  const [activeLineKeys, setActiveLineKeys] = useState<string[]>(["line-0"]);
  const assetKindId = formik.values.assetKindId;
  const kindReady = useIntangibleSetup(assetKindId);
  const accountsEnabled = Boolean(documentTypeId) && kindReady;

  // NSBU 21: an intangible asset's amortization account mirrors its own (0430 → 0530)
  const matchAmortizationAccount = async (lineIndex: number, assetId: unknown) => {
    if (assetKindId !== faAssetKinds.intangible || !assetId || !documentTypeId) return;
    try {
      const [assets, accounts] = await Promise.all([
        $axiosPrivate.get<{ id: number; assetAccountNumber?: string | null }[]>(
          selectListEndpoints.faAssetsSelectList,
          { params: { assetKindId } },
        ),
        $axiosPrivate.get<unknown>(documentAccountChartAccountsPath(documentTypeId), {
          params: { documentRoleCode: faKindRole(assetKindId, faDocumentAccountRoleCodes.accumulatedDepreciation) },
        }),
      ]);
      const assetNumber = assets.data.find((asset) => asset.id === Number(assetId))?.assetAccountNumber;
      if (!assetNumber?.startsWith("04")) return;
      const wanted = `05${assetNumber.slice(2)}`;
      const account = normalizeDocumentAccountOptions(accounts.data).find(
        (option) => String(option.number) === wanted,
      );
      if (account)
        void formik.setFieldValue(`lines[${lineIndex}].accumulatedDepreciationAccountId`, account.id);
    } catch {
      // the account stays as picked
    }
  };

  // a line's asset picked or changed (by hand or as the only one): its amortization account
  // follows; a draft opened again keeps the accounts it was saved with
  const assetIdsKey = formik.values.lines.map((line) => line.faAssetId ?? "").join(",");
  const previousAssetIds = useRef<string[] | null>(null);
  useEffect(() => {
    const current = assetIdsKey.split(",");
    const previous = previousAssetIds.current;
    previousAssetIds.current = current;
    if (previous === null) return;
    current.forEach((assetId, lineIndex) => {
      if (assetId && assetId !== previous[lineIndex])
        void matchAmortizationAccount(lineIndex, assetId);
    });
    // the match runs on a change of the assets only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetIdsKey]);

  // another kind takes other assets and accounts; NSBU 7 item 46: an intangible asset whose
  // life cannot be told is amortized over five years
  const handleKindChange = (kind: FaAssetKindId) => {
    void formik.setFieldValue("assetKindId", kind);
    void formik.setFieldValue(
      "lines",
      formik.values.lines.map((line) => ({
        ...line,
        faAssetId: null,
        accumulatedDepreciationAccountId: null,
        usefulLifeMonths:
          kind === faAssetKinds.intangible && Number(line.usefulLifeMonths) <= 1
            ? 60
            : line.usefulLifeMonths,
      })),
    );
  };

  const handleAddLine = () => {
    const lineIndex = formik.values.lines.length;
    void formik.setFieldValue("lines", [
      ...formik.values.lines,
      emptyLine(currentUserId),
    ]);
    setActiveLineKeys((keys) => [...keys, `line-${lineIndex}`]);
  };

  const handleRemoveLine = (lineIndex: number) => {
    void formik.setFieldValue(
      "lines",
      formik.values.lines.filter((_, index) => index !== lineIndex),
    );
    setActiveLineKeys(["line-0"]);
  };

  const lineItems: CollapseProps["items"] = formik.values.lines.map(
    (line, lineIndex) => ({
      key: `line-${lineIndex}`,
      label: (
        <div className="flex min-w-0 flex-1 items-center justify-between gap-4 pr-2">
          <span className="shrink-0 font-semibold">
            {t(faKindLabel(assetKindId, "fa.sections.assetNumber"), { number: lineIndex + 1 })}
          </span>
          <div className="hidden min-w-0 flex-1 grid-cols-2 gap-5 text-xs text-muted-foreground lg:grid">
            <span className="truncate">
              {line.faAssetId
                ? `${t(faKindLabel(assetKindId, "fa.fields.faAssetId"))}: ${line.faAssetId}`
                : t(faKindLabel(assetKindId, "fa.fields.faAssetId"))}
            </span>
            <span className="truncate">
              {line.usefulLifeMonths
                ? `${t("fa.fields.usefulLifeMonths")}: ${line.usefulLifeMonths}`
                : ""}
            </span>
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
            <Col span={8}>
              <SelectCustom
                path={selectListEndpoints.faAssetsSelectList}
                queryParams={{ statusId: faAssetStatusIds.notCommissioned, assetKindId }}
                displayConfig={faMovementAssetDisplayConfig}
                formik={formik}
                fieldName={`lines[${lineIndex}].faAssetId`}
                label={faKindLabel(assetKindId, "fa.fields.faAssetId")}
                search
                required
              />
            </Col>
            <Col span={4}>
              <SelectDate
                formik={formik}
                fieldName={`lines[${lineIndex}].deprStartDate`}
                label="fa.fields.deprStartDate"
                required
              />
            </Col>
            <Col span={4}>
              <InputNumber
                formik={formik}
                fieldName={`lines[${lineIndex}].salvageValue`}
                label="fa.fields.salvageValue"
                min={0}
                required
              />
            </Col>
            <Col span={4}>
              <InputNumber
                formik={formik}
                fieldName={`lines[${lineIndex}].usefulLifeMonths`}
                label="fa.fields.usefulLifeMonths"
                min={1}
                precision={0}
                required
              />
            </Col>
            <Col span={4}>
              <SelectCustom
                path={selectListEndpoints.depreciationMethodsSelectList}
                formik={formik}
                fieldName={`lines[${lineIndex}].depreciationMethodId`}
                label="fa.fields.depreciationMethod"
                required
              />
            </Col>
            <Col span={4}>
              <InputNumber
                formik={formik}
                fieldName={`lines[${lineIndex}].plannedUnitsTotal`}
                label="fa.fields.plannedUnitsTotal"
                min={0}
              />
            </Col>
            <Col span={5}>
              <SelectCustom
                path={selectListEndpoints.departmentsSelectList} createWith="department"
                formik={formik}
                fieldName={`lines[${lineIndex}].departmentId`}
                label="fa.fields.department"
                search
                required
              />
            </Col>
            <Col span={5}>
              <SelectCustom
                path={selectListEndpoints.usersSelectList}
                formik={formik}
                fieldName={`lines[${lineIndex}].responsibleUserId`}
                label="fa.fields.responsibleUser"
                search
                required
                disabled
              />
            </Col>
            <Col span={5}>
              <DocumentAccountSelect
                documentTypeId={documentTypeId ?? 0}
                documentRoleCode={faKindRole(assetKindId, faDocumentAccountRoleCodes.accumulatedDepreciation)}
                formik={formik}
                fieldName={`lines[${lineIndex}].accumulatedDepreciationAccountId`}
                label="fa.fields.accumulatedDepreciationAccount"
                search
                required
                enabled={accountsEnabled}
              />
            </Col>
            <Col span={5}>
              <DocumentAccountSelect
                documentTypeId={documentTypeId ?? 0}
                documentRoleCode={faDocumentAccountRoleCodes.depreciationExpense}
                formik={formik}
                fieldName={`lines[${lineIndex}].depreciationExpenseAccountId`}
                label="fa.fields.depreciationExpenseAccount"
                search
                required
                enabled={Boolean(documentTypeId)}
              />
            </Col>
            <Col span={4}>
              <InputText
                formik={formik}
                fieldName={`lines[${lineIndex}].note`}
                label="fa.fields.note"
              />
            </Col>
          </Row>
        </div>
      ),
    }),
  );

  return (
    <div className="space-y-2">
      <Card className="p-3">
        <div className="mb-3">
          <FaAssetKindSwitch value={assetKindId} onChange={handleKindChange} disabled={!isDraft} />
        </div>
        <Row gutter={[16, 0]}>
          <Col span={4}>
            <SelectDate
              formik={formik}
              fieldName="docDate"
              label="fa.fields.docDate"
              required
            />
          </Col>
          <Col span={20}>
            <InputText
              formik={formik}
              fieldName="note"
              label="fa.fields.note"
            />
          </Col>
        </Row>
      </Card>

      <Card className="border border-border p-3 sm:p-5">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-base font-semibold">
              {t("fa.commissioning.assetsTitle")}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {t("fa.commissioning.assetsDescription")}
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

        <Collapse
          activeKey={activeLineKeys}
          onChange={(keys) =>
            setActiveLineKeys(Array.isArray(keys) ? keys : [keys])
          }
          items={lineItems}
          className="bg-transparent"
        />

        {typeof formik.errors.lines === "string" && (
          <div className="mt-3 text-sm text-red-500">
            {formik.errors.lines}
          </div>
        )}
      </Card>
    </div>
  );
}
