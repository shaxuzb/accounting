import { Form, Spin } from "antd";
import dayjs from "dayjs";
import { useFormik } from "formik";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Navigate, useNavigate, useParams } from "react-router";
import { ValidationError } from "yup";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { formatDate } from "@/utils/helpers";
import { useAppSelector } from "@/store/hooks";
import {
  usePersistedState,
  useScopedStorageKey,
} from "@/shared/persistence/usePersistedState";
import { useGetNowSaleCondition } from "@/modules/settings/pages/saleCondition/hooks";
import { useVatPayer } from "@/shared/hooks/useVatPayer";
import { COSTING_METHOD } from "../../sale/utils/salePricingDetails";
import DocumentProcessingModeModal from "@/components/ui/DocumentProcessingModeModal";
import SaleProductSelection from "../../sale/components/SaleProductSelection";
import SaleServiceLines from "../../sale/components/SaleServiceLines";
import {
  savedServiceLines,
  serviceLinesError,
  serviceToSaleLine,
  useSaleServiceOptions,
  type SaleServiceLine,
} from "../../sale/utils/serviceLines";
import { roundMoney } from "../../sale/utils/pricing";
// import { getSaleCostingValidationError } from "../../sale/utils/saleCostingValidation";
import { saleDocLinesSchema } from "../../sale/types/schema";
import type { SaleSelectedProduct } from "../../sale/types/type";
import {
  RetailSaleFormFields,
  RetailSalePayments,
} from "../components";
import { retailSaleDocumentTypeIds } from "../constants/endpoints";
import {
  useCreateRetailSale,
  useGetRetailSale,
  useUpdateRetailSale,
} from "../hooks";
import type {
  RetailSaleFormValues,
  RetailSaleProcessingMode,
} from "../types/form";
import { retailSalePermissions } from "../constants/permissions";
import { retailSaleSchema } from "../types/schema";
import {
  toRetailSaleCreatePayload,
  toRetailSaleUpdatePayload,
} from "../utils/payload";

const createDefaultValues = (): RetailSaleFormValues => ({
  docDate: dayjs().format(formatDate),
  counterpartyId: null,
  warehouseId: null,
  cashRegisterId: null,
  currencyId: 1,
  exchangeRate: 1,
  receivableAccountId: null,
  vatAccountId: null,
  comment: "",
  stateId: 1,
  payments: [],
});

const getNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

interface RetailSaleDraft {
  values: RetailSaleFormValues;
  products: SaleSelectedProduct[];
  services?: SaleServiceLine[];
}

export default function RetailSaleEditorPage() {
  // Taken once when the form opens; the factory reads the clock.
  const [openedDefaults] = useState(createDefaultValues);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id = "" } = useParams();
  const isEdit = Boolean(id);
  const draftKey = useScopedStorageKey("form-draft", "retail-sale:new");
  const [savedDraft, setSavedDraft, clearSavedDraft] = usePersistedState<
    RetailSaleDraft | null
  >(draftKey, null, { storage: "local", debounceMs: 400 });
  const [selectedProducts, setSelectedProducts] = useState<
    SaleSelectedProduct[] | null
  >(() => (!isEdit ? savedDraft?.products ?? null : null));
  const [saleTotalAmount, setSaleTotalAmount] = useState(0);
  // services sold at the till (1C «Услуги» of the retail report): no stock, income 9030
  const [selectedServices, setSelectedServices] = useState<SaleServiceLine[] | null>(
    () => (!isEdit ? savedDraft?.services ?? null : null),
  );
  const [processingModeModalOpen, setProcessingModeModalOpen] =
    useState(false);
  const previousWarehouseId = useRef<number | null>(null);
  const draftPersistenceDisabled = useRef(false);
  const detailQuery = useGetRetailSale(id);
  const document = detailQuery.data;
  const createMutation = useCreateRetailSale();
  const updateMutation = useUpdateRetailSale();
  const permissions = useAppSelector(
    (state) => state.auth.user?.user.permissions ?? [],
  );
  const canConfirm = permissions.includes(retailSalePermissions.confirm);
  const {
    data: saleCondition,
    isLoading: isSaleConditionLoading,
    isError: isSaleConditionError,
  } = useGetNowSaleCondition(true);

  const savedProducts = useMemo<SaleSelectedProduct[]>(() => {
    if (!document) return [];
    const rawLines = document.products?.length
      ? document.products
      : (document.lines ?? []);

    const goods = rawLines.map((line, index) => {
      const items = "tables" in line
        ? (line.tables ?? [])
        : (line.items ?? []);

      return {
        id: line.id,
        rowKey: `retail-sale-line-${line.id ?? index}`,
        productId: line.productId,
        productName: line.productName,
        quantity: line.quantity,
        availableQuantity: line.quantity,
        costPrice: getNumber(line.costPrice ?? line.unitPrice),
        unitId: getNumber(line.unitId),
        unitName: line.unitName,
        unitPrice: getNumber(line.unitPrice ?? ("price" in line ? line.price : 0)),
        vatRateId: line.vatRateId,
        inventoryAccountId: line.inventoryAccountId ?? null,
        incomeAccountId: line.incomeAccountId ?? null,
        costAccountId: line.costAccountId ?? null,
        inventoryAccountName: line.inventoryAccountName,
        incomeAccountName: line.incomeAccountName,
        costAccountName: line.costAccountName,
        isPieceTracked: line.isPieceTracked,
        markings: items
          .filter((item) => Number(item.productTableId) > 0)
          .map((item) => ({
            productTableId: Number(item.productTableId),
            markingNumber: String(item.markingNumber ?? ""),
          })),
      };
    });
    // the services go to their own table
    return goods.filter((_, index) => !rawLines[index].isService);
  }, [document]);

  const products = selectedProducts ?? savedProducts;
  const vatPayerFlag = useVatPayer().isVatPayer;
  const savedServices = useMemo(
    () => (document ? savedServiceLines(document.products?.length ? document.products : (document.lines ?? [])) : []),
    [document],
  );
  const services = selectedServices ?? savedServices;
  const { vatRates: serviceVatRates } = useSaleServiceOptions();
  const serviceLines = services.map((line) => serviceToSaleLine(line, serviceVatRates, vatPayerFlag));
  const allLines = [...products, ...serviceLines];
  const servicesTotal = serviceLines.reduce(
    (sum, line) => sum + (line.netAmount ?? 0) + (line.vatAmount ?? 0),
    0,
  );
  const handleSaleTotalChange = useCallback(
    (totalAmount: number) => setSaleTotalAmount(totalAmount),
    [],
  );
  // On by default, as in the wholesale sale: a marked product is scanned unless the
  // seller says otherwise. Turned off, the units that leave stock are picked in costing
  // order — the only way to sell a marked product over the counter without scanning it.
  // A reopened check keeps its choice: a marked line with fewer codes than pieces was
  // entered with the switch off, so it opens off rather than asking for codes again.
  const savedWithoutMarking = useMemo(
    () =>
      (document?.lines ?? []).some(
        (line) =>
          line.isPieceTracked &&
          (line.items?.length ?? 0) < Number(line.quantity ?? 0),
      ),
    [document],
  );
  const [markingModeChoice, setMarkingMode] = useState<boolean | null>(null);
  const markingMode = markingModeChoice ?? !savedWithoutMarking;
  const vatPayer = useVatPayer();
  // the server writes stock off FIFO (accounting policy), so the cost and margin
  // previews follow the same order whatever an old sale condition still says
  const baseSaleCondition = {
    ...(saleCondition ?? {
      id: 0,
      vatRateId: products[0]?.vatRateId ?? 0,
      startDate: "",
      endDate: null,
    }),
    costingMethodId: COSTING_METHOD.FIFO,
  };
  // a non-payer sells «QQSsiz» (1C «Без НДС»): new lines take that rate
  const activeSaleCondition =
    !vatPayer.isVatPayer && vatPayer.noVatRateId
      ? { ...baseSaleCondition, vatRateId: vatPayer.noVatRateId }
      : baseSaleCondition;

  const formik = useFormik<RetailSaleFormValues>({
    initialValues: document
      ? {
          docDate: document.docDate,
          counterpartyId: document.counterpartyId,
          warehouseId: document.warehouseId,
          cashRegisterId: document.cashRegisterId,
          currencyId: document.currencyId,
          exchangeRate: document.exchangeRate ?? 0,
          receivableAccountId: document.receivableAccountId ?? null,
          vatAccountId: document.vatAccountId ?? null,
          comment: document.comment ?? "",
          stateId: document.stateId,
          payments: (document.payments ?? []).map((payment) => ({
            id: payment.id,
            paymentMethodId: payment.paymentMethodId,
            paymentMethodCode: payment.paymentMethodCode,
            paymentMethodName: payment.paymentMethodName,
            paymentAcceptancePointId: payment.paymentAcceptancePointId,
            debitAccountId: payment.debitAccountId,
            amount: payment.amount,
            transactionNumber: payment.transactionNumber ?? "",
          })),
        }
      : savedDraft?.values ?? openedDefaults,
    enableReinitialize: true,
    validationSchema: retailSaleSchema(t),
    onSubmit: async (values) => {
      const serviceError = serviceLinesError(services);
      if (serviceError) {
        toast.error(t(serviceError));
        return;
      }
      try {
        // a check of services only has no goods to validate
        if (products.length > 0 || services.length === 0)
          await saleDocLinesSchema(t, isEdit).validate(products, {
            abortEarly: false,
          });
      } catch (error) {
        if (error instanceof ValidationError) {
          toast.error(error.errors[0]);
        } else {
          toast.error(t("retailSale.messages.checkProductData"));
        }
        return;
      }

      // Turli partiyalarning tannarxi har xil bo'lishiga vaqtincha ruxsat berildi.
      // const costingError = getSaleCostingValidationError(
      //   {
      //     costingMethodId: activeSaleCondition.costingMethodId,
      //     products,
      //   },
      //   t,
      // );
      // if (costingError) {
      //   toast.error(costingError);
      //   return;
      // }
      // Markirovka soni va tovar soni tengligi tekshiruvi vaqtincha o'chirilgan.
      // if (markingMode && !hasRequiredSaleMarkings(products)) {
      //   toast.error(t("sale.messages.markingQuantityRequired"));
      //   return;
      // }

      try {
        if (isEdit && document) {
          await updateMutation.mutateAsync({
            id: document.id,
            payload: toRetailSaleUpdatePayload(
              values,
              allLines,
              markingMode,
            ),
          });
          toast.success(t("retailSale.messages.updated"));
          navigate(`/main/sales/retail-sale/${document.id}`);
          return;
        }

        setProcessingModeModalOpen(true);
      } catch (error) {
        errorHandlers(error);
      }
    },
  });

  useEffect(() => {
    if (isEdit || !saleCondition || draftPersistenceDisabled.current) return;

    const hasDraftContent = formik.dirty || products.length > 0 ||
      formik.values.payments.length > 0;
    if (!hasDraftContent) return;

    setSavedDraft({
      values: formik.values,
      products,
      services,
    });
  }, [
    formik.dirty,
    formik.values,
    isEdit,
    products,
    services,
    saleCondition,
    setSavedDraft,
  ]);

  useEffect(() => {
    const warehouseId = formik.values.warehouseId;
    if (
      previousWarehouseId.current !== null &&
      previousWarehouseId.current !== warehouseId
    ) {
      queueMicrotask(() => {
        setSelectedProducts([]);
        void formik.setFieldValue("cashRegisterId", null, false);
      });
    }
    previousWarehouseId.current = warehouseId;
  }, [formik, formik.values.warehouseId]);

  useEffect(() => {
    if (!isSaleConditionError || isEdit) return;
    toast.error(t("sale.messages.saleRuleMissing"));
    navigate(-1);
  }, [isEdit, isSaleConditionError, navigate, t]);

  // a posted or cancelled check is not edited: it opens as it stands
  if (isEdit && document && (document.statusId === 2 || document.statusId === 3)) {
    return <Navigate to={`/main/sales/retail-sale/${document.id}`} replace />;
  }

  if (
    (isEdit && (detailQuery.isLoading || !document)) ||
    isSaleConditionLoading ||
    !saleCondition
  ) {
    return (
      <div className="flex justify-center p-10">
        <Spin />
      </div>
    );
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleCreate = async (processingMode: RetailSaleProcessingMode) => {
    if (createMutation.isPending || isEdit) return;
    if (processingMode === 2 && !canConfirm) {
      toast.error(t("purchase.messages.confirmPermissionDenied"));
      return;
    }

    setProcessingModeModalOpen(false);
    try {
      await createMutation.mutateAsync(
        toRetailSaleCreatePayload(
          formik.values,
          allLines,
          processingMode,
          markingMode,
        ),
      );
      draftPersistenceDisabled.current = true;
      clearSavedDraft();
      toast.success(
        processingMode === 2
          ? t("retailSale.messages.confirmed")
          : t("retailSale.messages.created"),
      );
      navigate("/main/sales/retail-sale");
    } catch (error) {
      errorHandlers(error);
    }
  };

  return (
    <Form
      layout="vertical"
      onFinish={formik.handleSubmit}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.preventDefault();
      }}
    >
      <div className="space-y-3">
        <DocumentProcessingModeModal
          open={processingModeModalOpen}
          title={t("purchase.actions.saveDocument")}
          description={t("purchase.messages.chooseSaveMode")}
          saveLabel={t("purchase.actions.saveAsDraft")}
          saveAndConfirmLabel={t("purchase.actions.saveAndConfirm")}
          loading={createMutation.isPending}
          canConfirm={canConfirm}
          onClose={() => setProcessingModeModalOpen(false)}
          onSelect={(mode) => void handleCreate(mode)}
        />
        <RetailSaleFormFields
          vatPayer={vatPayer.isVatPayer}
          formik={formik}
          documentTypeId={retailSaleDocumentTypeIds.goods}
        />
        <RetailSalePayments
          formik={formik}
          totalAmount={roundMoney(saleTotalAmount + servicesTotal)}
          disabled={isSubmitting}
        />
        <SaleProductSelection
          vatPayer={vatPayer.isVatPayer}
          warehouseId={formik.values.warehouseId}
          comment={formik.values.comment}
          products={products}
          saleCondition={activeSaleCondition}
          onCommentChange={(comment) =>
            void formik.setFieldValue("comment", comment, false)
          }
          onChange={setSelectedProducts}
          onTotalsChange={handleSaleTotalChange}
          documentTypeId={retailSaleDocumentTypeIds.goods}
          markingMode={markingMode}
          onMarkingModeChange={setMarkingMode}
          aggregateStockMode
          disableMarkingQuantityValidation
          onCancel={() => navigate(-1)}
          submitting={isSubmitting}
          disabled={isSubmitting}
        />
        <SaleServiceLines
          lines={services}
          onChange={setSelectedServices}
          vatPayer={vatPayer.isVatPayer}
          disabled={isSubmitting}
        />
      </div>
    </Form>
  );
}
