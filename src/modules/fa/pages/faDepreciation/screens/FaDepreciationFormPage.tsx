import { Button, Spin } from "antd";
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

export default function FaDepreciationFormPage() {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { user } = useAppSelector((state) => state.auth);
  const permissions = user?.user.permissions ?? [];
  const detailQuery = useGetDetailFaDepreciation(id);
  const runMutation = useRunFaDepreciation();
  const cancelMutation = useCancelFaDepreciation(id);
  const detail = detailQuery.data;
  const stateId = detail?.stateId ?? 1;
  const isDraft = !isEdit || stateId === 1;

  const isSubmitting = runMutation.isPending || cancelMutation.isPending;

  const canCancel = permissions.includes(faDepreciationPermissions.cancel);
  const canRun = permissions.includes(faDepreciationPermissions.create);

  const title = isEdit ? t("fa.form.detail") : t("fa.form.run");

  const handleRun = async () => {
    try {
      const created = await runMutation.mutateAsync();
      toast.success(t("settings.messages.created"));
      navigate(`/main/fa/depreciation/${created.id}`, { replace: true });
    } catch (error) {
      errorHandlers(error);
    }
  };

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync();
      toast.success(t("common.cancel"));
      navigate("/main/fa/depreciation");
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
            {t("fa.fields.state")}
          </div>
          <div>{detail?.stateName ?? "-"}</div>
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

        {isEdit && isDraft && canCancel && (
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
