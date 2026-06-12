import { Button, Table, TableColumnType } from "antd";
import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import NonSerialAddModal from "./NonSerialAddModal";
import { FormikProps } from "formik";
import { ExcelDataProductIncomeType } from "..";
import { Plus, Trash } from "lucide-react";
import { numberSpacingWithCurrency } from "@/utils/utils";

type FormValues = object;

interface ProdcutAcceptTableProps {
  data: ExcelDataProductIncomeType[];
  formik: FormikProps<FormValues>;
}

const NonSerialTableImport: FC<ProdcutAcceptTableProps> = (props) => {
  const { data, formik } = props;
  const { t } = useTranslation();
  const [modal, setModal] = useState(false);

  const handleDelete = (id: number) => {
    const filtered = data.filter((item) => item.indexId !== id);
    formik.setFieldValue("newProducts", filtered, true);
  };

  const tableColumnLabels: TableColumnType<ExcelDataProductIncomeType>[] = [
    {
      dataIndex: "indexId",
      title: t("Table.ordinalNumber"),
      width: 70,
      align: "center",
    },
    {
      dataIndex: "name",
      title: t("Table.productName"),
      minWidth: 200,
      width: 300,
    },
    {
      dataIndex: "pricePerUom",
      title: t("Table.price"),
      align: "center",
      width: 200,
      render(value, record) {
        return numberSpacingWithCurrency(value, record.currencyId);
      },
    },
    {
      dataIndex: "qty",
      title: t("Table.quantity"),
      align: "center",
      width: 150,
    },
    {
      dataIndex: "Jami",
      title: t("Table.totalPrice"),
      align: "center",
      width: 150,
      render(_, record) {
        return numberSpacingWithCurrency(
          (record.pricePerUom ?? 0) * (record.qty ?? 0),
          record.currencyId,
        );
      },
    },
    {
      dataIndex: "actions",
      title: t("Table.actions"),
      width: 100,
      fixed: "right",
      align: "center",
      render(_, record) {
        return (
          <div>
            <Button
              onClick={() => handleDelete(record.indexId)}
              type="text"
              className="!px-2"
            >
              <Trash className="!text-red-800 size-3.5" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <Table
        columns={tableColumnLabels}
        title={() => (
          <div className="flex justify-end">
            <Button
              type="primary"
              className="!px-2"
              onClick={() => setModal(!modal)}
            >
              <Plus className="size-4" /> mahsulot qo'shish
            </Button>
          </div>
        )}
        dataSource={data.map((item, index) => ({
          ...item,
          indexId: index + 1,
          key: item.indexId,
        }))}
        scroll={{
          y: "calc(100vh - 360px)",
          x: "max-content",
        }}
        pagination={false}
      />
      <NonSerialAddModal open={modal} setOpen={setModal} formik={formik} />
    </>
  );
};

export default NonSerialTableImport;
