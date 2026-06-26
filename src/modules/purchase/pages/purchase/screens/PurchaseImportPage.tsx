import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Col,
  Form,
  Input,
  Modal,
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
  type Dispatch,
  type SetStateAction,
} from "react";
import { useTranslation } from "react-i18next";
import SelectDate from "@/components/fields/SelectDate";
import dayjs from "dayjs";
import { $axiosPrivate } from "@/services/AxiosService";
import { ArrowLeft, PackagePlus, Plus, QrCode, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import SelectCustom from "@/components/fields/SelectCustom";
import Card from "@/components/ui/card/Card";
import { useNavigate } from "react-router";
import useWindowSize from "@/shared/hooks/useWindowSize";
import type { PurchaseImportRow, SelectBoxOptions } from "../types/type";
import {
  filterIds,
  selectListEndpoints,
  selectListKeys,
} from "@/shared/constants/selectLists";
import ExcelImportFile from "@/components/widget/excelimport/ExcelImportFile";
import type { PurchaseImportForm } from "@/modules/purchase/pages/purchase/types/form";
import { formatDate, formatDateWithOutTime } from "@/utils/helpers";
import { numberSpacing } from "@/utils/utils";
import {
  purchaseValidationSchema,
  isCompletePurchaseLine,
} from "@/modules/purchase/pages/purchase/types/schema";
import PurchaseImportEditableCell from "../components/PurchaseImportEditableCell";
import ProductsCreateModal from "../components/ProductsCreateModal";
import {
  buildColumnConfig,
  getBaseColumnConfig,
  numericImportColumns,
  toSelectBoxOptions,
  type ImportColumnConfig,
} from "../utils/importColumns";
import { useCreatePurchase } from "../hooks/useCreatePurchase";
import useLocalStorage from "@/hooks/UseLocalStorage";

interface ProductSelectOption {
  id: number;
  code?: string;
  barcode?: string;
  name: string;
  mxik?: string;
  unitId?: number | null;
  unitCode?: string | null;
  unitName?: string | null;
  unit?: string | null;
  price?: number | null;
  purchasePrice?: number | null;
  pricePerUom?: number | null;
}

interface SelectOption {
  id: number;
  name: string;
  code?: string;
}

type PurchaseMode = "goods" | "services";

type PurchaseImportHeaderDraft = Pick<
  PurchaseImportForm,
  | "docDate"
  | "counterpartyId"
  | "contractId"
  | "currencyId"
  | "warehouseId"
  | "comment"
>;

const PURCHASE_IMPORT_DRAFT_HEADER_KEY = "purchase-import:draft:header";
const PURCHASE_IMPORT_DRAFT_LINES_KEY = "purchase-import:draft:lines";
const PURCHASE_IMPORT_DRAFT_PRODUCT_WITH_COUNT_KEY =
  "purchase-import:draft:product-with-count";
const PURCHASE_IMPORT_DRAFT_MODE_KEY = "purchase-import:draft:mode";

const getDefaultPurchaseImportHeader = (): PurchaseImportHeaderDraft => ({
  docDate: dayjs().format(formatDate),
  counterpartyId: null,
  contractId: null,
  currencyId: 1,
  warehouseId: null,
  comment: "",
});

const getNumber = (value: unknown) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const getVatPercent = (vatRateId: unknown, options: SelectOption[]) => {
  const option = options.find((item) => item.id === Number(vatRateId));
  const match = String(option?.name ?? "").match(/(\d+(?:[.,]\d+)?)/);
  return match ? Number(match[1].replace(",", ".")) : 0;
};

const getProductCode = (item?: ProductSelectOption | SelectOption | null) =>
  String(
    (item as ProductSelectOption | undefined)?.mxik ??
      (item as ProductSelectOption | undefined)?.code ??
      (item as ProductSelectOption | undefined)?.barcode ??
      "",
  );

const getProductPrice = (item?: ProductSelectOption | null) =>
  Number(item?.purchasePrice ?? item?.pricePerUom ?? item?.price ?? 0);

const getRowUnitLabel = (row: PurchaseImportRow) =>
  row.unitCode ?? row.unitName ?? "";

const getRowUnitPrice = (row: PurchaseImportRow) =>
  getNumber(row.price || row.pricePerUom);

const getRowAmount = (row: PurchaseImportRow) =>
  getNumber(row.qty) * getRowUnitPrice(row);

const getRowVatAmount = (row: PurchaseImportRow, options: SelectOption[]) =>
  (getRowAmount(row) * getVatPercent(row.vatRateId, options)) / 100;

const toMarkingNumbers = (row: PurchaseImportRow) => {
  if (Array.isArray(row.markingNumbers)) return row.markingNumbers;
  const marking = String(row.markingNumber ?? "").trim();
  return marking ? [marking] : [];
};

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

  const formik = useFormik<PurchaseImportForm>({
    initialValues: {
      ...headerDraft,
      lines: excelData,
      // newProducts: productWithCount ? excelData : [],
      // newSerialProducts: !productWithCount ? excelData : [],
    },
    validationSchema: purchaseValidationSchema,
    onSubmit: async (values, helpers) => {
      // Swagger DTO — PurchaseDocLineDto:
      // { productId, quantity, unitId, unitPrice, vatRateId, items: [{markingNumber, serialNumber}] | null }
      const lines = values.lines
        .filter(isCompletePurchaseLine)
        .map((item) => {
          const markingNumbers = toMarkingNumbers(item);
          const hasMarking =
            purchaseMode === "goods" && markingNumbers.length > 0;
          // Serinkali rejim (productWithCount=false) — har qator bitta dona, items[] majburiy
          // Serinkasiz rejim (productWithCount=true) — quantity > 1, items yo'q
          const quantity = Number(item.qty ?? 1);
          const unitPrice = getRowUnitPrice(item);
          return {
            productId: Number(item.productId),
            quantity,
            unitId: Number(item.unitId ?? 1),
            unitPrice,
            vatRateId: item.vatRateId ?? null,
            items: hasMarking
              ? markingNumbers.map((markingNumber) => ({
                  markingNumber,
                  serialNumber: null,
                }))
              : null,
          };
        });

      // Servislar (Приход услуг) — bir xil lines[] ga qo'shiladi, items=null
      // if (!lines.length) {
      //   toast.error("Kamida bitta mahsulot yoki xizmat kiriting");
      //   return;
      // }

      await importPurchase.mutateAsync({
        docDate: values.docDate,
        counterpartyId: values.counterpartyId ?? 0,
        warehouseId: values.warehouseId ?? 0,
        currencyId: values.currencyId ?? 0,
        contractId: values.contractId,
        comment: values.comment || null,
        lines,
      });
      const defaultHeader = getDefaultPurchaseImportHeader();
      setHeaderDraft(defaultHeader);
      setExcelData([]);
      setProductWithCount(false);
      setPurchaseMode("goods");
      helpers.resetForm({
        values: {
          ...defaultHeader,
          lines: [],
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
      const { data } = await $axiosPrivate.get<ProductSelectOption[]>(
        `${selectListEndpoints.productsSelectList}?IsService=false`,
      );
      return data ?? [];
    },
    enabled: true,
  });
  const { data: serviceOptions = [], isLoading: isServicesLoading } = useQuery<
    ProductSelectOption[]
  >({
    queryKey: ["selectlist", selectListKeys.product, "purchase-services"],
    queryFn: async () => {
      const { data } = await $axiosPrivate.get<ProductSelectOption[]>(
        `${selectListEndpoints.productsSelectList}?IsService=true`,
      );
      return data ?? [];
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

  const productIdBySapCode = useMemo(() => {
    const map = new Map<string, number>();
    (data ?? []).forEach((item) => {
      const codes = [item.code, item.barcode, item.mxik].filter(Boolean);
      codes.forEach((code) => {
        map.set(String(code).trim(), Number(item.id));
      });
    });
    return map;
  }, [data]);

  const productByCode = useMemo(() => {
    const map = new Map<string, ProductSelectOption>();
    (data ?? []).forEach((item) => {
      const codes = [item.code, item.barcode, item.mxik].filter(Boolean);
      codes.forEach((code) => {
        map.set(String(code).trim(), item);
      });
    });
    return map;
  }, [data]);

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
          price: getNumber(item.price) || unitPrice,
          pricePerUom: getNumber(item.pricePerUom) || unitPrice,
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
      const nextRows = excelData.map((item, index) =>
        index === rowIndex ? { ...item, ...patch } : item,
      );
      commitRows(nextRows);
    },
    [commitRows, excelData],
  );

  const handleItemSelect = useCallback(
    (rowIndex: number, value: number) => {
      const selected = itemOptions.find((item) => item.id === value);
      const productCode = getProductCode(selected);
      const unitPrice = getProductPrice(selected);
      handleRowValueChange(rowIndex, {
        productId: value,
        product: selected?.name ?? "",
        productName: selected?.name ?? "",
        name: selected?.name ?? "",
        sapCode: productCode || excelData[rowIndex]?.sapCode || "",
        mxik: selected?.mxik ?? productCode,
        unitId: selected?.unitId ?? (excelData[rowIndex]?.unitId as number | null),
        unitCode: selected?.unitCode ?? null,
        unitName: selected?.unitName ?? selected?.unit ?? null,
        price: unitPrice || getNumber(excelData[rowIndex]?.price),
        pricePerUom: unitPrice || getNumber(excelData[rowIndex]?.pricePerUom),
      });
    },
    [excelData, handleRowValueChange, itemOptions],
  );

  const openMarkingModal = useCallback((rowIndex: number) => {
    setMarkingRowIndex(rowIndex);
    setMarkingInput("");
  }, []);

  const closeMarkingModal = useCallback(() => {
    setMarkingRowIndex(null);
    setMarkingInput("");
  }, []);

  const updateRowMarkings = useCallback(
    (rowIndex: number, markingNumbers: string[]) => {
      handleRowValueChange(rowIndex, {
        markingNumbers,
        markingNumber: markingNumbers.join("\n"),
        qty: markingNumbers.length || 1,
      });
    },
    [handleRowValueChange],
  );

  const handleAddMarking = useCallback(() => {
    if (markingRowIndex === null) return;
    const marking = markingInput.trim();
    if (!marking) return;

    const current = toMarkingNumbers(excelData[markingRowIndex]);
    if (current.includes(marking)) {
      toast.error("Bu markirovka avval kiritilgan");
      return;
    }

    updateRowMarkings(markingRowIndex, [...current, marking]);
    setMarkingInput("");
  }, [excelData, markingInput, markingRowIndex, updateRowMarkings]);

  const handleRemoveMarking = useCallback(
    (marking: string) => {
      if (markingRowIndex === null) return;
      const nextMarkings = toMarkingNumbers(excelData[markingRowIndex]).filter(
        (item) => item !== marking,
      );
      updateRowMarkings(markingRowIndex, nextMarkings);
    },
    [excelData, markingRowIndex, updateRowMarkings],
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
    const indexId = excelData.length + 1;
    commitRows([
      ...excelData,
      {
        key: Date.now(),
        id: 0,
        indexId,
        name: "",
        counterpartyId: formik.values.counterpartyId,
        product: "",
        productId: null,
        productName: "",
        sapCode: "",
        qty: 1,
        serialNumber: "",
        currencyId: formik.values.currencyId ?? 1,
        currency: "",
        markingNumber: "",
        markingNumbers: [],
        mxik: "",
        price: 0,
        pricePerUom: 0,
        unitId: null,
        unitCode: null,
        unitName: null,
        vatRateId: null,
        vatRates: null,
        isSerial: purchaseMode === "goods" && !productWithCount,
      },
    ]);
  }, [
    commitRows,
    excelData,
    formik.values.counterpartyId,
    formik.values.currencyId,
    purchaseMode,
    productWithCount,
  ]);

  const handleDeleteRow = useCallback(
    (rowIndex: number) => {
      const nextRows = excelData
        .filter((_, index) => index !== rowIndex)
        .map((item, index) => ({
          ...item,
          indexId: index + 1,
        }));
      commitRows(nextRows);
    },
    [commitRows, excelData],
  );

  // Table columnlarni yaratish
  const handleCellCommit = useCallback(
    (rowIndex: number, dataIndex: string, rawValue: string) => {
      const currentRows = excelData;

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
        targetRow.productId =
          productIdBySapCode.get(String(rawValue).trim()) ?? null;
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
    [commitRows, excelData, productIdBySapCode],
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
        !["serialNumber", "markingNumber"].includes(col.code) &&
        (purchaseMode === "goods" || col.code !== "sapCode"),
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
          _record: PurchaseImportRow,
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
            />
          );
        },
      };
    });

    const hasQuantityColumn = visibleColumnConfig.some(
      (col) => col.code === "qty",
    );

    return [
      ...editableColumns,
      ...(purchaseMode === "goods"
        ? [
            {
              dataIndex: "markingNumber",
              title: "Markirovka",
              width: 120,
              align: "center",
              render: (_: unknown, record: PurchaseImportRow, rowIndex: number) => {
                const markingCount = toMarkingNumbers(record).length;
                return (
                  <Tooltip
                    title={
                      markingCount
                        ? `${markingCount} ta markirovka`
                        : "Markirovka kiritish"
                    }
                  >
                    <Button
                      type="text"
                      className="text-primary"
                      icon={<QrCode className="size-5" />}
                      onClick={() => openMarkingModal(rowIndex)}
                    >
                      {markingCount || ""}
                    </Button>
                  </Tooltip>
                );
              },
            } satisfies TableColumnType<PurchaseImportRow>,
          ]
        : []),
      ...(!hasQuantityColumn
        ? [
            {
              dataIndex: "qty",
              title: "Miqdor",
              width: 120,
              align: "center",
              render: (value: unknown, _record: PurchaseImportRow, rowIndex: number) => (
                <PurchaseImportEditableCell
                  value={value}
                  dataIndex="qty"
                  rowIndex={rowIndex ?? 0}
                  onCommit={handleCellCommit}
                />
              ),
            } satisfies TableColumnType<PurchaseImportRow>,
          ]
        : []),
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
    if (purchaseMode === "goods" && isSuccess && data && excelData.length > 0) {
      const updated = resolveProductIds(excelData);
      const timeoutId = window.setTimeout(() => commitRows(updated), 0);
      return () => window.clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isSuccess, purchaseMode, resolveProductIds]);

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
                disabled={excelData.length > 0}
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
            {excelData.length > 0 && (
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

        {excelData.length > 0 && (
          <div className="rounded-lg relative">
            <Table
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
        )}
        {/* <SupplierAddEdit
          open={openSupplier}
          setOpen={setOpenSupplier}
          edit={null}
        /> */}
        <Modal
          title="Markirovkalarni kiritish"
          open={markingRowIndex !== null}
          onCancel={closeMarkingModal}
          footer={null}
          width={640}
          destroyOnHidden
        >
          <div className="flex gap-2">
            <Input
              autoFocus
              value={markingInput}
              placeholder="Markirovka raqamini kiriting"
              onChange={(event) => setMarkingInput(event.target.value)}
              onPressEnter={handleAddMarking}
            />
            <Button type="primary" icon={<Plus className="size-4" />} onClick={handleAddMarking}>
              Qo'shish
            </Button>
          </div>
          <div className="mt-3 flex max-h-64 flex-col gap-2 overflow-auto rounded border border-border p-2">
            {markingRowIndex !== null &&
            toMarkingNumbers(excelData[markingRowIndex]).length ? (
              toMarkingNumbers(excelData[markingRowIndex]).map((marking) => (
                <div
                  key={marking}
                  className="flex items-center justify-between gap-3 rounded bg-gray-50 px-3 py-2 text-sm"
                >
                  <span className="break-all">{marking}</span>
                  <Button
                    type="text"
                    danger
                    icon={<X className="size-4" />}
                    onClick={() => handleRemoveMarking(marking)}
                  />
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-sm text-gray-500">
                Markirovka kiritilmagan
              </div>
            )}
          </div>
        </Modal>
        <ProductsCreateModal
          open={productCreateOpen}
          setOpen={setProductCreateOpen}
          editData={missingProductRows}
          setEditData={setMissingProductRows}
          refetch={() => {
            void refetchProducts();
          }}
        />
      </Form>
    </div>
  );
};

export default PurchaseImportPage;
