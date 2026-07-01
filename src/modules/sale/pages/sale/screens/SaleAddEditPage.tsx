import { Button, Form, Spin } from "antd";
import dayjs from "dayjs";
import { useFormik } from "formik";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import toast from "react-hot-toast";
import { Save } from "lucide-react";
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
  SaleDocUpdateForm,
} from "../types/form";
import { saleDocSchema } from "../types/schema";
import type { SaleSelectedProduct } from "../types/type";
import {
  clearSaleDraft,
  getSaleDraft,
  getSaleConditionDraftKey,
  saveSaleDraft,
} from "../utils/saleDraft";

const defaultValues: SaleDocForm = {
  docDate: dayjs().format(formatDate),
  counterpartyId: null,
  contractId: null,
  warehouseId: null,
  currencyId: 1,
  comment: "",
  stateId: 1,
};

export default function SaleAddEditPage() {
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
          counterpartyId: document.counterpartyId,
          contractId: document.contractId ?? null,
          warehouseId: document.warehouseId,
          currencyId: document.currencyId,
          comment: document.comment,
          stateId: document.stateId,
        }
      : initialDraft?.form ?? defaultValues,
    enableReinitialize: true,
    validationSchema: saleDocSchema,
    onSubmit: async (values) => {
      const validProducts = products.filter(
        (product) => product.productId > 0 && product.quantity > 0,
      );
      if (!validProducts.length) {
        toast.error("Kamida bitta mahsulotni miqdori bilan kiriting");
        return;
      }
      if (products.some((product) => !product.productId)) {
        toast.error("Tanlangan mahsulotlarda productId topilmadi");
        return;
      }
      if (validProducts.some((product) => !product.unitId || product.unitId <= 0)) {
        toast.error("Tanlangan mahsulotlarda birlik topilmadi");
        return;
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
          const payload: SaleDocCreateForm = {
            counterpartyId: values.counterpartyId ?? 0,
            warehouseId: values.warehouseId ?? 0,
            currencyId: values.currencyId ?? 0,
            contractId: values.contractId,
            comment: values.comment || null,
            lines: validProducts.map((product) => ({
              productId: product.productId,
              quantity: product.quantity,
              costPrice: product.costPrice,
              unitId: product.unitId,
              unitPrice: product.unitPrice,
              vatRateId: product.vatRateId ?? null,
            })),
          };
          await createSale.mutateAsync(payload);
          clearSaleDraft(organizationId);
        }
        navigate("/main/sales/sale");
      } catch (error) {
        errorHandlers(error);
      }
    },
  });

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
        formik.resetForm({ values: defaultValues });
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
      saleConditionKey: saleConditionDraftKey,
    }),
    [formik.values, products, saleConditionDraftKey],
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
      toast.error("Sotuv qoidasi kiritilmagan");
      navigate(-1);
    }
  }, [
    isEdit,
    isSaleConditionError,
    isSaleConditionLoading,
    isSaleConditionSuccess,
    navigate,
    saleCondition,
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
          comment={formik.values.comment}
          products={products}
          saleCondition={activeSaleCondition}
          onCommentChange={(comment) =>
            formik.setFieldValue("comment", comment, false)
          }
          onChange={setSelectedProducts}
          disabled={createSale.isPending || updateSale.isPending}
        />
        <div className="flex justify-end">
          <Button
            type="primary"
            size="large"
            htmlType="submit"
            icon={<Save className="size-4" />}
            loading={createSale.isPending || updateSale.isPending}
          >
            Rasmiylashtirish
          </Button>
        </div>
      </div>
    </Form>
  );
}
