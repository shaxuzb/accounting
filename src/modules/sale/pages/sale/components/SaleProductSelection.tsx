import { Button, Input, Table } from "antd";
import type { TableColumnsType } from "antd";
import { PlusCircle, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import InputNumberFormat from "@/components/fields/InputNumber";
import Card from "@/components/ui/card/Card";
import { generateKeyTable, numberSpacing } from "@/utils/utils";
import { useGetSaleProductStocks } from "../hooks";
import type { SaleProductStock, SaleSelectedProduct } from "../types/type";

interface Props {
  products: SaleSelectedProduct[];
  onChange: (products: SaleSelectedProduct[]) => void;
  disabled?: boolean;
}

const getStockProductId = (product: SaleProductStock) =>
  product.productId || product.id;

const getProductName = (product: SaleProductStock | SaleSelectedProduct) =>
  product.productName || ("name" in product ? product.name : "") || "-";

const getUnitPrice = (product: SaleProductStock) =>
  product.salePrice ?? product.price ?? 0;

const getQuantity = (
  product: SaleProductStock,
  quantities: Record<number, number | null>,
) => {
  const productId = getStockProductId(product);
  const quantity = Number(quantities[productId]);
  if (!Number.isFinite(quantity) || quantity <= 0) return 0;

  return Math.min(Math.max(quantity, 0), product.quantity || quantity);
};

export default function SaleProductSelection({
  products,
  onChange,
  disabled = false,
}: Props) {
  const [search, setSearch] = useState("");
  const [activeProductId, setActiveProductId] = useState<number | null>(null);
  const [quantities, setQuantities] = useState<Record<number, number | null>>(
    {},
  );
  const params = useMemo(() => {
    const value = new URLSearchParams();
    value.set("Page", "1");
    value.set("PageSize", "1000");
    if (search.trim()) value.set("Search", search.trim());
    return value;
  }, [search]);
  const { data, isLoading, isFetching } = useGetSaleProductStocks(params);
  const stockProducts = data?.items ?? [];
  const selectedProductIds = useMemo(
    () => new Set(products.map((product) => product.productId)),
    [products],
  );

  const addProduct = (product: SaleProductStock) => {
    const productId = getStockProductId(product);
    const quantity = getQuantity(product, quantities);
    if (!quantity) return;

    const existingProduct = products.find((item) => item.productId === productId);
    if (existingProduct) {
      onChange(
        products.map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity: Math.min(
                  item.availableQuantity,
                  item.quantity + quantity,
                ),
              }
            : item,
        ),
      );
    } else {
      onChange([
        ...products,
        {
          productId,
          productName: getProductName(product),
          quantity: Math.min(product.quantity || quantity, quantity),
          availableQuantity: product.quantity || quantity,
          unitPrice: getUnitPrice(product),
          unitName: product.unitName,
          vatRateId: null,
        },
      ]);
    }
    setQuantities((current) => ({ ...current, [productId]: null }));
    setActiveProductId(null);
  };

  const productColumns: TableColumnsType<SaleProductStock> = [
    {
      dataIndex: "id",
      title: "Kod",
      width: 90,
    },
    {
      dataIndex: "barcode",
      title: "Shtrix-kod",
      width: 150,
      render: (value, record) => value || record.sapCode || "-",
    },
    {
      dataIndex: "productName",
      title: "Mahsulot nomi",
      minWidth: 240,
      render: (_, record) => getProductName(record),
    },
    {
      dataIndex: "quantity",
      title: "Qoldiq",
      width: 90,
      align: "center",
      render: (value: number) => numberSpacing(value, undefined, true),
    },
    {
      dataIndex: "unitName",
      title: "Birligi",
      width: 90,
      render: (value) => value || "dona",
    },
    {
      dataIndex: "price",
      title: "Sotuv narxi",
      width: 130,
      align: "right",
      render: (_, record) =>
        `${numberSpacing(getUnitPrice(record), undefined, true)} ${
          record.currencyCode || ""
        }`.trim(),
    },
    {
      dataIndex: "actions",
      title: "Amallar",
      width: 178,
      fixed: "right",
      render: (_, record) => {
        const productId = getStockProductId(record);
        const currentQuantity = quantities[productId] ?? null;
        const isActive = activeProductId === productId;
        if (!isActive) {
          return (
            <Button
              type="text"
              shape="circle"
              icon={<PlusCircle className="size-4 text-primary" />}
              disabled={disabled || !record.quantity}
              onClick={() => {
                setActiveProductId(productId);
                setQuantities((current) => ({
                  ...current,
                  [productId]: current[productId] ?? null,
                }));
              }}
            />
          );
        }

        return (
          <div className="flex items-center gap-2">
            <InputNumberFormat
              standalone
              height={34}
              min={0}
              max={record.quantity}
              precision={3}
              value={currentQuantity}
              placeholder="Miqdor"
              disabled={disabled || !record.quantity}
              onValueChange={(value) =>
                setQuantities((current) => ({
                  ...current,
                  [productId]: value,
                }))
              }
              onPressEnter={() => addProduct(record)}
            />
            <Button
              type="primary"
              disabled={disabled || !record.quantity || !currentQuantity}
              onClick={() => addProduct(record)}
            >
              Qo'shish
            </Button>
          </div>
        );
      },
    },
  ];

  const selectedColumns: TableColumnsType<SaleSelectedProduct> = [
    {
      dataIndex: "indexId",
      title: "№",
      width: 60,
      align: "center",
    },
    {
      dataIndex: "productName",
      title: "Mahsulot nomi",
      minWidth: 220,
    },
    {
      dataIndex: "unitName",
      title: "Birligi",
      width: 90,
      render: (value) => value || "dona",
    },
    {
      dataIndex: "quantity",
      title: "Miqdori",
      width: 130,
      render: (value, record) => (
        <InputNumberFormat
          standalone
          height={34}
          min={0}
          max={record.availableQuantity}
          precision={3}
          value={value}
          onValueChange={(quantity) =>
            onChange(
              products.map((item) =>
                item.productId === record.productId
                  ? { ...item, quantity: Number(quantity ?? 0) }
                  : item,
              ),
            )
          }
        />
      ),
    },
    {
      dataIndex: "unitPrice",
      title: "Narxi",
      width: 130,
      align: "right",
      render: (value: number) => numberSpacing(value, undefined, true),
    },
    {
      dataIndex: "totalAmount",
      title: "Jami",
      width: 130,
      align: "right",
      render: (_, record) =>
        numberSpacing(record.quantity * record.unitPrice, undefined, true),
    },
    {
      dataIndex: "actions",
      title: "Amallar",
      width: 90,
      align: "center",
      render: (_, record) => (
        <Button
          danger
          type="text"
          icon={<Trash2 className="size-4" />}
          onClick={() =>
            onChange(
              products.filter((item) => item.productId !== record.productId),
            )
          }
        />
      ),
    },
  ];

  const totalQuantity = products.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = products.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );

  return (
    <div className="grid items-start gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(420px,1fr)]">
      <Card className="overflow-hidden border border-border">
        <div className="space-y-3 border-b border-border p-3">
          <h3 className="font-semibold text-text">Mahsulotlar</h3>
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Mahsulot nomi yoki kodi bo'yicha qidirish..."
            prefix={<Search className="size-4 text-secondary-text" />}
            allowClear
          />
        </div>
        <Table<SaleProductStock>
          size="small"
          loading={isLoading || isFetching}
          columns={productColumns}
          dataSource={generateKeyTable(stockProducts, "id")}
          rowClassName={(record) =>
            selectedProductIds.has(getStockProductId(record))
              ? "bg-blue-50 [&>td]:!bg-blue-50 hover:[&>td]:!bg-blue-100"
              : ""
          }
          pagination={false}
          scroll={{ x: "max-content", y: "calc(100vh - 410px)" }}
        />
      </Card>

      <div className="space-y-3">
        <Card className="overflow-hidden border border-border">
          <div className="flex items-center justify-between border-b border-border p-3">
            <h3 className="font-semibold text-text">
              Tanlangan mahsulotlar (hujjat)
            </h3>
            <Button
              danger
              type="text"
              icon={<Trash2 className="size-4" />}
              disabled={!products.length || disabled}
              onClick={() => onChange([])}
            >
              Tozalash
            </Button>
          </div>
          <Table<SaleSelectedProduct>
            size="small"
            columns={selectedColumns}
            dataSource={generateKeyTable(products, "productId")}
            pagination={false}
            scroll={{ x: "max-content", y: "calc(100vh - 500px)" }}
          />
        </Card>

        <Card className="grid gap-3 border border-border p-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-secondary-text">Mahsulotlar soni</p>
            <p className="text-lg font-semibold">{products.length} tur</p>
          </div>
          <div>
            <p className="text-xs text-secondary-text">Jami miqdor</p>
            <p className="text-lg font-semibold">
              {numberSpacing(totalQuantity, undefined, true)} dona
            </p>
          </div>
          <div>
            <p className="text-xs text-secondary-text">Umumiy summa</p>
            <p className="text-lg font-semibold">
              {numberSpacing(totalAmount, undefined, true)}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
