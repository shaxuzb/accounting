import { Form } from "antd";
import { useFormik } from "formik";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ClipboardEvent,
  type Dispatch,
  type SetStateAction,
} from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import useWindowSize from "@/shared/hooks/useWindowSize";
import type {
  PurchaseImportRow,
  PurchaseMode,
  SelectBoxOptions,
} from "../types/type";
import type {
  PurchaseImportForm,
  PurchaseImportHeaderDraft,
} from "@/modules/purchase/pages/purchase/types/form";
import {
  purchaseValidationSchema,
  isCompletePurchaseLine,
} from "@/modules/purchase/pages/purchase/types/schema";
import PurchaseImportHeader from "../components/PurchaseImportHeader";
import ProductsCreateModal from "../components/ProductsCreateModal";
import PurchaseImportLinesSection from "../components/PurchaseImportLinesSection";
import PurchaseMarkingModal from "../components/PurchaseMarkingModal";
import {
  buildColumnConfig,
  getBaseColumnConfig,
  numericImportColumns,
  toSelectBoxOptions,
  type ImportColumnConfig,
} from "../utils/importColumns";
import { useCreatePurchase } from "../hooks/useCreatePurchase";
import { usePurchaseImportOptions } from "../hooks/usePurchaseImportOptions";
import { usePurchaseImportColumns } from "../hooks/usePurchaseImportColumns";
import useLocalStorage from "@/hooks/UseLocalStorage";
import {
  createEmptyPurchaseRow,
  getDefaultPurchaseImportHeader,
  getNumber,
  getProductCode,
  getProductPrice,
  getPurchaseImportTotals,
  getUnmarkedPieceTrackedRow,
  parseMarkingInput,
  toMarkingNumbers,
  toPurchaseCreatePayload,
} from "../utils/purchaseImport";

const PURCHASE_IMPORT_DRAFT_HEADER_KEY = "purchase-import:draft:header";
const PURCHASE_IMPORT_DRAFT_LINES_KEY = "purchase-import:draft:lines";
const PURCHASE_IMPORT_DRAFT_PRODUCT_WITH_COUNT_KEY =
  "purchase-import:draft:product-with-count";
const PURCHASE_IMPORT_DRAFT_MODE_KEY = "purchase-import:draft:mode";

const PurchaseImportPage = () => {
  const navigate = useNavigate();
  // const org = useAppSelector((state) => state.organization);
  const [headerDraft, setHeaderDraft] =
    useLocalStorage<PurchaseImportHeaderDraft>(
      PURCHASE_IMPORT_DRAFT_HEADER_KEY,
      getDefaultPurchaseImportHeader(),
    );
  const [excelData, setExcelData] = useLocalStorage<PurchaseImportRow[]>(
    PURCHASE_IMPORT_DRAFT_LINES_KEY,
    [],
  );
  // const [openSupplier, setOpenSupplier] = useState(false);
  const [productWithCount, setProductWithCount] = useLocalStorage<boolean>(
    PURCHASE_IMPORT_DRAFT_PRODUCT_WITH_COUNT_KEY,
    false,
  );
  const [withDiscount, _setWithWithDiscount] = useState(false);
  const [purchaseMode, setPurchaseMode] = useLocalStorage<PurchaseMode>(
    PURCHASE_IMPORT_DRAFT_MODE_KEY,
    "goods",
  );
  const { height } = useWindowSize();
  const importPurchase = useCreatePurchase();
  // Asosiy column konfiguratsiyasini olish
  const baseColumnConfig = useMemo(
    () => getBaseColumnConfig(productWithCount, withDiscount),
    [productWithCount, withDiscount],
  );

  // SelectBox options ni column konfiguratsiyasidan yaratish
  const [selectBoxOptions, setSelectBoxOptions] = useState<SelectBoxOptions[]>(
    () => toSelectBoxOptions(baseColumnConfig),
  );
  const [productCreateOpen, setProductCreateOpen] = useState(false);
  const [missingProductRows, setMissingProductRows] = useState<
    PurchaseImportRow[]
  >([]);
  const [markingRowIndex, setMarkingRowIndex] = useState<number | null>(null);
  const [markingInput, setMarkingInput] = useState("");

  const columnConfig = useMemo<ImportColumnConfig[]>(
    () => buildColumnConfig(baseColumnConfig, selectBoxOptions),
    [baseColumnConfig, selectBoxOptions],
  );

  const initialLines = useMemo(
    () =>
      excelData.length
        ? excelData
        : [
            createEmptyPurchaseRow({
              indexId: 1,
              counterpartyId: headerDraft.counterpartyId,
              currencyId: headerDraft.currencyId,
              purchaseMode,
              productWithCount,
            }),
          ],
    [
      excelData,
      headerDraft.counterpartyId,
      headerDraft.currencyId,
      purchaseMode,
      productWithCount,
    ],
  );

  const formik = useFormik<PurchaseImportForm>({
    initialValues: {
      ...headerDraft,
      lines: initialLines,
      // newProducts: productWithCount ? excelData : [],
      // newSerialProducts: !productWithCount ? excelData : [],
    },
    validationSchema: purchaseValidationSchema,
    onSubmit: async (values, helpers) => {
      const completedRows = values.lines.filter(isCompletePurchaseLine);
      const unmarkedRow = getUnmarkedPieceTrackedRow(
        completedRows,
        purchaseMode,
      );

      if (unmarkedRow) {
        toast.error(
          `${unmarkedRow.product || unmarkedRow.productName || "Mahsulot"} uchun markirovka kiriting`,
        );
        return;
      }

      // Swagger DTO — PurchaseDocLineDto:
      // { productId, quantity, unitId, unitPrice, vatRateId, items: [{markingNumber, serialNumber}] | null }
      const payload = toPurchaseCreatePayload(
        values,
        completedRows,
        purchaseMode,
      );
      // Servislar (Приход услуг) — bir xil lines[] ga qo'shiladi, items=null
      if (!payload.lines.length) {
        toast.error("Kamida bitta mahsulot yoki xizmat kiriting");
        return;
      }

      await importPurchase.mutateAsync(payload);
      const defaultHeader = getDefaultPurchaseImportHeader();
      const defaultLines = [
        createEmptyPurchaseRow({
          indexId: 1,
          counterpartyId: defaultHeader.counterpartyId,
          currencyId: defaultHeader.currencyId,
          purchaseMode: "goods",
          productWithCount: false,
        }),
      ];
      setHeaderDraft(defaultHeader);
      setExcelData(defaultLines);
      setProductWithCount(false);
      setPurchaseMode("goods");
      helpers.resetForm({
        values: {
          ...defaultHeader,
          lines: defaultLines,
        },
      });
      navigate(-1);
    },
  });

  const setDraftFieldValue: typeof formik.setFieldValue = useCallback(
    (field, value, shouldValidate) => {
      if (
        field === "docDate" ||
        field === "counterpartyId" ||
        field === "contractId" ||
        field === "currencyId" ||
        field === "warehouseId" ||
        field === "comment"
      ) {
        setHeaderDraft((prev) => ({
          ...prev,
          [field]: value,
        }));
      }
      if (field === "lines" && Array.isArray(value)) {
        setExcelData(value as PurchaseImportRow[]);
      }

      return formik.setFieldValue(field, value, shouldValidate);
    },
    [formik, setExcelData, setHeaderDraft],
  );

  const draftFormik = useMemo(
    () => ({
      ...formik,
      setFieldValue: setDraftFieldValue,
    }),
    [formik, setDraftFieldValue],
  );

  const {
    data,
    isFetching,
    isLoading,
    isServicesLoading,
    isServicesSuccess,
    isSuccess,
    itemOptions,
    productByCode,
    productIdBySapCode,
    refetchProducts,
    unitOptions,
    vatRateOptions,
  } = usePurchaseImportOptions(purchaseMode);

  const resolveProductIds = useCallback(
    (rows: PurchaseImportRow[]) =>
      rows.map((item) => {
        const product = productByCode.get(String(item.sapCode ?? "").trim());
        const unitPrice = getProductPrice(product);
        return {
          ...item,
          productId: item.productId ?? product?.id ?? null,
          product: item.product || product?.name || "",
          productName: item.productName || product?.name || "",
          name: item.name || product?.name || "",
          mxik: item.mxik ?? product?.mxik ?? getProductCode(product),
          unitId: item.unitId ?? product?.unitId ?? null,
          unitCode: item.unitCode ?? product?.unitCode ?? null,
          unitName: item.unitName ?? product?.unitName ?? product?.unit ?? null,
          price: item.price || unitPrice || null,
          pricePerUom: item.pricePerUom || unitPrice || null,
          isPieceTracked: Boolean(product?.isPieceTracked),
          ...(product?.isPieceTracked
            ? {}
            : {
                markingNumber: "",
                markingNumbers: [],
              }),
        };
      }),
    [productByCode],
  );

  const commitRows = useCallback(
    (rows: PurchaseImportRow[]) => {
      setExcelData(rows);
      formik.setFieldValue("lines", rows, false);
    },
    [formik, setExcelData],
  );

  const handleRowValueChange = useCallback(
    (rowIndex: number, patch: Partial<PurchaseImportRow>) => {
      const nextRows = formik.values.lines.map((item, index) =>
        index === rowIndex ? { ...item, ...patch } : item,
      );
      commitRows(nextRows);
    },
    [commitRows, formik.values.lines],
  );

  const handleItemSelect = useCallback(
    (rowIndex: number, value: number) => {
      const currentRows = formik.values.lines;
      const selected = itemOptions.find((item) => item.id === value);
      const productCode = getProductCode(selected);
      const unitPrice = getProductPrice(selected);
      const isPieceTracked =
        purchaseMode === "goods" && Boolean(selected?.isPieceTracked);
      const currentMarkings = toMarkingNumbers(currentRows[rowIndex]);
      handleRowValueChange(rowIndex, {
        productId: value,
        product: selected?.name ?? "",
        productName: selected?.name ?? "",
        name: selected?.name ?? "",
        sapCode: productCode || currentRows[rowIndex]?.sapCode || "",
        mxik: selected?.mxik ?? productCode,
        unitId: selected?.unitId ?? (currentRows[rowIndex]?.unitId as number | null),
        unitCode: selected?.unitCode ?? null,
        unitName: selected?.unitName ?? selected?.unit ?? null,
        price: unitPrice || currentRows[rowIndex]?.price || null,
        pricePerUom: unitPrice || currentRows[rowIndex]?.pricePerUom || null,
        isPieceTracked,
        qty: isPieceTracked
          ? currentMarkings.length
          : currentRows[rowIndex]?.qty,
        markingNumber: isPieceTracked
          ? currentRows[rowIndex]?.markingNumber
          : "",
        markingNumbers: isPieceTracked ? currentMarkings : [],
      });
    },
    [formik.values.lines, handleRowValueChange, itemOptions, purchaseMode],
  );

  const openMarkingModal = useCallback((rowIndex: number) => {
    if (!formik.values.lines[rowIndex]?.isPieceTracked) {
      toast.error("Bu mahsulot markirovkasiz");
      return;
    }
    setMarkingRowIndex(rowIndex);
    setMarkingInput("");
  }, [formik.values.lines]);

  const closeMarkingModal = useCallback(() => {
    setMarkingRowIndex(null);
    setMarkingInput("");
  }, []);

  const updateRowMarkings = useCallback(
    (rowIndex: number, markingNumbers: string[]) => {
      handleRowValueChange(rowIndex, {
        markingNumbers,
        markingNumber: markingNumbers.join("\n"),
        qty: markingNumbers.length,
      });
    },
    [handleRowValueChange],
  );

  const handleAddMarking = useCallback(() => {
    if (markingRowIndex === null) return;
    const nextMarkings = parseMarkingInput(markingInput);
    if (!nextMarkings.length) return;

    const current = toMarkingNumbers(formik.values.lines[markingRowIndex]);
    const currentSet = new Set(current);
    const uniqueMarkings = nextMarkings.filter((marking) => {
      if (currentSet.has(marking)) return false;
      currentSet.add(marking);
      return true;
    });

    if (!uniqueMarkings.length) {
      toast.error("Kiritilgan markirovkalar avval qo'shilgan");
      return;
    }

    updateRowMarkings(markingRowIndex, [...current, ...uniqueMarkings]);
    setMarkingInput("");
  }, [formik.values.lines, markingInput, markingRowIndex, updateRowMarkings]);

  const handleMarkingPaste = useCallback(
    (event: ClipboardEvent<HTMLInputElement>) => {
      const pastedText = event.clipboardData.getData("text");
      const pastedMarkings = parseMarkingInput(pastedText);

      if (pastedMarkings.length < 2) return;

      event.preventDefault();
      setMarkingInput((prev) =>
        [...parseMarkingInput(prev), ...pastedMarkings].join(" "),
      );
    },
    [],
  );

  const handleRemoveMarking = useCallback(
    (marking: string) => {
      if (markingRowIndex === null) return;
      const nextMarkings = toMarkingNumbers(
        formik.values.lines[markingRowIndex],
      ).filter((item) => item !== marking);
      updateRowMarkings(markingRowIndex, nextMarkings);
    },
    [formik.values.lines, markingRowIndex, updateRowMarkings],
  );

  const handleExcelDataChange = useCallback<
    Dispatch<SetStateAction<PurchaseImportRow[]>>
  >(
    (value) => {
      setExcelData((prev) => {
        const nextRaw = typeof value === "function" ? value(prev) : value;
        const nextRows = resolveProductIds(nextRaw);
        formik.setFieldValue("lines", nextRows, false);
        return nextRows;
      });
    },
    [formik, resolveProductIds, setExcelData],
  );

  const handleAddManualRow = useCallback(() => {
    const indexId = formik.values.lines.length + 1;
    commitRows([
      ...formik.values.lines,
      createEmptyPurchaseRow({
        indexId,
        counterpartyId: formik.values.counterpartyId,
        currencyId: formik.values.currencyId,
        purchaseMode,
        productWithCount,
      }),
    ]);
  }, [
    commitRows,
    formik.values.counterpartyId,
    formik.values.currencyId,
    formik.values.lines,
    purchaseMode,
    productWithCount,
  ]);

  const handleDeleteRow = useCallback(
    (rowIndex: number) => {
      const nextRows = formik.values.lines
        .filter((_, index) => index !== rowIndex)
        .map((item, index) => ({
          ...item,
          indexId: index + 1,
        }));
      commitRows(
        nextRows.length
          ? nextRows
          : [
              createEmptyPurchaseRow({
                indexId: 1,
                counterpartyId: formik.values.counterpartyId,
                currencyId: formik.values.currencyId,
                purchaseMode,
                productWithCount,
              }),
            ],
      );
    },
    [
      commitRows,
      formik.values.counterpartyId,
      formik.values.currencyId,
      formik.values.lines,
      purchaseMode,
      productWithCount,
    ],
  );

  // Table columnlarni yaratish
  const handleCellCommit = useCallback(
    (rowIndex: number, dataIndex: string, rawValue: string) => {
      const currentRows = formik.values.lines;

      if (!currentRows[rowIndex]) {
        return;
      }

      const nextRows = [...currentRows];
      const targetRow = { ...nextRows[rowIndex] } as PurchaseImportRow;

      if (numericImportColumns.has(dataIndex)) {
        const parsed = Number(rawValue);
        (targetRow as Record<string, unknown>)[dataIndex] = Number.isNaN(parsed)
          ? null
          : parsed;
      } else {
        (targetRow as Record<string, unknown>)[dataIndex] = rawValue;
      }

      if (dataIndex === "sapCode") {
        const selected = productByCode.get(String(rawValue).trim());
        const unitPrice = getProductPrice(selected);
        const isPieceTracked =
          purchaseMode === "goods" && Boolean(selected?.isPieceTracked);
        targetRow.productId = selected?.id ?? null;
        targetRow.product = selected?.name ?? "";
        targetRow.productName = selected?.name ?? "";
        targetRow.name = selected?.name ?? "";
        targetRow.mxik = selected?.mxik ?? getProductCode(selected);
        targetRow.unitId = selected?.unitId ?? null;
        targetRow.unitCode = selected?.unitCode ?? null;
        targetRow.unitName = selected?.unitName ?? selected?.unit ?? null;
        targetRow.price = targetRow.price || unitPrice || null;
        targetRow.pricePerUom = targetRow.pricePerUom || unitPrice || null;
        targetRow.isPieceTracked = isPieceTracked;
        if (!isPieceTracked) {
          targetRow.markingNumber = "";
          targetRow.markingNumbers = [];
          targetRow.qty = getNumber(targetRow.qty) || 1;
        } else {
          targetRow.qty = toMarkingNumbers(targetRow).length;
        }
      }

      const previousValue = (currentRows[rowIndex] as Record<string, unknown>)[
        dataIndex
      ];
      const nextValue = (targetRow as Record<string, unknown>)[dataIndex];
      if (previousValue === nextValue) {
        return;
      }

      nextRows[rowIndex] = targetRow;

      commitRows(nextRows);
    },
    [commitRows, formik.values.lines, productByCode, purchaseMode],
  );

  const isSapCodeValid = useCallback(
    (value: unknown) => {
      const normalized = String(value ?? "").trim();
      if (!normalized) {
        return false;
      }
      if (!data) {
        return true;
      }

      return productIdBySapCode.has(normalized);
    },
    [data, productIdBySapCode],
  );

  const tableColumns = usePurchaseImportColumns({
    columnConfig,
    handleCellCommit,
    handleDeleteRow,
    handleItemSelect,
    handleRowValueChange,
    isLoading,
    isSapCodeValid,
    isServicesLoading,
    itemOptions,
    openMarkingModal,
    purchaseMode,
    unitOptions,
    vatRateOptions,
  });

  useEffect(() => {
    const hasLoadedOptions =
      purchaseMode === "goods" ? isSuccess && data : isServicesSuccess;
    if (hasLoadedOptions && formik.values.lines.length > 0) {
      const updated = resolveProductIds(formik.values.lines);
      const timeoutId = window.setTimeout(() => commitRows(updated), 0);
      return () => window.clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isServicesSuccess, isSuccess, purchaseMode, resolveProductIds]);

  const handleDeleteSapCodes = () => {
    const filteredData = formik.values.lines?.filter((item) => item.productId);
    const nextRows = filteredData ?? [];
    commitRows(nextRows);
    toast.success("Topilmagan sab kodlar o'chirildi");
  };

  const handleOpenMissingProductsModal = () => {
    const rows =
      formik.values.lines?.filter(
        (item) => String(item.sapCode ?? "").trim() && !item.productId,
      ) ?? [];
    setMissingProductRows(rows);
    setProductCreateOpen(true);
  };

  const foundedSapCodes = useMemo(
    () =>
      formik.values.lines?.filter(
        (item) => String(item.sapCode ?? "").trim() && !item.productId,
      ).length ?? 0,
    [formik.values.lines],
  );

  const hasSelectedRows = useMemo(
    () => formik.values.lines.some((item) => Boolean(item.productId)),
    [formik.values.lines],
  );

  const handlePurchaseModeChange = useCallback(
    (value: PurchaseMode) => {
      setPurchaseMode(value);
      setProductWithCount(value === "services");
      setSelectBoxOptions(
        toSelectBoxOptions(
          getBaseColumnConfig(value === "services", withDiscount),
        ),
      );
    },
    [setProductWithCount, setPurchaseMode, withDiscount],
  );

  const totals = useMemo(
    () => getPurchaseImportTotals(formik.values.lines ?? [], vatRateOptions),
    [formik.values.lines, vatRateOptions],
  );

  const activeMarkings = useMemo(
    () =>
      markingRowIndex === null
        ? []
        : toMarkingNumbers(formik.values.lines[markingRowIndex]),
    [formik.values.lines, markingRowIndex],
  );

  // Chegirma switch o'zgarganda
  // const handleDiscountChange = (e: boolean) => {
  //   setWithWithDiscount(e);
  //   setFoundedSapCodes(0);
  //   formik.resetForm();
  //   setExcelData([]);
  // };

  // Character switch o'zgarganda - bu endi faqat selectBox options ni o'zgartiradi
  // const handleCharacterChange = (e: boolean) => {
  //   formik.setFieldValue("isCharacter", e, true);

  // if (e) {
  //   // Character yoqilganda yangi optionlar qo'shish

  //   setSelectBoxOptions(prev => {
  //     const existingCodes = new Set(prev.map(opt => opt.code));
  //     const optionsToAdd = newCharacterOptions.filter(opt => !existingCodes.has(opt.code));
  //     return [...prev, ...optionsToAdd];
  //   });
  // } else {
  //   // Character o'chirilganda character optionlarini olib tashlash
  //   const characterCodes = ["weightGram", "size", "description"];
  //   setSelectBoxOptions(prev =>
  //     prev.filter(opt => !characterCodes.includes(opt.code))
  //   );
  // }
  // };
  // useEffect(() => {
  //   if (formik.values.requestCode === "") {
  //     formik.setFieldValue(
  //       "requestCode",
  //       dayjs().toDate().getTime().toString(),
  //     );
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [formik.values.requestCode]);
  // useChangeSelectType("disabled");

  return (
    <div>
      <Form onFinish={formik.handleSubmit} layout="vertical">
        <PurchaseImportHeader
          formik={draftFormik}
          hasSelectedRows={hasSelectedRows}
          onAddManualRow={handleAddManualRow}
          onBack={() => navigate(-1)}
          onExcelDataChange={handleExcelDataChange}
          onPurchaseModeChange={handlePurchaseModeChange}
          purchaseMode={purchaseMode}
          selectBoxOptions={selectBoxOptions}
          setSelectBoxOptions={setSelectBoxOptions}
        />
        {/* {isNonSerial && (
          <Card className="rounded-lg relative my-4">
            <NonSerialTableImport
              formik={formik}
              data={formik.values.newProducts ?? []}
            />
          </Card>
        )} */}
        <PurchaseImportLinesSection
          columns={tableColumns}
          comment={formik.values.comment}
          counterpartyId={formik.values.counterpartyId}
          foundedSapCodes={foundedSapCodes}
          height={height}
          isFetching={isFetching}
          isLoading={isLoading}
          lines={formik.values.lines}
          onAddManualRow={handleAddManualRow}
          onCommentChange={(value) =>
            draftFormik.setFieldValue("comment", value, false)
          }
          onDeleteSapCodes={handleDeleteSapCodes}
          onOpenMissingProductsModal={handleOpenMissingProductsModal}
          purchaseMode={purchaseMode}
          totals={totals}
        />
        {/* <SupplierAddEdit
          open={openSupplier}
          setOpen={setOpenSupplier}
          edit={null}
        /> */}
        <PurchaseMarkingModal
          open={markingRowIndex !== null}
          value={markingInput}
          markings={activeMarkings}
          onChange={setMarkingInput}
          onPaste={handleMarkingPaste}
          onAdd={handleAddMarking}
          onRemove={handleRemoveMarking}
          onClose={closeMarkingModal}
        />
        <ProductsCreateModal
          open={productCreateOpen}
          rows={missingProductRows}
          onRowsChange={setMissingProductRows}
          onClose={() => setProductCreateOpen(false)}
          onCreated={() => {
            void refetchProducts();
          }}
        />
      </Form>
    </div>
  );
};

export default PurchaseImportPage;
