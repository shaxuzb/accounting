import { useParams } from "react-router";
import Card from "@/components/ui/card/Card";
import {
  Building2,
  CalendarDays,
  CircleDollarSign,
  FileText,
  Menu,
  Package,
  WalletCards,
  Wrench,
} from "lucide-react";

import { Button, Table, type TableColumnType } from "antd";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import PermissionCard from "@/components/ui/card/PermissionCard";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import type {
  PurchaseDetailLine,
  PurchaseDetailLineItem,
  PurchaseDetailServiceLine,
} from "@/modules/purchase/pages/purchase/types/type";
import { ProductStockSerialModal } from "@/modules/warehouse/pages/warehouse/components";
import type { ProductStockSerial } from "@/modules/warehouse/pages/warehouse/types/type";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { customDate, generateKeyTable, numberSpacing } from "@/utils/utils";
import { purchasePermissions } from "../constants/permissions";
import { useCancelPurchase } from "../hooks/useCancelPurchase";
import { useConfirmPurchase } from "../hooks/useConfirmPurchase";
import { useGetDetailPurchase } from "../hooks/useGetDetailPurchase";
import LineClampCell from "@/components/widget/text/LineClampCell";
import PurchaseEditor from "./PurchaseEditorPage";
import { useAppSelector } from "@/store/hooks";
import {
  DocumentSummary,
  DocumentSummaryItem,
} from "@/components/ui/card/DocumentSummary";

const getMarkedLineItems = (
  line?: PurchaseDetailLine | null,
): PurchaseDetailLineItem[] =>
  (line?.items ?? []).filter((item) => Boolean(item.markingNumber?.trim()));

const PurchaseDetailPage = () => {
  const params = useParams();
  const { t } = useTranslation();
  const canUpdate = useAppSelector((state) =>
    (state.auth.user?.user.permissions ?? []).includes(
      purchasePermissions.update,
    ),
  );
  const [selectedLine, setSelectedLine] = useState<PurchaseDetailLine | null>(
    null,
  );
  const { data, isLoading, isFetching } = useGetDetailPurchase(
    Number(params.id),
  );
  const confirmMutation = useConfirmPurchase(Number(params.id));
  const cancelMutation = useCancelPurchase(Number(params.id));
  const isDraft = data?.statusId === 1;
  const currency = data?.currencyName || "UZS";
  const documentAmount = data?.finalAmount || data?.totalAmount || 0;

  const selectedLineItems = useMemo<ProductStockSerial[]>(() => {
    if (!selectedLine) return [];

    return getMarkedLineItems(selectedLine).map((item, index) => ({
      id: item.id ?? index + 1,
      productId:
        item.productId ??
        selectedLine.productId ??
        selectedLine.productTableId,
      productName: selectedLine.productName,
      serialNumber: item.serialNumber,
      markingNumber: item.markingNumber,
    }));
  }, [selectedLine]);
  const tableColumnLabels: TableColumnType<PurchaseDetailLine>[] = [
    {
      dataIndex: "indexId",
      title: "Markirovka",
      align: "center",
      width: 110,
      render: (_, record) => {
        const canLoadMarkings = getMarkedLineItems(record).length > 0;
        return (
          <Button
            shape="circle"
            icon={<Menu className="size-4" />}
            disabled={!canLoadMarkings}
            onClick={() => {
              if (!canLoadMarkings) return;
              setSelectedLine(record);
            }}
            title={
              canLoadMarkings
                ? "Markirovkalarni ko'rish"
                : "Markirovka ma'lumoti yo'q"
            }
          />
        );
      },
    },
    {
      dataIndex: "productName",
      title: t("purchase.fields.product"),
    },
    // {
    //   dataIndex: "markingNumber",
    //   title: t("purchase.fields.mxik"),
    //   width: 10,
    //   render: (value) => <LineClampCell text={value} />,
    // },
    {
      dataIndex: "quantity",
      title: t("purchase.fields.quantity"),
      align: "center",
    },
    {
      dataIndex: "price",
      title: "Dona narxi",
      align: "center",
      render: (_, record) => numberSpacing(record.unitPrice),
    },
    {
      dataIndex: "amount",
      title: "Summa",
      align: "center",
      render: (val) => numberSpacing(val),
    },
    {
      dataIndex: "vatRateName",
      title: "QQS stavkasi",
      align: "center",
    },
    {
      dataIndex: "vatAmount",
      title: "QQS summasi",
      align: "center",
      render: (val) => numberSpacing(val),
    },

    {
      dataIndex: "totalAmount",
      title: "Jami",
      align: "center",
      render: (val) => numberSpacing(val),
    },
  ];
  const serviceLineColumns: TableColumnType<PurchaseDetailServiceLine>[] = [
    {
      dataIndex: "indexId",
      title: "T/r",
      align: "center",
      width: 70,
    },
    {
      dataIndex: "serviceName",
      title: "Xizmat nomi",
      render: (value, record) => (
        <LineClampCell text={value || record.name} />
      ),
    },
    {
      dataIndex: "expenseAccountName",
      title: "Xarajat schyoti",
      width: 180,
      render: (value, record) => (
        <LineClampCell text={value || record.accountName || record.accountId} />
      ),
    },
    {
      dataIndex: "price",
      title: "Summa",
      align: "right",
      width: 160,
      render: (value) => numberSpacing(value, undefined, true),
    },
  ];
  // useChangeSelectType("disabled");
  if (isDraft && canUpdate) {
    return <PurchaseEditor purchaseId={Number(params.id)} />;
  }
  return (
    <div className="">
      <div className="mt-2 space-y-4">
        <DocumentSummary>
          <DocumentSummaryItem
            icon={<Building2 size={24} strokeWidth={1.8} />}
            label="Tashkilot"
            value={data?.organizationName || "-"}
          />
          <DocumentSummaryItem
            icon={<FileText size={24} strokeWidth={1.8} />}
            label="Hujjat"
            value={data?.docNumber || `#${data?.id ?? "-"}`}
          />
          <DocumentSummaryItem
            icon={<CalendarDays size={24} strokeWidth={1.8} />}
            label="Hujjat sanasi"
            value={data?.docDate ? customDate(data.docDate) : "-"}
          />
          <DocumentSummaryItem
            icon={<CircleDollarSign size={24} strokeWidth={1.8} />}
            label="Valyuta"
            value={currency}
          />
          <DocumentSummaryItem
            icon={<WalletCards size={24} strokeWidth={1.8} />}
            label="Hujjat summasi"
            value={`${numberSpacing(documentAmount, undefined, true)} ${currency}`}
            emphasized
          />
        </DocumentSummary>

        <Card className="border border-border p-3">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            <div className="min-w-0">
              <div className="text-xs text-secondary-text">
                Yetkazib beruvchi
              </div>
              <div className="truncate text-sm font-semibold text-text">
                {data?.counterpartyName || "-"}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs text-secondary-text">Tavsif</div>
              <div className="truncate text-sm text-text">
                {data?.comment || "Ma'lumot yo'q"}
              </div>
            </div>
            <ProcessStatusBadge
              statusId={data?.statusId}
              statusName={data?.statusName}
            />
            <div className="ml-auto flex items-center gap-2">
              {isDraft && (
                <PermissionCard permission={purchasePermissions.confirm}>
                  <Button
                    type="primary"
                    loading={confirmMutation.isPending}
                    onClick={async () => {
                      try {
                        await confirmMutation.mutateAsync();
                        toast.success("Hujjat tasdiqlandi");
                      } catch (error) {
                        errorHandlers(error);
                      }
                    }}
                  >
                    Tasdiqlash
                  </Button>
                </PermissionCard>
              )}
              {isDraft && (
                <PermissionCard permission={purchasePermissions.cancel}>
                  <Button
                    danger
                    loading={cancelMutation.isPending}
                    onClick={async () => {
                      try {
                        await cancelMutation.mutateAsync();
                        toast.success("Hujjat bekor qilindi");
                      } catch (error) {
                        errorHandlers(error);
                      }
                    }}
                  >
                    Bekor qilish
                  </Button>
                </PermissionCard>
              )}
            </div>
          </div>
        </Card>

        {/* Products List Card */}
        <Card className="">
          <div className="mb-3 flex items-center gap-2 px-1 text-sm font-semibold text-text">
            <Package className="size-4 text-primary" />
            <span>Mahsulotlar</span>
          </div>
          <Table
            dataSource={generateKeyTable(data?.lines, "id")}
            rowKey="key"
            pagination={false}
            scroll={{
              x: "max-content",
              y: "calc(100vh - 280px)",
            }}
            loading={isLoading || isFetching}
            columns={tableColumnLabels}
            size="large"
            // summary={(pageData) => {
            //   const totals = pageData.reduce(
            //     (acc, { pricePerUom, qty, currencyId, discountPercent }) => {
            //       const amount = pricePerUom * qty;
            //       const amountDiscount =
            //         (pricePerUom * qty * (100 - discountPercent)) / 100;

            //       if (currencyId === 1) {
            //         acc.totalPriceUzs += amount;
            //         acc.totalDiscountPriceUzs += amountDiscount;
            //       }
            //       if (currencyId === 2) {
            //         acc.totalPriceUsd += amount;
            //         acc.totalDiscountPriceUsd += amountDiscount;
            //       }

            //       return acc;
            //     },
            //     {
            //       totalPriceUzs: 0,
            //       totalPriceUsd: 0,
            //       totalDiscountPriceUzs: 0,
            //       totalDiscountPriceUsd: 0,
            //     },
            //   );

            //   const {
            //     totalPriceUzs,
            //     totalPriceUsd,
            //     totalDiscountPriceUsd,
            //     totalDiscountPriceUzs,
            //   } = totals;

            //   return (
            //     <Table.Summary fixed>
            //       <Table.Summary.Row className="[&>td]:!py-1 [&>td]:font-semibold !rounded-4xl">
            //         <Table.Summary.Cell
            //           className="text-center"
            //           colSpan={2}
            //           index={0}
            //         />
            //         <Table.Summary.Cell colSpan={3} align="center" index={1}>
            //           {t("Jami narx")}
            //         </Table.Summary.Cell>
            //         <Table.Summary.Cell
            //           className="text-center"
            //           align="center"
            //           colSpan={3}
            //           index={3}
            //         >
            //           {t("Jami chegirmadagi narx")}
            //         </Table.Summary.Cell>
            //         <Table.Summary.Cell className="text-center" index={2} />
            //       </Table.Summary.Row>
            //       <Table.Summary.Row className="[&>td]:!py-0 [&>td]:font-semibold !rounded-4xl">
            //         <Table.Summary.Cell
            //           className="text-center"
            //           index={0}
            //           colSpan={2}
            //         />
            //         <Table.Summary.Cell
            //           align="center"
            //           className="!text-nowrap !p-0"
            //           colSpan={3}
            //           index={1}
            //         >
            //           <span>{numberSpacingWithCurrency(totalPriceUzs, 1)}</span>
            //         </Table.Summary.Cell>
            //         <Table.Summary.Cell
            //           align="center"
            //           className="!text-nowrap"
            //           colSpan={3}
            //           index={3}
            //         >
            //           <span>
            //             {numberSpacingWithCurrency(totalDiscountPriceUzs, 1)}
            //           </span>
            //         </Table.Summary.Cell>
            //         <Table.Summary.Cell className="text-center" index={2} />
            //       </Table.Summary.Row>
            //       <Table.Summary.Row className="[&>td]:!py-0 [&>td]:font-semibold !rounded-4xl">
            //         <Table.Summary.Cell
            //           className="text-center"
            //           index={0}
            //           colSpan={2}
            //         />
            //         <Table.Summary.Cell align="center" colSpan={3} index={1}>
            //           <span>{numberSpacingWithCurrency(totalPriceUsd, 2)}</span>
            //         </Table.Summary.Cell>
            //         <Table.Summary.Cell align="center" colSpan={3} index={3}>
            //           <span>
            //             {numberSpacingWithCurrency(totalDiscountPriceUsd, 2)}
            //           </span>
            //         </Table.Summary.Cell>
            //         <Table.Summary.Cell className="text-center" index={2} />
            //       </Table.Summary.Row>
            //     </Table.Summary>
            //   );
            // }}
          />
        </Card>
        {!!data?.serviceLines?.length && (
          <Card className="">
            <div className="mb-3 flex items-center gap-2 px-1 text-sm font-semibold text-text">
              <Wrench className="size-4 text-primary" />
              <span>Xizmatlar</span>
            </div>
            <Table
              dataSource={generateKeyTable(data.serviceLines)}
              pagination={false}
              scroll={{ x: "max-content" }}
              loading={isLoading || isFetching}
              columns={serviceLineColumns}
              size="large"
            />
          </Card>
        )}
      </div>
      <ProductStockSerialModal
        open={Boolean(selectedLine)}
        title={selectedLine?.productName || "Markirovkalar"}
        items={selectedLineItems}
        loading={false}
        onClose={() => setSelectedLine(null)}
      />
    </div>
  );
};

export default PurchaseDetailPage;
