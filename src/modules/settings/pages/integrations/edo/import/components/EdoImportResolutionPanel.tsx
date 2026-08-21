import {
  Alert,
  Button,
  Checkbox,
  Collapse,
  Empty,
  Modal,
  Select,
  Skeleton,
  Table,
  Tag,
} from "antd";
import type { CollapseProps, TableColumnsType } from "antd";
import {
  Boxes,
  GitMerge,
  PackageCheck,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import Card from "@/components/ui/card/Card";
import SelectCustom from "@/components/fields/SelectCustom";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import {
  useApplyEdoImportMarkingConflicts,
  useApplyEdoImportMasterData,
  useApplyEdoImportPieceTracking,
  useApplyEdoImportProductConflicts,
  useApplyEdoImportProductDefaults,
  useEdoImportMappingSummary,
  useEdoImportMarkingConflicts,
  useEdoImportMasterDataPlan,
  useEdoImportPieceTrackingPlan,
  useEdoImportProductConflicts,
  useResolveEdoImportMappings,
} from "../hooks";
import type {
  EdoImportMappingIssueCountsDto,
  EdoImportMarkingConflictItemDto,
  EdoImportMasterDataAction,
  EdoImportPieceTrackingProductDto,
  EdoImportProductConflictItemDto,
} from "../types";
import {
  formatImportNumber,
  getImportErrorMessage,
  importStatusTag,
} from "./presentation";

interface EdoImportResolutionPanelProps {
  jobId: number;
}

const normalizeAction = (
  action: string,
  existingId?: number | null,
): EdoImportMasterDataAction =>
  action === "CREATE" || action === "USE_EXISTING"
    ? action
    : existingId
      ? "USE_EXISTING"
      : "CREATE";

const actionLabel = (action: string) => {
  switch (action) {
    case "USE_EXISTING":
      return "Mavjudidan foydalaniladi";
    case "CREATE":
      return "Yangi yaratiladi";
    case "NO_CHANGE":
      return "O‘zgarish kerak emas";
    default:
      return action.replaceAll("_", " ");
  }
};

const issueLabel: Record<string, string> = {
  counterparty: "Kontragent",
  contract: "Shartnoma",
  product: "Mahsulot",
  currency: "Valuta",
  warehouse: "Ombor",
  unit: "Birlik",
  vatRate: "QQS stavkasi",
  marking: "Marking",
};

const errorLabel = (code?: string | null) => {
  switch (code) {
    case "MARKING_COUNT_MISMATCH":
      return "Marking soni yetishmaydi";
    default:
      return code?.replaceAll("_", " ") || "Noma’lum muammo";
  }
};

export default function EdoImportResolutionPanel({
  jobId,
}: EdoImportResolutionPanelProps) {
  const [openKeys, setOpenKeys] = useState<string[]>(["master-data"]);
  const summary = useEdoImportMappingSummary(jobId);
  const resolve = useResolveEdoImportMappings(jobId);

  const resolveMappings = async () => {
    try {
      await resolve.mutateAsync();
      toast.success("Moslashtirishlar qayta tekshirildi.");
    } catch (error) {
      toast.error(getImportErrorMessage(error));
    }
  };

  const items: CollapseProps["items"] = [
    {
      key: "master-data",
      label: "Asosiy ma’lumotlar rejasi",
      extra: summary.data
        ? importStatusTag(
            summary.data.mappingRequiredCount > 0
              ? "MAPPING_REQUIRED"
              : "READY",
          )
        : undefined,
      children: openKeys.includes("master-data") ? (
        <MasterDataSection jobId={jobId} />
      ) : null,
    },
    {
      key: "product-conflicts",
      label: "Mahsulot mos kelmasligi",
      children: openKeys.includes("product-conflicts") ? (
        <ProductConflictSection jobId={jobId} />
      ) : null,
    },
    {
      key: "piece-tracking",
      label: "Dona hisobini tekshirish",
      children: openKeys.includes("piece-tracking") ? (
        <PieceTrackingSection jobId={jobId} />
      ) : null,
    },
    {
      key: "marking-conflicts",
      label: "Marking muammolari",
      children: openKeys.includes("marking-conflicts") ? (
        <MarkingConflictSection jobId={jobId} />
      ) : null,
    },
  ];

  return (
    <div className="space-y-4">
      <Card className="border border-border p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-heading">
              Moslashtirish nazorati
            </h2>
            <p className="mt-1 text-sm text-secondary-text">
              Draft importdan oldin hujjatlar va mahsulot ma’lumotlari tekshiriladi.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              icon={<RefreshCw className="size-4" />}
              loading={summary.isFetching}
              onClick={() => void summary.refetch()}
            >
              Yangilash
            </Button>
            <Button
              type="primary"
              icon={<GitMerge className="size-4" />}
              loading={resolve.isPending}
              onClick={() => void resolveMappings()}
            >
              Natijani qayta tekshirish
            </Button>
          </div>
        </div>

        {summary.isLoading ? (
          <Skeleton active paragraph={{ rows: 2 }} className="mt-4" />
        ) : summary.isError ? (
          <Alert
            className="mt-4"
            type="error"
            showIcon
            message={getImportErrorMessage(summary.error)}
          />
        ) : summary.data ? (
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
            {[
              ["Jami hujjatlar", summary.data.totalCandidates],
              ["Takroriy hujjatlar", summary.data.duplicateCount],
              ["Tayyor", summary.data.readyCount],
              ["Amal kerak", summary.data.mappingRequiredCount],
              ...Object.entries(summary.data.issueCounts)
                .filter(([, value]) => value > 0)
                .map(([key, value]) => [issueLabel[key] ?? key, value]),
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-xl bg-surface-muted/50 p-3">
                <div className="text-lg font-semibold tabular-nums text-heading">
                  {value}
                </div>
                <div className="mt-1 truncate text-xs text-secondary-text">
                  {label}
                </div>
              </div>
            ))}
          </div>
        ) : null}
        {summary.data?.mappingRequiredCount ? (
          <Alert
            className="mt-4"
            type="warning"
            showIcon
            message={`${summary.data.mappingRequiredCount} ta hujjat bo‘yicha amal kerak`}
            description={getMappingIssueDescription(summary.data.issueCounts)}
          />
        ) : null}
      </Card>

      <Collapse
        activeKey={openKeys}
        onChange={(keys) => setOpenKeys(keys as string[])}
        items={items}
        className="border-border bg-primary-bg"
      />
    </div>
  );
}

function getMappingIssueDescription(
  issueCounts: EdoImportMappingIssueCountsDto,
) {
  const issues = Object.entries(issueCounts)
    .filter(([, count]) => count > 0)
    .map(([key, count]) => `${issueLabel[key] ?? key}: ${count} ta`);

  return issues.length > 0
    ? `${issues.join(", ")}. Avval ko‘rsatilgan muammolarni hal qiling, keyin qayta tekshiring.`
    : "Hujjatlarni moslashtiring va natijani qayta tekshiring.";
}

function MasterDataSection({ jobId }: { jobId: number }) {
  const plan = useEdoImportMasterDataPlan(jobId);
  const applyPlan = useApplyEdoImportMasterData(jobId);
  const applyDefaults = useApplyEdoImportProductDefaults(jobId);
  const [unitMappings, setUnitMappings] = useState<
    Record<string, number | null>
  >({});

  const packageNames = useMemo(
    () =>
      Array.from(
        new Set(
          (plan.data?.products ?? [])
            .map((product) => product.packageName?.trim())
            .filter((name): name is string => Boolean(name)),
        ),
      ),
    [plan.data?.products],
  );
  const resolvedUnitMappings = useMemo(() => {
    const mappings: Record<string, number | null> = {};
    (plan.data?.products ?? []).forEach((product) => {
      const packageName = product.packageName?.trim();
      if (packageName && mappings[packageName] == null) {
        mappings[packageName] = product.resolvedUnitId ?? null;
      }
    });
    return mappings;
  }, [plan.data?.products]);
  const getSelectedUnitId = (packageName: string) =>
    Object.prototype.hasOwnProperty.call(unitMappings, packageName)
      ? unitMappings[packageName]
      : resolvedUnitMappings[packageName] ?? null;

  const submitPlan = () => {
    if (!plan.data) return;
    const invalidCounterparty = plan.data.counterparties.some(
      (item) => !item.sellerTin,
    );
    const invalidContract = plan.data.contracts.some(
      (item) =>
        !item.sellerTin ||
        !item.providerContractNumber ||
        !item.providerContractDate ||
        item.candidateIds.some((id) => id <= 0),
    );
    const invalidProduct = plan.data.products.some((item) => !item.catalogCode);
    if (invalidCounterparty || invalidContract || invalidProduct) {
      toast.error(
        "Rejada majburiy STIR, shartnoma yoki katalog kodi yetishmaydi.",
      );
      return;
    }

    Modal.confirm({
      title: "Master data rejasini qo‘llash",
      content: `${plan.data.createCount} ta yaratish va ${plan.data.useExistingCount} ta mavjud yozuvdan foydalanish rejalashtirilgan.`,
      okText: "Tasdiqlash va qo‘llash",
      cancelText: "Bekor qilish",
      onOk: async () => {
        try {
          await applyPlan.mutateAsync({
            confirm: true,
            expectedPlanHash: plan.data!.planHash,
            counterparties: plan.data!.counterparties.map((item) => ({
              sellerTin: item.sellerTin!,
              action: normalizeAction(item.action, item.existingCounterpartyId),
              existingCounterpartyId: item.existingCounterpartyId ?? null,
            })),
            contracts: plan.data!.contracts.map((item) => ({
              sellerTin: item.sellerTin!,
              providerContractNumber: item.providerContractNumber!,
              providerContractDate: item.providerContractDate!,
              candidateIds: item.candidateIds,
              action: normalizeAction(item.action, item.existingContractId),
              existingContractId: item.existingContractId ?? null,
            })),
            products: plan.data!.products.map((item) => ({
              catalogCode: item.catalogCode!,
              action: normalizeAction(item.action, item.existingProductId),
              existingProductId: item.existingProductId ?? null,
              isService: item.isService ?? null,
              isPieceTracked: item.markingRequired,
              unitId: item.resolvedUnitId ?? null,
              vatRateId: item.resolvedVatRateId ?? null,
            })),
          });
          toast.success("Master data rejasi qo‘llandi.");
        } catch (error) {
          toast.error(getImportErrorMessage(error));
        }
      },
    });
  };

  const submitDefaults = () => {
    if (!plan.data) return;
    const mappings = packageNames.map((packageName) => ({
      packageName,
      unitId: getSelectedUnitId(packageName) ?? 0,
    }));
    if (!mappings.length || mappings.some((item) => item.unitId <= 0)) {
      toast.error("Har bir package uchun musbat unit ID kiriting.");
      return;
    }
    Modal.confirm({
      title: "Qadoq birliklarini tasdiqlash",
      content:
        "Tanlangan birliklar ushbu importdagi mos keladigan EDO qadoqlariga qo‘llanadi.",
      okText: "Tasdiqlash",
      cancelText: "Bekor qilish",
      onOk: async () => {
        try {
          await applyDefaults.mutateAsync({
            confirm: true,
            expectedPlanHash: plan.data!.planHash,
            packageUnitMappings: mappings,
            markingPolicy: "PIECE_TRACKED_WHEN_REQUIRED",
          });
          toast.success("Mahsulot defaultlari qo‘llandi.");
        } catch (error) {
          toast.error(getImportErrorMessage(error));
        }
      },
    });
  };

  if (plan.isLoading) return <Skeleton active paragraph={{ rows: 5 }} />;
  if (plan.isError)
    return (
      <Alert
        type="error"
        showIcon
        message={getImportErrorMessage(plan.error)}
      />
    );
  if (!plan.data) return <Empty description="Master data rejasi yo‘q" />;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["Yaratiladi", plan.data.createCount],
          ["Mavjudidan", plan.data.useExistingCount],
          ["Konflikt", plan.data.conflictCount],
          ["Bloklangan", plan.data.blockedCount],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            className="rounded-xl border border-border p-3"
          >
            <div className="text-xl font-semibold text-heading">
              {formatImportNumber(Number(value))}
            </div>
            <div className="mt-1 text-xs text-secondary-text">{label}</div>
          </div>
        ))}
      </div>

      {plan.data.blockedReasonCodes.length > 0 && (
        <Alert
          type="warning"
          showIcon
          message="Bloklovchi sabablar"
          description={plan.data.blockedReasonCodes.join(" · ")}
        />
      )}

      <div className="grid gap-3 lg:grid-cols-3">
        <PlanList
          title="Kontragentlar"
          icon={<Boxes className="size-4" />}
          items={plan.data.counterparties.map((item) => ({
            title:
              item.canonicalSellerName ||
              item.sellerTin ||
              "Noma’lum kontragent",
            meta: `${item.candidateCount} ta hujjat`,
            action: normalizeAction(item.action, item.existingCounterpartyId),
          }))}
        />
        <PlanList
          title="Shartnomalar"
          icon={<GitMerge className="size-4" />}
          items={plan.data.contracts.map((item) => ({
            title: item.providerContractNumber || "Raqamsiz shartnoma",
            meta: `${item.providerCode} · ${item.candidateCount} ta`,
            action: normalizeAction(item.action, item.existingContractId),
          }))}
        />
        <PlanList
          title="Mahsulotlar"
          icon={<PackageCheck className="size-4" />}
          items={plan.data.products.map((item) => ({
            title:
              item.providerProductName || item.catalogCode || "Nomsiz mahsulot",
            meta: `${item.candidateCount} ta · ${item.packageName || "package yo‘q"}`,
            action: normalizeAction(item.action, item.existingProductId),
          }))}
        />
      </div>

      {packageNames.length > 0 && (
        <div className="rounded-xl border border-border bg-surface-muted/20 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="font-semibold text-heading">
                Qadoq birliklarini moslashtirish
              </div>
              <p className="mt-1 max-w-2xl text-sm text-secondary-text">
                EDO hujjatidagi qadoq nomini tizimdagi birlik bilan bog‘lang.
                Bu miqdor emas, mahsulot birligi hisoblanadi.
              </p>
            </div>
            <Tag color="blue" className="m-0">
              {packageNames.length} ta qadoq
            </Tag>
          </div>
          <div className="mt-4 overflow-hidden rounded-lg border border-border bg-primary-bg">
            <div className="hidden grid-cols-[minmax(0,1fr)_minmax(220px,0.8fr)_160px] gap-4 border-b border-border bg-surface-muted/30 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-secondary-text md:grid">
              <span>EDO qadoq nomi</span>
              <span>Tizimdagi birlik</span>
              <span>Holat</span>
            </div>
            {packageNames.map((packageName) => (
              <div
                key={packageName}
                className="grid gap-3 border-b border-border px-4 py-4 last:border-b-0 md:grid-cols-[minmax(0,1fr)_minmax(220px,0.8fr)_160px] md:items-center md:gap-4"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-heading">
                    {packageName}
                  </div>
                  <div className="mt-1 text-xs text-secondary-text">
                    EDO’dan kelgan qadoq
                  </div>
                </div>
                <SelectCustom
                  path={selectListEndpoints.unitsSelectList}
                  value={getSelectedUnitId(packageName)}
                  onChange={(value) =>
                    setUnitMappings((current) => ({
                      ...current,
                      [packageName]: value == null ? null : Number(value),
                    }))
                  }
                  search
                  clearable
                  marginBottom="mb-0"
                  placeholder="Birlikni tanlang"
                />
                <div className="text-xs md:text-sm">
                  {Object.prototype.hasOwnProperty.call(unitMappings, packageName) ? (
                    getSelectedUnitId(packageName) ? (
                      <Tag color="blue" className="m-0">Qo‘lda tanlandi</Tag>
                    ) : (
                      <Tag color="warning" className="m-0">Tanlash kerak</Tag>
                    )
                  ) : getSelectedUnitId(packageName) ? (
                    <Tag color="success" className="m-0">Avtomatik topildi</Tag>
                  ) : (
                    <Tag color="warning" className="m-0">Tanlash kerak</Tag>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Button
            className="mt-4"
            loading={applyDefaults.isPending}
            disabled={packageNames.some((packageName) => !getSelectedUnitId(packageName))}
            onClick={submitDefaults}
          >
            Birliklarni tasdiqlash
          </Button>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          type="primary"
          loading={applyPlan.isPending}
          disabled={plan.data.blockedCount > 0}
          onClick={submitPlan}
        >
          Eng so‘nggi rejani tasdiqlash
        </Button>
      </div>
    </div>
  );
}

function PlanList({
  title,
  icon,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  items: { title: string; meta: string; action: EdoImportMasterDataAction }[];
}) {
  return (
    <div className="rounded-xl border border-border p-4">
      <div className="mb-3 flex items-center gap-2 font-semibold text-heading">
        {icon}
        {title}
      </div>
      <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
        {items.length ? (
          items.map((item, index) => (
            <div
              key={`${item.title}-${index}`}
              className="rounded-lg bg-surface-muted/45 p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-medium text-heading">
                  {item.title}
                </span>
                <Tag
                  color={item.action === "CREATE" ? "blue" : "green"}
                  className="m-0"
                >
                  {actionLabel(item.action)}
                </Tag>
              </div>
              <div className="mt-1 text-xs text-secondary-text">
                {item.meta}
              </div>
            </div>
          ))
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Muammo yo‘q"
          />
        )}
      </div>
    </div>
  );
}

function ProductConflictSection({ jobId }: { jobId: number }) {
  const plan = useEdoImportProductConflicts(jobId);
  const apply = useApplyEdoImportProductConflicts(jobId);
  const [decisions, setDecisions] = useState<
    Record<
      string,
      {
        action?: EdoImportMasterDataAction;
        existingProductId?: number;
        isPieceTracked: boolean;
        confirmItemTypeOverride: boolean;
      }
    >
  >({});

  const submit = () => {
    if (!plan.data?.items.length) return;
    const invalid = plan.data.items.some((item) => {
      const decision = decisions[item.identityKey];
      return (
        !decision?.action ||
        (decision.action === "USE_EXISTING" && !decision.existingProductId)
      );
    });
    if (invalid) {
      toast.error(
        "Har bir konflikt uchun action va kerak bo‘lsa mavjud mahsulotni tanlang.",
      );
      return;
    }
    Modal.confirm({
      title: "Mahsulot konfliktlarini hal qilish",
      content:
        "Tanlangan CREATE/USE_EXISTING qarorlari eng so‘nggi reja hashiga nisbatan qo‘llanadi.",
      okText: "Tasdiqlash",
      cancelText: "Bekor qilish",
      onOk: async () => {
        try {
          await apply.mutateAsync({
            confirm: true,
            expectedPlanHash: plan.data!.planHash,
            items: plan.data!.items.map((item) => {
              const decision = decisions[item.identityKey]!;
              const compatible = item.compatibleProducts.find(
                (product) => product.productId === decision.existingProductId,
              );
              return {
                identityKeys: [item.identityKey],
                action: decision.action!,
                existingProductId:
                  decision.action === "USE_EXISTING"
                    ? decision.existingProductId
                    : null,
                isService: item.isService ?? null,
                unitId: compatible?.unitId ?? null,
                vatRateId:
                  compatible?.vatRateId ?? item.resolvedVatRateId ?? null,
                isPieceTracked: decision.isPieceTracked,
                confirmItemTypeOverride: decision.confirmItemTypeOverride,
              };
            }),
          });
          toast.success("Mahsulot konfliktlari hal qilindi.");
          setDecisions({});
        } catch (error) {
          toast.error(getImportErrorMessage(error));
        }
      },
    });
  };

  if (plan.isLoading) return <Skeleton active paragraph={{ rows: 4 }} />;
  if (plan.isError)
    return (
      <Alert
        type="error"
        showIcon
        message={getImportErrorMessage(plan.error)}
      />
    );
  if (!plan.data?.items.length)
    return <Empty description="Mahsulot konflikti yo‘q" />;

  const columns: TableColumnsType<EdoImportProductConflictItemDto> = [
    {
      title: "Provider mahsuloti",
      dataIndex: "providerProductName",
      render: (value) => value || "—",
    },
    {
      title: "MXIK",
      dataIndex: "catalogCode",
      width: 150,
      render: (value) => value || "—",
    },
    {
      title: "Package",
      dataIndex: "packageName",
      render: (value) => value || "—",
    },
    { title: "Candidate", dataIndex: "candidateCount", width: 110 },
    {
      title: "Action",
      key: "action",
      width: 160,
      render: (_, record) => (
        <Select
          value={decisions[record.identityKey]?.action}
          placeholder="Tanlang"
          options={[
            { value: "CREATE", label: actionLabel("CREATE") },
            { value: "USE_EXISTING", label: actionLabel("USE_EXISTING") },
          ]}
          onChange={(action) =>
            setDecisions((current) => ({
              ...current,
              [record.identityKey]: {
                action,
                existingProductId: undefined,
                isPieceTracked:
                  current[record.identityKey]?.isPieceTracked ??
                  record.markingRequired,
                confirmItemTypeOverride:
                  current[record.identityKey]?.confirmItemTypeOverride ?? false,
              },
            }))
          }
          className="w-full"
        />
      ),
    },
    {
      title: "Mavjud mahsulot",
      key: "compatibleProduct",
      width: 240,
      render: (_, record) => (
        <Select
          showSearch
          optionFilterProp="label"
          value={decisions[record.identityKey]?.existingProductId}
          disabled={decisions[record.identityKey]?.action !== "USE_EXISTING"}
          placeholder="Compatible mahsulot"
          options={record.compatibleProducts.map((product) => ({
            value: product.productId,
            label: `${product.name} · #${product.productId}`,
          }))}
          onChange={(existingProductId) =>
            setDecisions((current) => ({
              ...current,
              [record.identityKey]: {
                ...current[record.identityKey],
                existingProductId,
                isPieceTracked:
                  current[record.identityKey]?.isPieceTracked ??
                  record.markingRequired,
                confirmItemTypeOverride:
                  current[record.identityKey]?.confirmItemTypeOverride ?? false,
              },
            }))
          }
          className="w-full"
        />
      ),
    },
    {
      title: "Piece",
      key: "piece",
      width: 80,
      render: (_, record) => (
        <Checkbox
          checked={
            decisions[record.identityKey]?.isPieceTracked ??
            record.markingRequired
          }
          onChange={(event) =>
            setDecisions((current) => ({
              ...current,
              [record.identityKey]: {
                ...current[record.identityKey],
                isPieceTracked: event.target.checked,
                confirmItemTypeOverride:
                  current[record.identityKey]?.confirmItemTypeOverride ?? false,
              },
            }))
          }
        />
      ),
    },
    {
      title: "Type override",
      key: "typeOverride",
      width: 120,
      render: (_, record) => (
        <Checkbox
          checked={
            decisions[record.identityKey]?.confirmItemTypeOverride ?? false
          }
          onChange={(event) =>
            setDecisions((current) => ({
              ...current,
              [record.identityKey]: {
                ...current[record.identityKey],
                isPieceTracked:
                  current[record.identityKey]?.isPieceTracked ??
                  record.markingRequired,
                confirmItemTypeOverride: event.target.checked,
              },
            }))
          }
        />
      ),
    },
  ];

  return (
    <div>
      <Table
        rowKey="identityKey"
        size="small"
        columns={columns}
        dataSource={plan.data.items}
        pagination={false}
        scroll={{ x: 1250 }}
      />
      <div className="mt-4 flex justify-end">
        <Button type="primary" loading={apply.isPending} onClick={submit}>
          Tanlangan moslashtirishlarni qo‘llash
        </Button>
      </div>
    </div>
  );
}

function PieceTrackingSection({ jobId }: { jobId: number }) {
  const plan = useEdoImportPieceTrackingPlan(jobId);
  const apply = useApplyEdoImportPieceTracking(jobId);
  const [selected, setSelected] = useState<number[]>([]);

  const products = plan.data?.products ?? [];
  const actionableProducts = products.filter(
    (product) => product.safeAction !== "NO_CHANGE",
  );
  const submit = () => {
    if (
      !plan.data ||
      !selected.length ||
      selected.some((id) => id <= 0) ||
      new Set(selected).size !== selected.length
    ) {
      toast.error("Kamida bitta musbat product ID tanlang.");
      return;
    }
    Modal.confirm({
      title: "Piece trackingni yoqish",
      content: `${selected.length} ta mahsulot dona hisobiga o‘tkaziladi.`,
      okText: "Yoqish",
      cancelText: "Bekor qilish",
      onOk: async () => {
        try {
          await apply.mutateAsync({
            confirm: true,
            expectedPlanHash: plan.data!.planHash,
            productIds: selected,
          });
          toast.success("Piece tracking qo‘llandi.");
          setSelected([]);
        } catch (error) {
          toast.error(getImportErrorMessage(error));
        }
      },
    });
  };

  if (plan.isLoading) return <Skeleton active paragraph={{ rows: 4 }} />;
  if (plan.isError)
    return (
      <Alert
        type="error"
        showIcon
        message={getImportErrorMessage(plan.error)}
      />
    );
  if (!products.length)
    return <Empty description="Piece tracking rejasi bo‘sh" />;

  const columns: TableColumnsType<EdoImportPieceTrackingProductDto> = [
    { title: "Mahsulot", dataIndex: "productName" },
    { title: "MXIK", dataIndex: "catalogCode", width: 160 },
    { title: "Candidate", dataIndex: "affectedCandidateCount", width: 110 },
    { title: "Marking", dataIndex: "markingCount", width: 100 },
    {
      title: "Hozirgi holat",
      key: "currentState",
      width: 150,
      render: (_: unknown, record) =>
        record.isPieceTracked ? "Yoqilgan" : "Yoqilmagan",
    },
    {
      title: "Safe action",
      dataIndex: "safeAction",
      render: (value) =>
        value === "NO_CHANGE" ? actionLabel(value) : importStatusTag(value),
    },
  ];

  return (
    <div>
      <Table
        rowKey="productId"
        size="small"
        columns={columns}
        dataSource={products}
        pagination={false}
        rowSelection={{
          selectedRowKeys: selected,
          onChange: (keys) => setSelected(keys.map(Number)),
          getCheckboxProps: (record) => ({
            disabled: record.safeAction === "NO_CHANGE",
          }),
        }}
        scroll={{ x: 720 }}
      />
      {actionableProducts.length === 0 ? (
        <Alert
          className="mt-4"
          type="success"
          showIcon
          message="Dona hisobi bo‘yicha o‘zgarish kerak emas"
          description="Barcha mahsulotlarda dona hisobini yuritish allaqachon yoqilgan."
        />
      ) : null}
      <div className="mt-4 flex justify-end">
        <Button
          type="primary"
          disabled={!selected.length || actionableProducts.length === 0}
          loading={apply.isPending}
          onClick={submit}
        >
          Tanlanganlarni yoqish
        </Button>
      </div>
    </div>
  );
}

function MarkingConflictSection({ jobId }: { jobId: number }) {
  const plan = useEdoImportMarkingConflicts(jobId);
  const apply = useApplyEdoImportMarkingConflicts(jobId);
  const [selected, setSelected] = useState<number[]>([]);

  const submit = () => {
    if (!plan.data || !selected.length) return;
    Modal.confirm({
      title: "Hujjatlarni importdan chiqarish",
      icon: <ShieldAlert className="size-5 text-warning" />,
      content: `${selected.length} ta hujjat import qilinmaydi va “O‘tkazib yuborilgan” holatiga o‘tadi. Bu amal yetishmayotgan markingni tiklamaydi.`,
      okText: "Importdan chiqarish",
      okButtonProps: { danger: true },
      cancelText: "Bekor qilish",
      onOk: async () => {
        try {
          await apply.mutateAsync({
            confirm: true,
            expectedConflictHash: plan.data!.conflictHash,
            items: selected.map((candidateId) => ({
              candidateId,
              action: "SKIP",
            })),
          });
          toast.success("Tanlangan konfliktlar o‘tkazib yuborildi.");
          setSelected([]);
        } catch (error) {
          toast.error(getImportErrorMessage(error));
        }
      },
    });
  };

  if (plan.isLoading) return <Skeleton active paragraph={{ rows: 4 }} />;
  if (plan.isError)
    return (
      <Alert
        type="error"
        showIcon
        message={getImportErrorMessage(plan.error)}
      />
    );
  if (!plan.data?.items.length)
    return <Empty description="Marking konflikti yo‘q" />;

  const columns: TableColumnsType<EdoImportMarkingConflictItemDto> = [
    { title: "Candidate", dataIndex: "candidateId", width: 110 },
    {
      title: "Hujjat",
      dataIndex: "documentNumber",
      render: (value) => value || "—",
    },
    {
      title: "Safe error",
      dataIndex: "safeErrorCode",
      render: (value) => <Tag color="orange">{errorLabel(value)}</Tag>,
    },
    {
      title: "Kutilgan",
      dataIndex: "expectedQuantity",
      align: "right",
      render: formatImportNumber,
    },
    { title: "Marking", dataIndex: "actualMarkingCount", align: "right" },
    {
      title: "Yetishmayapti",
      key: "missingMarking",
      align: "right",
      render: (_: unknown, record) => {
        const missing = Math.max(
          0,
          Number(record.expectedQuantity ?? 0) - record.actualMarkingCount,
        );
        return missing > 0 ? (
          <Tag color="red">{formatImportNumber(missing)} ta</Tag>
        ) : (
          "—"
        );
      },
    },
    { title: "Konflikt", dataIndex: "conflictCount", align: "right" },
  ];

  return (
    <div>
      <Alert
        className="mb-4"
        type="warning"
        showIcon
        message="Marking soni hujjatdagi miqdorga mos emas"
        description="Importdan chiqarish tanlangan hujjatlarni o‘tkazib yuboradi. Agar hujjatni import qilish kerak bo‘lsa, avval manba hujjatdagi marking ma’lumotlarini to‘g‘rilang."
      />
      <Table
        rowKey="candidateId"
        size="small"
        columns={columns}
        dataSource={plan.data.items}
        pagination={false}
        rowSelection={{
          selectedRowKeys: selected,
          onChange: (keys) => setSelected(keys.map(Number)),
          selections: [Table.SELECTION_ALL, Table.SELECTION_NONE],
        }}
        scroll={{ x: 760 }}
      />
      <div className="mt-4 flex items-center justify-between gap-3">
        <Checkbox
          checked={selected.length === plan.data.items.length}
          indeterminate={
            selected.length > 0 && selected.length < plan.data.items.length
          }
          onChange={(event) =>
            setSelected(
              event.target.checked
                ? plan.data!.items.map((item) => item.candidateId)
                : [],
            )
          }
        >
          Barchasini tanlash
        </Checkbox>
        <Button
          danger
          disabled={!selected.length}
          loading={apply.isPending}
          onClick={submit}
        >
          Tanlanganlarni importdan chiqarish
        </Button>
      </div>
    </div>
  );
}
