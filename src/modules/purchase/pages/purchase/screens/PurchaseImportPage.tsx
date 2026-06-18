import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Col,
  Form,
  Row,
  Segmented,
  Table,
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
import { ArrowLeft } from "lucide-react";
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
import ProductsCreateModal from "../components/ProductsCreateModal";
import ProductCreateModal from "../components/ProductCreateModal";
import type { PurchaseImportForm } from "@/modules/purchase/pages/purchase/types/form";
import { formatDate, formatDateWithOutTime } from "@/utils/helpers";
import { purchaseValidationSchema } from "@/modules/purchase/pages/purchase/types/schema";
import PurchaseImportEditableCell from "../components/PurchaseImportEditableCell";
import {
  buildColumnConfig,
  getBaseColumnConfig,
  numericImportColumns,
  toSelectBoxOptions,
  type ImportColumnConfig,
} from "../utils/importColumns";
import { useCreatePurchase } from "../hooks/useCreatePurchase";

interface ProductSelectOption {
  id: number;
  code: string;
  name: string;
}

const PurchaseImportPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  // const org = useAppSelector((state) => state.organization);
  const [excelData, setExcelData] = useState<PurchaseImportRow[]>([]);
  const [nonSapcodeList, setNonSapcodeList] = useState<PurchaseImportRow[]>([]);
  const [modal, setModal] = useState(false);
  // const [openSupplier, setOpenSupplier] = useState(false);
  const [productWithCount, setProductWithCount] = useState(false);
  const [withDiscount, _setWithWithDiscount] = useState(false);
  const [_isNonSerial, setIsNonSerial] = useState(false);
  const { height } = useWindowSize();
  const [foundedSapCodes, setFoundedSapCodes] = useState<number>(0);
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

  useEffect(() => {
    setSelectBoxOptions(toSelectBoxOptions(baseColumnConfig));
  }, [baseColumnConfig]);

  const columnConfig = useMemo<ImportColumnConfig[]>(
    () => buildColumnConfig(baseColumnConfig, selectBoxOptions),
    [baseColumnConfig, selectBoxOptions],
  );

  const formik = useFormik<PurchaseImportForm>({
    initialValues: {
      docDate: dayjs().format(formatDate),
      counterpartyId: null,
      contractId: null,
      currencyId: 1,
      warehouseId: null,
      comment: "",
      lines: excelData,
      // newProducts: productWithCount ? excelData : [],
      // newSerialProducts: !productWithCount ? excelData : [],
    },
    validationSchema: purchaseValidationSchema,
    onSubmit: async (values, helpers) => {
      await importPurchase.mutateAsync({
        ...values,
        lines: values.lines.map((item) => ({ ...item, vatRateId: 1 })),
      });
      navigate(-1);
      helpers.resetForm();
    },
  });

  const { data, isLoading, isFetching, isSuccess, refetch } = useQuery<
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
    [formik],
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
    [formik, resolveProductIds],
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

  const openSingleAddModal = useCallback(
    (record: PurchaseImportRow) => {
      setModal(true);
      setNonSapcodeList([
        {
          ...record,
          counterpartyId: formik.values.counterpartyId,
          isSerial: !productWithCount,
        },
      ]);
    },
    [formik.values.counterpartyId, productWithCount],
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
        render: (value: unknown, record: PurchaseImportRow, rowIndex: any) => {
          const isSapCodeCell = col.code === "sapCode";
          const invalidSapCode = isSapCodeCell && !isSapCodeValid(value);

          return (
            <PurchaseImportEditableCell
              value={value}
              dataIndex={String(col.dataIndex)}
              rowIndex={rowIndex ?? 0}
              onCommit={handleCellCommit}
              isInvalid={invalidSapCode}
              onAddClick={
                invalidSapCode ? () => openSingleAddModal(record) : undefined
              }
            />
          );
        },
      };
    });
  }, [columnConfig, handleCellCommit, isSapCodeValid, openSingleAddModal]);

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
      commitRows(updated);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isSuccess, productIdBySapCode]);

  const handleDeleteSapCodes = () => {
    const filteredData = formik.values.lines?.filter((item) => item.productId);
    const nextRows = filteredData ?? [];
    commitRows(nextRows);
    setFoundedSapCodes(0);
    toast.success("Topilmagan sab kodlar o'chirildi");
  };

  useEffect(() => {
    const filteredData = formik.values.lines?.filter((item) => !item.productId);
    setFoundedSapCodes(filteredData?.length ?? 0);
  }, [formik.values]);

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
              <Col span={24}>
                <SelectDate label="Sana" formik={formik} fieldName="docDate" />
              </Col>
              <Col span={24}>
                <SelectCustom
                  fieldName="counterpartyId"
                  label="Yetkazib beruvchi turi"
                  path={selectListEndpoints.counterpartiesSelectList}
                  getFirst
                  formik={formik}
                  // addOption={{
                  //   bool: true,
                  //   permissionCode: counterpartyPermissions.create,
                  //   onClick() {
                  //     setOpenSupplier(true);
                  //   },
                  // }}
                />
              </Col>
              <Col span={24}>
                <SelectCustom
                  path={selectListEndpoints.warehousesSelectList}
                  label="Ombor"
                  fieldName="warehouseId"
                  formik={formik}
                />
              </Col>
              <Col span={24}>
                <SelectCustom
                  path={selectListEndpoints.currenciesSelectList}
                  label="Valyuta"
                  fieldName="currencyId"
                  formik={formik}
                />
              </Col>
              <Col span={24}>
                <SelectCustom
                  path={
                    selectListEndpoints.contractsSelectList +
                    `?choosedDate=${dayjs(formik.values.docDate).format(formatDateWithOutTime)}${formik.values.counterpartyId ? `&${filterIds.counterparty}=${formik.values.counterpartyId}` : ""}`
                  }
                  label="Shartnoma"
                  fieldName="contractId"
                  formik={formik}
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
              <Col span={4}>
                <div className="h-full flex justify-end items-center">
                  <Button
                    type="primary"
                    className=""
                    loading={formik.isSubmitting}
                    htmlType="submit"
                  >
                    {t("common.save")}
                  </Button>
                </div>
              </Col>
            </Row>
          </div>
          <div className="flex gap-4 items-center">
            <div>
              <Segmented
                disabled={excelData.length > 0}
                value={productWithCount}
                onChange={(e) => {
                  setProductWithCount(e);
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
        <div className="flex justify-between items-center">
          <ExcelImportFile
            selectBoxOptions={selectBoxOptions}
            setSelectBoxOptions={setSelectBoxOptions}
            excelData={excelData}
            setData={handleExcelDataChange}
            formik={formik}
            disabled={!formik.values.counterpartyId}
          />
          <div className="flex items-center gap-3">
            {nonSapcodeList.length > 0 && (
              <Button
                type="primary"
                className="mt-3"
                htmlType="button"
                onClick={() => {
                  setModal(!modal);
                  setNonSapcodeList(
                    nonSapcodeList.filter(
                      (item, index, self) =>
                        index ===
                        self.findIndex(
                          (t) =>
                            t.sapCode.toString() === item.sapCode.toString(),
                        ),
                    ),
                  );
                }}
              >
                Topilmagan sablarni tasdiqlash
              </Button>
            )}
            {excelData.length > 0 && (
              <Button
                type="primary"
                className="mt-3"
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

        {excelData.length > 0 && (
          <div className="rounded-lg relative">
            <Table
              loading={isLoading || isFetching}
              rowSelection={{
                columnWidth: 30,
                fixed: "left",
                onChange: (_, rowSelection) => {
                  setNonSapcodeList(
                    rowSelection.map((item) => ({
                      ...item,
                      counterpartyId: formik.values.counterpartyId,
                      isSerial: !productWithCount,
                    })),
                  );
                },
                checkStrictly: false,
                getCheckboxProps: (record: PurchaseImportRow) => ({
                  disabled: !!record.productId,
                  name: record.name,
                }),
                selectedRowKeys: nonSapcodeList.map((item) => item.indexId),
              }}
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
          </div>
        )}
        {modal && nonSapcodeList.length <= 1 && (
          <ProductCreateModal
            open={modal}
            setOpen={setModal}
            editData={nonSapcodeList[0]}
            setEditData={setNonSapcodeList}
            refetch={refetch}
          />
        )}
        {modal && nonSapcodeList.length > 1 && (
          <ProductsCreateModal
            open={modal}
            setOpen={setModal}
            editData={nonSapcodeList}
            setEditData={setNonSapcodeList}
            refetch={refetch}
          />
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
