import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Modal,
  Radio,
  Row,
  Select,
  Segmented,
  Steps,
  Switch,
  Table,
  Upload,
} from "antd";
import type { TableColumnsType, UploadProps } from "antd";
import { ArrowLeft, Plus, Trash, UploadIcon, X } from "lucide-react";
import { useFormik } from "formik";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import Card from "@/components/ui/card/Card";
import SelectCustom from "@/components/fields/SelectCustom";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { $axiosPrivate } from "@/services/AxiosService";
import { purchaseService } from "../../services/purchaseService";
import type { PurchaseImportForm } from "../../types/form";

type ExcelRow = Record<string, unknown>;

interface PurchaseImportRow {
  key: number;
  productId: number | null;
  productName: string;
  sapCode: string;
  qty: number;
  serialNumber: string;
  markingNumber: string;
  pricePerUom: number;
  price: number;
  discountPercent: number;
}



interface WorkbookWithMeta extends XLSX.WorkBook {
  fileName: string;
}

interface ProductSelectOption {
  id: number;
  code?: string;
  name?: string;
}

interface ProductCreateForm {
  products: PurchaseImportRow[];
  productTypeId: number | null;
  currencyId: number | null;
  supplierId: number | null;
  isSerial: boolean;
  productUom: {
    supplierUomId: number | null;
    stockUomId: number | null;
    clientUomId: number | null;
    supplierToStockFactor: number;
    stockToClientFactor: number;
  };
}

type MappingKey =
  | "productId"
  | "productName"
  | "sapCode"
  | "qty"
  | "serialNumber"
  | "markingNumber"
  | "pricePerUom"
  | "price"
  | "discountPercent";

interface MappingOption {
  label: string;
  value: MappingKey;
}

const dateFormat = "YYYY-MM-DDTHH:mm:ss";

const toNumber = (value: unknown) => {
  const normalized = String(value ?? "0").replace(/\s/g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const numericColumns = new Set([
  "qty",
  "price",
  "pricePerUom",
  "discountPercent",
]);

interface EditableImportCellProps {
  value: unknown;
  dataIndex: keyof PurchaseImportRow;
  rowIndex: number;
  invalid?: boolean;
  onCommit: (
    rowIndex: number,
    dataIndex: keyof PurchaseImportRow,
    value: string,
  ) => void;
  onAddClick?: () => void;
}

function EditableImportCell({
  value,
  dataIndex,
  rowIndex,
  invalid = false,
  onCommit,
  onAddClick,
}: EditableImportCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(String(value ?? ""));

  useEffect(() => {
    if (!isEditing) setLocalValue(String(value ?? ""));
  }, [isEditing, value]);

  const commit = () => {
    onCommit(rowIndex, dataIndex, localValue);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Input
        autoFocus
        size="small"
        status={invalid ? "error" : undefined}
        value={localValue}
        inputMode={numericColumns.has(String(dataIndex)) ? "decimal" : "text"}
        onChange={(event) => setLocalValue(event.target.value)}
        onBlur={commit}
        onPressEnter={commit}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            setLocalValue(String(value ?? ""));
            setIsEditing(false);
          }
        }}
      />
    );
  }

  return (
    <div
      className={`flex min-h-8 items-center gap-1 rounded border px-1 ${
        invalid ? "border-red-300 bg-red-50" : "border-transparent hover:border-border"
      }`}
    >
      <button
        type="button"
        className={`w-full bg-transparent px-1 py-1 text-left text-sm outline-none ${
          invalid ? "text-red-600" : ""
        }`}
        onClick={() => setIsEditing(true)}
      >
        {String(value ?? "") || "-"}
      </button>
      {invalid && onAddClick && (
        <Button
          type="link"
          size="small"
          className="h-6! px-1!"
          icon={<Plus className="size-3" />}
          onMouseDown={(event) => event.preventDefault()}
          onClick={(event) => {
            event.stopPropagation();
            onAddClick();
          }}
        />
      )}
    </div>
  );
}

const mapRowsByMapping = (
  rows: ExcelRow[],
  mapping: Partial<Record<MappingKey, string>>,
): PurchaseImportRow[] =>
  rows.map((row, index) => ({
    key: index + 1,
    productId: toNumber(row[mapping.productId ?? ""]) || null,
    productName: String(row[mapping.productName ?? ""] ?? ""),
    sapCode: String(row[mapping.sapCode ?? ""] ?? ""),
    qty: toNumber(row[mapping.qty ?? ""]),
    serialNumber: String(row[mapping.serialNumber ?? ""] ?? ""),
    markingNumber: String(row[mapping.markingNumber ?? ""] ?? ""),
    pricePerUom: toNumber(row[mapping.pricePerUom ?? ""]),
    price: toNumber(row[mapping.price ?? ""]),
    discountPercent: toNumber(row[mapping.discountPercent ?? ""]),
  }));

interface ProductCreateModalProps {
  open: boolean;
  rows: PurchaseImportRow[];
  supplierId: number | null;
  isSerial: boolean;
  onClose: () => void;
  onCreated: () => void;
}

function ProductCreateModal({
  open,
  rows,
  supplierId,
  isSerial,
  onClose,
  onCreated,
}: ProductCreateModalProps) {
  const formik = useFormik<ProductCreateForm>({
    initialValues: {
      products: rows,
      productTypeId: null,
      currencyId: null,
      supplierId,
      isSerial,
      productUom: {
        supplierUomId: null,
        stockUomId: null,
        clientUomId: null,
        supplierToStockFactor: 1,
        stockToClientFactor: 1,
      },
    },
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const payload = values.products.map((row) => ({
          productTypeId: values.productTypeId,
          name: row.productName,
          sapCode: row.sapCode,
          description: "",
          supplierId: values.supplierId,
          currencyId: values.currencyId,
          isSerial: values.isSerial,
          productUom: values.productUom,
        }));

        await $axiosPrivate.post("products/many", payload);
        toast.success("Mahsulot muvaffaqiyatli yaratildi");
        onCreated();
      } catch (error) {
        errorHandlers(error);
      }
    },
  });

  const handleDelete = (key: number) => {
    formik.setFieldValue(
      "products",
      formik.values.products.filter((item) => item.key !== key),
      true,
    );
  };

  return (
    <Modal
      title="Mahsulot yaratish"
      open={open}
      footer={false}
      width={760}
      onCancel={onClose}
    >
      <Form layout="vertical" onFinish={formik.handleSubmit}>
        <Row gutter={12}>
          <Col span={24} md={12}>
            <SelectCustom
              path="manuals/product-types"
              label="purchase.fields.productType"
              search
              formik={formik}
              fieldName="productTypeId"
            />
          </Col>
          <Col span={24} md={12} >
            <SelectCustom
              fieldName="currencyId"
              label="purchase.fields.currency"
              path={selectListEndpoints.currenciesSelectList}
              formik={formik}
            />
          </Col>
          <Col span={24} md={8}>
            <SelectCustom
              label="purchase.fields.supplierUom"
              path={selectListEndpoints.unitsSelectList}
              formik={formik}
              fieldName="productUom.supplierUomId"
            />
          </Col>
          <Col span={24} md={8}>
            <SelectCustom
              label="purchase.fields.stockUom"
              path={selectListEndpoints.unitsSelectList}
              formik={formik}
              fieldName="productUom.stockUomId"
            />
          </Col>
          <Col span={24} md={8}>
            <SelectCustom
              label="purchase.fields.clientUom"
              path={selectListEndpoints.unitsSelectList}
              formik={formik}
              fieldName="productUom.clientUomId"
            />
          </Col>
          <Col span={24}>
            <Table<PurchaseImportRow>
              rowKey="key"
              pagination={false}
              size="small"
              dataSource={formik.values.products}
              columns={[
                {
                  dataIndex: "key",
                  title: "T/r",
                  width: 60,
                  align: "center",
                },
                {
                  dataIndex: "productName",
                  title: "Mahsulot nomi",
                },
                {
                  dataIndex: "sapCode",
                  title: "SAP kod",
                  width: 140,
                },
                {
                  dataIndex: "actions",
                  title: "Amallar",
                  width: 80,
                  align: "center",
                  render: (_, record) => (
                    <Button
                      type="text"
                      icon={<Trash className="size-4 text-red-700" />}
                      onClick={() => handleDelete(record.key)}
                    />
                  ),
                },
              ]}
            />
          </Col>
        </Row>
        <Button
          block
          type="primary"
          htmlType="submit"
          loading={formik.isSubmitting}
          disabled={formik.values.products.length === 0}
          className="mt-3"
        >
          Saqlash
        </Button>
      </Form>
    </Modal>
  );
}

export default function PurchaseImportPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [rows, setRows] = useState<PurchaseImportRow[]>([]);
  const [nonSerial, setNonSerial] = useState(true);
  const [withDiscount, setWithDiscount] = useState(false);
  const [workbook, setWorkbook] = useState<WorkbookWithMeta | null>(null);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [mapping, setMapping] = useState<Partial<Record<MappingKey, string>>>({});
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [selectedInvalidRows, setSelectedInvalidRows] = useState<PurchaseImportRow[]>([]);

  const formik = useFormik<PurchaseImportForm>({
    initialValues: {
      docDate: dayjs().format(dateFormat),
      supplierId: null,
      movementCode: "PURCHASE",
      newProducts: [],
      newSerialProducts: [],
    },
    onSubmit: async (values) => {
      try {
        const payload = {
          ...values,
          newProducts: nonSerial
            ? rows.map((row) => ({
                productId: row.productId,
                qty: row.qty,
                pricePerUom: row.pricePerUom,
                discountPercent: withDiscount ? row.discountPercent : 0,
              }))
            : [],
          newSerialProducts: nonSerial
            ? []
            : rows.map((row) => ({
                productId: row.productId,
                serialNumber: row.serialNumber,
                markingNumber: row.markingNumber,
                price: row.price || row.pricePerUom,
                discountPercent: withDiscount ? row.discountPercent : 0,
              })),
        };

        await purchaseService.create(payload);
        toast.success(t("purchase.messages.imported"));
        navigate("..");
      } catch (error) {
        errorHandlers(error);
      }
    },
  });

  const {
    data: products = [],
    isLoading: productsLoading,
    isFetching: productsFetching,
    refetch: refetchProducts,
  } = useQuery<ProductSelectOption[]>({
    queryKey: ["selectlist", "products", "purchase-import"],
    queryFn: async () => {
      const { data } = await $axiosPrivate.get<ProductSelectOption[]>(
        selectListEndpoints.productsSelectList,
      );
      return data;
    },
  });

  const resolveProductId = (sapCode: unknown) => {
    const normalizedSapCode = String(sapCode ?? "").trim();
    if (!normalizedSapCode) return null;
    const found = products.find(
      (product) => String(product.code ?? "").trim() === normalizedSapCode,
    );
    return found?.id ?? null;
  };

  const isSapCodeValid = (sapCode: unknown) => {
    const normalizedSapCode = String(sapCode ?? "").trim();
    if (!normalizedSapCode) return false;
    if (!products.length && productsLoading) return true;
    return products.some(
      (product) => String(product.code ?? "").trim() === normalizedSapCode,
    );
  };

  const handleCellCommit = (
    rowIndex: number,
    dataIndex: keyof PurchaseImportRow,
    value: string,
  ) => {
    setRows((prev) =>
      prev.map((row, index) => {
        if (index !== rowIndex) return row;
        const nextValue = numericColumns.has(String(dataIndex)) ? toNumber(value) : value;
        const nextRow = { ...row, [dataIndex]: nextValue } as PurchaseImportRow;
        if (dataIndex === "sapCode") {
          nextRow.productId = resolveProductId(value);
        }
        return nextRow;
      }),
    );
  };

  const invalidRows = useMemo(
    () => rows.filter((row) => !row.productId || !isSapCodeValid(row.sapCode)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [products, rows],
  );

  useEffect(() => {
    if (!rows.length || !products.length) return;
    setRows((prev) =>
      prev.map((row) => ({
        ...row,
        productId: row.productId ?? resolveProductId(row.sapCode),
      })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  const sheetRows = useMemo<ExcelRow[]>(() => {
    if (!workbook || !selectedSheet) return [];
    return XLSX.utils.sheet_to_json<ExcelRow>(workbook.Sheets[selectedSheet], {
      defval: "",
    });
  }, [selectedSheet, workbook]);

  const sheetColumns = useMemo<TableColumnsType<ExcelRow>>(() => {
    const keys = Object.keys(sheetRows[0] ?? {});
    return keys.map((key, index) => ({
      dataIndex: key,
      title: key,
      width: index === 0 ? 80 : 180,
      ellipsis: true,
      render: (value: unknown) => String(value ?? ""),
    }));
  }, [sheetRows]);

  const mappingOptions = useMemo<MappingOption[]>(() => {
    const options: MappingOption[] = [
      { label: t("purchase.fields.productId"), value: "productId" },
      { label: t("purchase.fields.product"), value: "productName" },
      { label: t("purchase.fields.sapCode"), value: "sapCode" },
    ];

    if (nonSerial) {
      options.push(
        { label: t("purchase.fields.quantity"), value: "qty" },
        { label: t("purchase.fields.price"), value: "pricePerUom" },
      );
    } else {
      options.push(
        { label: t("purchase.fields.serialNumber"), value: "serialNumber" },
        { label: t("purchase.fields.markingNumber"), value: "markingNumber" },
        { label: t("purchase.fields.price"), value: "price" },
      );
    }

    if (withDiscount) {
      options.push({
        label: t("purchase.fields.discount"),
        value: "discountPercent",
      });
    }

    return options;
  }, [nonSerial, t, withDiscount]);

  useEffect(() => {
    const activeKeys = new Set(mappingOptions.map((option) => option.value));
    setMapping((prev) => {
      const next = Object.fromEntries(
        Object.entries(prev).filter(([key]) => activeKeys.has(key as MappingKey)),
      ) as Partial<Record<MappingKey, string>>;
      return Object.keys(next).length === Object.keys(prev).length ? prev : next;
    });
  }, [mappingOptions]);

  const hasRequiredMapping = useMemo(() => {
    const hasProduct = Boolean(mapping.productId || mapping.sapCode || mapping.productName);
    if (nonSerial) return hasProduct && Boolean(mapping.qty && mapping.pricePerUom);
    return hasProduct && Boolean(mapping.serialNumber && mapping.markingNumber && mapping.price);
  }, [mapping, nonSerial]);

  const resetImport = () => {
    setWorkbook(null);
    setSelectedSheet("");
    setCurrentStep(0);
    setModalOpen(false);
    setMapping({});
  };

  const handleSaveMappedRows = () => {
    setRows(
      mapRowsByMapping(sheetRows, mapping).map((row) => ({
        ...row,
        productId: row.productId ?? resolveProductId(row.sapCode),
      })),
    );
    resetImport();
  };

  const uploadProps: UploadProps = {
    accept: ".xlsx,.xls",
    maxCount: 1,
    showUploadList: false,
    beforeUpload: async (file) => {
      const buffer = await file.arrayBuffer();
      const parsedWorkbook = XLSX.read(buffer, { type: "array", cellDates: true });
      const nextSheet = parsedWorkbook.SheetNames[0] ?? "";
      setWorkbook({ ...parsedWorkbook, fileName: file.name });
      setSelectedSheet(parsedWorkbook.SheetNames.length === 1 ? nextSheet : "");
      setCurrentStep(parsedWorkbook.SheetNames.length === 1 ? 1 : 0);
      setMapping({});
      setModalOpen(true);
      return false;
    },
  };

  const columns = useMemo<TableColumnsType<PurchaseImportRow>>(
    () => [
      {
        dataIndex: "key",
        title: t("common.rowNumber"),
        align: "center",
        width: 70,
      },
      {
        dataIndex: "productName",
        title: t("purchase.fields.product"),
        minWidth: 180,
        render: (value: unknown, _row: PurchaseImportRow, index: number) => (
          <EditableImportCell
            value={value}
            dataIndex="productName"
            rowIndex={index}
            onCommit={handleCellCommit}
          />
        ),
      },
      {
        dataIndex: "sapCode",
        title: t("purchase.fields.sapCode"),
        width: 130,
        render: (value: unknown, record: PurchaseImportRow, index: number) => {
          const invalid = !record.productId || !isSapCodeValid(value);
          return (
            <EditableImportCell
              value={value}
              dataIndex="sapCode"
              rowIndex={index}
              invalid={invalid}
              onCommit={handleCellCommit}
              onAddClick={() => {
                setSelectedInvalidRows([{ ...record, supplierId: formik.values.supplierId } as PurchaseImportRow]);
                setProductModalOpen(true);
              }}
            />
          );
        },
      },
      ...(nonSerial
        ? [
            {
              dataIndex: "qty",
              title: t("purchase.fields.quantity"),
              width: 120,
              render: (_: unknown, row: PurchaseImportRow, index: number) => (
                <EditableImportCell
                  value={row.qty}
                  dataIndex="qty"
                  rowIndex={index}
                  onCommit={handleCellCommit}
                />
              ),
            },
            {
              dataIndex: "pricePerUom",
              title: t("purchase.fields.price"),
              width: 140,
              render: (_: unknown, row: PurchaseImportRow, index: number) => (
                <EditableImportCell
                  value={row.pricePerUom}
                  dataIndex="pricePerUom"
                  rowIndex={index}
                  onCommit={handleCellCommit}
                />
              ),
            },
          ]
        : [
            {
              dataIndex: "serialNumber",
              title: t("purchase.fields.serialNumber"),
              width: 180,
              render: (value: unknown, _row: PurchaseImportRow, index: number) => (
                <EditableImportCell
                  value={value}
                  dataIndex="serialNumber"
                  rowIndex={index}
                  onCommit={handleCellCommit}
                />
              ),
            },
            {
              dataIndex: "markingNumber",
              title: t("purchase.fields.markingNumber"),
              width: 180,
              render: (value: unknown, _row: PurchaseImportRow, index: number) => (
                <EditableImportCell
                  value={value}
                  dataIndex="markingNumber"
                  rowIndex={index}
                  onCommit={handleCellCommit}
                />
              ),
            },
            {
              dataIndex: "price",
              title: t("purchase.fields.price"),
              width: 140,
              render: (value: unknown, _row: PurchaseImportRow, index: number) => (
                <EditableImportCell
                  value={value}
                  dataIndex="price"
                  rowIndex={index}
                  onCommit={handleCellCommit}
                />
              ),
            },
          ]),
      ...(withDiscount
        ? [
            {
              dataIndex: "discountPercent",
              title: t("purchase.fields.discount"),
              width: 140,
              render: (value: unknown, _row: PurchaseImportRow, index: number) => (
                <EditableImportCell
                  value={value}
                  dataIndex="discountPercent"
                  rowIndex={index}
                  onCommit={handleCellCommit}
                />
              ),
            },
          ]
        : []),
    ],
    [formik.values.supplierId, nonSerial, products, t, withDiscount],
  );

  return (
    <Form layout="vertical" onFinish={formik.handleSubmit}>
      <Card className="mb-4 border border-border p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">{t("purchase.importTitle")}</h2>
          <Button type="text" onClick={() => navigate(-1)}>
            <ArrowLeft className="size-4" />
            {t("common.back")}
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Form.Item label={t("purchase.fields.docDate")}>
            <DatePicker
              className="w-full"
              value={dayjs(formik.values.docDate)}
              onChange={(value) =>
                formik.setFieldValue(
                  "docDate",
                  (value ?? dayjs()).format(dateFormat),
                )
              }
            />
          </Form.Item>
          <SelectCustom
            formik={formik}
            fieldName="supplierId"
            label="purchase.fields.supplier"
            path={selectListEndpoints.counterpartiesSelectList}
          />
          <div className="flex items-center justify-end gap-3">
            <Segmented
              value={nonSerial ? "nonSerial" : "serial"}
              onChange={(value) => setNonSerial(value === "nonSerial")}
              options={[
                { label: t("purchase.import.nonSerial"), value: "nonSerial" },
                { label: t("purchase.import.serial"), value: "serial" },
              ]}
            />
            <Switch
              checked={withDiscount}
              onChange={setWithDiscount}
              checkedChildren={t("purchase.import.withDiscount")}
              unCheckedChildren={t("purchase.import.withoutDiscount")}
            />
          </div>
        </div>
      </Card>

      {rows.length === 0 && (
        <Upload.Dragger {...uploadProps}>
          <div className="my-4 flex justify-center">
            <UploadIcon className="size-10" />
          </div>
          <p>{t("purchase.import.uploadTitle")}</p>
          <p className="text-muted-second">{t("purchase.import.uploadHint")}</p>
        </Upload.Dragger>
      )}

      {rows.length > 0 && (
        <>
          <div className="mt-4 flex justify-end gap-2">
            {selectedInvalidRows.length > 0 && (
              <Button
                type="primary"
                onClick={() => setProductModalOpen(true)}
                disabled={!formik.values.supplierId}
              >
                {t("purchase.import.createSelectedProducts")} ({selectedInvalidRows.length})
              </Button>
            )}
            {invalidRows.length > 0 && (
              <Button
                danger
                onClick={() => {
                  setRows((prev) => prev.filter((row) => row.productId));
                  setSelectedInvalidRows([]);
                }}
              >
                {t("purchase.import.deleteInvalidSapCodes")} ({invalidRows.length})
              </Button>
            )}
          </div>
          <Card className="mt-3 overflow-hidden border border-border">
            <Table<PurchaseImportRow>
              rowKey="key"
              loading={productsLoading || productsFetching}
              rowSelection={{
                columnWidth: 36,
                selectedRowKeys: selectedInvalidRows.map((row) => row.key),
                onChange: (_, selectedRows) => setSelectedInvalidRows(selectedRows),
                getCheckboxProps: (record) => ({
                  disabled: Boolean(record.productId) && isSapCodeValid(record.sapCode),
                }),
              }}
              columns={columns}
              dataSource={rows}
              pagination={false}
              scroll={{ x: "max-content", y: "calc(100vh - 420px)" }}
            />
          </Card>
        </>
      )}

      <div className="mt-4 flex justify-end">
        <Button
          type="primary"
          htmlType="submit"
          loading={formik.isSubmitting}
          disabled={!formik.values.supplierId || rows.length === 0 || invalidRows.length > 0}
        >
          {t("common.save")}
        </Button>
      </div>

      <ProductCreateModal
        open={productModalOpen}
        rows={selectedInvalidRows}
        supplierId={formik.values.supplierId}
        isSerial={!nonSerial}
        onClose={() => {
          setProductModalOpen(false);
          setSelectedInvalidRows([]);
        }}
        onCreated={async () => {
          await refetchProducts();
          setProductModalOpen(false);
          setSelectedInvalidRows([]);
        }}
      />

      <Modal
        open={modalOpen}
        width="100%"
        centered
        closable={false}
        footer={false}
        title={
          <div className="flex items-center justify-between">
            <span>{t("purchase.import.modalTitle")}</span>
            <Button type="text" icon={<X className="size-4" />} onClick={resetImport} />
          </div>
        }
      >
        <Steps
          current={currentStep}
          items={[
            { title: t("purchase.import.sheetStep") },
            { title: t("purchase.import.previewStep") },
            { title: t("purchase.import.mappingStep") },
          ]}
        />

        <div className="mt-6">
          {currentStep === 0 && workbook && (
            <div className="flex flex-col items-center gap-5">
              <Radio.Group
                value={selectedSheet}
                className="!flex !flex-col !gap-2"
                options={workbook.SheetNames.map((sheetName) => ({
                  label: sheetName,
                  value: sheetName,
                }))}
                onChange={(event) => setSelectedSheet(event.target.value)}
              />
              <Button
                type="primary"
                size="large"
                disabled={!selectedSheet}
                onClick={() => setCurrentStep(1)}
              >
                {t("common.next")}
              </Button>
            </div>
          )}

          {currentStep === 1 && (
            <div>
              <Table<ExcelRow>
                columns={sheetColumns}
                dataSource={sheetRows.map((row, index) => ({
                  ...row,
                  key: index + 1,
                }))}
                bordered
                pagination={false}
                scroll={{ x: "max-content", y: "calc(100vh - 420px)" }}
              />
              <div className="mt-5 flex justify-center">
                <Button type="primary" size="large" onClick={() => setCurrentStep(2)}>
                  {t("common.next")}
                </Button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <Table<ExcelRow>
                columns={sheetColumns}
                dataSource={sheetRows.slice(0, 5).map((row, index) => ({
                  ...row,
                  key: index + 1,
                }))}
                bordered
                pagination={false}
                scroll={{ x: "max-content" }}
                summary={() => (
                  <Table.Summary.Row>
                    {sheetColumns.map((column, index) => {
                      const dataIndex =
                        "dataIndex" in column ? String(column.dataIndex ?? "") : "";
                      const selectedKey = Object.entries(mapping).find(
                        ([, value]) => value === dataIndex,
                      )?.[0] as MappingKey | undefined;

                      return (
                        <Table.Summary.Cell key={dataIndex || index} index={index}>
                          <Select<MappingKey>
                            allowClear
                            value={selectedKey}
                            placeholder={t("purchase.import.selectField")}
                            className="w-52"
                            options={mappingOptions.map((option) => ({
                              ...option,
                              disabled:
                                Boolean(mapping[option.value as MappingKey]) &&
                                mapping[option.value as MappingKey] !== dataIndex,
                            }))}
                            onChange={(value) => {
                              setMapping((prev) => {
                                const next = { ...prev };
                                Object.entries(next).forEach(([key, selectedColumn]) => {
                                  if (selectedColumn === dataIndex) {
                                    delete next[key as MappingKey];
                                  }
                                });
                                if (value) next[value] = dataIndex;
                                return next;
                              });
                            }}
                          />
                        </Table.Summary.Cell>
                      );
                    })}
                  </Table.Summary.Row>
                )}
              />
              <div className="mt-5 flex justify-center">
                <Button
                  type="primary"
                  size="large"
                  disabled={!hasRequiredMapping}
                  onClick={handleSaveMappedRows}
                >
                  {t("common.save")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </Form>
  );
}
