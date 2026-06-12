import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Col,
  Form,
  Row,
  Segmented,
  Switch,
  Table,
  TableColumnType,
  Input,
} from "antd";
import { useFormik } from "formik";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import SelectDate from "@/components/fields/SelectDate";
import { selectBoxOptions } from "@/shared/types";
import dayjs from "dayjs";
import useWindowSize from "@/shared/hooks/useWindowSize";
import { $axiosPrivate } from "@/services/AxiosService";
import LineClampCell from "@/components/ui/text/LineClampCell";
import { ArrowLeft, Plus } from "lucide-react";
import toast from "react-hot-toast";
import SelectCustom from "@/components/fields/SelectCustom";
import { formatDate } from "@/shared/utils/helpers";
import ExcelImportFile from "@/components/widget/excelimport/ExcelImportFile";
import Card from "@/components/ui/card/Card";
import { selectListEndpoints, selectListKeys } from "@/shared/constants";
import ProductCreateModal from "./components/ProductCreateModal";
import ProductsCreateModal from "./components/ProductsCreateModal";
import NonSerialTableImport from "./components/NonSerialTableImport";
import ExcelTemplateDropdown from "./components/ExcelTemplateDropdown";
import { purchaseEndpoint } from "@/modules/purchases/constants/endpoints";
import SupplierAddEdit from "@/modules/settings/features/settings/supplier/addedit";
import { supplierPermission } from "@/modules/settings/constants/permissions";
import { errorHandlers } from "@/shared/utils/helpers/errorHandlers";
import { useChangeSelectType } from "@/hooks/useChangeSelectType ";
import { useAppSelector } from "@/store/hooks";

interface initialValues {
  newProducts?: ExcelDataProductIncomeType[];
  newSerialProducts?: ExcelDataProductIncomeType[];
  docDate: string;
  isCharacter?: boolean;
  requestCode: string;
  movementCode: string;
  currencyId?: number | null;
  supplierId: number | null;
}
interface ProductSelectOption {
  id: number;
  code: string;
  name: string;
}

interface ImportColumnConfig {
  dataIndex: string;
  title: string;
  width?: number;
  align?: "left" | "center" | "right";
  ellipsis?: boolean;
  code: string;
  render?: (value: unknown) => ReactNode;
}

export interface ExcelDataProductIncomeType {
  indexId: number;
  productName: string;
  isSerial: boolean;
  name: string;
  sapCode: string;
  weightGram: number;
  currencyId: number | null;
  size: number;
  description: string;
  supplierId: number | null;
  price: string;
  productId: number | null;
  isMandatory: boolean;
  qty: number;
  serialNumber: string;
  markingNumber: string;
  pricePerUom: number | null;
  markerNumber: string;
  hasInstallment: boolean;
  [key: string]: unknown; // Dinamik fieldlar uchun
}

// Asosiy column konfiguratsiyasi
const getBaseColumnConfig = (
  productWithCount: boolean,
  withDiscount: boolean,
): ImportColumnConfig[] => {
  const baseColumns: ImportColumnConfig[] = [
    {
      dataIndex: "indexId",
      title: "T/r",
      width: 50,
      align: "center",
      code: "indexId",
      render: (value: unknown) => (
        <LineClampCell text={value == null ? null : String(value)} />
      ),
    },
    {
      dataIndex: "product",
      title: "Mahsulot nomi",
      ellipsis: true,
      width: 200,
      code: "product",
      render: (value: unknown) => (
        <LineClampCell text={value == null ? null : String(value)} />
      ),
    },
  ];

  if (productWithCount) {
    const columns: ImportColumnConfig[] = [
      ...baseColumns,
      {
        dataIndex: "sapCode",
        title: "Sap kod",
        align: "center",
        code: "sapCode",
      },
      {
        dataIndex: "qty",
        title: "Miqdori",
        align: "center",
        code: "qty",
      },
      {
        dataIndex: "pricePerUom",
        title: "Narxi",
        align: "center",
        code: "pricePerUom",
        render: (value: unknown) => (
          <LineClampCell text={value == null ? null : String(value)} />
        ),
      },
    ];

    // Chegirma qo'shish
    if (withDiscount) {
      columns.push({
        dataIndex: "discount",
        title: "Chegirma",
        align: "center",
        code: "discount",
        render: (value: unknown) => (
          <LineClampCell text={value == null ? null : String(value)} />
        ),
      });
    }

    return columns;
  } else {
    const columns: ImportColumnConfig[] = [
      ...baseColumns,
      {
        dataIndex: "serialNumber",
        title: "Seriya raqam",
        width: 200,
        code: "serialNumber",
      },
      {
        dataIndex: "sapCode",
        title: "Sab kodi",
        width: 200,
        align: "center",
        code: "sapCode",
      },
      {
        dataIndex: "markingNumber",
        title: "Markirovka raqami",
        width: 200,
        align: "center",
        code: "markingNumber",
        render: (value: unknown) => (
          <LineClampCell text={value == null ? null : String(value)} />
        ),
      },
      {
        dataIndex: "price",
        title: "Narxi",
        width: 150,
        align: "center",
        code: "price",
        render: (value: unknown) => (
          <LineClampCell text={value == null ? null : String(value)} />
        ),
      },
    ];

    // Chegirma qo'shish
    if (withDiscount) {
      columns.push({
        dataIndex: "discount",
        title: "Chegirma",
        width: 150,
        align: "center",
        code: "discount",
        render: (value: unknown) => (
          <LineClampCell text={value == null ? null : String(value)} />
        ),
      });
    }

    return columns;
  }
};

interface EditableCellProps {
  value: unknown;
  dataIndex: string;
  rowIndex: number;
  onCommit: (rowIndex: number, dataIndex: string, value: string) => void;
  isInvalid?: boolean;
  onAddClick?: () => void;
}

const numericColumns = new Set([
  "qty",
  "price",
  "pricePerUom",
  "discount",
  "weightGram",
  "size",
]);

const EditableCell = memo(function EditableCell({
  value,
  dataIndex,
  rowIndex,
  onCommit,
  isInvalid = false,
  onAddClick,
}: EditableCellProps) {
  const [localValue, setLocalValue] = useState<string>(String(value ?? ""));
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setLocalValue(String(value ?? ""));
    }
  }, [value, isEditing]);

  const startEditing = useCallback(() => {
    setIsEditing(true);
  }, []);

  const commit = useCallback(() => {
    onCommit(rowIndex, dataIndex, localValue);
    setIsEditing(false);
  }, [rowIndex, dataIndex, localValue, onCommit]);

  const cancelEdit = useCallback(() => {
    setLocalValue(String(value ?? ""));
    setIsEditing(false);
  }, [value]);

  if (isEditing) {
    return (
      <Input
        autoFocus
        size="small"
        status={isInvalid ? "error" : undefined}
        value={localValue}
        inputMode={numericColumns.has(dataIndex) ? "decimal" : "text"}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={commit}
        onPressEnter={commit}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            cancelEdit();
          }
        }}
      />
    );
  }

  return (
    <div
      className={`flex min-h-8 items-center gap-1 rounded border px-1 transition-colors ${
        isInvalid
          ? "border-red-300 bg-red-50"
          : "border-transparent hover:border-slate-300"
      }`}
    >
      <button
        type="button"
        className={`w-full bg-transparent px-1 py-1 text-left text-sm outline-none ${
          isInvalid ? "text-red-600" : "text-inherit"
        }`}
        onClick={startEditing}
        onFocus={startEditing}
      >
        <LineClampCell text={localValue || null} />
      </button>
      {isInvalid && onAddClick && (
        <Button
          type="link"
          size="small"
          className="!h-6 !px-1"
          icon={<Plus className="size-3" />}
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.stopPropagation();
            onAddClick();
          }}
        />
      )}
    </div>
  );
});

const PurchaseImport = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const org = useAppSelector((state) => state.organization);
  const [excelData, setExcelData] = useState<ExcelDataProductIncomeType[]>([]);
  const [nonSapcodeList, setNonSapcodeList] = useState<
    ExcelDataProductIncomeType[]
  >([]);
  const [modal, setModal] = useState(false);
  const [openSupplier, setOpenSupplier] = useState(false);
  const [productWithCount, setProductWithCount] = useState(false);
  const [withDiscount, setWithWithDiscount] = useState(false);
  const [isNonSerial, setIsNonSerial] = useState(false);
  const { height } = useWindowSize();
  const [foundedSapCodes, setFoundedSapCodes] = useState<number>(0);

  // Asosiy column konfiguratsiyasini olish
  const baseColumnConfig = useMemo(
    () => getBaseColumnConfig(productWithCount, withDiscount),
    [productWithCount, withDiscount],
  );

  // SelectBox options ni column konfiguratsiyasidan yaratish
  const [selectBoxOptions, setSelectBoxOptions] = useState<selectBoxOptions[]>(
    () => {
      return baseColumnConfig
        .filter((col) => col.code !== "indexId") // T/r ni olib tashlaymiz
        .map((col) => ({
          label: col.title as string,
          code: col.code,
          disabled: false,
        }));
    },
  );
  useEffect(() => {
    const newOptions = baseColumnConfig
      .filter((col) => col.code !== "indexId")
      .map((col) => ({
        label: col.title as string,
        code: col.code,
        disabled: false,
      }));

    setSelectBoxOptions(newOptions);
  }, [baseColumnConfig]);
  // Yakuniy column konfiguratsiyasi (asosiy + dinamik qo'shilgan columnlar)
  const columnConfig = useMemo<ImportColumnConfig[]>(() => {
    // SelectBoxOptions dan columnlar yaratish
    const dynamicColumns: ImportColumnConfig[] = selectBoxOptions
      .filter(
        (option) => !baseColumnConfig.some((col) => col.code === option.code), // Asosiy configda mavjud bo'lmaganlar
      )
      .map((option) => ({
        dataIndex: option.code,
        title: option.label,
        align: "center" as const,
        code: option.code,
        render: (value: unknown) => (
          <LineClampCell text={value == null ? null : String(value)} />
        ),
      }));

    return [...baseColumnConfig, ...dynamicColumns];
  }, [baseColumnConfig, selectBoxOptions]);

  const importType = productWithCount ? "newProducts" : "newSerialProducts";

  const validationSchema = yup.object<initialValues>({
    docDate: yup.string().required("asd"),
    supplierId: yup.number().required("sadasd"),
    newProducts: yup.array().notRequired(),
    newSerialProducts: yup.array().notRequired(),
    contractId: org.useContractAccounting
      ? yup.number().nullable().required("Shartnoma tanlang")
      : yup.number().nullable().notRequired(),
  });

  const formik = useFormik<initialValues>({
    initialValues: {
      docDate: dayjs().format(formatDate),
      supplierId: null,
      isCharacter: false,
      requestCode: "",
      movementCode: "PURCHASE",
      newProducts: productWithCount ? excelData : [],
      newSerialProducts: !productWithCount ? excelData : [],
      ...(org.useContractAccounting ? { contractId: null } : {}),
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        const response = await $axiosPrivate.post(
          purchaseEndpoint.CREATE,
          values,
        );
        if (response) {
          navigate(-1);
          formik.resetForm();
          toast.success("Excel muvaffaqiyatli import qilindi");
        }
      } catch (err) {
        errorHandlers(err);
      }
    },
  });

  const { data, isLoading, isFetching, isSuccess, refetch } = useQuery<
    ProductSelectOption[]
  >({
    queryKey: ["selectlist", selectListKeys.product],
    queryFn: async () => {
      const { data } = await $axiosPrivate.get(
        selectListEndpoints.productSelectList,
      );
      return data && data;
    },
    enabled: true,
  });
  console.log(data);

  // Table columnlarni yaratish
  const handleCellCommit = useCallback(
    (rowIndex: number, dataIndex: string, rawValue: string) => {
      const currentRows = (formik.values[importType] ??
        []) as ExcelDataProductIncomeType[];

      if (!currentRows[rowIndex]) {
        return;
      }

      const nextRows = [...currentRows];
      const targetRow = { ...nextRows[rowIndex] } as ExcelDataProductIncomeType;

      if (numericColumns.has(dataIndex)) {
        const parsed = Number(rawValue);
        (targetRow as Record<string, unknown>)[dataIndex] = Number.isNaN(parsed)
          ? null
          : parsed;
      } else {
        (targetRow as Record<string, unknown>)[dataIndex] = rawValue;
      }

      if (dataIndex === "sapCode") {
        const found = data?.find(
          (item) => String(item.code) === String(rawValue),
        );
        targetRow.productId = found ? Number(found.id) : null;
      }

      const previousValue = (currentRows[rowIndex] as Record<string, unknown>)[
        dataIndex
      ];
      const nextValue = (targetRow as Record<string, unknown>)[dataIndex];
      if (previousValue === nextValue) {
        return;
      }

      nextRows[rowIndex] = targetRow;

      setExcelData(nextRows);
      formik.setFieldValue(importType, nextRows, true);
    },
    [formik, importType, data],
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

      return data.some((item) => String(item.code).trim() === normalized);
    },
    [data],
  );

  const openSingleAddModal = useCallback(
    (record: ExcelDataProductIncomeType) => {
      setModal(true);
      setNonSapcodeList([
        {
          ...record,
          supplierId: formik.values.supplierId,
          isSerial: !productWithCount,
        },
      ]);
    },
    [formik.values.supplierId, productWithCount],
  );

  const tableColumns: TableColumnType<ExcelDataProductIncomeType>[] =
    useMemo(() => {
      return columnConfig.map((col: ImportColumnConfig) => {
        const baseColumn: TableColumnType<ExcelDataProductIncomeType> = {
          dataIndex: col.dataIndex,
          title: col.title,
          width: col.width,
          align: col.align,
          ellipsis: false,
        };

        if (col.code === "indexId") {
          return {
            ...baseColumn,
            render: (value: unknown) => (
              <LineClampCell text={value == null ? null : String(value)} />
            ),
          };
        }

        return {
          ...baseColumn,
          render: (
            value: unknown,
            record: ExcelDataProductIncomeType,
            rowIndex: any,
          ) => {
            const isSapCodeCell = col.code === "sapCode";
            const invalidSapCode = isSapCodeCell && !isSapCodeValid(value);

            return (
              <EditableCell
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
        const found = data.find((d) => d.code === item.sapCode.toString());
        return {
          ...item,
          name: item.productName,
          productName: item.productName,
          productId: found ? found.id : null,
        };
      });
      formik.setFieldValue(importType, updated, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isSuccess, excelData, importType]);

  const handleDeleteSapCodes = () => {
    const filteredData = formik.values[importType]?.filter(
      (item) => item.productId,
    );
    formik.setFieldValue(importType, filteredData, true);
    setFoundedSapCodes(0);
    toast.success("Topilmagan sab kodlar o'chirildi");
  };

  useEffect(() => {
    const filteredData = formik.values[importType]?.filter(
      (item) => !item.productId,
    );
    setFoundedSapCodes(filteredData?.length ?? 0);
  }, [formik.values, importType]);

  // Chegirma switch o'zgarganda
  const handleDiscountChange = (e: boolean) => {
    setWithWithDiscount(e);
    setFoundedSapCodes(0);
    formik.resetForm();
    setExcelData([]);
  };

  // Character switch o'zgarganda - bu endi faqat selectBox options ni o'zgartiradi
  const handleCharacterChange = (e: boolean) => {
    formik.setFieldValue("isCharacter", e, true);

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
  };
  useEffect(() => {
    if (formik.values.requestCode === "") {
      formik.setFieldValue(
        "requestCode",
        dayjs().toDate().getTime().toString(),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.requestCode]);
  useChangeSelectType("disabled");
  return (
    <div>
      <Form onFinish={formik.handleSubmit} layout="vertical">
        <Card className="p-3">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">
              {t("Purchase.excelImport.title")}
            </h2>
            <div className="flex items-center gap-2">
              <ExcelTemplateDropdown />
              <Button type="text" onClick={() => navigate(-1)}>
                <ArrowLeft className="size-4" />
                {t("Buttons.back")}
              </Button>
            </div>
          </div>
          <div className="mt-3">
            <Row gutter={20}>
              <Col span={6}>
                <SelectDate label="Sana" formik={formik} fieldName="docDate" />
              </Col>
              <Col span={6}>
                <SelectCustom
                  fieldName="supplierId"
                  label="Yetkazib beruvchi turi"
                  path="/select-list/suppliers"
                  formik={formik}
                  addOption={{
                    bool: true,
                    permissionCode: supplierPermission.CREATE,
                    onClick() {
                      setOpenSupplier(true);
                    },
                  }}
                />
              </Col>
              {org.useContractAccounting && (
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
              )}
              <Col span={org.useContractAccounting ? 6 : 12}>
                <div className="h-full flex justify-end items-center">
                  <Button
                    type="primary"
                    className=""
                    loading={formik.isSubmitting}
                    htmlType="submit"
                  >
                    {t("Buttons.save")}
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
            {!productWithCount && (
              <div className="text-sm">
                <Switch
                  checkedChildren="Serinkasiz mahsulot"
                  unCheckedChildren="Avval ustiga bosing"
                  checked={isNonSerial}
                  onChange={(e) => setIsNonSerial(e)}
                />
              </div>
            )}
            <div className="text-sm">
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
            </div>
          </div>
        </Card>
        {isNonSerial && (
          <Card className="rounded-lg relative my-4">
            <NonSerialTableImport
              formik={formik}
              data={formik.values.newProducts ?? []}
            />
          </Card>
        )}
        <div className="flex justify-between items-center">
          <ExcelImportFile
            selectBoxOptions={selectBoxOptions}
            setSelectBoxOptions={setSelectBoxOptions}
            excelData={excelData}
            setData={setExcelData}
            formik={formik}
            disabled={!formik.values.supplierId}
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
                      supplierId: formik.values.supplierId,
                      isSerial: !productWithCount,
                    })),
                  );
                },
                checkStrictly: false,
                getCheckboxProps: (record: ExcelDataProductIncomeType) => ({
                  disabled: !!record.productId,
                  name: record.name,
                }),
                selectedRowKeys: nonSapcodeList.map((item) => item.indexId),
              }}
              columns={tableColumns}
              dataSource={formik.values[importType]?.map((item, index) => ({
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
        <SupplierAddEdit
          open={openSupplier}
          setOpen={setOpenSupplier}
          edit={null}
        />
      </Form>
    </div>
  );
};

export default PurchaseImport;
