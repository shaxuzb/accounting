import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Button, Checkbox, DatePicker, Select } from "antd";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import dayjs from "@/config/dayjs";
import Card from "@/components/ui/card/Card";
import { $axiosPrivate } from "@/services/AxiosService";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { selectListEndpoints } from "@/shared/constants/selectLists";

interface EditLockException {
  userId: number;
  userName?: string | null;
  lockDate?: string | null;
}

interface EditLock {
  lockDate?: string | null;
  exceptions: EditLockException[];
}

interface UserOption {
  id: number;
  name?: string;
  fullName?: string;
  userName?: string;
}

const endpoint = "/accounting-periods/edit-lock";

/**
 * 1C «Даты запрета изменения данных»: nothing dated up to the date changes, the months open or
 * not; a user may have his own date or none (the chief accountant keeps working).
 */
export default function EditLockCard({ canEdit }: { canEdit: boolean }) {
  const { t } = useTranslation();
  const [lockDate, setLockDate] = useState<string | null>(null);
  const [exceptions, setExceptions] = useState<EditLockException[]>([]);
  const [saving, setSaving] = useState(false);

  const { data, refetch } = useQuery({
    queryKey: ["accounting-periods", "edit-lock"],
    queryFn: async () => (await $axiosPrivate.get<EditLock>(endpoint)).data,
  });
  const { data: users = [] } = useQuery({
    queryKey: ["selectlist", selectListEndpoints.usersSelectList],
    queryFn: async () => {
      const { data: list } = await $axiosPrivate.get<UserOption[] | { items: UserOption[] }>(
        selectListEndpoints.usersSelectList,
      );
      return Array.isArray(list) ? list : (list.items ?? []);
    },
    enabled: canEdit,
  });

  useEffect(() => {
    if (!data) return;
    setLockDate(data.lockDate ?? null);
    setExceptions(data.exceptions ?? []);
  }, [data]);

  const save = async () => {
    setSaving(true);
    try {
      await $axiosPrivate.put(endpoint, { lockDate, exceptions });
      toast.success(t("periods.editLock.saved"));
      await refetch();
    } catch (error) {
      errorHandlers(error);
    } finally {
      setSaving(false);
    }
  };

  const userLabel = (user: UserOption) => user.fullName ?? user.name ?? user.userName ?? String(user.id);

  return (
    <Card className="space-y-3 border border-border p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="font-semibold">{t("periods.editLock.title")}</div>
          <div className="text-xs text-secondary-text">{t("periods.editLock.hint")}</div>
        </div>
        <div className="flex items-center gap-2">
          <DatePicker
            allowClear
            disabled={!canEdit}
            format="DD.MM.YYYY"
            placeholder={t("periods.editLock.none")}
            value={lockDate ? dayjs(lockDate) : null}
            onChange={(value) => setLockDate(value ? value.format("YYYY-MM-DD") : null)}
          />
          {canEdit && (
            <Button type="primary" loading={saving} onClick={save}>
              {t("common.save")}
            </Button>
          )}
        </div>
      </div>
      {(exceptions.length > 0 || canEdit) && (
        <div className="space-y-2">
          <div className="text-sm font-medium">{t("periods.editLock.exceptions")}</div>
          {exceptions.map((item, index) => (
            <div key={item.userId} className="flex flex-wrap items-center gap-2">
              <span className="min-w-48">
                {item.userName ?? userLabel(users.find((user) => user.id === item.userId) ?? { id: item.userId })}
              </span>
              <Checkbox
                disabled={!canEdit}
                checked={!item.lockDate}
                onChange={(event) =>
                  setExceptions((current) =>
                    current.map((row, i) =>
                      i === index ? { ...row, lockDate: event.target.checked ? null : (lockDate ?? dayjs().format("YYYY-MM-DD")) } : row,
                    ),
                  )
                }
              >
                {t("periods.editLock.unlimited")}
              </Checkbox>
              {item.lockDate && (
                <DatePicker
                  disabled={!canEdit}
                  format="DD.MM.YYYY"
                  value={dayjs(item.lockDate)}
                  onChange={(value) =>
                    setExceptions((current) =>
                      current.map((row, i) => (i === index ? { ...row, lockDate: value ? value.format("YYYY-MM-DD") : null } : row)),
                    )
                  }
                />
              )}
              {canEdit && (
                <Button
                  size="small"
                  danger
                  type="text"
                  icon={<Trash2 className="size-4" />}
                  onClick={() => setExceptions((current) => current.filter((_, i) => i !== index))}
                />
              )}
            </div>
          ))}
          {canEdit && (
            <Select<number>
              className="w-72"
              showSearch
              optionFilterProp="label"
              placeholder={t("periods.editLock.addUser")}
              value={null as unknown as number}
              options={users
                .filter((user) => !exceptions.some((item) => item.userId === user.id))
                .map((user) => ({ value: user.id, label: userLabel(user) }))}
              onChange={(userId) =>
                setExceptions((current) => [...current, { userId, userName: userLabel(users.find((user) => user.id === userId)!), lockDate: null }])
              }
            />
          )}
        </div>
      )}
    </Card>
  );
}
