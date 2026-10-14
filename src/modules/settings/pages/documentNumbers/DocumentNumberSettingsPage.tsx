import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Input, InputNumber, Table } from "antd";
import toast from "react-hot-toast";
import { $axiosPrivate } from "@/services/AxiosService";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { selectListEndpoints } from "@/shared/constants/selectLists";

interface NumberSetting {
  documentTypeId: number | null;
  prefix?: string | null;
  numberLength?: number | null;
}

interface DocumentType {
  id: number;
  name: string;
}

const endpoint = "/document-number-settings";

const preview = (prefix?: string | null, length?: number | null) =>
  `${prefix ?? ""}${"17".padStart(length ?? 0, "0")}`;

/**
 * Document number prefixes as 1C sets them («Префикс»): the organization's default for every
 * type, and a type's own where it differs; the length pads the number with zeros.
 */
export default function DocumentNumberSettingsPage() {
  const { t } = useTranslation();
  const [rows, setRows] = useState<Record<string, NumberSetting>>({});
  const [saving, setSaving] = useState(false);

  const { data: types = [], isLoading: typesLoading } = useQuery({
    queryKey: ["selectlist", selectListEndpoints.documentTypesSelectList],
    queryFn: async () => {
      const { data } = await $axiosPrivate.get<DocumentType[] | { items: DocumentType[] }>(
        selectListEndpoints.documentTypesSelectList,
      );
      return Array.isArray(data) ? data : (data.items ?? []);
    },
  });
  const { data: saved, isLoading, refetch } = useQuery({
    queryKey: ["document-number-settings"],
    queryFn: async () => (await $axiosPrivate.get<NumberSetting[]>(endpoint)).data,
  });

  useEffect(() => {
    if (!saved) return;
    setRows(Object.fromEntries(saved.map((row) => [String(row.documentTypeId ?? 0), row])));
  }, [saved]);

  const key = (typeId: number | null) => String(typeId ?? 0);
  const update = (typeId: number | null, changes: Partial<NumberSetting>) =>
    setRows((current) => ({
      ...current,
      [key(typeId)]: { ...current[key(typeId)], documentTypeId: typeId, ...changes },
    }));

  const defaults = rows[key(null)];
  const dataSource = useMemo(
    () => [{ id: 0, name: t("settings.numbers.allDocuments") }, ...types],
    [t, types],
  );

  const save = async () => {
    setSaving(true);
    try {
      await $axiosPrivate.put(
        endpoint,
        Object.values(rows).map((row) => ({
          documentTypeId: row.documentTypeId || null,
          prefix: row.prefix?.trim() || null,
          numberLength: row.numberLength || null,
        })),
      );
      toast.success(t("settings.messages.updated"));
      await refetch();
    } catch (error) {
      errorHandlers(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border border-border">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div className="text-sm text-secondary-text">{t("settings.numbers.hint")}</div>
        <Button type="primary" loading={saving} onClick={save}>
          {t("common.save")}
        </Button>
      </div>
      <Table
        rowKey="id"
        size="small"
        loading={isLoading || typesLoading}
        dataSource={dataSource}
        pagination={false}
        rowClassName={(row) => (row.id === 0 ? "font-semibold" : "")}
        columns={[
          { title: t("settings.numbers.documentType"), dataIndex: "name" },
          {
            title: t("settings.numbers.prefix"),
            width: 200,
            render: (_, row) => (
              <Input
                maxLength={20}
                value={rows[key(row.id || null)]?.prefix ?? ""}
                placeholder={row.id ? (defaults?.prefix ?? "") : "DT-"}
                onChange={(event) => update(row.id || null, { prefix: event.target.value })}
              />
            ),
          },
          {
            title: t("settings.numbers.length"),
            width: 140,
            render: (_, row) => (
              <InputNumber
                min={1}
                max={20}
                value={rows[key(row.id || null)]?.numberLength ?? null}
                placeholder={row.id ? String(defaults?.numberLength ?? "") : ""}
                onChange={(value) => update(row.id || null, { numberLength: value ?? null })}
              />
            ),
          },
          {
            title: t("settings.numbers.example"),
            width: 160,
            render: (_, row) => {
              const own = rows[key(row.id || null)];
              const effective = row.id && !own?.prefix && !own?.numberLength ? defaults : own;
              return <span className="tabular-nums">{preview(effective?.prefix, effective?.numberLength)}</span>;
            },
          },
        ]}
      />
    </Card>
  );
}
