import { useState } from "react";
import { Typography } from "antd";
import EndpointResultCard from "@/modules/accountings/components/EndpointResultCard";
import { useRepostAccounting } from "../hooks";
import RepostForm from "../components/RepostForm";
import type { RepostFilter } from "../types/type";

export default function RepostPage() {
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
          Repost
        </Typography.Title>
        <p className="text-sm text-secondary-text">
          Swagger endpoint: <code>/api/register/repost</code>
        </p>
      </div>

      <RepostForm loading={mutation.isPending} onSubmit={handleSubmit} />

      <EndpointResultCard
        title="Response"
        description="Repost so'rovi natijasi."
        data={mutation.data ?? lastResult}
        isLoading={mutation.isPending}
        emptyText="Hozircha repost natijasi yo'q"
      />
    </div>
  );
}
