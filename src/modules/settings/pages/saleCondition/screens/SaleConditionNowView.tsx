import { Empty, Spin, Tag } from "antd";
import {
  Building2,
  CalendarDays,
  CircleCheck,
  Clock,
  Percent,
  Tag as TagIcon,
} from "lucide-react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import Card from "@/components/ui/card/Card";
import { formatDate, formatDateWithOutTime } from "@/utils/helpers";
import { useGetNowSaleCondition } from "../hooks/useGetNowSaleCondition";

interface FieldRowProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: React.ReactNode;
  badge?: React.ReactNode;
}

function FieldRow({ icon, iconBg, label, value, badge }: FieldRowProps) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBg}`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="mt-0.5 text-sm font-medium text-foreground truncate">
          {value}
        </div>
      </div>
      {badge && <div className="shrink-0">{badge}</div>}
    </div>
  );
}

export default function SaleConditionNowView() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useGetNowSaleCondition();

  if (isLoading) {
    return (
      <div className="flex justify-center p-10">
        <Spin />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Card className="border border-border p-6">
        <Empty description={t("settings.saleCondition.noActive")} />
      </Card>
    );
  }

  const periodText =
    (data.startDate
      ? dayjs(data.startDate).format(formatDateWithOutTime)
      : "—") +
    " — " +
    (data.endDate ? dayjs(data.endDate).format(formatDateWithOutTime) : "");

  return (
    <div className="space-y-4">
      <Card className="border border-border p-5">
        <div className="mb-4 flex items-center gap-2">
          <h3 className="text-base font-semibold">
            {t("settings.saleCondition.activeTitle")}
          </h3>
          <Tag color="green">{t("settings.saleCondition.active")}</Tag>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          {t("settings.saleCondition.activeDescription")}
        </p>

        <div className="grid grid-cols-1 gap-x-6 md:grid-cols-2 divide-y divide-border md:divide-y-0">
          <div className="divide-y divide-border">
            {data.organizationName && (
              <FieldRow
                icon={<Building2 className="size-5 text-blue-600" />}
                iconBg="bg-blue-50"
                label={t("settings.fields.organization")}
                value={data.organizationName}
              />
            )}
            <FieldRow
              icon={<TagIcon className="size-5 text-purple-600" />}
              iconBg="bg-purple-50"
              label={t("settings.fields.costingMethod")}
              value={data.costingMethodName ?? "—"}
              // badge={
              //   data.costingMethodCode ? (
              //     <Tag>{data.costingMethodCode}</Tag>
              //   ) : undefined
              // }
            />
            <FieldRow
              icon={<Percent className="size-5 text-orange-600" />}
              iconBg="bg-orange-50"
              label={t("settings.fields.vatRate")}
              value={data.vatRateName ?? "—"}
              // badge={
              //   data.vatRateCode ? <Tag>{data.vatRateCode}</Tag> : undefined
              // }
            />
          </div>
          <div className="divide-y divide-border">
            {/* <FieldRow
              icon={<Hash className="size-5 text-slate-600" />}
              iconBg="bg-slate-100"
              label={t("settings.fields.conditionId")}
              value={data.id}
            />
            {data.organizationId !== undefined && (
              <FieldRow
                icon={<Hash className="size-5 text-violet-600" />}
                iconBg="bg-violet-50"
                label={t("settings.fields.organizationId")}
                value={data.organizationId}
              />
            )} */}
            <FieldRow
              icon={<CircleCheck className="size-5 text-green-600" />}
              iconBg="bg-green-50"
              label={t("settings.fields.status")}
              value={
                <Tag color={data.stateId === 1 ? "green" : "red"}>
                  {data.stateName ?? "—"}
                </Tag>
              }
            />
            {data.createdDate && (
              <FieldRow
                icon={<Clock className="size-5 text-sky-600" />}
                iconBg="bg-sky-50"
                label={t("settings.fields.createdDate")}
                value={dayjs(data.createdDate).format(formatDate)}
              />
            )}
            <FieldRow
              icon={<CalendarDays className="size-5 text-emerald-600" />}
              iconBg="bg-emerald-50"
              label={t("settings.fields.period")}
              value={periodText}
            />
          </div>
        </div>
      </Card>

      {/* <Alert
        type="info"
        showIcon
        message={t("settings.saleCondition.infoTitle")}
        description={t("settings.saleCondition.infoDescription")}
      /> */}
    </div>
  );
}
