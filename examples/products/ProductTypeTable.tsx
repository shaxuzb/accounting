import { Button, ConfigProvider, Table, TableColumnType, Tag } from "antd";
import { FormikProps } from "formik";
import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import AddProductTypeModal from "./AddProductTypeModal";
import LineClampCell from "@/components/ui/text/LineClampCell";
import { Edit, Trash } from "lucide-react";
import {
  ProductTypeInitialValues,
  ProductTypeProductsInitialValues,
} from "@/modules/warehouses/types/initialValues";
import UpdateProductType from "./UpdateProductType";

type ProductRow = ProductTypeProductsInitialValues & {
  id?: number;
  idIndex?: number;
  new?: boolean;
  state?: string;
};

interface ProductTypeTableProps {
  tableData: ProductRow[];
  formik: FormikProps<ProductTypeInitialValues>;
  fieldName?: string;
  openEditModal?: boolean;
  refetch: () => void;
  setOpenEditModal?: React.Dispatch<React.SetStateAction<boolean>>;
}

const ProductTypeTable: FC<ProductTypeTableProps> = (props) => {
  const {
    tableData,
    formik,
    fieldName = "products",
    openEditModal,
    setOpenEditModal,
    refetch,
  } = props;
  const { t } = useTranslation();
  const [editItem, setEditItem] = useState<ProductRow>();

  const tableColumnLabels: TableColumnType<ProductRow>[] = [
    { dataIndex: "idIndex", title: t("Table.ordinalNumber"), width: 70 },
    {
      dataIndex: "name",
      title: t("Table.productName"),
      render: (value, record) => {
        return (
          <Button
            type="link"
            onClick={() => {
              setOpenEditModal?.(true);
              setEditItem(record);
            }}
          >
            <LineClampCell text={value} />
          </Button>
        );
      },
    },
    {
      dataIndex: "sapCode",
      title: t("Table.sapCode"),
      align: "center",
    },
    {
      dataIndex: "characteristics",
      width: 200,
      title: "Tavsifi",
      render: (_, record) => {
        return (
          <div className="flex flex-col">
            {record.characteristics.map((item, index) => {
              return (
                <div key={`${item.key}-${index}`}>
                  <span className="font-semibold">{item.key}: </span>
                  <span>{item.value}</span>
                </div>
              );
            })}
          </div>
        );
      },
    },
    {
      dataIndex: "supplier",
      title: t("Table.supplier"),
      align: "center",
    },
    {
      dataIndex: "description",
      title: t("Table.description"),
      render: (value) => <LineClampCell text={value} />,
    },
    {
      dataIndex: "stateId",
      title: t("Table.state"),
      fixed: "right",
      align: "center",
      render(value, record) {
        return (
          <Tag color={record.new ? "blue" : value === 1 ? "green" : "red"}>
            {record.new ? "Yangi" : value === 1 ? "Faol" : "Deaktiv"}
          </Tag>
        );
      },
    },
    {
      dataIndex: "actions",
      title: t("Table.actions"),
      width: 120,
      fixed: "right",
      align: "center",
      render(_, record) {
        return (
          <div className="flex items-center justify-center">
            {!record.new && record.id && (
              <UpdateProductType
                data={{ productTypeId: formik.values.id ?? 0, id: record.id }}
                refetch={refetch}
              />
            )}
            <Button
              onClick={() => {
                setOpenEditModal?.(true);
                setEditItem(record);
              }}
              type="text"
              className="!px-1.5"
            >
              <Edit className="!text-blue-800 size-3.5" />
            </Button>
            <Button
              onClick={() => handleDelete(record)}
              type="text"
              className="!px-1.5"
            >
              <Trash className="!text-red-800 size-3.5" />
            </Button>
          </div>
        );
      },
    },
  ];

  const handleDelete = (itemDelete: ProductRow) => {
    let filtered: ProductRow[];

    if (itemDelete.new) {
      filtered = tableData.filter(
        (item) => item.idIndex !== itemDelete.idIndex,
      );
    } else {
      filtered = tableData.map((item) =>
        item.idIndex === itemDelete.idIndex
          ? { ...item, stateId: 2, state: "Deaktiv" }
          : item,
      );
    }

    formik.setFieldValue(fieldName, filtered, true);
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Table: {
            cellPaddingBlock: 8,
          },
        },
      }}
    >
      <Table
        columns={tableColumnLabels}
        virtual={tableData.length > 100}
        dataSource={tableData
          ?.sort((a, b) => (b.idIndex ?? 0) - (a.idIndex ?? 0))
          .map((item) => ({
            ...item,
            key: item.id ?? item.idIndex,
          }))}
        scroll={{ y: "calc(100vh - 420px)", x: "max-content" }}
        pagination={false}
        className="mt-3"
      />

      <AddProductTypeModal
        formik={formik}
        open={openEditModal}
        setOpen={setOpenEditModal}
        editItem={editItem}
        setEditItem={setEditItem}
      />
    </ConfigProvider>
  );
};

export default ProductTypeTable;
