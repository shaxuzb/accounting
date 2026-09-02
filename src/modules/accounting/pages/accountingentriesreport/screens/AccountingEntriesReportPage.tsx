import { useMemo } from "react";
import { Spin, Table } from "antd";
import type { TableColumnsType } from "antd";
import { useSearchParams } from "react-router";
import Card from "@/components/ui/card/Card";
import StructuredDataView from "@/components/ui/data/StructuredDataView";
import { useAppSelector } from "@/store/hooks";
import { generateKeyTable, numberSpacing } from "@/utils/utils";
import AccountingEntriesSummary from "../components/AccountingEntriesSummary";
import { useGetAccountingEntriesReport } from "../hooks";
import type {
  AccountingEntriesReportPosting,
  AccountingEntriesReportSubkontoItem,
} from "../types/type";
import { useTranslation } from "react-i18next";

const DetailLine = ({
  item,
}: {
  item: AccountingEntriesReportSubkontoItem;
}) => {
  const labelClassName =
    item.side === "credit"
      ? "font-semibold text-danger"
      : "font-semibold text-brand-text";
  const fallbackLabel = /^(purchase|sale)(doc|document)?$/i.test(
    item.label.trim(),
  )
    ? undefined
    : item.label;

  return (
    <StructuredDataView
      value={item.value}
      fallbackLabel={fallbackLabel}
      labelClassName={labelClassName}
      itemClassName="flex gap-3 rounded-lg border border-border p-1 px-2"
    />
  );
};

// const SubkontoIcon = ({ index }: { index: number }) => {
//   const icons = [Package, Warehouse, UserRound];
//   const Icon = icons[index % icons.length];
//   return <Icon className="size-4 text-slate-700" />;
// };

export default function AccountingEntriesReportPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const organizationName = useAppSelector((state) => state.organization.name);
  const documentIdParam = searchParams.get("documentId") ?? "";
  const documentTypeIdParam = searchParams.get("documentTypeId") ?? "1";
  // const [documentId, setDocumentId] = useState(documentIdParam);
  const { data, isFetching, isLoading } = useGetAccountingEntriesReport(
    documentIdParam,
    documentTypeIdParam,
  );

  const columns = useMemo<TableColumnsType<AccountingEntriesReportPosting>>(
    () => [
      {
        dataIndex: "indexId",
        title: t("common.rowNumber"),
        width: 72,
        align: "center",
        render: (_, __, index) => index + 1,
      },
      // {
      //   dataIndex: "date",
      //   title: "Sana",
      //   width: 150,
      //   render: (value) => customDate(value),
      // },
      {
        title: t("app.fields.debit"),
        className: "text-brand-text!",
        align: "center",
        children: [
          {
            dataIndex: "debitAccountCode",
            title: t("app.fields.account"),
            width: 190,
            render: (_, record) => (
              <div>
                <div className="font-semibold">{record.debitAccountCode}</div>
                <div className="font-semibold text-secondary-text">
                  {record.debitAccountNumber}
                </div>
              </div>
            ),
          },
          {
            dataIndex: "subconto",
            title: t("app.fields.subkonto"),
            align: "center",
            width: 190,
            render: (_, record) => (
              <div className="space-y-3">
                {record.debitDetails.map((item, index) => (
                  <DetailLine key={`${item.value}-${index}`} item={item} />
                ))}
              </div>
            ),
          },
        ],
      },
      {
        title: t("app.fields.credit"),
        className: "text-brand-text!",
        align: "center",
        children: [
          {
            dataIndex: "creditAccountCode",
            title: t("app.fields.account"),
            width: 210,
            render: (_, record) => (
              <div>
                <div className="font-semibold">{record.creditAccountCode}</div>
                <div className="font-semibold text-secondary-text">
                  {record.creditAccountNumber}
                </div>
              </div>
            ),
          },
          {
            dataIndex: "subconto",
            title: t("app.fields.subkonto"),
            width: 190,
            align: "center",
            render: (_, record) => (
              <div className="space-y-3">
                {record.creditDetails.map((item, index) => (
                  <DetailLine key={`${item.value}-${index}`} item={item} />
                ))}
              </div>
            ),
          },
        ],
      },

      {
        dataIndex: "amount",
        title: t("app.fields.amount"),
        width: 130,
        align: "center",
        render: (value) => (
          <span className="font-semibold">{numberSpacing(value)}</span>
        ),
      },
      {
        dataIndex: "debitQuantity",
        title: t("app.fields.quantity"),
        width: 110,
        align: "center",
      },
      {
        dataIndex: "currency",
        title: t("app.fields.currency"),
        width: 110,
        align: "center",
      },
      // {
      //   dataIndex: "subkonto",
      //   title: "Subkonto",
      //   width: 240,
      //   render: (items: AccountingEntriesReportSubkontoItem[]) => (
      //     <div className="space-y-1">
      //       {(items ?? []).map((item, index) => (
      //         <div key={`${item.value}-${index}`} className="flex items-center gap-2">
      //           <SubkontoIcon index={index} />
      //           <span>{item.value}</span>
      //         </div>
      //       ))}
      //     </div>
      //   ),
      // },
      {
        dataIndex: "documentNumber",
        title: t("app.fields.document"),
        width: 190,
      },
    ],
    [t],
  );

  // const showReport = () => {
  //   const nextParams = new URLSearchParams(searchParams);
  //   if (documentId) nextParams.set("documentId", documentId);
  //   else nextParams.delete("documentId");
  //   setSearchParams(nextParams);
  // };

  return (
    <div className="space-y-2">
      {/* <h1 className="text-2xl font-bold">Accounting entries report</h1>
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="font-medium">Document ID</span>
          <Input
            value={documentId}
            onChange={(event) => setDocumentId(event.target.value)}
            onPressEnter={showReport}
            className="h-10 w-56"
          />
        </label>
        <Button type="primary" size="large" onClick={showReport}>
          Hisobotni ko'rsat
        </Button>
      </div> */}

      {isLoading && (
        <div className="flex justify-center p-10">
          <Spin />
        </div>
      )}

      {data && (
        <>
          <AccountingEntriesSummary
            data={data}
            organizationName={organizationName}
          />

          <Card className="overflow-hidden border border-border">
            <Table<AccountingEntriesReportPosting>
              loading={isFetching}
              columns={columns}
              bordered
              dataSource={generateKeyTable(data?.postings)}
              pagination={false}
              scroll={{ x: "max-content", y: "max-content" }}
              // expandable={{
              //   expandIcon: ({ expanded, onExpand, record }) => (
              //     <Button
              //       className={`p-0! w-6! h-6!`}
              //       onClick={(event) => onExpand(record, event)}
              //     >
              //       <ChevronRight
              //         className={`size-4 transition-transform ${expanded ? "rotate-90" : ""}`}
              //       />
              //     </Button>
              //   ),
              //   defaultExpandedRowKeys: [1, 2, 3, 4, 5, 6],
              //   expandedRowRender: (record) => (
              //     <div className="grid gap-4 rounded-md border border-blue-100 bg-slate-50 p-4 md:grid-cols-2">
              //       <div className="space-y-3">
              //         {record.debitDetails.map((item, index) => (
              //           <DetailLine
              //             key={`${item.value}-${index}`}
              //             item={item}
              //           />
              //         ))}
              //       </div>
              //       <div className="space-y-3 border-t border-slate-200 pt-3 md:border-l md:border-t-0 md:pl-6 md:pt-0">
              //         {record.creditDetails.map((item, index) => (
              //           <DetailLine
              //             key={`${item.value}-${index}`}
              //             item={item}
              //           />
              //         ))}
              //       </div>
              //     </div>
              //   ),
              // }}
            />
          </Card>
        </>
      )}
    </div>
  );
}
