import { useEffect, useMemo, useState } from "react";
import {
  App,
  Button,
  Checkbox,
  DatePicker,
  Dropdown,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Select,
  Space,
  Table,
} from "antd";
import type { TableColumnsType } from "antd";
import { ChevronDown, Percent, Plus, Save, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { Dayjs } from "dayjs";
import dayjs from "@/config/dayjs";
import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import SelectCustom from "@/components/fields/SelectCustom";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { getJson } from "@/modules/accountings/services/request";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { numberSpacing } from "@/utils/utils";
import {
  fillPriceSetting,
  priceSettingPath,
  priceSettingPermissions,
  roundByType,
  useDeletePriceSetting,
  usePriceSetting,
  usePriceSettings,
  usePriceTypes,
  useSavePriceSetting,
  type PriceSettingFill,
  type PriceSettingLine,
  type PriceSettingListItem,
  type PriceTypePrice,
} from "./api";

const money = (value?: number | null) => (value == null ? "—" : numberSpacing(value, undefined, true));

/** 1C «Установки цен номенклатуры»: the journal. */
export function PriceSettingListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [priceTypeId, setPriceTypeId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const { data: types = [] } = usePriceTypes();
  const { data = [], isFetching } = usePriceSettings({
    dateFrom: range?.[0].format("YYYY-MM-DD"),
    dateTo: range?.[1].format("YYYY-MM-DD"),
    priceTypeId: priceTypeId ?? undefined,
    search: search.trim() || undefined,
  });

  const columns: TableColumnsType<PriceSettingListItem> = [
    { dataIndex: "docNumber", title: "№", width: 90, render: (value: string) => <b>{value}</b> },
    { dataIndex: "docDate", title: t("priceSetting.date"), width: 120, render: (value: string) => dayjs(value).format("DD.MM.YYYY") },
    { dataIndex: "priceTypeName", title: t("priceSetting.priceType") },
    { dataIndex: "lineCount", title: t("priceSetting.lineCount"), width: 130, align: "right" },
    { dataIndex: "comment", title: t("priceSetting.comment"), render: (value?: string | null) => value || "—" },
  ];

  return (
    <div className="space-y-3">
      <Card className="flex flex-wrap items-center justify-between gap-3 border border-border p-3">
        <Space wrap>
          <Input.Search allowClear placeholder={t("priceSetting.search")} onSearch={setSearch} className="w-56" />
          <DatePicker.RangePicker format="DD.MM.YYYY" value={range} onChange={(value) => setRange(value as [Dayjs, Dayjs] | null)} />
          <Select
            allowClear
            className="w-52"
            placeholder={t("priceSetting.priceType")}
            value={priceTypeId}
            onChange={(value?: number) => setPriceTypeId(value ?? null)}
            options={types.map((type) => ({ value: type.id, label: type.name }))}
          />
        </Space>
        <PermissionCard permission={priceSettingPermissions.create}>
          <Button type="primary" icon={<Plus className="size-4" />} onClick={() => navigate(`${priceSettingPath}/new`)}>
            {t("priceSetting.new")}
          </Button>
        </PermissionCard>
      </Card>
      <div className="text-sm text-secondary-text">{t("priceSetting.hint")}</div>
      <Card className="overflow-hidden border border-border">
        <Table<PriceSettingListItem>
          rowKey="id"
          size="middle"
          loading={isFetching}
          columns={columns}
          dataSource={data}
          locale={{ emptyText: t("priceSetting.empty") }}
          onRow={(row) => ({ className: "cursor-pointer", onClick: () => navigate(`${priceSettingPath}/${row.id}`) })}
        />
      </Card>
    </div>
  );
}

type Line = PriceSettingLine & { key: string };
type ChangeBase = "current" | "old" | "purchase" | "type";

let keySeed = 0;
const nextKey = () => `l${++keySeed}`;

interface PurchaseOption {
  id: number;
  docNumber: string;
  docDate: string;
  counterpartyName?: string | null;
}

/**
 * 1C «Установка цен номенклатуры»: the date the prices hold from, the price type and the products with
 * their new prices. «To'ldirish» brings products (all, a group, a purchase, those already priced) and
 * «O'zgartirish» sets prices from a base (the current, old or purchase price, another type) with a
 * markup and the type's rounding — as 1C's «Заполнить» and «Изменить».
 */
export function PriceSettingEditorPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { modal } = App.useApp();
  const docId = Number(useParams().id) || null;
  const { data } = usePriceSetting(docId);
  const { data: types = [] } = usePriceTypes();
  const save = useSavePriceSetting();
  const remove = useDeletePriceSetting();

  const [docDate, setDocDate] = useState<Dayjs>(dayjs());
  const [priceTypeId, setPriceTypeId] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [filling, setFilling] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const [groupId, setGroupId] = useState<number | null>(null);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [purchaseId, setPurchaseId] = useState<number | null>(null);
  const [purchaseSearch, setPurchaseSearch] = useState("");
  const [changeOpen, setChangeOpen] = useState(false);
  const [change, setChange] = useState<{ base: ChangeBase; percent: number; round: boolean; typeId: number | null }>({
    base: "current",
    percent: 0,
    round: true,
    typeId: null,
  });

  useEffect(() => {
    if (!data) return;
    setDocDate(dayjs(data.docDate));
    setPriceTypeId(data.priceTypeId);
    setComment(data.comment ?? "");
    setLines(data.lines.map((line) => ({ ...line, key: nextKey() })));
  }, [data]);

  // a new document starts on the default type
  useEffect(() => {
    if (docId || priceTypeId || types.length === 0) return;
    setPriceTypeId((types.find((type) => type.isDefault) ?? types[0]).id);
  }, [docId, priceTypeId, types]);

  const priceType = types.find((type) => type.id === priceTypeId) ?? null;

  const { data: purchases = [] } = useQuery({
    queryKey: ["price-setting-purchases", purchaseSearch],
    queryFn: async () => {
      const response = await getJson<{ items?: PurchaseOption[] }>("/purchase-docs", {
        statusId: 2,
        page: 1,
        pageSize: 30,
        search: purchaseSearch || undefined,
      });
      return response.items ?? [];
    },
    enabled: purchaseOpen,
  });

  const fill = async (request: Omit<PriceSettingFill, "priceTypeId" | "date" | "documentId">) => {
    if (!priceTypeId) {
      toast.error(t("priceSetting.chooseType"));
      return;
    }
    setFilling(true);
    try {
      const filled = await fillPriceSetting({
        ...request,
        priceTypeId,
        date: docDate.format("YYYY-MM-DD"),
        documentId: docId,
      });
      // the filled products join the lines; one already listed keeps its line
      setLines((current) => {
        const listed = new Set(current.map((line) => line.productId));
        return [
          ...current.filter((line) => line.productId),
          ...filled.filter((line) => !listed.has(line.productId)).map((line) => ({ ...line, key: nextKey() })),
        ];
      });
      if (filled.length === 0) toast(t("priceSetting.nothingFound"));
    } catch (error) {
      errorHandlers(error);
    } finally {
      setFilling(false);
    }
  };

  const pickProduct = async (key: string, productId: number | null) => {
    if (!productId) return;
    if (lines.some((line) => line.key !== key && line.productId === productId)) {
      toast.error(t("priceSetting.duplicate"));
      return;
    }
    setLines((current) => current.map((line) => (line.key === key ? { ...line, productId } : line)));
    if (!priceTypeId) return;
    try {
      const [detail] = await fillPriceSetting({
        priceTypeId,
        date: docDate.format("YYYY-MM-DD"),
        documentId: docId,
        productIds: [productId],
      });
      if (detail)
        setLines((current) =>
          current.map((line) =>
            line.key === key
              ? { ...line, ...detail, key, price: line.price ?? detail.oldPrice ?? null }
              : line,
          ),
        );
    } catch (error) {
      errorHandlers(error);
    }
  };

  const applyChange = async () => {
    const targetKeys = new Set(selectedKeys.length ? selectedKeys.map(String) : lines.map((line) => line.key));
    let typePrices: Map<number, number> | null = null;
    if (change.base === "type") {
      if (!change.typeId) {
        toast.error(t("priceSetting.chooseBaseType"));
        return;
      }
      try {
        const prices = await getJson<PriceTypePrice[]>(`/price-types/${change.typeId}/prices`, {
          date: docDate.format("YYYY-MM-DD"),
          currencyId: priceType?.currencyId,
        });
        typePrices = new Map(prices.map((item) => [item.productId, item.price]));
      } catch (error) {
        errorHandlers(error);
        return;
      }
    }
    const factor = 1 + (Number(change.percent) || 0) / 100;
    setLines((current) =>
      current.map((line) => {
        if (!targetKeys.has(line.key) || !line.productId) return line;
        const base =
          change.base === "current"
            ? line.price
            : change.base === "old"
              ? line.oldPrice
              : change.base === "purchase"
                ? line.purchasePrice
                : typePrices?.get(line.productId);
        // a product without the base keeps its price (1C leaves such a line as it is)
        if (base == null) return line;
        const raw = Number(base) * factor;
        return { ...line, price: change.round ? roundByType(raw, priceType) : Math.round(raw * 100) / 100 };
      }),
    );
    setChangeOpen(false);
  };

  const submit = async () => {
    if (!priceTypeId) {
      toast.error(t("priceSetting.chooseType"));
      return;
    }
    try {
      const savedId = await save.mutateAsync({
        id: docId,
        body: {
          docDate: docDate.format("YYYY-MM-DD"),
          priceTypeId,
          comment: comment.trim() || null,
          lines: lines
            .filter((line) => line.productId)
            .map((line) => ({ productId: Number(line.productId), price: Number(line.price) || 0 })),
        },
      });
      toast.success(t("priceSetting.saved"));
      if (!docId) navigate(`${priceSettingPath}/${savedId}`, { replace: true });
    } catch (error) {
      errorHandlers(error);
    }
  };

  const changePercent = (line: Line) => {
    if (line.oldPrice == null || !line.oldPrice || line.price == null) return null;
    return ((Number(line.price) - line.oldPrice) / line.oldPrice) * 100;
  };

  const columns: TableColumnsType<Line> = useMemo(
    () => [
      { key: "index", title: "№", width: 50, render: (_, __, index) => index + 1 },
      {
        key: "product",
        title: t("priceSetting.product"),
        render: (_, line) =>
          line.id || line.productName ? (
            line.productName
          ) : (
            <SelectCustom
              fieldName={`price-product-${line.key}`}
              path={selectListEndpoints.productsSelectList}
              value={line.productId}
              search
              marginBottom="mb-0"
              onChange={(value) => void pickProduct(line.key, Number(value) || null)}
            />
          ),
      },
      { dataIndex: "unitName", title: t("priceSetting.unit"), width: 90 },
      {
        dataIndex: "purchasePrice",
        title: t("priceSetting.purchasePrice"),
        width: 140,
        align: "right",
        render: money,
      },
      { dataIndex: "oldPrice", title: t("priceSetting.oldPrice"), width: 140, align: "right", render: money },
      {
        key: "price",
        title: t("priceSetting.price", { currency: priceType?.currencyCode ?? "" }),
        width: 170,
        render: (_, line) => (
          <InputNumber
            min={0}
            className="w-full!"
            value={line.price}
            onChange={(value) =>
              setLines((current) =>
                current.map((row) => (row.key === line.key ? { ...row, price: value == null ? null : Number(value) } : row)),
              )
            }
          />
        ),
      },
      {
        key: "change",
        title: t("priceSetting.changePercent"),
        width: 110,
        align: "right",
        render: (_, line) => {
          const value = changePercent(line);
          if (value == null) return "—";
          const color = value > 0 ? "text-green-600" : value < 0 ? "text-red-600" : "";
          return <span className={color}>{`${value > 0 ? "+" : ""}${value.toFixed(1)}%`}</span>;
        },
      },
      {
        key: "remove",
        width: 50,
        render: (_, line) => (
          <Button
            size="small"
            danger
            type="text"
            icon={<Trash2 className="size-4" />}
            onClick={() => setLines((current) => current.filter((row) => row.key !== line.key))}
          />
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, priceType, priceTypeId, docDate, docId, lines],
  );

  return (
    <div className="space-y-3">
      <Card className="border border-border p-4">
        <Form layout="vertical" component={false}>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <div className="mb-1 text-sm">{t("priceSetting.date")}</div>
              <DatePicker format="DD.MM.YYYY" value={docDate} allowClear={false} onChange={(value) => value && setDocDate(value)} />
            </div>
            <div className="w-64">
              <div className="mb-1 text-sm">{t("priceSetting.priceType")}</div>
              <Select
                className="w-full"
                value={priceTypeId}
                placeholder={t("priceSetting.priceType")}
                onChange={(value: number) => setPriceTypeId(value)}
                options={types.map((type) => ({
                  value: type.id,
                  label: `${type.name} (${type.currencyCode ?? ""}${type.priceIncludesVat ? `, ${t("priceSetting.withVat")}` : ""})`,
                }))}
              />
            </div>
            <div className="min-w-64 flex-1">
              <div className="mb-1 text-sm">{t("priceSetting.comment")}</div>
              <Input value={comment} onChange={(event) => setComment(event.target.value)} />
            </div>
            <Space>
              {data && (
                <PermissionCard permission={priceSettingPermissions.delete}>
                  <Button
                    danger
                    icon={<Trash2 className="size-4" />}
                    onClick={() =>
                      modal.confirm({
                        title: t("priceSetting.deleteConfirm"),
                        okButtonProps: { danger: true },
                        onOk: async () => {
                          try {
                            await remove.mutateAsync(data.id);
                            navigate(priceSettingPath, { replace: true });
                          } catch (error) {
                            errorHandlers(error);
                          }
                        },
                      })
                    }
                  >
                    {t("priceSetting.delete")}
                  </Button>
                </PermissionCard>
              )}
              <PermissionCard permission={priceSettingPermissions.create}>
                <Button type="primary" icon={<Save className="size-4" />} loading={save.isPending} onClick={() => void submit()}>
                  {t("priceSetting.save")}
                </Button>
              </PermissionCard>
            </Space>
          </div>
          {data && (
            <div className="mt-2 text-sm text-secondary-text">
              {t("priceSetting.number", { number: data.docNumber })}
            </div>
          )}
        </Form>
      </Card>

      <Card className="border border-border p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Dropdown
            trigger={["click"]}
            menu={{
              items: [
                { key: "all", label: t("priceSetting.fillAll") },
                { key: "group", label: t("priceSetting.fillGroup") },
                { key: "priced", label: t("priceSetting.fillPriced") },
                { key: "purchase", label: t("priceSetting.fillPurchase") },
              ],
              onClick: ({ key }) => {
                if (key === "all") void fill({});
                if (key === "priced") void fill({ onlyWithPrice: true });
                if (key === "group") setGroupOpen(true);
                if (key === "purchase") setPurchaseOpen(true);
              },
            }}
          >
            <Button loading={filling}>
              <Space>
                {t("priceSetting.fill")}
                <ChevronDown className="size-4" />
              </Space>
            </Button>
          </Dropdown>
          <Button icon={<Percent className="size-4" />} disabled={lines.length === 0} onClick={() => setChangeOpen(true)}>
            {selectedKeys.length ? t("priceSetting.changeSelected", { count: selectedKeys.length }) : t("priceSetting.change")}
          </Button>
          <Button
            icon={<Plus className="size-4" />}
            onClick={() => setLines((current) => [...current, { key: nextKey(), productId: null, price: null }])}
          >
            {t("priceSetting.addLine")}
          </Button>
          {lines.length > 0 && (
            <Button type="text" danger onClick={() => setLines([])}>
              {t("priceSetting.clear")}
            </Button>
          )}
          <span className="ml-auto text-sm text-secondary-text">{t("priceSetting.lines", { count: lines.length })}</span>
        </div>
        <Table<Line>
          rowKey="key"
          size="small"
          pagination={lines.length > 100 ? { pageSize: 100 } : false}
          dataSource={lines}
          columns={columns}
          rowSelection={{ selectedRowKeys: selectedKeys, onChange: setSelectedKeys }}
          locale={{ emptyText: t("priceSetting.noLines") }}
        />
      </Card>

      <Modal
        open={groupOpen}
        title={t("priceSetting.fillGroup")}
        okText={t("priceSetting.fill")}
        okButtonProps={{ disabled: !groupId }}
        onCancel={() => setGroupOpen(false)}
        onOk={() => {
          setGroupOpen(false);
          void fill({ productGroupId: groupId });
        }}
        destroyOnHidden
      >
        <SelectCustom
          label="priceSetting.group"
          fieldName="priceSettingGroup"
          path={selectListEndpoints.productGroupsSelectList}
          value={groupId}
          search
          onChange={(value) => setGroupId(Number(value) || null)}
        />
      </Modal>

      <Modal
        open={purchaseOpen}
        title={t("priceSetting.fillPurchase")}
        okText={t("priceSetting.fill")}
        okButtonProps={{ disabled: !purchaseId }}
        onCancel={() => setPurchaseOpen(false)}
        onOk={() => {
          setPurchaseOpen(false);
          void fill({ purchaseDocId: purchaseId });
        }}
        destroyOnHidden
      >
        <Select
          showSearch
          className="w-full"
          filterOption={false}
          onSearch={setPurchaseSearch}
          value={purchaseId}
          placeholder={t("priceSetting.purchase")}
          onChange={(value: number) => setPurchaseId(value)}
          options={purchases.map((item) => ({
            value: item.id,
            label: `№${item.docNumber} — ${dayjs(item.docDate).format("DD.MM.YYYY")} — ${item.counterpartyName ?? ""}`,
          }))}
        />
      </Modal>

      <Modal
        open={changeOpen}
        title={t("priceSetting.change")}
        okText={t("priceSetting.apply")}
        onCancel={() => setChangeOpen(false)}
        onOk={() => void applyChange()}
        destroyOnHidden
      >
        <Form layout="vertical" component={false}>
          <Form.Item label={t("priceSetting.base")}>
            <Radio.Group
              className="flex flex-col gap-1"
              value={change.base}
              onChange={(event) => setChange((current) => ({ ...current, base: event.target.value }))}
              options={[
                { value: "current", label: t("priceSetting.baseCurrent") },
                { value: "old", label: t("priceSetting.baseOld") },
                { value: "purchase", label: t("priceSetting.basePurchase") },
                { value: "type", label: t("priceSetting.baseType") },
              ]}
            />
          </Form.Item>
          {change.base === "type" && (
            <Form.Item label={t("priceSetting.baseTypeName")}>
              <Select
                className="w-full"
                value={change.typeId}
                onChange={(value: number) => setChange((current) => ({ ...current, typeId: value }))}
                options={types
                  .filter((type) => type.id !== priceTypeId)
                  .map((type) => ({ value: type.id, label: type.name }))}
              />
            </Form.Item>
          )}
          <Form.Item label={t("priceSetting.percent")} extra={t("priceSetting.percentHint")}>
            <InputNumber
              className="w-full!"
              value={change.percent}
              addonAfter="%"
              onChange={(value) => setChange((current) => ({ ...current, percent: Number(value) || 0 }))}
            />
          </Form.Item>
          <Checkbox
            checked={change.round}
            disabled={!priceType?.roundingPrecision}
            onChange={(event) => setChange((current) => ({ ...current, round: event.target.checked }))}
          >
            {priceType?.roundingPrecision
              ? t(priceType.roundingUp ? "priceType.roundingUpTo" : "priceType.roundingTo", { step: priceType.roundingPrecision })
              : t("priceSetting.noTypeRounding")}
          </Checkbox>
          <div className="mt-3 text-sm text-secondary-text">
            {selectedKeys.length
              ? t("priceSetting.applyToSelected", { count: selectedKeys.length })
              : t("priceSetting.applyToAll")}
          </div>
        </Form>
      </Modal>
    </div>
  );
}
