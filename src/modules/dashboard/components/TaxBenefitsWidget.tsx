import { useState } from "react";
import { Button, Checkbox, Empty, Modal, Tag } from "antd";
import { ExternalLink, Scale, Settings2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import dayjs from "@/config/dayjs";
import PermissionCard from "@/components/ui/card/PermissionCard";
import { $axiosPrivate } from "@/services/AxiosService";
import { useAppSelector } from "@/store/hooks";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import DashboardSection from "./DashboardSection";

interface ApplicableTaxBenefit {
  id: number;
  kind: "BENEFIT" | "LAW";
  title: string;
  summary: string | null;
  legalBasis: string | null;
  sourceUrl: string | null;
  validTo: string | null;
  /** The organization's traits it was matched on; empty — it holds for everyone. */
  matchedOn: string[];
}

interface CodeName {
  code: string;
  name: string;
}

const keys = {
  applicable: (orgId: number) => ["tax-benefits", "applicable", orgId] as const,
  statuses: (orgId: number) => ["tax-benefits", "statuses", orgId] as const,
  options: ["tax-benefits", "status-options"] as const,
};

/**
 * The tax benefits and laws that hold for the organization by its tax regime, VAT payer flag,
 * OKED, legal form and special statuses (the platform keeps the catalog).
 */
export default function TaxBenefitsWidget() {
  const { t } = useTranslation();
  const organizationId = useAppSelector((state) => state.organization.id);
  const [statusesOpen, setStatusesOpen] = useState(false);

  const { data = [], isLoading } = useQuery({
    queryKey: keys.applicable(organizationId),
    queryFn: async () =>
      (await $axiosPrivate.get<ApplicableTaxBenefit[]>("/tax-benefits/applicable")).data,
    enabled: Boolean(organizationId),
  });

  return (
    <DashboardSection
      title={t("dashboard.benefits.title")}
      description={t("dashboard.benefits.description")}
      icon={<Scale className="size-5" />}
      extra={
        <PermissionCard permission="ORGANIZATION_UPDATE">
          <Button
            size="small"
            icon={<Settings2 className="size-4" />}
            onClick={() => setStatusesOpen(true)}
          >
            {t("dashboard.benefits.statuses")}
          </Button>
        </PermissionCard>
      }
    >
      {!isLoading && data.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t("dashboard.benefits.empty")}
        />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {data.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-border bg-(--theme-bg-muted) p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="font-semibold text-heading">{item.title}</div>
                <Tag color={item.kind === "BENEFIT" ? "green" : "blue"}>
                  {item.kind === "BENEFIT"
                    ? t("dashboard.benefits.benefit")
                    : t("dashboard.benefits.law")}
                </Tag>
              </div>
              {item.summary && (
                <p className="mt-2 text-sm text-(--theme-text-secondary)">
                  {item.summary}
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-(--theme-text-secondary)">
                {item.legalBasis &&
                  (item.sourceUrl ? (
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1"
                    >
                      {item.legalBasis}
                      <ExternalLink className="size-3" />
                    </a>
                  ) : (
                    <span>{item.legalBasis}</span>
                  ))}
                {item.validTo && (
                  <span>
                    {t("dashboard.benefits.validTo", {
                      date: dayjs(item.validTo).format("DD.MM.YYYY"),
                    })}
                  </span>
                )}
              </div>
              {item.matchedOn.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {item.matchedOn.map((reason) => (
                    <Tag key={reason} className="m-0">
                      {reason}
                    </Tag>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {statusesOpen && (
        <SpecialStatusesModal
          organizationId={organizationId}
          onClose={() => setStatusesOpen(false)}
        />
      )}
    </DashboardSection>
  );
}

/** The organization's special statuses (IT Park resident, free economic zone …). */
function SpecialStatusesModal({
  organizationId,
  onClose,
}: {
  organizationId: number;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [picked, setPicked] = useState<string[] | null>(null);

  const options = useQuery({
    queryKey: keys.options,
    queryFn: async () =>
      (await $axiosPrivate.get<CodeName[]>("/tax-benefits/special-statuses/options")).data,
  });
  const current = useQuery({
    queryKey: keys.statuses(organizationId),
    queryFn: async () =>
      (await $axiosPrivate.get<{ codes: string[] }>("/tax-benefits/special-statuses")).data.codes,
  });
  const save = useMutation({
    mutationFn: (codes: string[]) =>
      $axiosPrivate.put("/tax-benefits/special-statuses", { codes }),
    onSuccess: () => {
      toast.success(t("dashboard.benefits.statusesSaved"));
      void queryClient.invalidateQueries({ queryKey: ["tax-benefits"] });
      onClose();
    },
    onError: errorHandlers,
  });

  const value = picked ?? current.data ?? [];

  return (
    <Modal
      open
      title={t("dashboard.benefits.statusesTitle")}
      okText={t("common.submit")}
      cancelText={t("common.cancel")}
      confirmLoading={save.isPending}
      onOk={() => save.mutate(value)}
      onCancel={onClose}
    >
      <p className="mb-3 text-sm text-(--theme-text-secondary)">
        {t("dashboard.benefits.statusesHint")}
      </p>
      <Checkbox.Group
        className="flex flex-col gap-2"
        value={value}
        onChange={(codes) => setPicked(codes as string[])}
        options={(options.data ?? []).map((option) => ({
          value: option.code,
          label: option.name,
        }))}
      />
    </Modal>
  );
}
