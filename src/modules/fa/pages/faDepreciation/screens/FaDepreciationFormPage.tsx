import { Button, DatePicker, Spin } from "antd";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import { useAppSelector } from "@/store/hooks";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { customDate } from "@/utils/utils";
import { faDepreciationPermissions } from "../constants/permissions";
import {
  useCancelFaDepreciation,
  useGetDetailFaDepreciation,
  useRunFaDepreciation,
} from "../hooks";
import { faDocumentStatusIds } from "../../../shared/constants/statuses";
import dayjs from "@/config/dayjs";

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

  if (isEdit && detailQuery.isLoading) {
    return (
      <Card className="border border-border p-4">
        <Spin spinning />
      </Card>
    );
  }

  return (
    <Card className="border border-border p-4">
      <div className="mb-4 text-xl font-semibold">{title}</div>

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

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <div className="text-sm text-muted-foreground">
            {t("fa.fields.documentNumber")}
          </div>
          <div>{detail?.documentNumber ?? "-"}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">
            {t("fa.fields.documentDate")}
          </div>
          <div>{detail?.documentDate ? customDate(detail.documentDate) : "-"}</div>
        </div>
        <div className="md:col-span-2">
          <div className="text-sm text-muted-foreground">
            {t("fa.fields.comment")}
          </div>
          <div>{detail?.comment ?? "-"}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">
            {t("settings.fields.status")}
          </div>
          <div>{detail?.statusName ?? "-"}</div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {!isEdit && canRun && (
          <PermissionCard permission={faDepreciationPermissions.create}>
            <Button type="primary" loading={isSubmitting} onClick={() => void handleRun()}>
              {t("fa.form.run")}
            </Button>
          </PermissionCard>
        )}

        {isPosted && canCancel && (
          <PermissionCard permission={faDepreciationPermissions.cancel}>
            <Button
              danger
              loading={isSubmitting}
              onClick={() => void handleCancel()}
            >
              {t("common.cancel")}
            </Button>
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
