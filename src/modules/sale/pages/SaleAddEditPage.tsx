import { Form } from "antd";
import dayjs from "dayjs";
import { useFormik } from "formik";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import toast from "react-hot-toast";
import Card from "@/components/ui/card/Card";
import { useAppSelector } from "@/store/hooks";
import { formatDate } from "@/utils/helpers";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import {
  SaleDocumentFields,
  SaleLinesTable,
  SaleScannerPanel,
  SaleSummaryPanel,
} from "../components";
import {
  useBarcodeProduct,
  useFinalizeSale,
  useGetDetailSale,
  useGetSaleLines,
  useUpdateSale,
} from "../hooks";
import { saleDocSchema } from "../types/schema";
import type { SaleDocForm, SaleDocTable } from "../types/type";

const defaultValues: SaleDocForm = {
  docDate: dayjs().format(formatDate),
  counterpartyId: null,
  warehouseId: null,
  currencyId: 1,
  comment: "",
  stateId: 1,
  lines: [],
};

interface SaleDraft {
  form: SaleDocForm;
  lines: SaleDocTable[];
}

const draftKey = (organizationId: number) =>
  `accounting:sale-draft:${organizationId || "default"}`;

const readDraft = (organizationId: number): SaleDraft | null => {
  try {
    const value = localStorage.getItem(draftKey(organizationId));
    if (!value) return null;
    return JSON.parse(value) as SaleDraft;
  } catch {
    return null;
  }
};

export default function SaleAddEditPage() {
  const navigate = useNavigate();
  const { id = "" } = useParams();
  const isEdit = Boolean(id);
  const organizationId = useAppSelector((state) => state.organization.id);
  const [initialDraft] = useState(() =>
    isEdit ? null : readDraft(organizationId),
  );
  const [linesOverride, setLinesOverride] = useState<SaleDocTable[] | null>(
    () =>
      initialDraft?.lines.filter(
        (line) => line.syncStatus === "confirmed",
      ) ?? null,
  );

  const documentQuery = useGetDetailSale(id);
  const linesQuery = useGetSaleLines(id);
  const document = isEdit ? documentQuery.data ?? null : null;
  const serverLines = linesQuery.data;
  const lines = useMemo(
    () => linesOverride ?? (isEdit ? serverLines ?? [] : []),
    [isEdit, linesOverride, serverLines],
  );

  const finalizeSale = useFinalizeSale();
  const updateSale = useUpdateSale();
  const markingLookup = useBarcodeProduct();

  const formik = useFormik<SaleDocForm>({
    initialValues: document
      ? {
          docDate: document.docDate,
          counterpartyId: document.counterpartyId,
          warehouseId: document.warehouseId,
          currencyId: document.currencyId,
          comment: document.comment,
          stateId: document.stateId ?? 1,
          lines: document.lines ?? [],
        }
      : initialDraft?.form ?? defaultValues,
    enableReinitialize: true,
    validationSchema: saleDocSchema,
    onSubmit: async (values) => {
      if (!lines.length) {
        toast.error("Kamida bitta mahsulot kiriting");
        return;
      }
      if (lines.some((line) => line.syncStatus === "pending")) {
        toast.error("Mahsulotlar tekshiruvi tugashini kuting");
        return;
      }

      const payload: SaleDocForm = {
        ...values,
        lines: lines.map((line) => ({
          productTableId: line.productTableId,
        })),
      };

      try {
        if (isEdit && document) {
          await updateSale.mutateAsync({
            id: document.id,
            payload: {
              docDate: values.docDate,
              counterpartyId: values.counterpartyId,
              warehouseId: values.warehouseId,
              currencyId: values.currencyId,
              comment: values.comment,
              stateId: values.stateId ?? document.stateId ?? 1,
              lines: lines.map((line) => ({
                productId: line.productId ?? 0,
                markingNumber: line.barcode,
                serialNumber: line.serialNumber ?? null,
                price: line.price,
                vatRateId: line.vatRateId,
              })),
            },
          });
        } else {
          await finalizeSale.mutateAsync(payload);
          localStorage.removeItem(draftKey(organizationId));
          toast.success("Sotuv muvaffaqiyatli saqlandi");
        }
        navigate("/main/sale");
      } catch (error) {
        errorHandlers(error);
      }
    },
  });

  useEffect(() => {
    if (isEdit) return;
    const confirmedLines = lines.filter(
      (line) => line.syncStatus === "confirmed",
    );
    localStorage.setItem(
      draftKey(organizationId),
      JSON.stringify({
        form: {
          ...formik.values,
          lines: confirmedLines.map((line) => ({
            productTableId: line.productTableId,
          })),
        },
        lines: confirmedLines,
      } satisfies SaleDraft),
    );
  }, [formik.values, isEdit, lines, organizationId]);

  const handleScan = async (markingNumber: string) => {
    const normalizedMarking = markingNumber.trim();
    if (lines.some((line) => line.barcode === normalizedMarking)) {
      toast.error("Bu markirovka avval qo'shilgan");
      return;
    }

    const pendingId = -Date.now();
    const pendingLine: SaleDocTable = {
      id: pendingId,
      ownerId: document?.id ?? 0,
      productTableId: 0,
      productName: "Tekshirilmoqda...",
      barcode: normalizedMarking,
      quantity: 1,
      price: 0,
      vatRateId: null,
      totalAmount: 0,
      syncStatus: "pending",
    };

    setLinesOverride((current) => [...(current ?? lines), pendingLine]);

    try {
      const product = await markingLookup.mutateAsync(normalizedMarking);
      if (!product) throw new Error("Mahsulot topilmadi");

      setLinesOverride((current) =>
        (current ?? []).map((line) =>
          line.id === pendingId
            ? {
                ...line,
                productId: product.productId,
                productTableId: product.productTableId,
                productName: product.productName,
                barcode: product.barcode,
                serialNumber: product.serialNumber,
                unitName: product.unitName,
                price: product.price,
                vatRateId: product.vatRateId,
                availableQuantity: product.availableQuantity,
                totalAmount: product.price,
                syncStatus: "confirmed",
              }
            : line,
        ),
      );
    } catch (error) {
      setLinesOverride((current) =>
        (current ?? []).filter((line) => line.id !== pendingId),
      );
      errorHandlers(error);
    }
  };

  const handleLineUpdate = async (
    line: SaleDocTable,
    changes: Pick<SaleDocTable, "quantity" | "price">,
  ) => {
    const updated = {
      ...line,
      ...changes,
      totalAmount: changes.quantity * changes.price,
    };
    setLinesOverride(
      lines.map((item) => (item.id === line.id ? updated : item)),
    );
  };

  const handleDelete = (line: SaleDocTable) => {
    setLinesOverride(lines.filter((item) => item.id !== line.id));
  };

  const confirmedLines = lines.filter(
    (line) => line.syncStatus !== "pending",
  );
  const pendingCount = lines.length - confirmedLines.length;
  const totalQuantity = confirmedLines.reduce(
    (sum, line) => sum + line.quantity,
    0,
  );
  const totalAmount = confirmedLines.reduce(
    (sum, line) => sum + line.quantity * line.price,
    0,
  );
  const isSubmitting =
    finalizeSale.isPending || updateSale.isPending;

  return (
    <Form
      layout="vertical"
      onFinish={formik.handleSubmit}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.preventDefault();
      }}
    >
      <div className="space-y-3">
        <SaleDocumentFields formik={formik} />

        <div className="grid items-start gap-3 xl:grid-cols-[minmax(0,1fr)_240px]">
          <div className="min-w-0 space-y-3">
            <SaleScannerPanel onScan={handleScan} />
            <Card className="overflow-hidden border border-border">
              <SaleLinesTable
                lines={lines}
                loading={linesQuery.isLoading}
                onUpdate={handleLineUpdate}
                onDelete={handleDelete}
              />
            </Card>
          </div>
          <SaleSummaryPanel
            positionCount={confirmedLines.length}
            totalQuantity={totalQuantity}
            totalAmount={totalAmount}
            pendingCount={pendingCount}
            loading={isSubmitting}
          />
        </div>
      </div>
    </Form>
  );
}
