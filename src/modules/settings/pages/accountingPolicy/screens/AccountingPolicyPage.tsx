import { Button, Tabs } from "antd";
import dayjs from "dayjs";
import { RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import {
  useGetAccountingPolicyHistory,
  useGetAccountingPolicyImpact,
  useGetCurrentAccountingPolicy,
} from "../hooks";
import CurrentPolicyTab from "../components/CurrentPolicyTab";
import PolicyHistoryTab from "../components/PolicyHistoryTab";
import PolicyImpactTab from "../components/PolicyImpactTab";
import AccountingPolicyAddEditPage from "./AccountingPolicyAddEditPage";

type PolicyTab = "current" | "impact" | "history";

export default function AccountingPolicyPage() {
  const today = dayjs().format("YYYY-MM-DD");
  const [activeTab, setActiveTab] = useState<PolicyTab>("current");
  const [editOpen, setEditOpen] = useState(false);
  const [impactParams, setImpactParams] = useState({
    effectiveOn: today,
    documentType: "SALE",
  });
  const [historyParams, setHistoryParams] = useState({
    dateFrom: `${dayjs().year()}-01-01`,
    dateTo: today,
  });

  const current = useGetCurrentAccountingPolicy({
    effectiveOn: today,
    enabled: activeTab === "current" || editOpen,
  });
  const impact = useGetAccountingPolicyImpact({
    ...impactParams,
    enabled: activeTab === "impact",
  });
  const history = useGetAccountingPolicyHistory({
    ...historyParams,
    enabled: activeTab === "history",
  });

  const tabItems = useMemo(
    () => [
      {
        key: "current",
        label: "Current policy",
        children: (
          <CurrentPolicyTab
            data={current.data}
            isLoading={current.isLoading}
            isError={current.isError}
            onEdit={() => setEditOpen(true)}
          />
        ),
      },
      {
        key: "impact",
        label: "Check impact",
        children: (
          <PolicyImpactTab
            effectiveOn={impactParams.effectiveOn}
            documentType={impactParams.documentType}
            data={impact.data}
            isLoading={impact.isLoading}
            isError={impact.isError}
            onCheck={(effectiveOn, documentType) =>
              setImpactParams({ effectiveOn, documentType: documentType ?? "" })
            }
          />
        ),
      },
      {
        key: "history",
        label: "Policy history",
        children: (
          <PolicyHistoryTab
            dateFrom={historyParams.dateFrom}
            dateTo={historyParams.dateTo}
            data={history.data}
            isLoading={history.isLoading}
            isError={history.isError}
            onFilter={(dateFrom, dateTo) =>
              setHistoryParams({ dateFrom, dateTo })
            }
          />
        ),
      },
    ],
    [
      current.data,
      current.isError,
      current.isLoading,
      history.data,
      history.isError,
      history.isLoading,
      historyParams.dateFrom,
      historyParams.dateTo,
      impact.data,
      impact.isError,
      impact.isLoading,
      impactParams.documentType,
      impactParams.effectiveOn,
    ],
  );

  const refresh = () => {
    if (activeTab === "current") void current.refetch();
    if (activeTab === "impact") void impact.refetch();
    if (activeTab === "history") void history.refetch();
  };

  return (
    <div className="w-full">
      <Tabs
        activeKey={activeTab}
        items={tabItems}
        onChange={(key) => setActiveTab(key as PolicyTab)}
        className="w-full [&_.ant-tabs-nav]:before:border-0!"
        tabBarExtraContent={
          <Button
            icon={<RefreshCw className="size-4" />}
            onClick={refresh}
            loading={
              current.isFetching || impact.isFetching || history.isFetching
            }
          >
            Refresh
          </Button>
        }
      />

      <AccountingPolicyAddEditPage
        open={editOpen}
        effectiveOn={today}
        onClose={() => setEditOpen(false)}
      />
    </div>
  );
}
