import { useParams } from "react-router";
import { useGetDetailPurchase } from "@/modules/purchases/hooks/useGetDetailPurchase";
import Card from "@/components/ui/card/Card";
import {
  Calendar,
  ChartPie,
  FileText,
  Menu,
  Package,
  ReceiptText,
} from "lucide-react";
import {
  customDate,
  formatToFixedIfDecimal,
  generateKeyTable,
  numberSpacing,
  numberSpacingWithCurrency,
} from "@/utils/utils";
import { Button, Table, TableColumnType } from "antd";
import StockProductSerialView from "@/modules/warehouses/components/StockProductSerialView";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PurchaseDetailProductData } from "@/modules/purchases/types/purchase";
import { customProductStatus } from "@/shared/utils/helpers/goodMovementStatus";
import { useChangeSelectType } from "@/hooks/useChangeSelectType ";
import { useAppSelector } from "@/store/hooks";

const PurchaseView = () => {
  const params = useParams();
  const { t } = useTranslation();
  const org = useAppSelector((state) => state.organization);
  const { data, isLoading, isFetching } = useGetDetailPurchase(
    Number(params.id),
  );
  const [itemData, setItemData] = useState<PurchaseDetailProductData | null>(
    null,
  );
  const tableColumnLabels: TableColumnType<PurchaseDetailProductData>[] = [
    {
      dataIndex: "indexId",
      title: "CH",
      align: "center",
      width: 70,
      render(_, record) {
        return (
          <Button
            type="default"
            color="red"
            // style={{
            //   borderRadius: "50%",
            //   backgroundColor: "ActiveBorder",
            //   boxShadow: "none",
            // }}
            disabled={!record.isSerial}
            className="!px-0 !w-8 !rounded-full"
            onClick={() => {
              setItemData(record);
            }}
          >
            <Menu className="size-4" />
          </Button>
        );
      },
    },
    {
      dataIndex: "product",
      title: t("Table.productName"),
    },
    {
      dataIndex: "sapCode",
      title: t("Table.sapCode"),
      align: "center",
      width: 150,
    },
    {
      dataIndex: "qty",
      title: t("Table.quantity"),
      align: "center",
      width: 100,
    },
    {
      dataIndex: "pricePerUom",
      title: t("Narxi"),
      align: "center",
      width: 100,
      render: (val, record) =>
        numberSpacingWithCurrency(val, record.currencyId),
    },
    {
      dataIndex: "pricePerUom",
      title: t("Jami narxi"),
      align: "center",
      width: 100,
      render: (val, record) =>
        numberSpacingWithCurrency(val * record.qty, record.currencyId),
    },
    {
      dataIndex: "discountPercent",
      title: t("Chegirma"),
      align: "center",
      width: 100,
      render: (val) => numberSpacing(val) + " %",
    },
    {
      dataIndex: "discountPercent",
      title: t("Chegirmadagi narxi"),
      align: "center",
      width: 100,
      render: (_, record) => {
        return numberSpacingWithCurrency(
          formatToFixedIfDecimal(
            (record.pricePerUom * record.qty * (100 - record.discountPercent)) /
              100,
          ),
          record.currencyId,
        );
      },
    },
    {
      dataIndex: "baseUom",
      title: t("Birlik"),
      align: "center",
      width: 100,
    },
  ];
  useChangeSelectType("disabled");
  return (
    <div className="">
      <div className="mt-2 space-y-4">
        {/* Document Information Card */}
        <Card className="border-border/50 overflow-hidden bg-gradient-card animate-scale-in transition-all duration-300">
          {/* <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b border-primary/20 p-2">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <h1 className="text-xl flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="size-4 text-primary" />
                </div>
                Hujjat ma'lumotlari
              </h1>
              <Badge color="green">
               
                {data?.state}
              </Badge>
            </div>
          </div> */}
          <Card className="p-3">
            <div className="flex justify-start items-center gap-8 flex-wrap">
              <div className="space-y-1 group animate-slide-in">
                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                  <div className="p-1.5 bg-primary/10 rounded-md group-hover:bg-primary/20 transition-colors">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-semibold">Hujjat raqami</span>
                </div>
                <p className="text-sm text-center font-bold text-foreground pl-1">
                  {data?.docNumber}
                </p>
              </div>
              <div
                className="space-y-1 group animate-slide-in"
                style={{ animationDelay: "0.1s" }}
              >
                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                  <div className="p-1.5 bg-primary/10 rounded-md group-hover:bg-primary/20 transition-colors">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-semibold">Qabul qilingan sana</span>
                </div>
                <p className="text-sm text-center font-bold text-foreground pl-1">
                  {customDate(data?.docDate)}
                </p>
              </div>
              {org.useContractAccounting && (
                <div
                  className="space-y-1 group animate-slide-in"
                  style={{ animationDelay: "0.2s" }}
                >
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="p-1.5 bg-primary/10 rounded-md group-hover:bg-primary/20 transition-colors">
                      <ReceiptText className="size-4 text-primary" />
                    </div>
                    <span className="font-medium">Shartnoma</span>
                  </div>
                  <p className="text-sm font-bold text-foreground pl-1">
                    {data?.contractName}
                  </p>
                </div>
              )}
              <div
                className="space-y-1 group animate-slide-in"
                style={{ animationDelay: "0.2s" }}
              >
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <div className="p-1.5 bg-primary/10 rounded-md group-hover:bg-primary/20 transition-colors">
                    <Package className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-semibold">Yetkazib beruvchi</span>
                </div>
                <p className="text-sm text-center font-bold text-foreground pl-1">
                  {data?.supplier}
                </p>
              </div>
              <div
                className="space-y-1 group animate-slide-in"
                style={{ animationDelay: "0.3s" }}
              >
                <div className="flex items-center gap-1 justify-center text-sm text-muted-foreground">
                  <div className="p-1.5 bg-primary/10 rounded-md group-hover:bg-primary/20 transition-colors">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-semibold">Tavsif</span>
                </div>
                <p className="text-sm text-center text-foreground/90 pl-1">
                  {data?.description ?? "Ma'lumot yuq"}
                </p>
              </div>
              <div
                className="space-y-1 group animate-slide-in flex flex-col items-center justify-center"
                style={{ animationDelay: "0.3s" }}
              >
                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                  <div className="p-1.5 bg-primary/10 rounded-md group-hover:bg-primary/20 transition-colors">
                    <ChartPie className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-semibold">Holati</span>
                </div>
                <p className="text-sm w-fit flex justify-center items-center">
                  {customProductStatus(data?.statusId ?? 0)}
                </p>
              </div>
              {/* <div
                className="space-y-1 animate-slide-in"
                style={{ animationDelay: "0.4s" }}
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-medium">Umumiy summa</span>
                </div>
                <div className="relative">
                  <p className="text-base font-bold">
                    {numberSpacingWithCurrency(
                      data?.goodsMovementProducts.reduce(
                        (a, b) => a + b.pricePerUom * b.qty,
                        0
                      ) ?? 0,
                      data?.goodsMovementProducts[0]?.currencyId ?? 1
                    )}
                  </p>
                </div>
              </div> */}
            </div>
          </Card>
        </Card>

        {/* Products List Card */}
        <Card className="">
          <Table
            dataSource={generateKeyTable(data?.goodsMovementProducts)}
            pagination={false}
            scroll={{
              x: "max-content",
              y: "calc(100vh - 280px)",
            }}
            loading={isLoading || isFetching}
            columns={tableColumnLabels}
            summary={(pageData) => {
              const totals = pageData.reduce(
                (acc, { pricePerUom, qty, currencyId, discountPercent }) => {
                  const amount = pricePerUom * qty;
                  const amountDiscount =
                    (pricePerUom * qty * (100 - discountPercent)) / 100;

                  if (currencyId === 1) {
                    acc.totalPriceUzs += amount;
                    acc.totalDiscountPriceUzs += amountDiscount;
                  }
                  if (currencyId === 2) {
                    acc.totalPriceUsd += amount;
                    acc.totalDiscountPriceUsd += amountDiscount;
                  }

                  return acc;
                },
                {
                  totalPriceUzs: 0,
                  totalPriceUsd: 0,
                  totalDiscountPriceUzs: 0,
                  totalDiscountPriceUsd: 0,
                },
              );

              const {
                totalPriceUzs,
                totalPriceUsd,
                totalDiscountPriceUsd,
                totalDiscountPriceUzs,
              } = totals;

              return (
                <Table.Summary fixed>
                  <Table.Summary.Row className="[&>td]:!py-1 [&>td]:font-semibold !rounded-4xl">
                    <Table.Summary.Cell
                      className="text-center"
                      colSpan={2}
                      index={0}
                    />
                    <Table.Summary.Cell colSpan={3} align="center" index={1}>
                      {t("Jami narx")}
                    </Table.Summary.Cell>
                    <Table.Summary.Cell
                      className="text-center"
                      align="center"
                      colSpan={3}
                      index={3}
                    >
                      {t("Jami chegirmadagi narx")}
                    </Table.Summary.Cell>
                    <Table.Summary.Cell className="text-center" index={2} />
                  </Table.Summary.Row>
                  <Table.Summary.Row className="[&>td]:!py-0 [&>td]:font-semibold !rounded-4xl">
                    <Table.Summary.Cell
                      className="text-center"
                      index={0}
                      colSpan={2}
                    />
                    <Table.Summary.Cell
                      align="center"
                      className="!text-nowrap !p-0"
                      colSpan={3}
                      index={1}
                    >
                      <span>{numberSpacingWithCurrency(totalPriceUzs, 1)}</span>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell
                      align="center"
                      className="!text-nowrap"
                      colSpan={3}
                      index={3}
                    >
                      <span>
                        {numberSpacingWithCurrency(totalDiscountPriceUzs, 1)}
                      </span>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell className="text-center" index={2} />
                  </Table.Summary.Row>
                  <Table.Summary.Row className="[&>td]:!py-0 [&>td]:font-semibold !rounded-4xl">
                    <Table.Summary.Cell
                      className="text-center"
                      index={0}
                      colSpan={2}
                    />
                    <Table.Summary.Cell align="center" colSpan={3} index={1}>
                      <span>{numberSpacingWithCurrency(totalPriceUsd, 2)}</span>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell align="center" colSpan={3} index={3}>
                      <span>
                        {numberSpacingWithCurrency(totalDiscountPriceUsd, 2)}
                      </span>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell className="text-center" index={2} />
                  </Table.Summary.Row>
                </Table.Summary>
              );
            }}
          />
        </Card>
      </div>
      <StockProductSerialView
        open={!!itemData}
        onClose={() => setItemData(null)}
        item={itemData}
        fromItem={true}
      />
    </div>
  );
};

export default PurchaseView;
