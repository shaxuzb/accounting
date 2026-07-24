import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { Alert, App, Button, Spin } from "antd";
import { Pencil, Plus, RefreshCw, Scale, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import OpeningBalanceAccountsTable from "../components/OpeningBalanceAccountsTable";
import OpeningBalanceAddEditModal from "../components/OpeningBalanceAddEditModal";
import OpeningBalanceDocumentHeader from "../components/OpeningBalanceDocumentHeader";
import { openingBalancePermissions } from "../constants/permissions";
import {
  useDeleteOpeningBalance,
  useGetOpeningBalance,
} from "../hooks";
import type { OpeningBalance } from "../types/type";

export default function OpeningBalancePage() {
  const { t } = useTranslation();
  const { modal } = App.useApp();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<OpeningBalance | null>(null);
  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetOpeningBalance();
  const deleteMutation = useDeleteOpeningBalance(data?.id);

  const totals = useMemo(
    () =>
      (data?.accounts ?? []).reduce(
        (result, account) => ({
          debit: result.debit + Number(account.debitAmount ?? 0),
          credit: result.credit + Number(account.creditAmount ?? 0),
        }),
        { debit: 0, credit: 0 },
      ),
    [data?.accounts],
  );

  const openCreateModal = () => {
    setEditRecord(null);
    setIsModalOpen(true);
  };

  const openEditModal = () => {
    if (!data) return;
    setEditRecord(data);
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    if (!data?.id) return;

    modal.confirm({
      title: t("openingBalance.actions.deleteTitle"),
      content: t("openingBalance.actions.deleteDescription"),
      okText: t("common.delete"),
      cancelText: t("common.cancel"),
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync();
          toast.success(t("openingBalance.messages.deleted"));
        } catch (error: unknown) {
          errorHandlers(error);
          throw error;
        }
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-105 items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!data && !isError) {
    return (
      <>
        <Card className="border border-border">
          <div className="flex min-h-105 flex-col items-center justify-center px-6 py-12 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-brand-soft text-primary">
              <Scale className="size-8" strokeWidth={1.7} />
            </div>
            <h1 className="mt-5 text-xl font-semibold text-heading">
              {t("openingBalance.title")}
            </h1>
            <p className="mt-2 max-w-lg text-sm leading-6 text-secondary-text">
              {t("openingBalance.emptySubtitle")}
            </p>
            <PermissionCard permission={openingBalancePermissions.create}>
              <Button
                type="primary"
                size="large"
                className="mt-6"
                icon={<Plus className="size-4" />}
                onClick={openCreateModal}
              >
                {t("common.create")}
              </Button>
            </PermissionCard>
          </div>
        </Card>

        <OpeningBalanceAddEditModal
          open={isModalOpen}
          record={editRecord}
          onClose={() => {
            setIsModalOpen(false);
            setEditRecord(null);
          }}
        />
      </>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      {isError && (
        <Alert
          showIcon
          type="error"
          message={t("openingBalance.messages.loadError")}
          action={
            <Button size="small" onClick={() => void refetch()}>
              {t("common.refresh")}
            </Button>
          }
        />
      )}

      {data && (
        <>
          <OpeningBalanceDocumentHeader
            data={data}
            totalDebit={totals.debit}
            totalCredit={totals.credit}
            actions={
              <>
                <Button
                  icon={<RefreshCw className="size-4" />}
                  loading={isFetching}
                  onClick={() => void refetch()}
                >
                  {t("common.refresh")}
                </Button>
                <PermissionCard
                  permission={openingBalancePermissions.update}
                >
                  <Button
                    icon={<Pencil className="size-4" />}
                    onClick={openEditModal}
                  >
                    {t("common.edit")}
                  </Button>
                </PermissionCard>
                <PermissionCard
                  permission={openingBalancePermissions.delete}
                >
                  <Button
                    danger
                    icon={<Trash2 className="size-4" />}
                    loading={deleteMutation.isPending}
                    onClick={handleDelete}
                  >
                    {t("common.delete")}
                  </Button>
                </PermissionCard>
              </>
            }
          />

          <OpeningBalanceAccountsTable
            accounts={data.accounts ?? []}
            onAddAccount={() => navigate(`${data.id}/accounts/new`)}
            onOpenAccount={(accountId) =>
              navigate(`${data.id}/accounts/${accountId}`)
            }
          />
        </>
      )}

      <OpeningBalanceAddEditModal
        open={isModalOpen}
        record={editRecord}
        onClose={() => {
          setIsModalOpen(false);
          setEditRecord(null);
        }}
      />
    </div>
  );
}
