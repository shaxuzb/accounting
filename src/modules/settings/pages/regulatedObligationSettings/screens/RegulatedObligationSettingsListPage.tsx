import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { Button, DatePicker, Table } from "antd";
import type { TableColumnsType } from "antd";
import { Pencil, Plus } from "lucide-react";
import { Link, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import Card from "@/components/ui/card/Card";
import ListToolbar from "@/components/ui/filters/ListToolbar";
import PermissionCard from "@/components/ui/card/PermissionCard";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import SelectFilter from "@/components/ui/filters/SelectFilter";
import ListPagination from "@/components/ui/table/ListPagination";
import { useAppSelector } from "@/store/hooks";
import { chartAccountOptionLabel } from "@/shared/constants/selectLists";
import { usePaginationParams } from "@/shared/hooks/usePaginationParams";
import { formatDateWithOutTime } from "@/utils/helpers";
import { numberSpacing } from "@/utils/utils";
import { stateStatus } from "@/utils/helpers/statusHelper";
import { useGetListRegulatedObligationSettings } from "../hooks";
import { regulatedObligationSettingPermissions } from "../constants/permissions";
import type { RegulatedObligationSetting } from "../types";
import type { RegulatedObligationSettingsQuery } from "../api/query";
import { getRegulatedObligationSettingId } from "../utils/settingId";
import RegulatedObligationSettingModal from "./RegulatedObligationSettingModal";

const categoryOptions = [
  { value: "TAX", label: "settings.regulatedObligations.categories.tax" },
  {
    value: "CONTRIBUTION",
    label: "settings.regulatedObligations.categories.contribution",
  },
] as const;

const configuredOptions = [
  {
    value: "true",
    label: "settings.regulatedObligations.filters.configured",
  },
  {
    value: "false",
    label: "settings.regulatedObligations.filters.notConfigured",
  },
] as const;

export default function RegulatedObligationSettingsListPage() {
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.auth);
  const [searchParams, setSearchParams] = useSearchParams();
  const { page, pageSize, withRowNumbers, paginationProps } =
    usePaginationParams();
  const [modal, setModal] = useState<{
    open: boolean;
    id: number | null;
    obligationId: number | null;
  }>({ open: false, id: null, obligationId: null });

  const filters = useMemo<RegulatedObligationSettingsQuery>(
    () => ({
      categoryCode: searchParams.get("categoryCode"),
      choosedDate: searchParams.get("choosedDate"),
      search: searchParams.get("search"),
      isConfigured:
        searchParams.get("isConfigured") === null
          ? undefined
          : searchParams.get("isConfigured") === "true",
      page,
      pageSize,
    }),
    [page, pageSize, searchParams],
  );
  const { data, refetch, isLoading, isFetching } =
    useGetListRegulatedObligationSettings(filters);

  const permissions = user?.user.permissions ?? [];
  const canCreate = permissions.includes(
    regulatedObligationSettingPermissions.create,
  );
  const canUpdate = permissions.includes(
    regulatedObligationSettingPermissions.update,
  );

  const updateDateFilter = (value: dayjs.Dayjs | null) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set("choosedDate", value.format("YYYY-MM-DD"));
    else next.delete("choosedDate");
    next.delete("page");
    setSearchParams(next, { replace: true });
  };

  const openCreate = (nextObligationId: number | null = null) => {
    setModal({
      open: true,
      id: null,
      obligationId: nextObligationId,
    });
  };

  const openEdit = (settingId: number) => {
    setModal({
      open: true,
      id: settingId,
      obligationId: null,
    });
  };

  const closeModal = () => {
    setModal({ open: false, id: null, obligationId: null });
  };

  const columns: TableColumnsType<RegulatedObligationSetting> = [
    {
      dataIndex: "indexId",
      title: t("common.rowNumber"),
      align: "center",
      width: 70,
    },
    {
      title: t("settings.fields.regulatedObligation"),
      dataIndex: "name",
      render: (value: string, record) => {
        const settingId = getRegulatedObligationSettingId(record);

        return settingId !== null ? (
          <Link
            to={String(settingId)}
            className="text-left text-primary hover:underline"
          >
            <span>{value}</span>
            <span className="block text-xs text-muted-second">
              {record.code}
            </span>
          </Link>
        ) : (
          <div>
            <div>{value}</div>
            <div className="text-xs text-muted-second">{record.code}</div>
          </div>
        );
      },
    },
    {
      title: t("settings.fields.category"),
      dataIndex: "categoryName",
      render: (value, record) => value || record.categoryCode || "-",
    },
    // {
    //   title: t("settings.fields.periodicity"),
    //   dataIndex: "periodicityName",
    //   width: 140,
    //   render: (value) => value || "-",
    // },
    // {
    //   title: t("settings.fields.classifierCode"),
    //   dataIndex: "classifierCode",
    //   width: 150,
    //   render: (value) => value || "-",
    // },
    {
      title: t("settings.fields.rate"),
      dataIndex: "rate",
      align: "right",
      render: (value) => (value === null ? "-" : `${numberSpacing(value)}%`),
    },
    {
      title: t("settings.fields.chartAccount"),
      dataIndex: "chartAccountNumber",
      render: (_, record) =>
        record.chartAccountNumber || record.chartAccountName
          ? chartAccountOptionLabel({
              number: record.chartAccountNumber ?? undefined,
              name: record.chartAccountName ?? undefined,
            })
          : "-",
    },
    {
      title: t("settings.fields.effectiveFrom"),
      dataIndex: "effectiveFrom",
      align: "center",
      render: (value) =>
        value ? dayjs(value).format(formatDateWithOutTime) : "-",
    },
    {
      title: t("settings.fields.effectiveTo"),
      dataIndex: "effectiveTo",
      align: "center",
      render: (value) =>
        value ? dayjs(value).format(formatDateWithOutTime) : "-",
    },
    {
      title: t("settings.fields.status"),
      dataIndex: "stateId",
      align: "center",
      render: (_, record) =>
        getRegulatedObligationSettingId(record) === null
          ? t("settings.regulatedObligations.notConfigured")
          : stateStatus(record.stateId, record.stateName),
    },
  ];

  if (canCreate || canUpdate) {
    columns.push({
      title: t("common.actions"),
      dataIndex: "actions",
      align: "center",
      fixed: "right",
      render: (_, record) => {
        const settingId = getRegulatedObligationSettingId(record);

        if (settingId !== null && canUpdate) {
          return (
            <Button
              type="text"
              icon={<Pencil className="size-4" />}
              onClick={() => openEdit(settingId)}
              aria-label={t("common.edit")}
            />
          );
        }

        if (settingId === null && canCreate) {
          return (
            <Button
              type="text"
              icon={<Plus className="size-4" />}
              onClick={() => openCreate(record.regulatedObligationId)}
              aria-label={t("common.add")}
            />
          );
        }

        return null;
      },
    });
  }

  return (
    <div className="w-full">
      <ListToolbar
        filters={
          <>
            <SearchFilter />
            <SelectFilter
              paramKey="categoryCode"
              placeholder="settings.regulatedObligations.filters.category"
              options={categoryOptions}
              width={160}
            />
            <DatePicker
              value={
                searchParams.get("choosedDate")
                  ? dayjs(searchParams.get("choosedDate"))
                  : null
              }
              format="DD.MM.YYYY"
              placeholder={t(
                "settings.regulatedObligations.filters.choosedDate",
              )}
              onChange={updateDateFilter}
              allowClear
              style={{ height: 32, width: 180 }}
            />
            <SelectFilter
              paramKey="isConfigured"
              placeholder="settings.regulatedObligations.filters.configuration"
              options={configuredOptions}
              width={180}
            />
          </>
        }
        actions={
          <PermissionCard
            permission={regulatedObligationSettingPermissions.create}
          >
            <Button
              type="primary"
              icon={<Plus className="size-4" />}
              onClick={() => openCreate()}
            >
              {t("common.add")}
            </Button>
          </PermissionCard>
        }
        onRefresh={() => void refetch()}
        refreshing={isFetching}
      />

      <Card className="overflow-hidden border border-border">
        <Table<RegulatedObligationSetting>
          loading={isLoading || isFetching}
          columns={columns}
          scroll={{ x: "max-content", y: "calc(100vh - 300px)" }}
          dataSource={withRowNumbers(data?.items)}
          pagination={false}
        />
        <ListPagination {...paginationProps(data?.total)} />
      </Card>

      <RegulatedObligationSettingModal
        open={modal.open}
        id={modal.id}
        obligationId={modal.obligationId}
        onClose={closeModal}
      />
    </div>
  );
}
