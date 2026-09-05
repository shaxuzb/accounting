import { Alert, Button, Col, Empty, Row, Skeleton } from "antd";
import { Pencil } from "lucide-react";
import * as React from "react";
import Card from "@/components/ui/card/Card";
import PolicyFieldCard from "./PolicyFieldCard";
import PolicyStatusBadge from "./PolicyStatusBadge";
import type { AccountingPolicyCurrentDto } from "../types/type";

export default function CurrentPolicyTab({
  data,
  isLoading,
  isError,
  onEdit,
}: {
  data?: AccountingPolicyCurrentDto;
  isLoading: boolean;
  isError: boolean;
  onEdit: () => void;
}) {
  if (isLoading) {
    return <Skeleton active paragraph={{ rows: 10 }} />;
  }

  if (isError) {
    return (
      <Alert
        type="error"
        showIcon
        message="Current policy could not be loaded."
      />
    );
  }

  if (!data) {
    return <Empty description="Current policy is not available." />;
  }

  return (
    <div className="space-y-4">
      <Card className="border border-border p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-muted-second">
              Policy status
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <PolicyStatusBadge status={data.sourceStatus} />
              {data.requiresBusinessDecision && (
                <span className="text-sm text-muted-second">
                  Business approval is required before activation.
                </span>
              )}
            </div>
          </div>
          <Button
            type="primary"
            icon={<Pencil className="size-4" />}
            onClick={onEdit}
          >
            Edit policy
          </Button>
        </div>
      </Card>

      {/* {data.requiresBusinessDecision && (
        <Alert
          type="warning"
          showIcon
          message="Business approval is required"
          description={
            data.sourceEvidence ??
            "Some policy fields are not fully configured."
          }
        />
      )} */}

      <PolicySection title="General information">
        <PolicyFieldCard
          label="Accounting start date"
          field={data.general?.accountingStartDate}
          fallback={data.accountingStartDate}
          kind="date"
        />
        <PolicyFieldCard
          label="Fiscal year start month"
          field={data.general?.fiscalYearStartMonth}
          fallback={data.fiscalYearStartMonth}
          kind="month"
        />
        <PolicyFieldCard
          label="Effective from"
          field={data.governance?.effectiveFrom}
          fallback={data.effectiveFrom}
          kind="date"
        />
        <PolicyFieldCard
          label="Effective to"
          field={data.governance?.effectiveTo}
          fallback={data.effectiveTo}
          kind="date"
        />
      </PolicySection>

      <PolicySection title="Inventory valuation">
        <PolicyFieldCard
          label="Valuation method"
          field={data.inventory?.inventoryValuationMethod}
          fallback={data.inventoryValuationMethod}
          kind="valuation"
        />
      </PolicySection>

      <PolicySection title="VAT">
        <PolicyFieldCard
          label="VAT payer"
          field={data.vat?.isVatPayer}
          fallback={data.isVatPayer}
          kind="boolean"
        />
        <PolicyFieldCard
          label="Tax type ID"
          field={data.vat?.taxTypeId}
          fallback={data.taxTypeId}
        />
        <PolicyFieldCard
          label="VAT period"
          field={data.vat?.vatTaxPeriod}
          fallback={data.vatTaxPeriod}
          kind="policy"
        />
        <PolicyFieldCard
          label="VAT base moment"
          field={data.vat?.vatBaseMoment}
          fallback={data.vatBaseMoment}
          kind="policy"
        />
        <PolicyFieldCard
          label="Active VAT rate catalog"
          field={data.vat?.activeVatRateCatalog}
        />
      </PolicySection>

      <PolicySection title="Currency">
        <PolicyFieldCard
          label="Base currency"
          field={data.currency?.baseCurrencyCode}
          fallback={data.baseCurrencyCode}
          kind="currency"
        />
        <PolicyFieldCard
          label="Base currency ID"
          field={data.currency?.baseCurrencyId}
          fallback={data.baseCurrencyId}
        />
        <PolicyFieldCard
          label="Currency revaluation"
          field={data.currency?.currencyRevaluationService}
        />
        <PolicyFieldCard
          label="Revaluation scope"
          field={data.currency?.revaluationScope}
        />
        <PolicyFieldCard
          label="Foreign currency enabled"
          fallback={data.foreignCurrencyEnabled}
          kind="boolean"
          status={9}
        />
        <PolicyFieldCard
          label="Foreign currency"
          fallback={data.foreignCurrency}
          status={9}
        />
      </PolicySection>

      <PolicySection title="Payroll">
        <PolicyFieldCard
          label="Payroll component model"
          field={data.payroll?.payrollComponentModel}
        />
        <PolicyFieldCard
          label="Individual tax policy"
          field={data.payroll?.individualTaxPolicy}
        />
        <PolicyFieldCard
          label="Social tax policy"
          field={data.payroll?.socialTaxPolicy}
        />
      </PolicySection>

      <PolicySection title="Scope and governance">
        <PolicyFieldCard
          label="Production"
          field={data.production?.productionEnabled}
          fallback={data.productionEnabled}
          kind="boolean"
        />
        <PolicyFieldCard
          label="Production output account ID"
          field={data.production?.productionOutputAccountId}
        />
        <PolicyFieldCard
          label="Production output account code"
          field={data.production?.outputAccountCode}
        />
        <PolicyFieldCard
          label="Cost allocation"
          field={data.costing?.costAllocationMethod}
          fallback={data.costAllocationMethod}
        />
        <PolicyFieldCard
          label="Document account settings"
          field={data.accounts?.documentAccountSettingsCount}
        />
        <PolicyFieldCard
          label="Policy versioning"
          field={data.governance?.policyVersioning}
          fallback={data.policyVersioning}
          kind="boolean"
        />
        <PolicyFieldCard
          label="Closed-period policy"
          field={data.governance?.closedPeriodPolicy}
          fallback={data.closedPeriodPolicy}
          kind="policy"
        />
      </PolicySection>
    </div>
  );
}

function PolicySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-2 text-base font-semibold text-primary-text">
        {title}
      </div>
      <Row gutter={[12, 12]}>
        {React.Children.map(children, (child) => (
          <Col xs={24} sm={12} lg={8} xl={6}>
            {child}
          </Col>
        ))}
      </Row>
    </section>
  );
}
