import type { ReactNode } from "react";
import { useMemo } from "react";
import { Table } from "antd";
import type { TableColumnsType } from "antd";
import { Boxes, Building2, CalendarDays, FileText, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import Card from "@/components/ui/card/Card";
import {
  DocumentSummary,
  DocumentSummaryItem,
} from "@/components/ui/card/DocumentSummary";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import { useAppSelector } from "@/store/hooks";
import { customDate } from "@/utils/utils";
import type {
  FaMovement,
  FaMovementAssetLineResponse,
} from "../types/type";
import FaMovementRouteCard from "./FaMovementRouteCard";
import useFaMovementLookups from "./useFaMovementLookups";

interface MovementReadonlyRow {
  key: string;
  index: number;
  inventoryNumber: string;
  assetName: string;
  previousDepartment: string;
  previousResponsible: string;
  destinationDepartment: string;
  destinationResponsible: string;
  note: string;
}

const getText = (source: object, ...keys: string[]) => {
  const record = source as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return "";
};

const getNumber = (source: object, ...keys: string[]) => {
  const record = source as Record<string, unknown>;
  for (const key of keys) {
    const value = Number(record[key]);
    if (Number.isFinite(value) && value > 0) return value;
  }
  return null;
};

interface FaMovementReadonlyViewProps {
  record: FaMovement;
  action?: ReactNode;
}

export default function FaMovementReadonlyView({
  record,
  action,
}: FaMovementReadonlyViewProps) {
  const { t } = useTranslation();
  const organizationName = useAppSelector(
    (state) => state.organization.name,
  );
  const lookups = useFaMovementLookups();
  const destinationDepartment =
    record.toDepartmentName ||
    lookups.departmentLabel(record.toDepartmentId);
  const destinationResponsible =
    record.toResponsibleUserName ||
    lookups.userLabel(record.toResponsibleUserId);

  const getPreviousDepartment = (line: FaMovementAssetLineResponse) => {
    const snapshotName = getText(
      line,
      "fromDepartmentName",
      "previousDepartmentName",
      "oldDepartmentName",
      "departmentName",
    );
    if (snapshotName) return snapshotName;

    const snapshotId = getNumber(
      line,
      "fromDepartmentId",
      "previousDepartmentId",
      "oldDepartmentId",
    );
    if (snapshotId) return lookups.departmentLabel(snapshotId);

    const asset = lookups.getAsset(line.faAssetId);
    if (asset?.departmentId === record.toDepartmentId) return "-";
    return asset?.departmentName || lookups.departmentLabel(asset?.departmentId);
  };

  const getPreviousResponsible = (line: FaMovementAssetLineResponse) => {
    const snapshotName = getText(
      line,
      "fromResponsibleUserName",
      "previousResponsibleUserName",
      "oldResponsibleUserName",
      "responsibleUserName",
    );
    if (snapshotName) return snapshotName;

    const snapshotId = getNumber(
      line,
      "fromResponsibleUserId",
      "previousResponsibleUserId",
      "oldResponsibleUserId",
    );
    if (snapshotId) return lookups.userLabel(snapshotId);

    const asset = lookups.getAsset(line.faAssetId);
    if (asset?.responsibleUserId === record.toResponsibleUserId) return "-";
    return (
      asset?.responsibleUserName || lookups.userLabel(asset?.responsibleUserId)
    );
  };

  const rows: MovementReadonlyRow[] = (record.lines ?? []).map(
    (line, index) => {
      const asset = lookups.getAsset(line.faAssetId);
      return {
        key: `${line.faAssetId}-${index}`,
        index: index + 1,
        inventoryNumber:
          line.faAssetInventoryNumber ||
          line.inventoryNumber ||
          String(asset?.inventoryNumber ?? "-"),
        assetName:
          line.faAssetName ||
          line.assetName ||
          String(asset?.name ?? line.faAssetId),
        previousDepartment: getPreviousDepartment(line),
        previousResponsible: getPreviousResponsible(line),
        destinationDepartment,
        destinationResponsible,
        note: line.note || "-",
      };
    },
  );

  const previousLocations = Array.from(
    new Set(rows.map((row) => row.previousDepartment).filter((value) => value !== "-")),
  ).join(" / ");

  const columns = useMemo<TableColumnsType<MovementReadonlyRow>>(
    () => [
      {
        title: t("common.rowNumber"),
        dataIndex: "index",
        align: "center",
        width: 62,
      },
      {
        title: t("fa.fields.inventoryNumber"),
        dataIndex: "inventoryNumber",
        width: 150,
        render: (value: string) => (
          <span className="font-mono text-xs font-semibold text-primary">
            {value}
          </span>
        ),
      },
      {
        title: t("fa.fields.faAssetId"),
        dataIndex: "assetName",
        minWidth: 230,
        render: (value: string) => (
          <span className="font-medium text-text">{value}</span>
        ),
      },
      {
        title: t("fa.movement.previousDepartment"),
        dataIndex: "previousDepartment",
        minWidth: 160,
      },
      {
        title: t("fa.movement.previousResponsible"),
        dataIndex: "previousResponsible",
        minWidth: 180,
      },
      {
        title: t("fa.movement.destinationDepartment"),
        dataIndex: "destinationDepartment",
        minWidth: 150,
      },
      {
        title: t("fa.movement.destinationResponsible"),
        dataIndex: "destinationResponsible",
        minWidth: 180,
      },
      {
        title: t("fa.fields.note"),
        dataIndex: "note",
        minWidth: 220,
      },
    ],
    [t],
  );

  return (
    <div className="min-w-0 space-y-4">
      <DocumentSummary>
        <DocumentSummaryItem
          icon={<Building2 size={24} strokeWidth={1.8} />}
          label={t("app.fields.organization")}
          value={getText(record, "organizationName") || organizationName || "-"}
        />
        <DocumentSummaryItem
          icon={<FileText size={24} strokeWidth={1.8} />}
          label={t("fa.fields.documentNumber")}
          value={record.documentNumber || record.docNumber || `#${record.id}`}
        />
        <DocumentSummaryItem
          icon={<CalendarDays size={24} strokeWidth={1.8} />}
          label={t("fa.fields.documentDate")}
          value={customDate(record.documentDate || record.docDate)}
        />
        <DocumentSummaryItem
          icon={<Boxes size={24} strokeWidth={1.8} />}
          label={t("fa.movement.assetCount")}
          value={t("fa.movement.countValue", { count: rows.length })}
        />
        <DocumentSummaryItem
          icon={<MapPin size={24} strokeWidth={1.8} />}
          label={t("fa.movement.destinationDepartment")}
          value={destinationDepartment}
          emphasized
        />
      </DocumentSummary>

      <Card className="border border-border px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-10 gap-y-3">
          <div className="min-w-56">
            <div className="text-xs text-secondary-text">
              {t("fa.movement.destinationResponsible")}
            </div>
            <div className="mt-0.5 text-sm font-semibold text-text">
              {destinationResponsible}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs text-secondary-text">
              {t("fa.fields.note")}
            </div>
            <div className="mt-0.5 truncate text-sm text-text">
              {record.note || record.comment || "-"}
            </div>
          </div>
          <ProcessStatusBadge
            statusId={record.statusId ?? record.stateId}
            statusName={record.statusName ?? record.stateName}
          />
        </div>
      </Card>

      <Card className="min-w-0 overflow-hidden border border-border">
        <div className="border-b border-border px-4 py-3 text-base font-semibold text-heading sm:px-5">
          {t("fa.movement.movementContents")}
        </div>
        <div className="p-4 sm:p-5">
          <FaMovementRouteCard
            embedded
            previousLocation={previousLocations || "-"}
            destinationDepartment={destinationDepartment}
            destinationUser={destinationResponsible}
          />
        </div>
        <Table<MovementReadonlyRow>
          columns={columns}
          dataSource={rows}
          pagination={false}
          size="middle"
          scroll={{ x: "max-content" }}
        />
      </Card>

      {action && <div className="flex justify-end">{action}</div>}
    </div>
  );
}
