import { Button, DatePicker, Popconfirm, Spin, Table } from "antd";
import type { TableColumnsType } from "antd";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import AccountingEntriesButton from "@/modules/accounting/components/AccountingEntriesButton";
import { useAppSelector } from "@/store/hooks";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { customDate } from "@/utils/utils";
import { faDepreciationPermissions } from "../constants/permissions";
import {
  useCancelFaDepreciation,
  useGetDetailFaDepreciation,
  useRunFaDepreciation,
} from "../hooks";
import type { FaDepreciationRunLine } from "../types/type";
import { formatMoney } from "../utils/formatMoney";
import { faDocumentStatusIds } from "../../../shared/constants/statuses";
import dayjs from "@/config/dayjs";

/** The register's document type of a depreciation run. */
const FA_DEPRECIATION_DOCUMENT_TYPE_ID = 13;

export default function FaDepreciationFormPage() {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [period, setPeriod] = useState(() => dayjs());
  const { user } = useAppSelector((state) => state.auth);
  const permissions = user?.user.permissions ?? [];
  const detailQuery = useGetDetailFaDepreciation(id);
  const runMutation = useRunFaDepreciation();
  const cancelMutation = useCancelFaDepreciation(id);
  const detail = detailQuery.data;
  const statusId = detail?.statusId ?? faDocumentStatusIds.posted;
  const isPosted = isEdit && statusId === faDocumentStatusIds.posted;

  const isSubmitting = runMutation.isPending || cancelMutation.isPending;

  const canCancel = permissions.includes(faDepreciationPermissions.cancel);
  const canRun = permissions.includes(faDepreciationPermissions.create);

  const title = isEdit ? t("fa.form.detail") : t("fa.form.run");

  const handleRun = async () => {
    try {
      await runMutation.mutateAsync(period.format("YYYY-MM"));
      toast.success(t("settings.messages.created"));
      navigate(-1);
    } catch (error) {
      errorHandlers(error);
    }
  };

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync();
      toast.success(t("common.cancel"));
      navigate(-1);
    } catch (error) {
      errorHandlers(error);
    }
  };

  const lineColumns: TableColumnsType<FaDepreciationRunLine> = [
    { title: t("fa.fields.inventoryNumber"), dataIndex: "inventoryNumber", width: 160 },
    { title: t("fa.fields.name"), dataIndex: "assetName", minWidth: 220 },
    { title: t("fa.fields.depreciationMethod"), dataIndex: "depreciationMethodName", width: 200 },
    {
      title: t("fa.fields.amount"),
      dataIndex: "amount",
      align: "right",
      width: 180,
      render: (value: number) => formatMoney(value),
    },
  ];

  if (isEdit && detailQuery.isLoading) {
    return (
      <Card className="border border-border p-4">
        <Spin spinning />
      </Card>
    );
  }

  return (
    <Card className="border border-border p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="text-xl font-semibold">{title}</div>
        {isEdit && detail && (
          <ProcessStatusBadge statusId={detail.statusId} statusName={detail.statusName} />
        )}
      </div>

      {!isEdit && (
        <div className="mb-4 max-w-xs">
          <div className="mb-2 text-sm font-medium">{t("fa.depreciation.period")}</div>
          <DatePicker
            picker="month"
            value={period}
            onChange={(value) => value && setPeriod(value)}
            format="MMMM YYYY"
            allowClear={false}
            className="h-[38px] w-full"
          />
        </div>
      )}

      {isEdit && detail && (
        <>
          <div className="grid gap-3 md:grid-cols-4">
            <div>
              <div className="text-sm text-muted-foreground">{t("fa.fields.documentNumber")}</div>
              <div className="font-medium">{detail.docNumber}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">{t("fa.depreciation.period")}</div>
              <div className="font-medium">{dayjs(detail.periodMonth).format("MMMM YYYY")}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">{t("fa.fields.amount")}</div>
              <div className="font-medium">{formatMoney(detail.totalAmount)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">{t("fa.fields.note")}</div>
              <div>{detail.note || "-"}</div>
            </div>
          </div>

          <Table<FaDepreciationRunLine>
            className="mt-4"
            size="small"
            rowKey="id"
            columns={lineColumns}
            dataSource={detail.lines ?? []}
            pagination={false}
            scroll={{ x: "max-content" }}
          />
        </>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        {!isEdit && canRun && (
          <PermissionCard permission={faDepreciationPermissions.create}>
            <Button type="primary" loading={isSubmitting} onClick={() => void handleRun()}>
              {t("fa.form.run")}
            </Button>
          </PermissionCard>
        )}

        {isEdit && (
          <AccountingEntriesButton
            documentTypeId={FA_DEPRECIATION_DOCUMENT_TYPE_ID}
            documentId={id}
            statusId={detail?.statusId}
          >
            {t("app.routes.accountingEntries")}
          </AccountingEntriesButton>
        )}

        {isPosted && canCancel && (
          <PermissionCard permission={faDepreciationPermissions.cancel}>
            <Popconfirm
              title={t("actions.cancelConfirmTitle")}
              description={t("actions.cancelConfirmContent")}
              okText={t("actions.cancel")}
              cancelText={t("common.close")}
              okButtonProps={{ danger: true }}
              onConfirm={() => handleCancel()}
            >
              <Button danger loading={isSubmitting}>
                {t("common.cancel")}
              </Button>
            </Popconfirm>
          </PermissionCard>
        )}
      </div>

      {isEdit && detail?.createdDate && (
        <div className="mt-3 text-xs text-muted-foreground">
          {t("settings.fields.createdDate")}: {customDate(detail.createdDate)}
        </div>
      )}
    </Card>
  );
}
