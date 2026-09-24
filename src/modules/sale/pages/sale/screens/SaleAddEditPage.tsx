import { App, Form, Spin } from "antd";
import dayjs from "dayjs";
import { useFormik } from "formik";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import toast from "react-hot-toast";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { useAppSelector } from "@/store/hooks";
import { formatDate } from "@/utils/helpers";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { useGetNowSaleCondition } from "@/modules/settings/pages/saleCondition/hooks";
import { SaleDocumentFormFields, SaleProductSelection } from "../components";
import { useCreateSale, useGetDetailSale, useUpdateSale } from "../hooks";
import type {
  SaleDocCreateForm,
  SaleDocForm,
  SaleProcessingMode,
  SaleDocUpdateForm,
} from "../types/form";
import { ValidationError } from "yup";
import { saleDocLinesSchema, saleDocSchema } from "../types/schema";
import type { SaleSelectedProduct } from "../types/type";
import {
  clearSaleDraft,
  getSaleDraft,
  getSaleConditionDraftKey,
  saveSaleDraft,
} from "../utils/saleDraft";
import {
  getIncompleteSaleMarkingLines,
  getSaleMarkingCount,
  toSaleCreatePayload,
} from "../utils/saleCreatePayload";
// import { getSaleCostingValidationError } from "../utils/saleCostingValidation";
import { useTranslation } from "react-i18next";

const toPositiveNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : null;
};

const createDefaultValues = (): SaleDocForm => ({
  docDate: dayjs().format(formatDate),
  exchangeRate: 0,
  counterpartyId: null,
  contractId: null,
  warehouseId: null,
  currencyId: 1,
  customerAccountId: null,
  vatAccountId: null,
  comment: "",
  stateId: 1,
});

export default function SaleAddEditPage() {
  // Taken once when the form opens; the factory reads the clock.
  const [openedDefaults] = useState(createDefaultValues);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id = "" } = useParams();
  const isEdit = Boolean(id);
  const organizationId = useAppSelector((state) => state.organization.id);
  const [initialDraft] = useState(() =>
    isEdit ? null : getSaleDraft(organizationId),
  );
  const [selectedProducts, setSelectedProducts] = useState<
    SaleSelectedProduct[] | null
  >(() => initialDraft?.products ?? null);
  const [isDraftSynced, setIsDraftSynced] = useState(isEdit);
  // Codes are scanned while selling unless the seller turns it off; the storekeeper
  // then scans them at assembly instead.
  const [processingMode, setProcessingMode] = useState<SaleProcessingMode>(
    () => initialDraft?.processingMode ?? 2,
  );
  const { modal } = App.useApp();

  const { data: document, isLoading: isDocumentLoading } =
    useGetDetailSale(id);
  const {
    data: saleCondition,
    isError: isSaleConditionError,
    isLoading: isSaleConditionLoading,
    isSuccess: isSaleConditionSuccess,
  } = useGetNowSaleCondition(true);
  const createSale = useCreateSale();
  const updateSale = useUpdateSale();

  const savedProducts = useMemo<SaleSelectedProduct[]>(() => {
    const products = document?.products ?? [];
    if (products.length) {
      return products.map((product) => ({
        id: product.id,
        rowKey: `saved-product-${product.id}`,
        productId: product.productId,
        productName: product.productName,
        quantity: product.quantity,
        availableQuantity: product.quantity,
        costPrice: product.costPrice || product.unitPrice || product.amount || 0,
        unitId: product.unitId ?? 0,
        unitPrice: product.unitPrice || product.amount || 0,
        unitName: product.unitName,
        vatRateId: product.vatRateId,
        inventoryAccountId: product.inventoryAccountId ?? null,
        incomeAccountId: product.incomeAccountId ?? null,
        costAccountId: product.costAccountId ?? null,
        inventoryAccountName: product.inventoryAccountName,
        incomeAccountName: product.incomeAccountName,
        costAccountName: product.costAccountName,
      }));
    }

    return (document?.lines ?? []).map((line) => ({
      id: line.id,
      rowKey: `saved-line-${line.id}`,
      productId: line.productId,
      productName: line.productName,
      quantity: line.quantity,
      availableQuantity: line.quantity,
      costPrice: line.costPrice || line.price || line.amount || 0,
      unitId: line.unitId ?? 0,
      unitPrice: line.price || line.amount || 0,
      unitName: line.unitName,
      vatRateId: line.vatRateId,
      inventoryAccountId: line.inventoryAccountId ?? null,
      incomeAccountId: line.incomeAccountId ?? null,
      costAccountId: line.costAccountId ?? null,
      inventoryAccountName: line.inventoryAccountName,
      incomeAccountName: line.incomeAccountName,
      costAccountName: line.costAccountName,
    }));
  }, [document?.lines, document?.products]);

  const products = useMemo(
    () => selectedProducts ?? (isEdit ? savedProducts : []),
    [isEdit, savedProducts, selectedProducts],
  );
  const activeSaleCondition = saleCondition ?? {
    id: 0,
    costingMethodId: 3,
    vatRateId: products[0]?.vatRateId ?? 0,
    startDate: "",
    endDate: null,
  };

  const formik = useFormik<SaleDocForm>({
    initialValues: document
      ? {
          docDate: document.docDate,
          exchangeRate: 0,
          counterpartyId: document.counterpartyId,
          contractId: document.contractId ?? null,
          warehouseId: document.warehouseId,
          currencyId: document.currencyId,
          customerAccountId: document.customerAccountId ?? null,
          vatAccountId: document.vatAccountId ?? null,
          comment: document.comment,
          stateId: document.stateId,
        }
      : initialDraft?.form ?? openedDefaults,
    enableReinitialize: true,
    validationSchema: saleDocSchema(t, isEdit),
    onSubmit: async (values) => {
      try {
        await saleDocLinesSchema(t, isEdit).validate(products, {
          abortEarly: false,
        });
      } catch (error) {
        if (error instanceof ValidationError) {
          toast.error(error.errors[0] || t("sale.messages.checkProductData"));
        } else {
          toast.error(t("sale.messages.checkProductData"));
        }
        return;
      }

      // Turli partiyalarning tannarxi har xil bo'lishiga vaqtincha ruxsat berildi.
      // const costingValidationError = getSaleCostingValidationError({
      //   costingMethodId: activeSaleCondition.costingMethodId,
      //   products,
      // }, t);
      // if (costingValidationError) {
      //   toast.error(costingValidationError);
      //   return;
      // }

      const validProducts = products;

      // A marked line whose units are not all scanned or stated code-less cannot
      // leave the warehouse, so the document may only be kept as a draft: no stock
      // is reserved or moved and nothing is posted until the codes are entered.
      let mode = processingMode;
      if (!isEdit && processingMode === 2) {
        const incomplete = getIncompleteSaleMarkingLines(validProducts);
        if (incomplete.length) {
          const keepAsDraft = await modal.confirm({
            title: t("sale.messages.markingsIncompleteTitle"),
            content: (
              <div className="space-y-2">
                <ul className="list-disc pl-5">
                  {incomplete.map((line) => (
                    <li key={line.rowKey ?? line.productId}>
                      {line.productName}:{" "}
                      {getSaleMarkingCount(line) + (line.unmarkedQuantity ?? 0)} /{" "}
                      {Math.round(line.quantity)}
                    </li>
                  ))}
                </ul>
                <div>{t("sale.messages.markingsIncompleteDraft")}</div>
              </div>
            ),
            okText: t("sale.actions.saveAsDraft"),
            cancelText: t("common.cancel"),
          });
          if (!keepAsDraft) return;
          mode = 1;
        }
      }

      try {
        if (isEdit && document) {
          const payload: SaleDocUpdateForm = {
            docDate: values.docDate,
            counterpartyId: values.counterpartyId ?? document.counterpartyId,
            warehouseId: values.warehouseId ?? document.warehouseId,
            currencyId: values.currencyId ?? document.currencyId,
            contractId: values.contractId,
            comment: values.comment || null,
            stateId: values.stateId ?? document.stateId,
            products: validProducts.map((product) => ({
              id: product.id,
              productId: product.productId,
              quantity: product.quantity,
              costPrice: product.costPrice,
              unitId: product.unitId,
              unitPrice: product.unitPrice,
              vatRateId: product.vatRateId ?? null,
            })),
          };
          await updateSale.mutateAsync({ id: document.id, payload });
        } else {
          const payload: SaleDocCreateForm = toSaleCreatePayload(
            values,
            validProducts,
            mode,
          );
          await createSale.mutateAsync(payload);
          clearSaleDraft(organizationId);
          if (mode !== processingMode) toast.success(t("sale.messages.savedAsDraft"));
        }
        navigate("/main/sales/sale");
      } catch (error) {
        errorHandlers(error);
      }
    },
  });

  const counterpartyId = useMemo(
    () => toPositiveNumber(formik.values.counterpartyId),
    [formik.values.counterpartyId],
  );
  const warehouseId = useMemo(
    () => toPositiveNumber(formik.values.warehouseId),
    [formik.values.warehouseId],
  );
  const previousCounterpartyId = useRef<number | null>(null);
  const previousWarehouseId = useRef<number | null>(null);

  useEffect(() => {
    if (isEdit) return;
    if (
      previousCounterpartyId.current !== null &&
      previousCounterpartyId.current !== counterpartyId
    ) {
      formik.setFieldValue("contractId", null, false);
      setSelectedProducts([]);
    }

    previousCounterpartyId.current = counterpartyId;
  }, [counterpartyId, formik, isEdit]);

  useEffect(() => {
    if (isEdit) return;
    if (
      previousWarehouseId.current !== null &&
      previousWarehouseId.current !== warehouseId
    ) {
      setSelectedProducts([]);
    }

    previousWarehouseId.current = warehouseId;
  }, [isEdit, setSelectedProducts, warehouseId]);

  const saleConditionDraftKey = useMemo(
    () => getSaleConditionDraftKey(saleCondition),
    [saleCondition],
  );

  useEffect(() => {
    if (isEdit || !saleCondition || isDraftSynced) return;

    queueMicrotask(() => {
      if (initialDraft?.saleConditionKey !== saleConditionDraftKey) {
        clearSaleDraft(organizationId);
        setSelectedProducts([]);
        formik.resetForm({ values: createDefaultValues() });
      }

      setIsDraftSynced(true);
    });
  }, [
    formik,
    initialDraft?.saleConditionKey,
    isDraftSynced,
    isEdit,
    organizationId,
    saleCondition,
    saleConditionDraftKey,
  ]);

  const draftValue = useMemo(
    () => ({
      form: formik.values,
      products,
      processingMode,
      saleConditionKey: saleConditionDraftKey,
    }),
    [formik.values, processingMode, products, saleConditionDraftKey],
  );
  const draft = useDebounce(draftValue, 300);
  useEffect(() => {
    if (!isEdit && isDraftSynced && saleConditionDraftKey) {
      saveSaleDraft(organizationId, draft);
    }
  }, [draft, isDraftSynced, isEdit, organizationId, saleConditionDraftKey]);

  useEffect(() => {
    if (isEdit || isSaleConditionLoading) return;
    if (isSaleConditionError || (isSaleConditionSuccess && !saleCondition)) {
      toast.error(t("sale.messages.saleRuleMissing"));
      navigate(-1);
    }
  }, [
    isEdit,
    isSaleConditionError,
    isSaleConditionLoading,
    isSaleConditionSuccess,
    navigate,
    saleCondition,
    t,
  ]);

  if (isEdit && isDocumentLoading) {
    return (
      <div className="flex justify-center p-10">
        <Spin />
      </div>
    );
  }

  if (!isEdit && (isSaleConditionLoading || !saleCondition)) {
    return (
      <div className="flex justify-center p-10">
        <Spin />
      </div>
    );
  }

  return (
    <Form
      layout="vertical"
      onFinish={formik.handleSubmit}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.preventDefault();
      }}
    >
      <div className="space-y-3">
        {!isEdit && <SaleDocumentFormFields formik={formik} isEdit={false} />}
        <SaleProductSelection
          warehouseId={warehouseId}
          comment={formik.values.comment}
          products={products}
          saleCondition={activeSaleCondition}
          onCommentChange={(comment) =>
            formik.setFieldValue("comment", comment, false)
          }
          onChange={setSelectedProducts}
          markingMode={!isEdit && processingMode === 2}
          explicitUnmarked
          aggregateStockMode
          onMarkingModeChange={
            isEdit
              ? undefined
              : (enabled) => setProcessingMode(enabled ? 2 : 1)
          }
          onCancel={() => navigate(-1)}
          submitting={createSale.isPending || updateSale.isPending}
          disabled={createSale.isPending || updateSale.isPending}
        />
      </div>
    </Form>
  );
}
