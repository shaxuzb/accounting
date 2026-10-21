import { Breadcrumb, Button, Drawer } from "antd";
import { ArrowLeft, Maximize2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import AccountDrill from "./AccountDrill";
import type { DrillSide } from "./api";

export interface DrillTarget {
  accountId: number;
  label: string;
  side?: DrillSide | null;
}

/** The URL of an account's analysis on a page of its own. */
export const accountAnalysisPath = (accountId: number, dateFrom?: string | null, dateTo?: string | null, side?: DrillSide | null) => {
  const params = new URLSearchParams({ accountId: String(accountId) });
  if (dateFrom) params.set("dateFrom", dateFrom);
  if (dateTo) params.set("dateTo", dateTo);
  if (side) params.set("side", side);
  return `/main/accountings/account-analysis?${params.toString()}`;
};

/**
 * The trial balance's drill-down: the account opens on a panel beside the sheet. A
 * correspondent account opens over it and the trail leads back; the page of its own keeps
 * the same view at a link.
 */
export default function AccountDrillPanel({
  target,
  dateFrom,
  dateTo,
  onClose,
}: {
  target: DrillTarget | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  // the accounts opened one from another; the last is shown
  const [trail, setTrail] = useState<DrillTarget[]>([]);
  const [opened, setOpened] = useState<DrillTarget | null>(null);
  if (target !== opened) {
    setOpened(target);
    setTrail(target ? [target] : []);
  }
  const current = trail[trail.length - 1];

  return (
    <Drawer
      open={Boolean(current)}
      onClose={onClose}
      width="min(1280px, 96vw)"
      destroyOnHidden
      title={
        <div className="flex items-center gap-2">
          {trail.length > 1 && (
            <Button size="small" type="text" icon={<ArrowLeft className="size-4" />} onClick={() => setTrail(trail.slice(0, -1))} />
          )}
          <Breadcrumb
            items={trail.map((item, index) => ({
              title:
                index === trail.length - 1 ? (
                  <b>{item.label}</b>
                ) : (
                  <a onClick={() => setTrail(trail.slice(0, index + 1))}>{item.label}</a>
                ),
            }))}
          />
        </div>
      }
      extra={
        current && (
          <Button
            icon={<Maximize2 className="size-4" />}
            onClick={() => navigate(accountAnalysisPath(current.accountId, dateFrom, dateTo, current.side))}
          >
            {t("app.accountDrill.openPage")}
          </Button>
        )
      }
    >
      {current && (
        <AccountDrill
          key={`${current.accountId}-${trail.length}`}
          accountId={current.accountId}
          dateFrom={dateFrom}
          dateTo={dateTo}
          initialSide={current.side}
          onOpenAccount={(accountId, label) => setTrail([...trail, { accountId, label }])}
        />
      )}
    </Drawer>
  );
}
