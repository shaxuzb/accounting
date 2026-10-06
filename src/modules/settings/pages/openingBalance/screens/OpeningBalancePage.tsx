import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { Alert, App, Button, Spin } from "antd";
import {
  CheckCircle2,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Scale,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import OpeningBalanceAccountsTable from "../components/OpeningBalanceAccountsTable";
import OpeningBalanceAddEditModal from "../components/OpeningBalanceAddEditModal";
import OpeningBalanceDocumentHeader from "../components/OpeningBalanceDocumentHeader";
import { openingBalancePermissions } from "../constants/permissions";
import {
  useCloseOpeningBalanceOffset,
  useDeleteOpeningBalance,
  useGetOpeningBalance,
  usePostOpeningBalance,
  useUnpostOpeningBalance,
} from "../hooks";
import type { OpeningBalance } from "../types/type";

const money = (value: number) =>
  value.toLocaleString("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

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
  const postMutation = usePostOpeningBalance(data?.id);
  const unpostMutation = useUnpostOpeningBalance(data?.id);
  const closeOffsetMutation = useCloseOpeningBalanceOffset(data?.id);
  const isPosted = data?.statusId === 2;
  const offsetBalance = Number(data?.offsetBalance ?? 0);

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

  const handlePost = () => {
    modal.confirm({
      title: t("openingBalance.actions.postTitle"),
      content: t("openingBalance.actions.postDescription"),
      okText: t("openingBalance.actions.post"),
      cancelText: t("common.cancel"),
      onOk: async () => {
        try {
          await postMutation.mutateAsync();
          toast.success(t("openingBalance.messages.posted"));
        } catch (error: unknown) {
          errorHandlers(error);
          throw error;
        }
      },
    });
  };

  const handleCloseOffset = () => {
    modal.confirm({
      title: t("openingBalance.offset.confirmTitle"),
      content: t("openingBalance.offset.confirmDescription", {
        amount: money(Math.abs(offsetBalance)),
      }),
      okText: t("openingBalance.offset.close"),
      cancelText: t("common.cancel"),
      onOk: async () => {
        try {
          const amount = Number((await closeOffsetMutation.mutateAsync()) ?? 0);
          toast.success(
            t("openingBalance.offset.closed", {
              amount: money(Math.abs(amount)),
              side: amount >= 0 ? "Kt" : "Dt",
            }),
          );
        } catch (error: unknown) {
          errorHandlers(error);
          throw error;
        }
      },
    });
  };

  const handleUnpost = () => {
    modal.confirm({
      title: t("openingBalance.actions.unpostTitle"),
      content: t("openingBalance.actions.unpostDescription"),
      okText: t("openingBalance.actions.unpost"),
      cancelText: t("common.cancel"),
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await unpostMutation.mutateAsync();
          toast.success(t("openingBalance.messages.unposted"));
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
                {isPosted ? (
                  <PermissionCard
                    permission={openingBalancePermissions.update}
                  >
                    <Button
                      danger
                      icon={<RotateCcw className="size-4" />}
                      loading={unpostMutation.isPending}
                      onClick={handleUnpost}
                    >
                      {t("openingBalance.actions.unpost")}
                    </Button>
                  </PermissionCard>
                ) : (
                  <>
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
                    <PermissionCard
                      permission={openingBalancePermissions.update}
                    >
                      <Button
                        type="primary"
                        icon={<CheckCircle2 className="size-4" />}
                        loading={postMutation.isPending}
                        onClick={handlePost}
                      >
                        {t("openingBalance.actions.post")}
                      </Button>
                    </PermissionCard>
                  </>
                )}
              </>
            }
          />

          {Math.abs(offsetBalance) >= 0.01 && (
            <Alert
              showIcon
              type="warning"
              message={t("openingBalance.offset.notZero", {
                amount: money(offsetBalance),
              })}
              action={
                <PermissionCard permission={openingBalancePermissions.update}>
                  <Button
                    size="small"
                    type="primary"
                    loading={closeOffsetMutation.isPending}
                    onClick={handleCloseOffset}
                  >
                    {t("openingBalance.offset.close")}
                  </Button>
                </PermissionCard>
              }
            />
          )}

          {isPosted && (
            <Alert
              showIcon
              type="success"
              message={t("openingBalance.messages.lockedHint")}
            />
          )}

          <OpeningBalanceAccountsTable
            accounts={data.accounts ?? []}
            readOnly={isPosted}
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
