import { Button, DatePicker, Input, Popconfirm, Table, Tag } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PauseCircle, PlayCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import type { Dayjs } from "dayjs";
import dayjs from "@/config/dayjs";
import Card from "@/components/ui/card/Card";
import { $axiosPrivate } from "@/services/AxiosService";
import { useAppSelector } from "@/store/hooks";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { faAssetPermissions } from "../constants/permissions";

interface Conservation {
  id: number;
  startDate: string;
  endDate?: string | null;
  basis?: string | null;
}

/** fa asset status «in use». */
const ACTIVE = 2;

/**
 * Conservation of the asset (NSBU 5, 35 and 38-g; 1C «Изменение состояния ОС»): no depreciation
 * from the month after it starts to the month it ends, those months not using up the life.
 */
export default function FaAssetConservationCard({ assetId, statusId }: { assetId: number; statusId: number }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const permissions = useAppSelector((state) => state.auth.user?.user.permissions ?? []);
  const canUpdate = permissions.includes(faAssetPermissions.update);
  const [date, setDate] = useState<Dayjs>(dayjs());
  const [basis, setBasis] = useState("");
  const path = `fa-assets/${assetId}/conservations`;

  const { data = [], isLoading } = useQuery({
    queryKey: ["fa-asset-conservations", assetId],
    queryFn: () => $axiosPrivate.get<Conservation[]>(path).then((res) => res.data),
  });
  const open = data.find((x) => !x.endDate);
  const refresh = () => void queryClient.invalidateQueries({ queryKey: ["fa-asset-conservations", assetId] });
  const onError = (error: unknown) => errorHandlers(error);

  const start = useMutation({
    mutationFn: () => $axiosPrivate.post(path, { startDate: date.format("YYYY-MM-DD"), basis }),
    onSuccess: () => {
      toast.success(t("fa.conservation.started"));
      setBasis("");
      refresh();
    },
    onError,
  });
  const end = useMutation({
    mutationFn: (id: number) => $axiosPrivate.post(`${path}/${id}/end`, { endDate: date.format("YYYY-MM-DD") }),
    onSuccess: () => {
      toast.success(t("fa.conservation.ended"));
      refresh();
    },
    onError,
  });
  const remove = useMutation({
    mutationFn: (id: number) => $axiosPrivate.delete(`${path}/${id}`),
    onSuccess: refresh,
    onError,
  });

  const canChange = canUpdate && (statusId === ACTIVE || Boolean(open));

  return (
    <Card className="border border-border p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-base font-semibold text-heading">
            {t("fa.conservation.title")} {open && <Tag color="orange">{t("fa.conservation.inConservation")}</Tag>}
          </div>
          <div className="text-sm text-secondary-text">{t("fa.conservation.hint")}</div>
        </div>
        {canChange && (
          <div className="flex flex-wrap items-center gap-2">
            <DatePicker value={date} format="DD.MM.YYYY" allowClear={false} onChange={(value) => value && setDate(value)} />
            {!open && (
              <Input
                className="w-56"
                value={basis}
                placeholder={t("fa.conservation.basis")}
                onChange={(event) => setBasis(event.target.value)}
              />
            )}
            {open ? (
              <Button icon={<PlayCircle className="size-4" />} loading={end.isPending} onClick={() => end.mutate(open.id)}>
                {t("fa.conservation.end")}
              </Button>
            ) : (
              <Button type="primary" icon={<PauseCircle className="size-4" />} loading={start.isPending} onClick={() => start.mutate()}>
                {t("fa.conservation.start")}
              </Button>
            )}
          </div>
        )}
      </div>
      <Table<Conservation>
        rowKey="id"
        size="small"
        loading={isLoading}
        pagination={false}
        dataSource={data}
        locale={{ emptyText: t("fa.conservation.none") }}
        columns={[
          { title: t("fa.conservation.startDate"), dataIndex: "startDate", render: (value: string) => dayjs(value).format("DD.MM.YYYY") },
          {
            title: t("fa.conservation.endDate"),
            dataIndex: "endDate",
            render: (value?: string | null) => (value ? dayjs(value).format("DD.MM.YYYY") : "—"),
          },
          { title: t("fa.conservation.basis"), dataIndex: "basis", render: (value?: string | null) => value || "—" },
          {
            dataIndex: "id",
            width: 56,
            render: (id: number) =>
              canUpdate ? (
                <Popconfirm title={t("fa.conservation.deleteConfirm")} onConfirm={() => remove.mutate(id)}>
                  <Button type="text" danger icon={<Trash2 className="size-4" />} />
                </Popconfirm>
              ) : null,
          },
        ]}
      />
    </Card>
  );
}
