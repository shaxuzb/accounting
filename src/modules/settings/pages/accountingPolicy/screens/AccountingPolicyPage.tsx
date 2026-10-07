import { Button, Tabs } from "antd";
import dayjs from "dayjs";
import { RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useGetAccountingPolicyHistory,
  useGetCurrentAccountingPolicy,
} from "../hooks";
import CurrentPolicyTab from "../components/CurrentPolicyTab";
import SettlementPolicyCard from "../components/SettlementPolicyCard";
import PolicyHistoryTab from "../components/PolicyHistoryTab";
import AccountingPolicyAddEditPage from "./AccountingPolicyAddEditPage";

type PolicyTab = "current" | "history";

export default function AccountingPolicyPage() {
  const { t } = useTranslation();
  const today = dayjs().format("YYYY-MM-DD");
  const [activeTab, setActiveTab] = useState<PolicyTab>("current");
  const [editOpen, setEditOpen] = useState(false);
  const [historyParams, setHistoryParams] = useState({
    dateFrom: `${dayjs().year()}-01-01`,
    dateTo: today,
  });

  const current = useGetCurrentAccountingPolicy({
    effectiveOn: today,
    enabled: activeTab === "current" || editOpen,
  });
  const history = useGetAccountingPolicyHistory({
    ...historyParams,
    enabled: activeTab === "history",
  });

  const tabItems = useMemo(
    () => [
      {
        key: "current",
        label: t("accountingPolicy.view.currentTab"),
        children: (
          <div className="space-y-4">
            <SettlementPolicyCard />
            <CurrentPolicyTab
              data={current.data}
              isLoading={current.isLoading}
              isError={current.isError}
              onEdit={() => setEditOpen(true)}
            />
          </div>
        ),
      },
      {
        key: "history",
        label: t("accountingPolicy.view.historyTab"),
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
      t,
    ],
  );

  const refresh = () => {
    if (activeTab === "current") void current.refetch();
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
              current.isFetching || history.isFetching
            }
          >
            {t("common.refresh")}
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
