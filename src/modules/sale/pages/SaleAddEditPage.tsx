import { Button, Form, Statistic } from "antd";
import dayjs from "dayjs";
import { useFormik } from "formik";
import { Check, ScanBarcode } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import toast from "react-hot-toast";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import Card from "@/components/ui/card/Card";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { useAppSelector } from "@/store/hooks";
import { formatDate } from "@/utils/helpers";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { numberSpacing } from "@/utils/utils";
import { BarcodeScannerInput, SaleLinesTable } from "../components";
import {
  useBarcodeProduct,
  useCreateSaleLine,
  useDeleteSaleLine,
  useFinalizeSale,
  useGetDetailSale,
  useGetSaleLines,
  useUpdateSale,
  useUpdateSaleLine,
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
  lines: [
    {
      productTableId: null,
    },
  ],
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
      initialDraft?.lines.map((line) =>
        line.syncStatus === "pending"
          ? {
              ...line,
              syncStatus: "error",
              errorMessage: "Tekshiruv tugamagan. Qayta skanerlang",
            }
          : line,
      ) ?? null,
  );

  const documentQuery = useGetDetailSale(id);
  const linesQuery = useGetSaleLines(id);
  const document = isEdit ? (documentQuery.data ?? null) : null;
  const serverLines = linesQuery.data;
  const lines = useMemo(
    () => linesOverride ?? (isEdit ? (serverLines ?? []) : []),
    [isEdit, linesOverride, serverLines],
  );

  const finalizeSale = useFinalizeSale();
  const updateSale = useUpdateSale();
  const createLine = useCreateSaleLine();
  const updateLine = useUpdateSaleLine();
  const deleteLine = useDeleteSaleLine(document?.id ?? "");
  const markingLookup = useBarcodeProduct();

  const formik = useFormik<SaleDocForm>({
    initialValues: document
      ? {
          docDate: document.docDate,
          counterpartyId: document.counterpartyId,
          warehouseId: document.warehouseId,
          currencyId: document.currencyId,
          comment: document.comment,
          lines: document.lines,
        }
      : (initialDraft?.form ?? defaultValues),
    enableReinitialize: true,
    validationSchema: saleDocSchema,
    onSubmit: async (values) => {
      // const pendingCount = lines.filter(
      //   (line) => line.syncStatus === "pending",
      // ).length;
      const errorCount = lines.filter(
        (line) => line.syncStatus === "error",
      ).length;

      if (!lines.length) {
        toast.error("Kamida bitta mahsulot kiriting");
        return;
      }
      // if (pendingCount) {
      //   toast.error("Mahsulotlar tekshiruvi tugashini kuting");
      //   return;
      // }
      if (errorCount) {
        toast.error("Xato markirovkalarni o'chiring yoki qayta skanerlang");
        return;
      }

      try {
        const finalLinesForDocument = lines.map((line) => ({
          productTableId: line.productTableId,
        }));
        const finalValues = {
          ...values,
          lines: finalLinesForDocument,
        };
        const linePayloads = lines.map((line) => ({
          productTableId: line.productTableId,
          quantity: line.quantity,
          price: line.price,
          vatRateId: line.vatRateId,
        }));

        if (isEdit && document) {
          await updateSale.mutateAsync({
            id: document.id,
            payload: { ...finalValues, stateId: document.stateId ?? 1 },
          });
          const newLines = lines.filter((line) => line.id < 0);
          await Promise.all(
            newLines.map((line) =>
              createLine.mutateAsync({
                ownerId: document.id,
                productTableId: line.productTableId,
                quantity: line.quantity,
                price: line.price,
                vatRateId: line.vatRateId,
              }),
            ),
          );
        } else {
          await finalizeSale.mutateAsync({
            document: finalValues,
            lines: linePayloads,
          });
          localStorage.removeItem(draftKey(organizationId));
        }

        toast.success("Savdo muvaffaqiyatli yakunlandi");
        navigate("/main/sale");
      } catch (error) {
        errorHandlers(error);
      }
    },
  });

  useEffect(() => {
    if (isEdit) return;
    localStorage.setItem(
      draftKey(organizationId),
      JSON.stringify({ form: formik.values, lines } satisfies SaleDraft),
    );
  }, [formik.values, isEdit, lines, organizationId]);

  const handleScan = async (markingNumber: string) => {
    const normalizedMarking = markingNumber.trim();
    const existing = lines.find((line) => line.barcode === normalizedMarking);

    if (existing && existing.syncStatus !== "error") {
      toast.notify("Bu markirovka avval qo'shilgan");
      return;
    }

    const pendingId = existing?.id ?? -Date.now();
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

    setLinesOverride((current) => {
      const source = current ?? lines;
      return existing
        ? source.map((line) => (line.id === pendingId ? pendingLine : line))
        : [...source, pendingLine];
    });

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
                unitName: product.unitName,
                price: product.price,
                vatRateId: product.vatRateId,
                availableQuantity: product.availableQuantity,
                totalAmount: product.price,
                syncStatus: "confirmed",
                errorMessage: undefined,
              }
            : line,
        ),
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Mahsulotni tekshirib bo'lmadi";
      setLinesOverride((current) =>
        (current ?? []).map((line) =>
          line.id === pendingId
            ? {
                ...line,
                productName: "Mahsulot topilmadi",
                syncStatus: "error",
                errorMessage: message,
              }
            : line,
        ),
      );
      errorHandlers(error);
    }
  };

  const handleLineUpdate = async (
    line: SaleDocTable,
    changes: Pick<SaleDocTable, "quantity" | "price">,
  ) => {
    const previous = lines;
    const updated = {
      ...line,
      ...changes,
      totalAmount: changes.quantity * changes.price,
    };
    setLinesOverride(
      lines.map((item) => (item.id === line.id ? updated : item)),
    );

    if (!isEdit || line.id < 0 || !document) return;

    try {
      await updateLine.mutateAsync({
        id: line.id,
        payload: {
          ownerId: document.id,
          productTableId: line.productTableId,
          quantity: changes.quantity,
          price: changes.price,
          vatRateId: line.vatRateId,
        },
      });
    } catch (error) {
      setLinesOverride(previous);
      errorHandlers(error);
    }
  };

  const handleDelete = async (line: SaleDocTable) => {
    if (!isEdit || line.id < 0) {
      setLinesOverride(lines.filter((item) => item.id !== line.id));
      return;
    }

    try {
      await deleteLine.mutateAsync(line.id);
      setLinesOverride(lines.filter((item) => item.id !== line.id));
      toast.success("Mahsulot o'chirildi");
    } catch (error) {
      errorHandlers(error);
    }
  };

  const totalAmount = lines.reduce(
    (sum, line) => sum + line.quantity * line.price,
    0,
  );
  const pendingCount = lines.filter(
    (line) => line.syncStatus === "pending",
  ).length;
  const isSubmitting =
    finalizeSale.isPending ||
    updateSale.isPending ||
    createLine.isPending ||
    updateLine.isPending ||
    deleteLine.isPending;
  console.log(formik.values.lines);

  return (
    <Form
      layout="vertical"
      onFinish={formik.handleSubmit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
        }
      }}
    >
      <div className="space-y-3">
        <div className="grid gap-x-3 border-b border-border pb-3 sm:grid-cols-2 xl:grid-cols-4">
          <SelectDate
            label="Sana"
            fieldName="docDate"
            formik={formik}
            required
          />
          <SelectCustom
            label="Kontragent"
            fieldName="counterpartyId"
            path={selectListEndpoints.counterpartiesSelectList}
            formik={formik}
            search
            required
          />
          <SelectCustom
            label="Ombor"
            fieldName="warehouseId"
            path={selectListEndpoints.warehousesSelectList}
            formik={formik}
            required
          />
          <SelectCustom
            label="Valyuta"
            fieldName="currencyId"
            path={selectListEndpoints.currenciesSelectList}
            formik={formik}
            getFirst
            required
          />
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-semibold">
              <ScanBarcode className="size-5 text-blue-600" />
              Mahsulot skaneri
            </div>
            <BarcodeScannerInput onScan={handleScan} />
          </div>
          <div className="grid grid-cols-3 gap-3 border-l border-border pl-3">
            <Statistic title="Mahsulotlar" value={lines.length} />
            <Statistic title="Kutilmoqda" value={pendingCount} />
            <Statistic title="Jami" value={numberSpacing(totalAmount)} />
          </div>
        </div>

        <Card className="overflow-hidden border border-border">
          <SaleLinesTable
            lines={lines}
            loading={linesQuery.isLoading}
            onUpdate={handleLineUpdate}
            onDelete={handleDelete}
          />
        </Card>

        <div className="flex justify-end">
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            icon={<Check className="size-4" />}
            loading={isSubmitting}
          >
            Yakunlash
          </Button>
        </div>
      </div>
    </Form>
  );
}
