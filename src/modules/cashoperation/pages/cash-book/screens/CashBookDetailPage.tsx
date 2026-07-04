import { Button, Table } from "antd";
import type { TableColumnsType } from "antd";
import { ArrowLeft, RefreshCw, Wallet } from "lucide-react";
import { useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import Card from "@/components/ui/card/Card";
import { customDate, generateKeyTable, numberSpacing } from "@/utils/utils";
import { useGetCashBook } from "../hooks";
import type { CashBookEntry } from "../types/type";

export default function CashBookDetailPage() {
  const navigate = useNavigate();
  const { cashBoxId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const { data, isLoading, isFetching, refetch } = useGetCashBook(
    cashBoxId,
    searchParams,
  );

  const columns = useMemo<TableColumnsType<CashBookEntry>>(
    () => [
      {
        dataIndex: "indexId",
        title: "№",
        align: "center",
        width: 70,
      },
      {
        dataIndex: "docDate",
        title: "Sana",
        render: (value) => customDate(value),
      },
      {
        dataIndex: "docNumber",
        title: "Hujjat raqami",
        render: (value) => value ?? "-",
      },
      {
        dataIndex: "documentKind",
        title: "Turi",
        render: (value) => value ?? "-",
      },
      {
        dataIndex: "paymentPurposeName",
        title: "To'lov maqsadi",
        render: (value) => value ?? "-",
      },
      {
        dataIndex: "counterpartyName",
        title: "Kontragent",
        render: (value) => value ?? "-",
      },
      {
        dataIndex: "comment",
        title: "Izoh",
        render: (value) => value ?? "-",
      },
      {
        dataIndex: "currencyName",
        title: "Valyuta",
        render: (value) => value ?? "-",
      },
      {
        dataIndex: "receipt",
        title: "Kirim",
        align: "right",
        render: (value) => numberSpacing(value ?? 0),
      },
      {
        dataIndex: "payment",
        title: "Chiqim",
        align: "right",
        render: (value) => numberSpacing(value ?? 0),
      },
      {
        dataIndex: "runningBalance",
        title: "Qoldiq",
        align: "right",
        render: (value) => numberSpacing(value ?? 0),
      },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <Card className="border-border/50 overflow-hidden bg-gradient-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Wallet className="size-4 text-primary" />
              <span className="font-semibold">Kassa</span>
            </div>
            <div className="text-lg font-bold text-foreground">
              {data?.cashBoxName ?? `Kassa #${cashBoxId}`}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              icon={<RefreshCw className="size-4" />}
              onClick={() => void refetch()}
            >
              Yangilash
            </Button>
            <Button
              icon={<ArrowLeft className="size-4" />}
              onClick={() => navigate("..")}
            >
              Orqaga
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Boshlang'ich qoldiq</div>
          <div className="mt-1 text-xl font-semibold">
            {numberSpacing(data?.openingBalance ?? 0)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Jami kirim</div>
          <div className="mt-1 text-xl font-semibold text-green-600">
            {numberSpacing(data?.totalReceipt ?? 0)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Jami chiqim</div>
          <div className="mt-1 text-xl font-semibold text-red-600">
            {numberSpacing(data?.totalPayment ?? 0)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Yakuniy qoldiq</div>
          <div className="mt-1 text-xl font-semibold">
            {numberSpacing(data?.closingBalance ?? 0)}
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden border border-border">
        <Table<CashBookEntry>
          loading={isLoading || isFetching}
          columns={columns}
          dataSource={generateKeyTable(data?.items ?? [], "moneyRegisterEntryId")}
          pagination={false}
          scroll={{ x: "max-content", y: "calc(100vh - 340px)" }}
        />
      </Card>
    </div>
  );
}
