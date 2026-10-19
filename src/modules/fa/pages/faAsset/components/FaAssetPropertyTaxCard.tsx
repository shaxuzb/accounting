import { Button, Input, InputNumber, Select, Switch, Tag } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import Card from "@/components/ui/card/Card";
import { $axiosPrivate } from "@/services/AxiosService";
import { useAppSelector } from "@/store/hooks";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { faAssetPermissions } from "../constants/permissions";

interface PropertyTax {
  exists: boolean;
  isObject: boolean;
  rate: number;
  areaSqm?: number | null;
  minValuePerSqm?: number | null;
  note?: string | null;
}

/** Tax Code, art. 415: the general rate, unfinished construction, public lines and objects conserved by a Cabinet decision. */
const rates = [1.5, 3, 0.7];

/** Tax Code, art. 412 (from 1 January 2026): the minimum value of a square metre by where the object stands. */
const minimumValues = [
  { key: "tashkent", value: 3_530_000 },
  { key: "regionalCentre", value: 2_350_000 },
  { key: "other", value: 1_390_000 },
];

/**
 * How the asset is taxed with the property tax of legal entities (Tax Code, ch. 59; 1C «Порядок
 * налогообложения имущества»): an object of the tax or not, its rate, its area and the minimum
 * value of a square metre. The base is worked out by the tax report from the ledger.
 */
export default function FaAssetPropertyTaxCard({ assetId }: { assetId: number }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const permissions = useAppSelector((state) => state.auth.user?.user.permissions ?? []);
  const canUpdate = permissions.includes(faAssetPermissions.update);
  const path = `fa-assets/${assetId}/property-tax`;
  const [values, setValues] = useState<PropertyTax | null>(null);

  const { data } = useQuery({
    queryKey: ["fa-asset-property-tax", assetId],
    queryFn: () => $axiosPrivate.get<PropertyTax>(path).then((res) => res.data),
  });
  useEffect(() => {
    if (data) setValues(data);
  }, [data]);

  const save = useMutation({
    mutationFn: () =>
      $axiosPrivate.put(path, {
        isObject: values?.isObject,
        rate: values?.rate,
        areaSqm: values?.areaSqm || null,
        minValuePerSqm: values?.minValuePerSqm || null,
        note: values?.note,
      }),
    onSuccess: () => {
      toast.success(t("fa.propertyTax.saved"));
      void queryClient.invalidateQueries({ queryKey: ["fa-asset-property-tax", assetId] });
    },
    onError: (error: unknown) => errorHandlers(error),
  });

  if (!values) return null;
  const update = (patch: Partial<PropertyTax>) => setValues((current) => (current ? { ...current, ...patch } : current));

  return (
    <Card className="border border-border p-4">
      <div className="mb-3">
        <div className="text-base font-semibold text-heading">
          {t("fa.propertyTax.title")}{" "}
          {values.isObject ? <Tag color="blue">{t("fa.propertyTax.object")}</Tag> : <Tag>{t("fa.propertyTax.notObject")}</Tag>}
          {!values.exists && <Tag color="orange">{t("fa.propertyTax.byDefault")}</Tag>}
        </div>
        <div className="max-w-3xl text-sm text-secondary-text">{t("fa.propertyTax.hint")}</div>
      </div>
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-xs text-secondary-text">
          {t("fa.propertyTax.isObject")}
          <Switch checked={values.isObject} disabled={!canUpdate} onChange={(isObject) => update({ isObject })} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-secondary-text">
          {t("fa.propertyTax.rate")}
          <Select
            className="w-28"
            disabled={!canUpdate || !values.isObject}
            value={values.rate}
            onChange={(rate) => update({ rate })}
            options={rates.map((rate) => ({ value: rate, label: `${rate} %` }))}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-secondary-text">
          {t("fa.propertyTax.areaSqm")}
          <InputNumber
            className="w-36"
            min={0}
            disabled={!canUpdate || !values.isObject}
            value={values.areaSqm ?? null}
            addonAfter="m²"
            onChange={(areaSqm) => update({ areaSqm: areaSqm == null ? null : Number(areaSqm) })}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-secondary-text">
          {t("fa.propertyTax.minValuePerSqm")}
          <Select
            className="w-72"
            allowClear
            disabled={!canUpdate || !values.isObject}
            value={values.minValuePerSqm ?? undefined}
            onChange={(minValuePerSqm) => update({ minValuePerSqm: minValuePerSqm ?? null })}
            options={minimumValues.map((item) => ({
              value: item.value,
              label: `${t(`fa.propertyTax.locations.${item.key}`)} — ${item.value.toLocaleString("ru-RU")}`,
            }))}
          />
        </label>
        <label className="flex min-w-60 flex-1 flex-col gap-1 text-xs text-secondary-text">
          {t("fa.propertyTax.note")}
          <Input disabled={!canUpdate} value={values.note ?? ""} onChange={(event) => update({ note: event.target.value })} />
        </label>
        {canUpdate && (
          <Button type="primary" icon={<Save className="size-4" />} loading={save.isPending} onClick={() => save.mutate()}>
            {t("fa.propertyTax.save")}
          </Button>
        )}
      </div>
    </Card>
  );
}
