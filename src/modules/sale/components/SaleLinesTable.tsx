import { Button,  Popconfirm, Table, Tag, Tooltip } from "antd";
import type { TableColumnsType } from "antd";
import { LoaderCircle, Trash2 } from "lucide-react";
import type { SaleDocTable } from "../types/type";

interface SaleLinesTableProps {
  lines: SaleDocTable[];
  loading?: boolean;
  readOnly?: boolean;
  onUpdate?: (
    line: SaleDocTable,
    changes: Pick<SaleDocTable, "quantity" | "price">,
  ) => Promise<void> | void;
  onDelete?: (line: SaleDocTable) => Promise<void> | void;
}

export default function SaleLinesTable({
  lines,
  loading = false,
  readOnly = false,
  // onUpdate,
  onDelete,
}: SaleLinesTableProps) {
  // const updateQuantity = (line: SaleDocTable, quantity: number) => {
  //   if (quantity < 1) return;
  //   void onUpdate?.(line, { quantity, price: line.price });
  // };

  const columns: TableColumnsType<SaleDocTable> = [
    {
      title: "№",
      width: 60,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Barcode",
      dataIndex: "barcode",
      width: 170,
    },
    {
      title: "Mahsulot",
      dataIndex: "productName",
      minWidth: 240,
    },
    {
      title: "Holat",
      dataIndex: "syncStatus",
      width: 120,
      align: "center",
      render: (status, line) => {
        if (status === "pending") {
          return (
            <Tag
              icon={<LoaderCircle className="size-3 animate-spin" />}
              color="processing"
            >
              Kutilmoqda
            </Tag>
          );
        }
        if (status === "error") {
          return (
            <Tooltip title={line.errorMessage}>
              <Tag color="error">Xato</Tag>
            </Tooltip>
          );
        }
        return <Tag color="success">Tasdiqlandi</Tag>;
      },
    },
    // {
    //   title: "Birlik",
    //   dataIndex: "unitName",
    //   width: 100,
    //   align: "center",
    //   render: (value) => value || "-",
    // },
    // {
    //   title: "Qoldiq",
    //   dataIndex: "availableQuantity",
    //   width: 110,
    //   align: "center",
    //   render: (value) => (value === undefined ? "-" : numberSpacing(value)),
    // },
    // {
    //   title: "Narx",
    //   dataIndex: "price",
    //   width: 160,
    //   align: "right",
    //   render: (value, line) =>
    //     readOnly ? (
    //       numberSpacing(value)
    //     ) : (
    //       <InputNumber
    //         min={0}
    //         value={value}
    //         controls={false}
    //         className="w-36!"
    //         onChange={(nextValue) => {
    //           if (nextValue === null || nextValue === value) return;
    //           void onUpdate?.(line, {
    //             quantity: line.quantity,
    //             price: Number(nextValue),
    //           });
    //         }}
    //       />
    //     ),
    // },
    // {
    //   title: "Miqdor",
    //   dataIndex: "quantity",
    //   width: readOnly ? 110 : 190,
    //   align: "center",
    //   render: (value, line) =>
    //     line.syncStatus === "pending" || line.syncStatus === "error" ? (
    //       "-"
    //     ) : readOnly ? (
    //       numberSpacing(value)
    //     ) : (
    //       <div className="flex items-center justify-center gap-1">
    //         <Tooltip title="Kamaytirish">
    //           <Button
    //             icon={<Minus className="size-4" />}
    //             disabled={value <= 1}
    //             onClick={() => updateQuantity(line, value - 1)}
    //           />
    //         </Tooltip>
    //         <InputNumber
    //           min={1}
    //           max={line.availableQuantity}
    //           value={value}
    //           controls={false}
    //           className="w-20!"
    //           onChange={(nextValue) => {
    //             if (nextValue !== null && nextValue !== value) {
    //               updateQuantity(line, Number(nextValue));
    //             }
    //           }}
    //         />
    //         <Tooltip title="Ko'paytirish">
    //           <Button
    //             icon={<Plus className="size-4" />}
    //             disabled={
    //               line.availableQuantity !== undefined &&
    //               value >= line.availableQuantity
    //             }
    //             onClick={() => updateQuantity(line, value + 1)}
    //           />
    //         </Tooltip>
    //       </div>
    //     ),
    // },
    // {
    //   title: "Summa",
    //   dataIndex: "totalAmount",
    //   width: 150,
    //   align: "right",
    //   render: (_, line) => (
    //     <span className="font-semibold">
    //       {numberSpacing(line.quantity * line.price)}
    //     </span>
    //   ),
    // },
  ];

  if (!readOnly) {
    columns.push({
      title: "",
      width: 60,
      align: "center",
      fixed: "right",
      render: (_, line) => (
        <Popconfirm
          title="Mahsulotni o'chirasizmi?"
          okText="Ha"
          cancelText="Yo'q"
          onConfirm={() => onDelete?.(line)}
        >
          <Button danger type="text" icon={<Trash2 className="size-4" />} />
        </Popconfirm>
      ),
    });
  }

  return (
    <Table<SaleDocTable>
      rowKey={(line) => line.id || `${line.productTableId}-${line.barcode}`}
      columns={columns}
      dataSource={lines}
      loading={loading}
      pagination={false}
      scroll={{ x: "max-content", y: "calc(100vh - 430px)" }}
      locale={{ emptyText: "Barcode orqali mahsulot qo'shing" }}
    />
  );
}
