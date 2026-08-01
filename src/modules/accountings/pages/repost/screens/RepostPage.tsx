import { useState } from "react";
import { Typography } from "antd";
import EndpointResultCard from "@/modules/accountings/components/EndpointResultCard";
import { useRepostAccounting } from "../hooks";
import RepostForm from "../components/RepostForm";
import type { RepostFilter } from "../types/type";
import { useTranslation } from "react-i18next";

export default function RepostPage() {
  const { t } = useTranslation();
  const mutation = useRepostAccounting();
  const [lastResult, setLastResult] = useState<unknown>(null);

  const handleSubmit = async (values: RepostFilter) => {
    const result = await mutation.mutateAsync(values);
    setLastResult(result);
  };

  return (
    <div className="space-y-4">
      <div>
        <Typography.Title level={3} className="!mb-1 !text-text">
          {t("accountings.repost.title")}
        </Typography.Title>
        <p className="text-sm text-secondary-text">
          {t("accountings.endpoint")}: <code>/api/register/repost</code>
        </p>
      </div>

      <RepostForm loading={mutation.isPending} onSubmit={handleSubmit} />

      <EndpointResultCard
        title={t("accountings.result.title")}
        description={t("accountings.repost.resultDescription")}
        data={mutation.data ?? lastResult}
        isLoading={mutation.isPending}
        emptyText={t("accountings.repost.empty")}
      />
    </div>
  );
}
