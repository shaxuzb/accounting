import { Button, Table, Tag } from "antd";
import type { TableColumnType } from "antd";
import type { FormikProps } from "formik";
import { Edit, Trash } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { ProductItem, ProductTypeForm } from "../types/type";
import ProductItemModal from "./ProductItemModal";

interface ProductItemsTableProps {
  formik: FormikProps<ProductTypeForm>;
  open: boolean;
  setOpen: (value: boolean) => void;
}

export default function ProductItemsTable({
  formik,
  open,
  setOpen,
}: ProductItemsTableProps) {
  const { t } = useTranslation();
  const [editItem, setEditItem] = useState<ProductItem>();

  const handleDelete = (record: ProductItem) => {
    const nextProducts = record.new
      ? formik.values.products.filter((item) => item.idIndex !== record.idIndex)
      : formik.values.products.map((item) =>
          item.idIndex === record.idIndex
            ? { ...item, stateId: 2, state: "Deaktiv" }
            : item,
        );
    formik.setFieldValue("products", nextProducts, true);
  };

  const columns: TableColumnType<ProductItem>[] = [
    {
      dataIndex: "idIndex",
      title: t("common.rowNumber"),
      width: 70,
      align: "center",
    },
    {
      dataIndex: "name",
      title: t("products.fields.name"),
      minWidth: 180,
      render: (value, record) => (
        <Button
          type="link"
          onClick={() => {
            setEditItem(record);
            setOpen(true);
          }}
        >
          {value}
        </Button>
      ),
    },
    {
      dataIndex: "mxik",
      title: t("mxik code"),
      width: 130,
    },
    // {
    //   dataIndex: "supplier",
    //   title: t("products.fields.supplier"),
    //   minWidth: 160,
    // },
    {
      dataIndex: "description",
      title: t("products.fields.description"),
      minWidth: 180,
    },
    {
      dataIndex: "stateId",
      title: t("products.fields.status"),
      width: 120,
      align: "center",
      render: (value, record) => (
        <Tag color={record.new ? "blue" : value === 1 ? "green" : "red"}>
          {record.new
            ? t("products.status.new")
            : value === 1
              ? t("products.status.active")
              : t("products.status.inactive")}
        </Tag>
      ),
    },
    {
      dataIndex: "actions",
      title: t("common.actions"),
      width: 110,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <div className="flex justify-center gap-1">
          <Button
            type="text"
            onClick={() => {
              setEditItem(record);
              setOpen(true);
            }}
          >
            <Edit className="size-4 text-blue-700" />
          </Button>
          <Button type="text" onClick={() => handleDelete(record)}>
            <Trash className="size-4 text-red-700" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Table<ProductItem>
        columns={columns}
        dataSource={formik.values.products
          .slice()
          .sort((a, b) => (b.idIndex ?? 0) - (a.idIndex ?? 0))
          .map((item, index) => ({
            ...item,
            key: item.id ?? item.idIndex ?? index,
          }))}
        pagination={false}
        scroll={{ x: "max-content", y: "calc(100vh - 420px)" }}
      />
      <ProductItemModal
        open={open}
        onClose={() => setOpen(false)}
        formik={formik}
        editItem={editItem}
        onClearEdit={() => setEditItem(undefined)}
      />
    </>
  );
}
