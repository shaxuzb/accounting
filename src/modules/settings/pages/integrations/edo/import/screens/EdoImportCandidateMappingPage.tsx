import { Alert, Button, Empty, Form, Skeleton } from "antd";
import { useFormik } from "formik";
import { ArrowLeft, ExternalLink, Save } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import Card from "@/components/ui/card/Card";
import useWindowSize from "@/shared/hooks/useWindowSize";
import type {
  ProductSelectOption,
  PurchaseImportRow,
  PurchaseMode,
  SelectBoxOptions,
} from "@/modules/purchase/pages/purchase/types/type";
import type { PurchaseImportForm } from "@/modules/purchase/pages/purchase/types/form";
import PurchaseImportHeader from "@/modules/purchase/pages/purchase/components/PurchaseImportHeader";
import PurchaseImportLinesSection from "@/modules/purchase/pages/purchase/components/PurchaseImportLinesSection";
import PurchaseLineAccountsModal, {
  type PurchaseLineAccountValues,
} from "@/modules/purchase/pages/purchase/components/PurchaseLineAccountsModal";
import { usePurchaseImportColumns } from "@/modules/purchase/pages/purchase/hooks/usePurchaseImportColumns";
import { usePurchaseImportOptions } from "@/modules/purchase/pages/purchase/hooks/usePurchaseImportOptions";
import {
  buildColumnConfig,
  getBaseColumnConfig,
  toSelectBoxOptions,
} from "@/modules/purchase/pages/purchase/utils/importColumns";
import {
  useEdoImportCandidate,
  useSaveEdoImportCandidateMapping,
} from "../hooks";
import type {
  EdoImportCandidateDetailDto,
  EdoImportCandidateMappingRequestDto,
} from "../types";
import {
  getImportErrorMessage,
  importStatusTag,
  isCandidateMappingEditable,
} from "../components/presentation";

const toPurchaseRow = (
  line: EdoImportCandidateDetailDto["lines"][number],
  detail: EdoImportCandidateDetailDto,
): PurchaseImportRow => ({
  key: line.number,
  id: line.number,
  indexId: line.number,
  name: line.providerProductName ?? "",
  product: line.providerProductName ?? "",
  productId: line.productId ?? null,
  productName: line.providerProductName ?? "",
  qty: line.quantity ?? null,
  price: line.unitPrice ?? null,
  pricePerUom: line.unitPrice ?? null,
  unitId: line.unitId ?? null,
  mxik: line.catalogCode ?? "",
  vatRateId: line.vatRateId ?? null,
  vatRates: line.vatRate ?? null,
  currencyId: detail.currencyId ?? 0,
  markingNumber: "",
  serialNumber: "",
  counterpartyId: detail.counterpartyId ?? null,
  debitAccountId: line.debitAccountId ?? null,
  vatAccountId: line.vatAccountId ?? null,
  isService: line.isService === true,
  edoNetAmount: line.netAmount ?? 0,
  edoVatAmount: line.vatAmount ?? 0,
  edoTotalAmount: line.totalAmount ?? 0,
});

const getInitialValues = (
  detail: EdoImportCandidateDetailDto,
): PurchaseImportForm => ({
  docDate: detail.documentDate ?? "",
  counterpartyId: detail.counterpartyId ?? null,
  contractId: detail.contractId ?? null,
  currencyId: detail.currencyId ?? null,
  warehouseId: detail.warehouseId ?? null,
  priceIncludesVat: false,
  supplierAccountId: null,
  comment: "",
  lines: detail.lines.map((line) => toPurchaseRow(line, detail)),
});

const toMappingPayload = (
  values: PurchaseImportForm,
): EdoImportCandidateMappingRequestDto => ({
  counterpartyId: values.counterpartyId,
  contractId: values.contractId,
  currencyId: values.currencyId,
  warehouseId: values.warehouseId,
  lines: values.lines.map((line) => ({
    lineNumber: line.indexId,
    productId: line.productId ?? null,
    unitId: line.unitId ?? null,
    vatRateId: line.vatRateId ?? null,
    debitAccountId: line.debitAccountId ?? null,
    vatAccountId: line.vatAccountId ?? null,
  })),
});

export default function EdoImportCandidateMappingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { height } = useWindowSize();
  const { jobId: rawJobId, candidateId: rawCandidateId } = useParams();
  const jobId = Number(rawJobId);
  const candidateId = Number(rawCandidateId);
  const validIds = jobId > 0 && candidateId > 0;
  const detail = useEdoImportCandidate(jobId, candidateId, validIds);
  const saveMapping = useSaveEdoImportCandidateMapping(jobId, candidateId);
  const canEditMapping = Boolean(
    detail.data &&
      isCandidateMappingEditable(
        detail.data.status,
        detail.data.mappingStatus,
      ),
  );
  const [selectBoxOptions, setSelectBoxOptions] = useState<SelectBoxOptions[]>(
    [],
  );
  const [accountLineIndex, setAccountLineIndex] = useState<number | null>(null);
  const backToCandidates = useCallback(
    () =>
      navigate(
        `/main/settings/integrations/edo/import?jobId=${jobId}&stage=CANDIDATES`,
      ),
    [jobId, navigate],
  );
  const purchaseMode: PurchaseMode = detail.data?.lines.some(
    (line) => line.isService,
  )
    ? "services"
    : "goods";
  const options = usePurchaseImportOptions(purchaseMode, Boolean(detail.data));
  const columnConfig = useMemo(() => {
    const base = getBaseColumnConfig(false, false, t);
    return buildColumnConfig(
      base,
      selectBoxOptions.length ? selectBoxOptions : toSelectBoxOptions(base),
    );
  }, [selectBoxOptions, t]);
  const formik = useFormik<PurchaseImportForm>({
    initialValues: detail.data
      ? getInitialValues(detail.data)
      : {
          docDate: "",
          counterpartyId: null,
          contractId: null,
          currencyId: null,
          warehouseId: null,
          priceIncludesVat: false,
          supplierAccountId: null,
          comment: "",
          lines: [],
        },
    enableReinitialize: true,
    onSubmit: async (values, helpers) => {
      try {
        await saveMapping.mutateAsync(toMappingPayload(values));
        toast.success("Moslashtirish ma’lumotlari saqlandi.");
      } catch (error) {
        toast.error(getImportErrorMessage(error));
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });
  const handleItemSelect = useCallback(
    (rowIndex: number, value: number) => {
      const item = options.itemOptions.find(
        (option) => Number(option.id) === value,
      ) as ProductSelectOption | undefined;
      const line = formik.values.lines[rowIndex];
      if (!line) return;
      formik.setFieldValue(`lines[${rowIndex}]`, {
        ...line,
        productId: value,
        product: item?.name ?? line.product,
        productName: item?.name ?? line.productName,
        name: item?.name ?? line.name,
        unitId: item?.unitId ?? line.unitId,
        isPieceTracked: item?.isPieceTracked,
      });
    },
    [formik, options.itemOptions],
  );
  const handleRowValueChange = useCallback(
    (rowIndex: number, patch: Partial<PurchaseImportRow>) => {
      formik.setFieldValue(`lines[${rowIndex}]`, {
        ...formik.values.lines[rowIndex],
        ...patch,
      });
    },
    [formik],
  );
  const handleAccountApply = useCallback(
    (values: PurchaseLineAccountValues, applyToAll: boolean) => {
      formik.setFieldValue(
        "lines",
        formik.values.lines.map((line, index) =>
          applyToAll || index === accountLineIndex
            ? { ...line, ...values }
            : line,
        ),
      );
      setAccountLineIndex(null);
    },
    [accountLineIndex, formik],
  );
  const tableColumns = usePurchaseImportColumns({
    columnConfig,
    enabled: Boolean(detail.data),
    handleCellCommit: () => undefined,
    handleDeleteRow: () => undefined,
    handleItemSelect,
    handleRowValueChange,
    isLoading: options.isLoading,
    isMxikValid: () => true,
    itemOptions: options.itemOptions,
    openMarkingModal: () => undefined,
    openAccountModal: setAccountLineIndex,
    purchaseMode,
    unitOptions: options.unitOptions,
    vatRateOptions: options.vatRateOptions,
    readOnlyValues: true,
    disabled: !canEditMapping,
  });

  if (!validIds)
    return (
      <Card className="border border-border p-6">
        <Alert
          type="error"
          showIcon
          message="Moslashtirish hujjati topilmadi"
          description="Job yoki hujjat identifikatori noto‘g‘ri."
        />
        <Button
          className="mt-4"
          icon={<ArrowLeft className="size-4" />}
          onClick={backToCandidates}
        >
          Hujjatlar ro‘yxatiga qaytish
        </Button>
      </Card>
    );
  return (
    <div className="w-full space-y-2">
      {detail.isLoading ? (
        <Card className="border border-border p-6">
          <Skeleton active paragraph={{ rows: 12 }} />
        </Card>
      ) : detail.isError ? (
        <Alert
          type="error"
          showIcon
          message={getImportErrorMessage(detail.error)}
        />
      ) : !detail.data ? (
        <Card className="border border-border p-6">
          <Empty description="Hujjat ma’lumotlari topilmadi" />
        </Card>
      ) : (
        <>
          <Card className="border border-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs text-secondary-text">
                  EDO · Hujjat{" "}
                  {detail.data.documentNumber || `#${detail.data.id}`}
                </div>
                <div className="mt-1 text-lg font-semibold text-heading">
                  {detail.data.sellerName || "Sotuvchi ko‘rsatilmagan"}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {importStatusTag(detail.data.status)}
                {importStatusTag(detail.data.mappingStatus)}
                {detail.data.existingPurchaseId ? (
                  <Button
                    size="small"
                    icon={<ExternalLink className="size-4" />}
                    onClick={() =>
                      navigate(
                        `/main/purchases/purchase/${detail.data!.existingPurchaseId}`,
                      )
                    }
                  >
                    Purchase’ni ochish
                  </Button>
                ) : null}
                <Button
                  type="primary"
                  icon={<Save className="size-4" />}
                  loading={saveMapping.isPending}
                  disabled={!canEditMapping}
                  onClick={() => void formik.submitForm()}
                >
                  Moslashtirishni saqlash
                </Button>
              </div>
            </div>
            {!canEditMapping ? (
              <Alert
                className="mt-3"
                type="info"
                showIcon
                message="Bu hujjat uchun moslashtirish yopilgan."
                description={
                  detail.data.existingPurchaseId
                    ? `Hujjat allaqachon Purchase #${detail.data.existingPurchaseId} bilan bog‘langan.`
                    : "Hujjatning joriy holatida mappingni o‘zgartirishga ruxsat berilmagan."
                }
              />
            ) : null}
            {/* <Descriptions
              className="mt-3"
              bordered
              size="small"
              column={{ xs: 1, sm: 2, lg: 4 }}
            >
              <Descriptions.Item label="Provider ID">
                {detail.data.providerDocumentId}
              </Descriptions.Item>
              <Descriptions.Item label="Sana">
                {detail.data.documentDate || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Sotuvchi STIR">
                {detail.data.sellerTin || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Jami summa">
                {formatImportNumber(detail.data.totalAmount)}
              </Descriptions.Item>
              <Descriptions.Item label="Hujjat holati">
                <Tag color="blue">{detail.data.duplicateState || "—"}</Tag>
              </Descriptions.Item>
            </Descriptions> */}
          </Card>
          <Form onFinish={formik.handleSubmit} layout="vertical">
            <PurchaseImportHeader
              formik={formik}
              purchaseMode={purchaseMode}
              readOnlyDate
              showCurrency
              showSupplierAccount={false}
              allowCreateOptions={false}
              disabled={!canEditMapping}
            />
            <PurchaseImportLinesSection
              columns={tableColumns}
              comment={formik.values.comment}
              counterpartyId={formik.values.counterpartyId}
              height={height}
              isFetching={options.isFetching}
              isLoading={options.isLoading}
              lines={formik.values.lines}
              onAddManualRow={() => undefined}
              onCommentChange={(value) =>
                void formik.setFieldValue("comment", value)
              }
              purchaseMode={purchaseMode}
              totals={{
                amount: detail.data.netAmount ?? 0,
                vatAmount: detail.data.vatAmount ?? 0,
                totalAmount: detail.data.totalAmount ?? 0,
              }}
              formik={formik}
              hasSelectedRows={formik.values.lines.some((line) =>
                Boolean(line.productId),
              )}
              onBack={backToCandidates}
              onSave={() => void formik.submitForm()}
              saveLoading={saveMapping.isPending}
              onExcelDataChange={() => undefined}
              onClearExcelData={() => undefined}
              onPurchaseModeChange={() => undefined}
              selectBoxOptions={selectBoxOptions}
              setSelectBoxOptions={setSelectBoxOptions}
              showActions={false}
              showAddLine={false}
              showComment={false}
            />
          </Form>
          <PurchaseLineAccountsModal
            open={accountLineIndex !== null}
            line={
              accountLineIndex === null
                ? null
                : (formik.values.lines[accountLineIndex] ?? null)
            }
            purchaseMode={purchaseMode}
            onClose={() => setAccountLineIndex(null)}
            onApply={handleAccountApply}
          />
        </>
      )}
    </div>
  );
}
