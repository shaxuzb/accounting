import {
  Alert,
  Button,
  DatePicker,
  Empty,
  Select,
  Skeleton,
  Space,
  Tag,
} from "antd";
import dayjs from "dayjs";
import { Search } from "lucide-react";
import Card from "@/components/ui/card/Card";
import PolicyStatusBadge from "./PolicyStatusBadge";
import type { AccountingPolicyImpactDto } from "../types/type";

export default function PolicyImpactTab({
  effectiveOn,
  documentType,
  data,
  isLoading,
  isError,
  onCheck,
}: {
  effectiveOn: string;
  documentType?: string;
  data?: AccountingPolicyImpactDto;
  isLoading: boolean;
  isError: boolean;
  onCheck: (effectiveOn: string, documentType?: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Card className="border border-border p-4">
        <Space wrap>
          <DatePicker
            value={effectiveOn ? dayjs(effectiveOn) : null}
            format="DD.MM.YYYY"
            onChange={(value) =>
              onCheck(value ? value.format("YYYY-MM-DD") : "", documentType)
            }
            allowClear={false}
          />
          <Select
            allowClear
            placeholder="Document type"
            value={documentType}
            style={{ width: 180 }}
            options={[
              { value: "SALE", label: "Sale" },
              { value: "PURCHASE", label: "Purchase" },
            ]}
            onChange={(value) => onCheck(effectiveOn, value)}
          />
          <Button
            type="primary"
            icon={<Search className="size-4" />}
            onClick={() => onCheck(effectiveOn, documentType)}
            disabled={!effectiveOn}
          >
            Check impact
          </Button>
        </Space>
      </Card>

      {isLoading && <Skeleton active paragraph={{ rows: 5 }} />}
      {isError && (
        <Alert
          type="error"
          showIcon
          message="Policy impact could not be loaded."
        />
      )}
      {!isLoading && !isError && !data && (
        <Empty description="Run an impact check to see the result." />
      )}
      {!isLoading && !isError && data && <ImpactResult data={data} />}
    </div>
  );
}

function ImpactResult({ data }: { data: AccountingPolicyImpactDto }) {
  return (
    <div className="space-y-4">
      {/* {data.requiresBusinessDecision && (
        <Alert
          type="warning"
          showIcon
          message="Business approval is required"
          description={data.sourceEvidence ?? "This policy is not ready for activation."}
        />
      )} */}
      <Card className="border border-border p-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <ImpactValue label="Effective date" value={data.effectiveOn} />
          <ImpactValue
            label="Document type"
            value={data.documentType ?? "All documents"}
          />
          <ImpactValue
            label="Existing documents recalculated"
            value={data.existingDocumentsRecalculated ? "Yes" : "No"}
          />
          <div>
            <div className="text-sm text-muted-second">Policy status</div>
            <div className="mt-2">
              <PolicyStatusBadge status={data.sourceStatus} />
            </div>
          </div>
        </div>
      </Card>
      {data.policy && (
        <Card className="border border-border p-4">
          <div className="mb-3 text-base font-semibold text-primary-text">
            Policy snapshot
          </div>
          <div className="flex flex-wrap gap-2">
            <Tag>Inventory: {data.policy.inventoryValuationMethod ?? "—"}</Tag>
            <Tag>Currency: {data.policy.baseCurrencyCode ?? "—"}</Tag>
            <Tag>
              VAT:{" "}
              {data.policy.isVatPayer === null
                ? "—"
                : data.policy.isVatPayer
                  ? "Yes"
                  : "No"}
            </Tag>
            <Tag>Closed period: {data.policy.closedPeriodPolicy ?? "—"}</Tag>
          </div>
        </Card>
      )}
    </div>
  );
}

function ImpactValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-sm text-muted-second">{label}</div>
      <div className="mt-1 font-semibold text-primary-text">{value}</div>
    </div>
  );
}
