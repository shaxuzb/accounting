import { Alert, Button, Collapse, Empty, Popconfirm, Select, Space, Tag } from "antd";
import { CheckCircle2, RefreshCw } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { formatDate } from "@/utils/utils";
import {
  errorText,
  useBankBranches,
  useCheckOneCPreflight,
  useOneCOurAccounts,
  useOneCPreflight,
  useResolveOneCPreflight,
  type OneCPreflightAction,
  type OneCPreflightItem,
} from "./api";
import { EvidenceTable, verdictColor } from "./OneCComparePanel";

const T = "settings.integrations.onec";
const C = `${T}.compare`;
const F = `${T}.preflight`;

/** The dismissal grounds of the Labour Code (codes as the payroll keeps them). */
const GROUNDS = [
  "AGREEMENT",
  "CONTRACT_EXPIRY",
  "EMPLOYEE_INITIATIVE",
  "LIQUIDATION",
  "STAFF_REDUCTION",
  "INSUFFICIENT_QUALIFICATION",
  "SYSTEMATIC_BREACH",
  "GROSS_BREACH",
  "EMPLOYER_OTHER",
  "OWNER_CHANGE_REFUSAL",
  "NEW_CONDITIONS_REFUSAL",
  "RELOCATION_REFUSAL",
  "MEDICAL_TRANSFER_REFUSAL",
  "MILITARY_SERVICE",
  "PREDECESSOR_REINSTATED",
  "COURT_SENTENCE",
  "HIRING_RULES_BREACH",
  "LEGAL_IMPEDIMENT",
  "COURT_LIQUIDATION",
  "REINSTATEMENT_REVERSED",
];

const money = (value: number | null | undefined) =>
  value === null || value === undefined ? "" : value.toLocaleString("ru-RU", { maximumFractionDigits: 2 });

/** The ways an issue may be settled, by its kind. */
const actionsOf = (category: string): OneCPreflightAction[] => {
  switch (category) {
    case "ANALYTICS":
      return ["MAP_ACCOUNT", "EXCLUDE"];
    case "CLASSIFIER":
      return ["PICK_BANK", "EXCLUDE"];
    case "SERVICE_ON_STOCK":
      return ["PICK_ACCOUNT", "EXCLUDE"];
    case "DISMISSAL_GROUND":
      return ["PICK_GROUND"];
    default:
      return ["EXCLUDE"];
  }
};

function Settle({ runId, item }: { runId: number; item: OneCPreflightItem }) {
  const { t } = useTranslation();
  const actions = actionsOf(item.category);
  const needsAccount = actions.includes("MAP_ACCOUNT") || actions.includes("PICK_ACCOUNT");
  const ourAccounts = useOneCOurAccounts(needsAccount);
  const branches = useBankBranches(actions.includes("PICK_BANK"));
  const resolve = useResolveOneCPreflight();
  const [value, setValue] = useState<string | undefined>();

  const send = (action: OneCPreflightAction, chosen?: string) =>
    resolve.mutate(
      { runId, findingId: item.id, action, value: chosen },
      {
        onSuccess: () => toast.success(t(`${F}.settled`)),
        onError: (error) => toast.error(errorText(error, t(`${T}.error`))),
      },
    );

  const picker = actions.find((action) => action !== "EXCLUDE");
  return (
    <Space wrap>
      {picker === "MAP_ACCOUNT" || picker === "PICK_ACCOUNT" ? (
        <Select
          showSearch
          className="w-80"
          placeholder={t(`${F}.chooseAccount`)}
          loading={ourAccounts.isLoading}
          value={value}
          onChange={setValue}
          optionFilterProp="label"
          options={(ourAccounts.data ?? []).map((account) => ({ value: String(account.id), label: `${account.number} ${account.name}` }))}
        />
      ) : picker === "PICK_BANK" ? (
        <Select
          showSearch
          className="w-96"
          placeholder={t(`${F}.chooseBank`)}
          loading={branches.isLoading}
          value={value}
          onChange={setValue}
          optionFilterProp="label"
          options={(branches.data ?? []).map((branch) => ({ value: String(branch.id), label: `${branch.mfo} — ${branch.name}` }))}
        />
      ) : picker === "PICK_GROUND" ? (
        <Select
          showSearch
          className="w-96"
          placeholder={t(`${F}.chooseGround`)}
          value={value}
          onChange={setValue}
          optionFilterProp="label"
          options={GROUNDS.map((code) => ({ value: code, label: t(`${F}.grounds.${code}`) }))}
        />
      ) : null}
      {picker && (
        <Button type="primary" disabled={!value} loading={resolve.isPending} onClick={() => picker && send(picker, value)}>
          {t(`${F}.apply`)}
        </Button>
      )}
      {actions.includes("EXCLUDE") && (
        <Popconfirm title={t(`${F}.excludeConfirm`, { count: item.related.length })} onConfirm={() => send("EXCLUDE")}>
          <Button danger loading={resolve.isPending}>
            {t(`${F}.exclude`, { count: item.related.length })}
          </Button>
        </Popconfirm>
      )}
    </Space>
  );
}

/** «Hal qilish kerak»: what the import waits for, each with its proof and the way to settle it. */
export function PreflightTab({ runId, version, editable, onOpen }: { runId: number; version: string; editable: boolean; onOpen: (id: number) => void }) {
  const { t } = useTranslation();
  const preflight = useOneCPreflight(runId, version, true);
  const check = useCheckOneCPreflight();
  const items = preflight.data?.items ?? [];
  const open = items.filter((item) => !item.resolvedAt);
  const settled = items.filter((item) => item.resolvedAt);

  const card = (item: OneCPreflightItem) => ({
    key: String(item.id),
    label: (
      <div className="flex flex-wrap items-center gap-2">
        {item.resolvedAt ? (
          <CheckCircle2 className="size-4 text-green-600" />
        ) : (
          <Tag color={verdictColor[item.verdict]}>{t(`${C}.verdicts.${item.verdict}`)}</Tag>
        )}
        <Tag>{t(`${C}.categories.${item.category}`)}</Tag>
        <span className={item.resolvedAt ? "text-secondary-text line-through" : "font-medium"}>{item.title}</span>
        {item.amount ? <span className="text-secondary-text">{money(item.amount)}</span> : null}
      </div>
    ),
    children: (
      <div className="space-y-3">
        {item.explanation && <p className="m-0 text-sm">{item.explanation}</p>}
        {item.resolvedAt ? (
          <Alert
            type="success"
            showIcon
            message={t(`${F}.settledAt`, { date: formatDate(item.resolvedAt, "DD.MM.YYYY HH:mm") })}
            description={item.resolution ?? undefined}
          />
        ) : (
          editable && <Settle runId={runId} item={item} />
        )}
        <EvidenceTable rows={item.evidence} onOpen={onOpen} />
      </div>
    ),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {open.length > 0 ? (
          <Alert showIcon type="warning" className="flex-1" message={t(`${F}.blocking`, { count: preflight.data?.unresolved ?? open.length })} />
        ) : (
          <Alert showIcon type="success" className="flex-1" message={t(`${F}.allSettled`)} />
        )}
        <Button
          icon={<RefreshCw className="size-4" />}
          loading={check.isPending}
          disabled={!editable}
          onClick={() =>
            check.mutate(runId, { onError: (error) => toast.error(errorText(error, t(`${T}.error`))) })
          }
        >
          {t(`${F}.recheck`)}
        </Button>
      </div>
      {items.length === 0 ? (
        <Empty description={t(`${F}.empty`)} />
      ) : (
        <>
          {open.length > 0 && <Collapse items={open.map(card)} />}
          {settled.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm text-secondary-text">{t(`${F}.settledList`, { count: settled.length })}</div>
              <Collapse items={settled.map(card)} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
