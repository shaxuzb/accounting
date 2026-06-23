import { Form } from "antd";
import dayjs from "dayjs";
import { useFormik } from "formik";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import toast from "react-hot-toast";
import Card from "@/components/ui/card/Card";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { useAppSelector } from "@/store/hooks";
import { formatDate } from "@/utils/helpers";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import {
  SaleBarcodeScanner,
  SaleDocumentFormFields,
  SaleDraftSummary,
  ScannedProductsTable,
} from "../components";
import {
  useCreateSale,
  useGetDetailSale,
  useGetProductByMarking,
  useGetSaleLines,
  useUpdateSale,
} from "../hooks";
import type {
  SaleDocCreateForm,
  SaleDocForm,
  SaleDocUpdateForm,
} from "../types/form";
import { saleDocSchema } from "../types/schema";
import type { SaleScannedProduct } from "../types/type";
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
  const [scannedProducts, setScannedProducts] = useState<
    SaleScannedProduct[] | null
  >(() => initialDraft?.lines ?? null);

  const { data: document } = useGetDetailSale(id);
  const { data: saleDocTables, isLoading: isLinesLoading } =
    useGetSaleLines(id);
  const createSale = useCreateSale();
  const updateSale = useUpdateSale();
  const getProductByMarking = useGetProductByMarking();

  const savedProducts = useMemo<SaleScannedProduct[]>(
    () =>
      (saleDocTables?.items ?? document?.lines ?? []).map((line) => ({
        scanId: line.id,
        productTableId: line.productTableId,
        productId: line.productId,
        productName: line.productName,
        markingNumber: line.markingNumber,
        serialNumber: line.serialNumber,
        unitName: line.unitName,
        price: line.price,
        vatRateId: line.vatRateId,
        scanStatus: "confirmed",
      })),
    [document?.lines, saleDocTables?.items],
  );
  const products = useMemo(
    () => scannedProducts ?? (isEdit ? savedProducts : []),
    [isEdit, savedProducts, scannedProducts],
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
      if (!isEdit && !products.length) {
        toast.error("Kamida bitta mahsulot kiriting");
        return;
      }
      if (products.some((product) => product.scanStatus === "pending")) {
        toast.error("Mahsulotlar tekshiruvi tugashini kuting");
        return;
      }

      const confirmedProducts = products.filter(
        (product) => product.scanStatus === "confirmed",
      );
      const createLines = confirmedProducts
        .map((product) => ({
          productTableId: Number(product.productTableId || 0),
        }))
        .filter((line) => line.productTableId > 0);

      if (createLines.length !== confirmedProducts.length) {
        toast.error("Mahsulot ma'lumotlari to'liq emas, qayta skaner qiling");
        return;
      }

      try {
        if (isEdit && document) {
          const payload: SaleDocUpdateForm = {
            docDate: values.docDate,
            counterpartyId: values.counterpartyId ?? 0,
            warehouseId: values.warehouseId ?? 0,
            currencyId: values.currencyId ?? 0,
            comment: values.comment,
            stateId: values.stateId ?? document.stateId,
            lines: confirmedProducts.map((product) => ({
              id: product.scanId,
              productTableId: product.productTableId,
              productId: product.productId,
              markingNumber: product.markingNumber,
              serialNumber: product.serialNumber,
              price: product.price ?? 0,
              vatRateId: product.vatRateId ?? null,
            })),
          };
          await updateSale.mutateAsync({ id: document.id, payload });
        } else {
          const payload: SaleDocCreateForm = {
            docDate: values.docDate,
            counterpartyId: values.counterpartyId ?? 0,
            warehouseId: values.warehouseId ?? 0,
            currencyId: values.currencyId ?? 0,
            comment: values.comment,
            lines: createLines,
          };
          await createSale.mutateAsync(payload);
          clearSaleDraft(organizationId);
        }
        navigate("/main/sale");
        if (isEdit) {
          toast.success("Sotuv hujjati muvaffaqiyatli yangilandi");
        } else {
          toast.success("Sotuv hujjati muvaffaqiyatli yaratildi");
        }
      } catch (error) {
        errorHandlers(error);
      }
    },
  });

  const draftValue = useMemo(
    () => ({
      form: formik.values,
      lines: products.filter((product) => product.scanStatus === "confirmed"),
    }),
    [formik.values, products],
  );
  const draft = useDebounce(draftValue, 300);
  useEffect(() => {
    if (!isEdit) saveSaleDraft(organizationId, draft);
  }, [draft, isEdit, organizationId]);

  const handleScan = async (markingNumber: string) => {
    const code = markingNumber.trim();
    if (products.some((product) => product.markingNumber === code)) {
      toast.error("Bu markirovka avval qo'shilgan");
      return;
    }

    const scanId = -Date.now();
    const pendingProduct: SaleScannedProduct = {
      scanId,
      productTableId: 0,
      productId: 0,
      productName: "Tekshirilmoqda...",
      markingNumber: code,
      serialNumber: "",
      scanStatus: "pending",
    };
    setScannedProducts((current) => [
      ...(current ?? products),
      pendingProduct,
    ]);

    try {
      const product = await getProductByMarking.mutateAsync(code);
      const productTableId = Number(product.productTableId ?? product.id ?? 0);

      if (!productTableId) {
        setScannedProducts((current) =>
          (current ?? []).filter((item) => item.scanId !== scanId),
        );
        toast.error("Mahsulot jadvali ID topilmadi");
        return;
      }

      setScannedProducts((current) =>
        (current ?? []).map((item) =>
          item.scanId === scanId
            ? {
                scanId,
                productTableId,
                productId: product.productId,
                productName: product.productName,
                markingNumber: product.markingNumber || code,
                serialNumber: product.serialNumber,
                unitName: product.unitName,
                price: product.price,
                vatRateId: product.vatRateId,
                scanStatus: "confirmed",
              }
            : item,
        ),
      );
    } catch (error) {
      setScannedProducts((current) =>
        (current ?? []).filter((product) => product.scanId !== scanId),
      );
      errorHandlers(error);
    }
  };

  const confirmedProducts = products.filter(
    (product) => product.scanStatus === "confirmed",
  );
  const totalAmount = confirmedProducts.reduce(
    (sum, product) => sum + (product.price ?? 0),
    0,
  );

  return (
    <Form
      layout="vertical"
      onFinish={formik.handleSubmit}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.preventDefault();
      }}
    >
      <div className="space-y-3">
        <SaleDocumentFormFields formik={formik} isEdit={isEdit} />
        <div className="grid items-start gap-3 xl:grid-cols-[minmax(0,1fr)_240px]">
          <div className="min-w-0 space-y-3">
            <SaleBarcodeScanner onScan={handleScan} />
            <Card className="overflow-hidden border border-border">
              <ScannedProductsTable
                products={products}
                loading={isLinesLoading}
                onDelete={(product) =>
                  setScannedProducts(
                    products.filter((item) => item.scanId !== product.scanId),
                  )
                }
              />
            </Card>
          </div>
          <SaleDraftSummary
            positionCount={confirmedProducts.length}
            totalQuantity={confirmedProducts.length}
            totalAmount={totalAmount}
            pendingCount={products.length - confirmedProducts.length}
            loading={createSale.isPending || updateSale.isPending}
            isEdit={isEdit}
          />
        </div>
      </div>
    </Form>
  );
}
