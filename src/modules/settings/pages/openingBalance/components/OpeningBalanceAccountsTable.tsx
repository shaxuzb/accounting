import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button, Empty, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import { Landmark, Plus } from "lucide-react";
import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import { formatDate, numberSpacing } from "@/utils/utils";
import { openingBalancePermissions } from "../constants/permissions";
import type { OpeningBalanceAccountSummary } from "../types/type";

interface OpeningBalanceAccountsTableProps {
  accounts: OpeningBalanceAccountSummary[];
  onAddAccount: () => void;
  onOpenAccount: (accountId: number) => void;
}

const getBalance = (account: OpeningBalanceAccountSummary) =>
  Number(account.debitAmount ?? 0) - Number(account.creditAmount ?? 0);

export default function OpeningBalanceAccountsTable({
  accounts,
  onAddAccount,
  onOpenAccount,
}: OpeningBalanceAccountsTableProps) {
  const { t } = useTranslation();
  const totals = useMemo(
    () =>
      accounts.reduce(
        (result, account) => ({
          debit: result.debit + Number(account.debitAmount ?? 0),
          credit: result.credit + Number(account.creditAmount ?? 0),
        }),
        { debit: 0, credit: 0 },
      ),
    [accounts],
  );

  const columns: TableColumnsType<OpeningBalanceAccountSummary> = [
    {
      title: t("common.rowNumber"),
      width: 64,
      align: "center",
      render: (_value, _record, index) => index + 1,
    },
    {
      title: t("openingBalance.fields.account"),
      dataIndex: "chartAccountNumber",
      width: 140,
      render: (value, record) => (
        <span className="font-semibold text-primary">
          {value || record.chartAccountCode || record.chartAccountId}
        </span>
      ),
    },
    {
      title: t("openingBalance.fields.accountName"),
      dataIndex: "chartAccountName",
      minWidth: 280,
      render: (value) => value || "-",
    },
    {
      title: t("openingBalance.fields.debit"),
      dataIndex: "debitAmount",
      align: "right",
      width: 170,
      render: (value) => numberSpacing(value ?? 0, undefined, true),
    },
    {
      title: t("openingBalance.fields.credit"),
      dataIndex: "creditAmount",
      align: "right",
      width: 170,
      render: (value) => numberSpacing(value ?? 0, undefined, true),
    },
    {
      title: t("openingBalance.fields.balance"),
      align: "right",
      width: 190,
      render: (_value, record) => {
        const balance = getBalance(record);
        if (!balance) return <span className="text-secondary-text">0</span>;

        return (
          <div className="flex items-center justify-end gap-2">
            <Tag color={balance > 0 ? "blue" : "green"}>
              {t(
                balance > 0
                  ? "openingBalance.fields.debit"
                  : "openingBalance.fields.credit",
              )}
            </Tag>
            <span className="font-medium text-text">
              {numberSpacing(Math.abs(balance), undefined, true)}
            </span>
          </div>
        );
      },
    },
    {
      title: t("settings.fields.createdDate"),
      dataIndex: "createdDate",
      align: "center",
      width: 180,
      render: (value) => (value ? formatDate(value) : "-"),
    },
  ];

  return (
    <Card className="overflow-hidden border border-border">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-primary">
            <Landmark className="size-4.5" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-heading">
              {t("openingBalance.accountsTitle")}
            </div>
            <div className="text-xs text-secondary-text">
              {t("openingBalance.detailsSubtitle")}
            </div>
          </div>
        </div>
        <PermissionCard permission={openingBalancePermissions.update}>
          <Button
            type="primary"
            icon={<Plus className="size-4" />}
            onClick={onAddAccount}
          >
            {t("openingBalance.actions.addAccount")}
          </Button>
        </PermissionCard>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={accounts}
        pagination={false}
        scroll={{ x: "max-content", y: "calc(100vh - 470px)" }}
        rowClassName={() =>
          "cursor-pointer transition-colors hover:bg-brand-soft!"
        }
        onRow={(record) => ({
          onClick: () => onOpenAccount(record.id),
        })}
        summary={() =>
          accounts.length ? (
            <Table.Summary fixed>
              <Table.Summary.Row className="font-semibold">
                <Table.Summary.Cell index={0} colSpan={3} align="right">
                  {t("common.total")}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3} align="right">
                  {numberSpacing(totals.debit, undefined, true)}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4} align="right">
                  {numberSpacing(totals.credit, undefined, true)}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5} colSpan={2} />
              </Table.Summary.Row>
            </Table.Summary>
          ) : null
        }
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={t("openingBalance.messages.noAccounts")}
            >
              <PermissionCard permission={openingBalancePermissions.update}>
                <Button type="primary" onClick={onAddAccount}>
                  {t("openingBalance.actions.addAccount")}
                </Button>
              </PermissionCard>
            </Empty>
          ),
        }}
      />
    </Card>
  );
}
