import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button, Empty, Input, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import { ListTree, Plus, Trash2 } from "lucide-react";
import InputNumberFormat from "@/components/fields/InputNumber";
import Card from "@/components/ui/card/Card";
import type {
  OpeningBalanceDetailForm,
  OpeningBalanceSubkontoForm,
} from "../types/form";
import type { SubkontoTypeOption } from "../types/type";
import OpeningBalanceSubkontoEditor from "./OpeningBalanceSubkontoEditor";

interface OpeningBalanceDetailsTableProps {
  details: OpeningBalanceDetailForm[];
  definitions: SubkontoTypeOption[];
  expandedDetailKey: string | null;
  isQuantity: boolean;
  onAdd: () => void;
  onChange: (
    clientKey: string,
    changes: Partial<OpeningBalanceDetailForm>,
  ) => void;
  onChangeSubkontos: (
    clientKey: string,
    subkontos: OpeningBalanceSubkontoForm[],
  ) => void;
  onExpand: (clientKey: string | null) => void;
  onRemove: (clientKey: string) => void;
}

const getAnalyticsProgress = (
  detail: OpeningBalanceDetailForm,
  definitions: SubkontoTypeOption[],
) => {
  const filled = definitions.filter((definition) =>
    detail.subkontos.some(
      (subkonto) =>
        subkonto.subkontoTypeId === definition.id &&
        Number(subkonto.subkontoId) > 0,
    ),
  ).length;

  return {
    filled,
    total: definitions.length,
    complete: filled === definitions.length,
  };
};

function OpeningBalanceDetailsTable({
  details,
  definitions,
  expandedDetailKey,
  isQuantity,
  onAdd,
  onChange,
  onChangeSubkontos,
  onExpand,
  onRemove,
}: OpeningBalanceDetailsTableProps) {
  const { t } = useTranslation();
  console.log(definitions);

  const columns = useMemo<TableColumnsType<OpeningBalanceDetailForm>>(
    () => [
      {
        title: t("common.rowNumber"),
        width: 58,
        align: "center",
        render: (_value, _record, index) => index + 1,
      },
      {
        title: t("openingBalance.fields.description"),
        minWidth: 260,
        render: (_value, record) => (
          <Input
            value={record.description}
            placeholder={t("openingBalance.fields.description")}
            onChange={(event) =>
              onChange(record.clientKey, {
                description: event.target.value,
              })
            }
          />
        ),
      },
      ...(definitions[0]?.accountTypeCode === "active"
        ? [
            {
              title: t("openingBalance.fields.debit"),
              align: "center" as any,
              width: 165,
              render: (
                _value: any,
                record: {
                  debitAmount: number;
                  creditAmount: any;
                  clientKey: string;
                },
              ) => (
                <InputNumberFormat
                  standalone
                  emptyZero
                  min={0}
                  precision={2}
                  value={record.debitAmount}
                  onValueChange={(value) => {
                    const debitAmount = Number(value ?? 0);
                    const creditAmount =
                      debitAmount > 0 ? 0 : Number(record.creditAmount ?? 0);
                    onChange(record.clientKey, {
                      debitAmount,
                      creditAmount,
                      currencyId: 1,
                      currencyAmount: debitAmount || creditAmount,
                      exchangeRate: 1,
                    });
                  }}
                />
              ),
            },
          ]
        : []),
      ...(definitions[0]?.accountTypeCode === "passive"
        ? [
            {
              title: t("openingBalance.fields.credit"),
              width: 165,
              align: "center",
              render: (_value, record) => (
                <InputNumberFormat
                  standalone
                  emptyZero
                  min={0}
                  precision={2}
                  value={record.creditAmount}
                  onValueChange={(value) => {
                    const creditAmount = Number(value ?? 0);
                    const debitAmount =
                      creditAmount > 0 ? 0 : Number(record.debitAmount ?? 0);
                    onChange(record.clientKey, {
                      debitAmount,
                      creditAmount,
                      currencyId: 1,
                      currencyAmount: creditAmount || debitAmount,
                      exchangeRate: 1,
                    });
                  }}
                />
              ),
            },
          ]
        : []),
      ...(isQuantity
        ? [
            {
              title: t("openingBalance.fields.quantity"),
              align: "center",
              width: 130,
              render: (_value: unknown, record: OpeningBalanceDetailForm) => (
                <InputNumberFormat
                  standalone
                  emptyZero
                  min={0}
                  precision={6}
                  value={record.quantity}
                  onValueChange={(value) =>
                    onChange(record.clientKey, { quantity: value })
                  }
                />
              ),
            },
          ]
        : []),
      {
        title: t("openingBalance.fields.analytics"),
        width: 150,
        align: "center",
        render: (_value, record) => {
          if (!definitions.length) {
            return (
              <Tag bordered={false}>
                {t("openingBalance.analytics.notRequired")}
              </Tag>
            );
          }

          const progress = getAnalyticsProgress(record, definitions);
          return (
            <Tag color={progress.complete ? "green" : "orange"}>
              {progress.filled}/{progress.total}{" "}
              {t(
                progress.complete
                  ? "openingBalance.analytics.complete"
                  : "openingBalance.analytics.incomplete",
              )}
            </Tag>
          );
        },
      },
      {
        title: t("common.actions"),
        width: 70,
        align: "center",
        fixed: "right",
        render: (_value, record) => (
          <Button
            type="text"
            danger
            icon={<Trash2 className="size-4" />}
            aria-label={t("common.delete")}
            onClick={() => onRemove(record.clientKey)}
          />
        ),
      },
    ],
    [definitions, isQuantity, onChange, onRemove, t],
  );

  return (
    <Card className="overflow-hidden border border-border">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-primary">
            <ListTree className="size-4.5" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-heading">
              {t("openingBalance.detailsTitle")}
            </div>
            <div className="text-xs text-secondary-text">
              {t("openingBalance.detailsSubtitle")}
            </div>
          </div>
        </div>
        <Button
          type="primary"
          icon={<Plus className="size-4" />}
          onClick={onAdd}
        >
          {t("openingBalance.actions.addDetail")}
        </Button>
      </div>

      <Table<OpeningBalanceDetailForm>
        rowKey="clientKey"
        columns={columns}
        dataSource={details}
        pagination={false}
        scroll={{ x: "max-content" }}
        rowClassName={(record) =>
          record.clientKey === expandedDetailKey ? "bg-brand-soft!" : ""
        }
        expandable={{
          expandedRowKeys: expandedDetailKey ? [expandedDetailKey] : [],
          rowExpandable: () => definitions.length > 0,
          onExpand: (expanded, record) =>
            onExpand(expanded ? record.clientKey : null),
          expandedRowRender: (record, index) => (
            <div className="rounded-lg border border-border bg-primary-bg p-4">
              <div className="mb-4">
                <div>
                  <div className="font-semibold text-heading">
                    {t("openingBalance.selectedDetail", {
                      row: index + 1,
                    })}
                  </div>
                  <div className="text-xs text-secondary-text">
                    {record.description ||
                      t("openingBalance.fields.description")}
                  </div>
                </div>
              </div>
              <OpeningBalanceSubkontoEditor
                definitions={definitions}
                value={record.subkontos}
                onChange={(subkontos) =>
                  onChangeSubkontos(record.clientKey, subkontos)
                }
              />
            </div>
          ),
        }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={t("openingBalance.messages.noDetails")}
            />
          ),
        }}
      />
    </Card>
  );
}

export default memo(OpeningBalanceDetailsTable);
