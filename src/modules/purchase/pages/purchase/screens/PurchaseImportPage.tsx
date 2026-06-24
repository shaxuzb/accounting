import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Col,
  Form,
  Row,
  Segmented,
  Switch,
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
import { ArrowLeft, Plus } from "lucide-react";
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
import {
  isCompletePurchaseLine,
  isCompletePurchaseServiceLine,
  purchaseValidationSchema,
} from "@/modules/purchase/pages/purchase/types/schema";
import PurchaseImportEditableCell from "../components/PurchaseImportEditableCell";
import PurchaseServiceLinesTable from "../components/PurchaseServiceLinesTable";
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
  code: string;
  name: string;
}

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
const PURCHASE_IMPORT_DRAFT_SERVICE_LINES_KEY =
  "purchase-import:draft:service-lines";
const PURCHASE_IMPORT_DRAFT_PRODUCT_WITH_COUNT_KEY =
  "purchase-import:draft:product-with-count";
const PURCHASE_IMPORT_DRAFT_IS_NON_SERIAL_KEY =
  "purchase-import:draft:is-non-serial";

const getDefaultPurchaseImportHeader = (): PurchaseImportHeaderDraft => ({
  docDate: dayjs().format(formatDate),
  counterpartyId: null,
  contractId: null,
  currencyId: 1,
  warehouseId: null,
  comment: "",
});

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
  const [serviceLinesDraft, setServiceLinesDraft] = useLocalStorage<
    PurchaseImportForm["serviceLines"]
  >(PURCHASE_IMPORT_DRAFT_SERVICE_LINES_KEY, []);
  // const [openSupplier, setOpenSupplier] = useState(false);
  const [productWithCount, setProductWithCount] = useLocalStorage<boolean>(
    PURCHASE_IMPORT_DRAFT_PRODUCT_WITH_COUNT_KEY,
    false,
  );
  const [withDiscount, _setWithWithDiscount] = useState(false);
  const [isNonSerial, setIsNonSerial] = useLocalStorage<boolean>(
    PURCHASE_IMPORT_DRAFT_IS_NON_SERIAL_KEY,
    serviceLinesDraft.length > 0,
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

  const columnConfig = useMemo<ImportColumnConfig[]>(
    () => buildColumnConfig(baseColumnConfig, selectBoxOptions),
    [baseColumnConfig, selectBoxOptions],
  );

  const formik = useFormik<PurchaseImportForm>({
    initialValues: {
      ...headerDraft,
      lines: excelData,
      serviceLines: serviceLinesDraft,
      // newProducts: productWithCount ? excelData : [],
      // newSerialProducts: !productWithCount ? excelData : [],
    },
    validationSchema: purchaseValidationSchema,
    onSubmit: async (values, helpers) => {
      const lines = values.lines
        .filter(isCompletePurchaseLine)
        .map((item) => ({
          productId: Number(item.productId),
          markingNumber: String(item.markingNumber ?? "").trim() || null,
          serialNumber: String(item.serialNumber ?? "").trim() || null,
          qty: Number(item.qty ?? 1),
          price: Number(item.price ?? item.pricePerUom ?? 0),
          vatRateId: item.vatRateId ?? 1,
        }));
      const serviceLines = values.serviceLines
        .filter(isCompletePurchaseServiceLine)
        .map((item) => ({
          serviceId: Number(item.serviceId),
          price: Number(item.price),
        }));

      if (!lines.length && !serviceLines.length) {
        toast.error("Kamida bitta mahsulot yoki serinkasiz mahsulot kiriting");
        return;
      }

      await importPurchase.mutateAsync({
        docDate: values.docDate,
        counterpartyId: values.counterpartyId ?? 0,
        warehouseId: values.warehouseId ?? 0,
        currencyId: values.currencyId ?? 0,
        contractId: values.contractId,
        comment: values.comment || null,
        lines,
        serviceLines,
      });
      const defaultHeader = getDefaultPurchaseImportHeader();
      setHeaderDraft(defaultHeader);
      setExcelData([]);
      setServiceLinesDraft([]);
      setProductWithCount(false);
      setIsNonSerial(false);
      helpers.resetForm({
        values: {
          ...defaultHeader,
          lines: [],
          serviceLines: [],
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
      if (field === "serviceLines" && Array.isArray(value)) {
        setServiceLinesDraft(value as PurchaseImportForm["serviceLines"]);
      }

      return formik.setFieldValue(field, value, shouldValidate);
    },
    [formik, setExcelData, setHeaderDraft, setServiceLinesDraft],
  );

  const draftFormik = useMemo(
    () => ({
      ...formik,
      setFieldValue: setDraftFieldValue,
    }),
    [formik, setDraftFieldValue],
  );

  const { data, isLoading, isFetching, isSuccess } = useQuery<
    ProductSelectOption[]
  >({
    queryKey: ["selectlist", selectListKeys.product],
    queryFn: async () => {
      const { data } = await $axiosPrivate.get(
        selectListEndpoints.productsSelectList,
      );
      return data && data;
    },
    enabled: true,
  });

  const productIdBySapCode = useMemo(() => {
    const map = new Map<string, number>();
    (data ?? []).forEach((item) => {
      map.set(String(item.code).trim(), Number(item.id));
    });
    return map;
  }, [data]);

  const resolveProductIds = useCallback(
    (rows: PurchaseImportRow[]) =>
      rows.map((item) => ({
        ...item,
        productId:
          item.productId ??
          productIdBySapCode.get(String(item.sapCode ?? "").trim()) ??
          null,
      })),
    [productIdBySapCode],
  );

  const commitRows = useCallback(
    (rows: PurchaseImportRow[]) => {
      setExcelData(rows);
      formik.setFieldValue("lines", rows, false);
    },
    [formik, setExcelData],
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
        price: 0,
        pricePerUom: 0,
        vatRateId: 1,
        vatRates: null,
        isSerial: !productWithCount,
      },
    ]);
  }, [
    commitRows,
    excelData,
    formik.values.counterpartyId,
    formik.values.currencyId,
    productWithCount,
  ]);

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
    return columnConfig.map((col: ImportColumnConfig) => {
      const baseColumn: TableColumnType<PurchaseImportRow> = {
        dataIndex: col.dataIndex,
        title: col.title,
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

      return {
        ...baseColumn,
        render: (value: unknown, _record: PurchaseImportRow, rowIndex: number) => {
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
  }, [columnConfig, handleCellCommit, isSapCodeValid]);

  useEffect(() => {
    if (isSuccess && data && excelData.length > 0) {
      const updated = excelData.map((item) => {
        const productId = productIdBySapCode.get(String(item.sapCode).trim());
        return {
          ...item,
          name: item.productName,
          productName: item.productName,
          productId: productId ?? null,
        };
      });
      const timeoutId = window.setTimeout(() => commitRows(updated), 0);
      return () => window.clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isSuccess, productIdBySapCode]);

  const handleDeleteSapCodes = () => {
    const filteredData = formik.values.lines?.filter((item) => item.productId);
    const nextRows = filteredData ?? [];
    commitRows(nextRows);
    toast.success("Topilmagan sab kodlar o'chirildi");
  };

  const handleServiceLinesChange = useCallback(
    (items: PurchaseImportForm["serviceLines"]) => {
      setServiceLinesDraft(items);
      formik.setFieldValue("serviceLines", items, true);
    },
    [formik, setServiceLinesDraft],
  );

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
                  label="Yetkazib beruvchi turi"
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
                value={productWithCount}
                onChange={(e) => {
                  const nextProductWithCount = Boolean(e);
                  setProductWithCount(nextProductWithCount);
                  setSelectBoxOptions(
                    toSelectBoxOptions(
                      getBaseColumnConfig(nextProductWithCount, withDiscount),
                    ),
                  );
                  setIsNonSerial(false);
                }}
                options={[
                  {
                    label: "Serinkali",
                    value: false,
                  },
                  {
                    label: "Serinkasiz",
                    value: true,
                  },
                ]}
              />
              <Switch
                checked={isNonSerial}
                checkedChildren="Serinkasiz mahsulot"
                unCheckedChildren="Serinkasiz mahsulot"
                onChange={(checked) => {
                  setIsNonSerial(checked);
                  if (!checked) {
                    handleServiceLinesChange([]);
                  }
                }}
              />
              <Button
                type="default"
                htmlType="button"
                icon={<Plus className="size-4" />}
                disabled={!formik.values.counterpartyId}
                onClick={handleAddManualRow}
              >
                Mahsulotni qo'lda qo'shish
              </Button>
            </div>
            <div className="flex items-center">
              <Button
                type="primary"
                className=""
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
          <ExcelImportFile
            selectBoxOptions={selectBoxOptions}
            setSelectBoxOptions={setSelectBoxOptions}
            setData={handleExcelDataChange}
            formik={draftFormik}
            disabled={!formik.values.counterpartyId}
          />
          <div className="flex flex-wrap items-center justify-end gap-3">
            {excelData.length > 0 && (
              <Button
                type="primary"
                htmlType="button"
                danger
                onClick={handleDeleteSapCodes}
                icon={<div>{foundedSapCodes}</div>}
                disabled={isLoading || isFetching || foundedSapCodes === 0}
              >
                Topilmagan sab kodlarni o'chirish
              </Button>
            )}
          </div>
        </div>

        {isNonSerial && (
          <div className="mt-3">
            <PurchaseServiceLinesTable
              items={formik.values.serviceLines}
              onChange={handleServiceLinesChange}
            />
          </div>
        )}

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
      </Form>
    </div>
  );
};

export default PurchaseImportPage;
