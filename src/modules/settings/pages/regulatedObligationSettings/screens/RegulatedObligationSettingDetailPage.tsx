import dayjs from "dayjs";
import { Empty, Spin } from "antd";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";
import Card from "@/components/ui/card/Card";
import ReadonlyFieldGrid from "@/components/ui/card/ReadonlyFieldGrid";
import SectionCard from "@/components/ui/card/SectionCard";
import { chartAccountOptionLabel } from "@/shared/constants/selectLists";
import { formatDateWithOutTime } from "@/utils/helpers";
import { numberSpacing } from "@/utils/utils";
import { stateStatus } from "@/utils/helpers/statusHelper";
import { useGetDetailRegulatedObligationSetting } from "../hooks";
import type { RegulatedObligationSetting } from "../types";

const displayValue = (value: string | number | null | undefined) =>
  value ?? "-";

export default function RegulatedObligationSettingDetailPage() {
  const { t } = useTranslation();
  const { id = "" } = useParams<{ id: string }>();
  const { data, isLoading } = useGetDetailRegulatedObligationSetting(id);

  if (isLoading) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!data) {
    return (
      <Card className="border border-border p-10">
        <Empty description={t("settings.regulatedObligations.notFound")} />
      </Card>
    );
  }

  const setting: RegulatedObligationSetting = data;
  const chartAccount =
    setting.chartAccountNumber || setting.chartAccountName
      ? chartAccountOptionLabel({
          number: setting.chartAccountNumber ?? undefined,
          name: setting.chartAccountName ?? undefined,
        })
      : "-";

  return (
    <div className="space-y-2">
      <SectionCard
        title="settings.regulatedObligations.detail"
        bodyClassName="sm:p-3"
      >
        <ReadonlyFieldGrid
          columns="md:grid-cols-2 xl:grid-cols-4"
          items={[
            {
              label: t("settings.fields.regulatedObligation"),
              value: `${setting.code} — ${setting.name}`,
              className: "md:col-span-2 xl:col-span-2",
            },
            {
              label: t("settings.fields.category"),
              value: setting.categoryName || setting.categoryCode,
            },
            {
              label: t("settings.fields.periodicity"),
              value: displayValue(
                setting.periodicityName ?? setting.periodicityCode,
              ),
            },
            {
              label: t("settings.fields.classifierCode"),
              value: displayValue(setting.classifierCode),
            },
            {
              label: t("settings.fields.rate"),
              value:
                setting.rate === null ? "-" : `${numberSpacing(setting.rate)}%`,
            },
            {
              label: t("settings.fields.chartAccount"),
              value: chartAccount,
              className: "md:col-span-2",
            },
            {
              label: t("settings.fields.effectiveFrom"),
              value: setting.effectiveFrom
                ? dayjs(setting.effectiveFrom).format(formatDateWithOutTime)
                : "-",
            },
            {
              label: t("settings.fields.effectiveTo"),
              value: setting.effectiveTo
                ? dayjs(setting.effectiveTo).format(formatDateWithOutTime)
                : "-",
            },
            {
              label: t("settings.fields.status"),
              value: stateStatus(setting.stateId, setting.stateName),
            },
          ]}
        />
      </SectionCard>

    </div>
  );
}
