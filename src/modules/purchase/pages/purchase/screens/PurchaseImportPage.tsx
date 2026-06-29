import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Col,
  Form,
  Row,
  Segmented,
  Select,
  Table,
  Tooltip,
  type TableColumnType,
} from "antd";
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
import { useTranslation } from "react-i18next";
import SelectDate from "@/components/fields/SelectDate";
import dayjs from "dayjs";
import { $axiosPrivate } from "@/services/AxiosService";
import { ArrowLeft, PackagePlus, Plus, QrCode, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import SelectCustom from "@/components/fields/SelectCustom";
import Card from "@/components/ui/card/Card";
import { useNavigate } from "react-router";
import useWindowSize from "@/shared/hooks/useWindowSize";
import type {
  ProductListResponse,
  ProductSelectOption,
  PurchaseImportRow,
  PurchaseMode,
  SelectBoxOptions,
  SelectOption,
} from "../types/type";
import {
  filterIds,
  selectListEndpoints,
  selectListKeys,
} from "@/shared/constants/selectLists";
import ExcelImportFile from "@/components/widget/excelimport/ExcelImportFile";
import type {
  PurchaseImportForm,
  PurchaseImportHeaderDraft,
} from "@/modules/purchase/pages/purchase/types/form";
import { formatDateWithOutTime } from "@/utils/helpers";
import { numberSpacing } from "@/utils/utils";
import {
  purchaseValidationSchema,
  isCompletePurchaseLine,
} from "@/modules/purchase/pages/purchase/types/schema";
import PurchaseImportEditableCell from "../components/PurchaseImportEditableCell";
import ProductsCreateModal from "../components/ProductsCreateModal";
import PurchaseImportSummary from "../components/PurchaseImportSummary";
import PurchaseMarkingModal from "../components/PurchaseMarkingModal";
import {
  buildColumnConfig,
  getBaseColumnConfig,
  numericImportColumns,
  toSelectBoxOptions,
  type ImportColumnConfig,
} from "../utils/importColumns";
import { useCreatePurchase } from "../hooks/useCreatePurchase";
import useLocalStorage from "@/hooks/UseLocalStorage";
import {
  createEmptyPurchaseRow,
  getDefaultPurchaseImportHeader,
  getNumber,
  getProductCode,
  getProductPrice,
  getPurchaseImportTotals,
  getRowAmount,
  getRowUnitLabel,
  getRowUnitPrice,
  getRowVatAmount,
  getUnmarkedPieceTrackedRow,
  normalizeProductOptions,
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
  const { t } = useTranslation();
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
    isLoading,
    isFetching,
    isSuccess,
    refetch: refetchProducts,
  } = useQuery<ProductSelectOption[]>({
    queryKey: ["selectlist", selectListKeys.product, "purchase-goods"],
    queryFn: async () => {
      const { data } = await $axiosPrivate.get<
        ProductSelectOption[] | ProductListResponse
      >("products", {
        params: {
          IsService: false,
          PageSize: 1000,
        },
      });
      return normalizeProductOptions(data);
    },
    enabled: true,
  });
  const {
    data: serviceOptions = [],
    isLoading: isServicesLoading,
    isSuccess: isServicesSuccess,
  } = useQuery<ProductSelectOption[]>({
    queryKey: ["selectlist", selectListKeys.product, "purchase-services"],
    queryFn: async () => {
      const { data } = await $axiosPrivate.get<
        ProductSelectOption[] | ProductListResponse
      >("products", {
        params: {
          IsService: true,
          PageSize: 1000,
        },
      });
      return normalizeProductOptions(data);
    },
    enabled: true,
  });
  const { data: unitOptions = [] } = useQuery<SelectOption[]>({
    queryKey: ["selectlist", selectListKeys.unit],
    queryFn: async () => {
      const { data } = await $axiosPrivate.get<SelectOption[]>(
        selectListEndpoints.unitsSelectList,
      );
      return data ?? [];
    },
    enabled: true,
  });
  const { data: vatRateOptions = [] } = useQuery<SelectOption[]>({
    queryKey: ["selectlist", selectListKeys.vatRate],
    queryFn: async () => {
      const { data } = await $axiosPrivate.get<SelectOption[]>(
        selectListEndpoints.vatRatesSelectList,
      );
      return data ?? [];
    },
    enabled: true,
  });

  const productLookupOptions = useMemo(
    () => [...(data ?? []), ...serviceOptions],
    [data, serviceOptions],
  );

  const productIdBySapCode = useMemo(() => {
    const map = new Map<string, number>();
    productLookupOptions.forEach((item) => {
      const codes = [item.code, item.barcode, item.mxik].filter(Boolean);
      codes.forEach((code) => {
        map.set(String(code).trim(), Number(item.id));
      });
    });
    return map;
  }, [productLookupOptions]);

  const productByCode = useMemo(() => {
    const map = new Map<string, ProductSelectOption>();
    productLookupOptions.forEach((item) => {
      const codes = [item.code, item.barcode, item.mxik].filter(Boolean);
      codes.forEach((code) => {
        map.set(String(code).trim(), item);
      });
    });
    return map;
  }, [productLookupOptions]);

  const itemOptions = useMemo<ProductSelectOption[]>(
    () =>
      purchaseMode === "services"
        ? serviceOptions
        : (data ?? []).map((item) => ({
            ...item,
            code: getProductCode(item),
          })),
    [data, purchaseMode, serviceOptions],
  );

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

  const tableColumns: TableColumnType<PurchaseImportRow>[] = useMemo(() => {
    const visibleColumnConfig = columnConfig.filter(
      (col) =>
        ![
          "serialNumber",
          "markingNumber",
          "qty",
          "price",
          "pricePerUom",
        ].includes(col.code),
    );

    const editableColumns = visibleColumnConfig.map((col: ImportColumnConfig) => {
      const baseColumn: TableColumnType<PurchaseImportRow> = {
        dataIndex: col.dataIndex,
        title:
          col.code === "product"
            ? purchaseMode === "services"
              ? "Xizmat"
              : "Tovar"
            : col.code === "sapCode"
              ? "MXIK"
              : col.title,
        width: col.width,
        align: col.align,
        ellipsis: false,
      };

      if (col.code === "indexId") {
        return {
          ...baseColumn,
          render: col.render,
        };
      }

      if (col.code === "product") {
        return {
          ...baseColumn,
          width: 280,
          render: (_: unknown, record: PurchaseImportRow, rowIndex: number) => (
            <Select
              showSearch
              className="w-full"
              placeholder={purchaseMode === "services" ? "Xizmat" : "Tovar"}
              value={record.productId ?? undefined}
              loading={isLoading || isServicesLoading}
              optionFilterProp="label"
              options={itemOptions.map((item) => ({
                value: item.id,
                label: item.name,
              }))}
              onChange={(value) => handleItemSelect(rowIndex, Number(value))}
            />
          ),
        };
      }

      return {
        ...baseColumn,
        render: (
          value: unknown,
          record: PurchaseImportRow,
          rowIndex: number,
        ) => {
          const isSapCodeCell = col.code === "sapCode";
          const hasSapCodeValue = String(value ?? "").trim().length > 0;
          const invalidSapCode =
            isSapCodeCell && hasSapCodeValue && !isSapCodeValid(value);

          return (
            <PurchaseImportEditableCell
              value={value}
              dataIndex={String(col.dataIndex)}
              rowIndex={rowIndex ?? 0}
              onCommit={handleCellCommit}
              isInvalid={invalidSapCode}
              disabled={isSapCodeCell && Boolean(record.productId)}
            />
          );
        },
      };
    });

    const markingColumn: TableColumnType<PurchaseImportRow> = {
      dataIndex: "markingNumber",
      title: "Markirovka",
      width: 130,
      align: "center",
      render: (_: unknown, record: PurchaseImportRow, rowIndex: number) => {
        const markingCount = toMarkingNumbers(record).length;
        const isTracked = Boolean(record.isPieceTracked);
        return (
          <Tooltip
            title={
              isTracked
                ? markingCount
                  ? `${markingCount} ta markirovka`
                  : "Markirovka kiritish"
                : "Bu mahsulot markirovkasiz"
            }
          >
            <Button
              type="text"
              disabled={!isTracked}
              className="text-primary"
              icon={<QrCode className="size-5" />}
              onClick={() => openMarkingModal(rowIndex)}
            >
              {markingCount || ""}
            </Button>
          </Tooltip>
        );
      },
    };

    const orderedEditableColumns = editableColumns.flatMap((column) =>
      purchaseMode === "goods" && column.dataIndex === "sapCode"
        ? [column, markingColumn]
        : [column],
    );

    return [
      ...orderedEditableColumns,
      {
        dataIndex: "unitId",
        title: "Birlik",
        width: 140,
        align: "center",
        render: (_: unknown, record: PurchaseImportRow, rowIndex: number) => (
          getRowUnitLabel(record) ? (
            <span className="font-medium">{getRowUnitLabel(record)}</span>
          ) : (
            <Select
              showSearch
              className="w-full"
              placeholder="Birlik"
              value={(record.unitId as number | null) ?? undefined}
              optionFilterProp="label"
              options={unitOptions.map((item) => ({
                value: item.id,
                label: item.name,
              }))}
              onChange={(value) =>
                handleRowValueChange(rowIndex, { unitId: Number(value) })
              }
            />
          )
        ),
      },
      {
        dataIndex: "qty",
        title: "Miqdor",
        width: 120,
        align: "center",
        render: (value: unknown, record: PurchaseImportRow, rowIndex: number) => (
          <PurchaseImportEditableCell
            value={value}
            dataIndex="qty"
            rowIndex={rowIndex ?? 0}
            onCommit={handleCellCommit}
            disabled={purchaseMode === "goods" && Boolean(record.isPieceTracked)}
          />
        ),
      } satisfies TableColumnType<PurchaseImportRow>,
      {
        dataIndex: "price",
        title: "Narx",
        width: 140,
        align: "center",
        render: (_: unknown, record: PurchaseImportRow, rowIndex: number) => (
          <PurchaseImportEditableCell
            value={getRowUnitPrice(record)}
            dataIndex="price"
            rowIndex={rowIndex ?? 0}
            onCommit={handleCellCommit}
          />
        ),
      } satisfies TableColumnType<PurchaseImportRow>,
      {
        dataIndex: "amount",
        title: "Summa",
        width: 140,
        align: "right",
        render: (_: unknown, record: PurchaseImportRow) => {
          const qty = getNumber(record.qty);
          const price = getRowUnitPrice(record);
          return numberSpacing(qty * price, undefined, true);
        },
      },
      {
        dataIndex: "vatRateId",
        title: "QQS (foiz va summa)",
        width: 260,
        align: "center",
        render: (_: unknown, record: PurchaseImportRow, rowIndex: number) => {
          const vatAmount = getRowVatAmount(record, vatRateOptions);
          return (
            <div className="flex items-center gap-2">
              <Select
                showSearch
                allowClear
                className="min-w-28"
                placeholder="QQS"
                value={record.vatRateId ?? undefined}
                optionFilterProp="label"
                options={vatRateOptions.map((item) => ({
                  value: item.id,
                  label: item.name,
                }))}
                onChange={(value) =>
                  handleRowValueChange(rowIndex, {
                    vatRateId: value ? Number(value) : null,
                  })
                }
              />
              <span className="min-w-24 text-right">
                {numberSpacing(vatAmount, undefined, true)}
              </span>
            </div>
          );
        },
      },
      {
        dataIndex: "totalAmount",
        title: "Jami",
        width: 140,
        align: "right",
        render: (_: unknown, record: PurchaseImportRow) => {
          const amount = getRowAmount(record);
          const vatAmount = getRowVatAmount(record, vatRateOptions);
          return numberSpacing(amount + vatAmount, undefined, true);
        },
      },
      {
        dataIndex: "actions",
        title: "Amallar",
        width: 90,
        fixed: "right",
        align: "center",
        render: (_: unknown, __: PurchaseImportRow, rowIndex: number) => (
          <Tooltip title="Qatorni o'chirish">
            <Button
              danger
              type="text"
              icon={<Trash2 className="size-4" />}
              onClick={() => handleDeleteRow(rowIndex)}
            />
          </Tooltip>
        ),
      } satisfies TableColumnType<PurchaseImportRow>,
    ];
  }, [
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
  ]);

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
        <Card className="p-3">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">
              {t("Purchase.excelImport.title")}
            </h2>
            <div className="flex items-center gap-2">
              {/* <ExcelTemplateDropdown /> */}
              <Button type="text" onClick={() => navigate(-1)}>
                <ArrowLeft className="size-4" />
                {t("Buttons.back")}
              </Button>
            </div>
          </div>
          <div className="mt-3">
            <Row gutter={20}>
              <Col span={24} sm={12} lg={8} xl={4}>
                <SelectDate
                  label="Sana"
                  formik={draftFormik}
                  fieldName="docDate"
                />
              </Col>
              <Col span={24} sm={12} lg={8} xl={4}>
                <SelectCustom
                  fieldName="counterpartyId"
                  label={
                    purchaseMode === "services"
                      ? "Ijrochi"
                      : "Yetkazib beruvchi"
                  }
                  path={selectListEndpoints.counterpartiesSelectList}
                  getFirst
                  formik={draftFormik}
                  // addOption={{
                  //   bool: true,
                  //   permissionCode: counterpartyPermissions.create,
                  //   onClick() {
                  //     setOpenSupplier(true);
                  //   },
                  // }}
                />
              </Col>
              <Col span={24} sm={12} lg={8} xl={4}>
                <SelectCustom
                  path={selectListEndpoints.warehousesSelectList}
                  label="Ombor"
                  fieldName="warehouseId"
                  formik={draftFormik}
                />
              </Col>
              <Col span={24} sm={12} lg={8} xl={4}>
                <SelectCustom
                  path={selectListEndpoints.currenciesSelectList}
                  label="Valyuta"
                  fieldName="currencyId"
                  formik={draftFormik}
                />
              </Col>
              <Col span={24} sm={12} lg={8} xl={4}>
                <SelectCustom
                  path={
                    selectListEndpoints.contractsSelectList +
                    `?choosedDate=${dayjs(formik.values.docDate).format(formatDateWithOutTime)}${formik.values.counterpartyId ? `&${filterIds.counterparty}=${formik.values.counterpartyId}` : ""}`
                  }
                  label="Shartnoma"
                  fieldName="contractId"
                  formik={draftFormik}
                  required
                  refetchSync={`${formik.values.counterpartyId}${formik.values.docDate}`}
                />
              </Col>
              {/* {org.useContractAccounting && (
                <Col span={6}>
                  <SelectCustom
                    path={
                      selectListEndpoints.projectContractSelectList +
                      "?isMovement=true&supplierId=" +
                      formik.values.supplierId
                    }
                    enabled={!!formik.values.supplierId}
                    label="Shartnoma"
                    refetchSync={formik.values.supplierId?.toString()}
                    formik={formik}
                    required={true}
                    fieldName={"contractId"}
                  />
                </Col>
              )} */}
            </Row>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
            <div className="flex flex-wrap items-center gap-3">
              <Segmented
                disabled={hasSelectedRows}
                value={purchaseMode}
                onChange={(value) => {
                  setPurchaseMode(value as PurchaseMode);
                  setProductWithCount(value === "services");
                  setSelectBoxOptions(
                    toSelectBoxOptions(
                      getBaseColumnConfig(value === "services", withDiscount),
                    ),
                  );
                }}
                options={[
                  { label: "Prixod tovar", value: "goods" },
                  { label: "Prixod uslug", value: "services" },
                ]}
              />
              <ExcelImportFile
                variant="button"
                selectBoxOptions={selectBoxOptions}
                setSelectBoxOptions={setSelectBoxOptions}
                setData={handleExcelDataChange}
                formik={draftFormik}
                disabled={!formik.values.counterpartyId}
              />
              <Button
                type="default"
                htmlType="button"
                icon={<Plus className="size-4" />}
                disabled={!formik.values.counterpartyId}
                onClick={handleAddManualRow}
              >
                {purchaseMode === "services" ? "Xizmat qo'shish" : "Tovar qo'shish"}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button htmlType="button" onClick={() => navigate(-1)}>
                Bekor qilish
              </Button>
              <Button
                type="primary"
                loading={formik.isSubmitting}
                htmlType="submit"
              >
                {t("common.save")}
              </Button>
            </div>
            {/* {!productWithCount && (
              <div className="text-sm">
                <Switch
                  checkedChildren="Serinkasiz mahsulot"
                  unCheckedChildren="Avval ustiga bosing"
                  checked={isNonSerial}
                  onChange={(e) => setIsNonSerial(e)}
                />
              </div>
            )} */}
            {/* <div className="text-sm">
              <Switch
                checkedChildren="Chegirmali"
                unCheckedChildren="Chegirmasiz"
                checked={withDiscount}
                onChange={handleDiscountChange}
              />
            </div>
            <div className="text-sm">
              <Switch
                checkedChildren="Tavsifli"
                unCheckedChildren="Tavsifsiz"
                checked={formik.values.isCharacter}
                onChange={handleCharacterChange}
              />
            </div> */}
          </div>
        </Card>
        {/* {isNonSerial && (
          <Card className="rounded-lg relative my-4">
            <NonSerialTableImport
              formik={formik}
              data={formik.values.newProducts ?? []}
            />
          </Card>
        )} */}
        <div className="mt-3 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-end gap-3">
            {formik.values.lines.length > 0 && (
              <>
                {purchaseMode === "goods" && (
                  <>
                    <Button
                      type="default"
                      htmlType="button"
                      onClick={handleOpenMissingProductsModal}
                      icon={<PackagePlus className="size-4" />}
                      disabled={isLoading || isFetching || foundedSapCodes === 0}
                    >
                      Topilmagan SAP kodlarni belgilash ({foundedSapCodes})
                    </Button>
                    <Button
                      type="primary"
                      htmlType="button"
                      danger
                      onClick={handleDeleteSapCodes}
                      icon={<div>{foundedSapCodes}</div>}
                      disabled={isLoading || isFetching || foundedSapCodes === 0}
                    >
                      Topilmagan SAP kodlarni o'chirish
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </div>

          <div className="rounded-lg relative">
            <Table
              className="[&_.ant-table-tbody>tr>td]:!h-16 [&_.ant-table-tbody>tr>td]:!py-3"
              loading={isLoading || isFetching}
              columns={tableColumns}
              dataSource={formik.values.lines?.map((item, index) => ({
                ...item,
                indexId: index + 1,
                key: index + 1,
              }))}
              virtual
              scroll={{ y: height - 320, x: "max-content" }}
              pagination={false}
            />
            <PurchaseImportSummary
              comment={formik.values.comment}
              totals={totals}
              onCommentChange={(value) =>
                draftFormik.setFieldValue("comment", value, false)
              }
            />
            <div className="sticky bottom-0 z-10 flex justify-center border-t border-border bg-primary-bg/95 py-2 backdrop-blur">
              <Tooltip title="Qator qo'shish">
                <Button
                  type="primary"
                  htmlType="button"
                  shape="circle"
                  size="large"
                  className="shadow-md"
                  icon={<Plus className="size-5" />}
                  disabled={!formik.values.counterpartyId}
                  onClick={handleAddManualRow}
                />
              </Tooltip>
            </div>
          </div>
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
