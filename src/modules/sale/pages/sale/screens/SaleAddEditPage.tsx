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
  saveSaleDraft,
} from "../utils/saleDraft";

const defaultValues: SaleDocForm = {
  docDate: dayjs().format(formatDate),
  counterpartyId: null,
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

  const { data: document, isLoading: isDocumentLoading } =
    useGetDetailSale(id);
  const createSale = useCreateSale();
  const updateSale = useUpdateSale();

  const savedProducts = useMemo<SaleSelectedProduct[]>(() => {
    const products = document?.products ?? [];
    if (products.length) {
      return products.map((product) => ({
        id: product.id,
        productId: product.productId,
        productName: product.productName,
        quantity: product.quantity,
        availableQuantity: product.quantity,
        unitPrice: product.unitPrice || product.amount || 0,
        unitName: product.unitName,
        vatRateId: product.vatRateId,
      }));
    }

    return (document?.lines ?? []).map((line) => ({
      id: line.id,
      productId: line.productId,
      productName: line.productName,
      quantity: line.quantity,
      availableQuantity: line.quantity,
      unitPrice: line.price || line.amount || 0,
      unitName: line.unitName,
      vatRateId: line.vatRateId,
    }));
  }, [document?.lines, document?.products]);

  const products = useMemo(
    () => selectedProducts ?? (isEdit ? savedProducts : []),
    [isEdit, savedProducts, selectedProducts],
  );

  const formik = useFormik<SaleDocForm>({
    initialValues: document
      ? {
          docDate: document.docDate,
          counterpartyId: document.counterpartyId,
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
      // if (!validProducts.length) {
      //   toast.error("Kamida bitta mahsulotni miqdori bilan kiriting");
      //   return;
      // }
      if (products.some((product) => !product.productId)) {
        toast.error("Tanlangan mahsulotlarda productId topilmadi");
        return;
      }

      try {
        if (isEdit && document) {
          const payload: SaleDocUpdateForm = {
            docDate: values.docDate,
            counterpartyId: values.counterpartyId ?? document.counterpartyId,
            warehouseId: values.warehouseId ?? document.warehouseId,
            currencyId: values.currencyId ?? document.currencyId,
            comment: values.comment || null,
            stateId: values.stateId ?? document.stateId,
            products: validProducts.map((product) => ({
              id: product.id,
              productId: product.productId,
              quantity: product.quantity,
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
            comment: values.comment || null,
            products: validProducts.map((product) => ({
              productId: product.productId,
              quantity: product.quantity,
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

  const draftValue = useMemo(
    () => ({
      form: formik.values,
      products,
    }),
    [formik.values, products],
  );
  const draft = useDebounce(draftValue, 300);
  useEffect(() => {
    if (!isEdit) saveSaleDraft(organizationId, draft);
  }, [draft, isEdit, organizationId]);

  if (isEdit && isDocumentLoading) {
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
          products={products}
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
