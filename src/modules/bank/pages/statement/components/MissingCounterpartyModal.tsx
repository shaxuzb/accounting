import { Button, Checkbox, Input, Modal, Table, type TableColumnsType } from "antd";
import { useFormik } from "formik";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import SelectCustom from "@/components/fields/SelectCustom";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { useCreateBankCounterparties } from "../hooks";
import type { BankStatementTransaction } from "../types/type";
import { getMissingCounterpartyKey } from "../utils/missingCounterpartyKey";
import DistrictSelect from "@/components/fields/DistrictSelect";
import { useLookupCounterparty } from "@/modules/settings/pages/counterparty/hooks/useLookupCounterparty";

export interface MissingCounterpartyItem {
  cardId: string;
  transactionIndex: number;
  transaction: BankStatementTransaction;
}

interface CounterpartyDraftRow {
  key: string;
  formKey: string;
  count: number;
  sourceName: string;
  sourceAccount: string;
  readonlyShortName: boolean;
  readonlyFullName: boolean;
  readonlyInn: boolean;
  isVatPayer: boolean;
  shortName: string;
  fullName: string;
  inn: string;
  phoneNumber: string;
  email: string;
  regionId: number | null;
  districtId: number | null;
  address: string;
}

interface CounterpartyDraftForm {
  rows: Record<string, CounterpartyDraftRow>;
}

interface MissingCounterpartyModalProps {
  open: boolean;
  items: MissingCounterpartyItem[];
  onClose: () => void;
  onApply: (assignments: Record<string, number>) => void;
}

const getResponseList = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  const record = payload as Record<string, unknown>;
  if (Array.isArray(record.data)) return record.data;
  if (Array.isArray(record.items)) return record.items;
  if (Array.isArray(record.counterparties)) return record.counterparties;

  return [];
};

const getRecordId = (payload: unknown) => {
  if (!payload || typeof payload !== "object") return null;

  const record = payload as Record<string, unknown>;
  const value = record.id ?? record.counterpartyId;
  const id = Number(value);

  return Number.isFinite(id) && id > 0 ? id : null;
};

const getFieldName = (
  record: CounterpartyDraftRow,
  fieldName: keyof CounterpartyDraftRow,
) => `rows.${record.formKey}.${fieldName}`;

const toFormRows = (rows: CounterpartyDraftRow[]) =>
  rows.reduce<Record<string, CounterpartyDraftRow>>((acc, row) => {
    acc[row.formKey] = row;
    return acc;
  }, {});

interface CounterpartyDraftTextCellProps {
  value: string;
  placeholder?: string;
  onCommit: (value: string) => void;
}

const formatUzbekPhoneForInput = (value: string) => {
  const digits = value.replace(/\D/g, "");
  let localDigits = digits;

  if (localDigits.startsWith("998")) {
    localDigits = localDigits.slice(3);
  }
  if (localDigits.startsWith("0")) {
    localDigits = localDigits.slice(1);
  }

  localDigits = localDigits.slice(0, 9);

  if (localDigits.length === 0) {
    return "";
  }

  if (localDigits.length <= 2) {
    return localDigits;
  }

  if (localDigits.length <= 5) {
    return `${localDigits.slice(0, 2)} ${localDigits.slice(2)}`;
  }

  if (localDigits.length <= 7) {
    return `${localDigits.slice(0, 2)} ${localDigits.slice(2, 5)}-${localDigits.slice(5)}`;
  }

  return `${localDigits.slice(0, 2)} ${localDigits.slice(2, 5)}-${localDigits.slice(5, 7)}-${localDigits.slice(7, 9)}`;
};

const hasFormattedPhoneValue = /^\d{2} \d{3}-\d{2}-\d{2}$/;
const buildApiPhoneValue = (value: string) => {
  const formatted = formatUzbekPhoneForInput(value);
  if (!formatted) return "";

  return `+998 ${formatted}`;
};

const CounterpartyDraftTextCell = memo(function CounterpartyDraftTextCell({
  value,
  placeholder,
  onCommit,
}: CounterpartyDraftTextCellProps) {
  const [draftValue, setDraftValue] = useState(value);

  const commit = () => {
    if (draftValue !== value) {
      onCommit(draftValue);
    }
  };

  return (
    <Input
      value={draftValue}
      placeholder={placeholder}
      onChange={(event) => setDraftValue(event.target.value)}
      onBlur={commit}
      onPressEnter={commit}
    />
  );
});

interface CounterpartyDraftPhoneCellProps {
  value: string;
  onCommit: (value: string) => void;
}

const CounterpartyDraftPhoneCell = memo(function CounterpartyDraftPhoneCell({
  value,
  onCommit,
}: CounterpartyDraftPhoneCellProps) {
  const [draftValue, setDraftValue] = useState(formatUzbekPhoneForInput(value));

  const commit = () => {
    const normalized = formatUzbekPhoneForInput(draftValue);
    if (normalized !== value) {
      onCommit(normalized);
    }
    setDraftValue(normalized);
  };

  return (
    <Input
      value={draftValue}
      addonBefore="+998"
      placeholder="99 123-45-67"
      maxLength={15}
      onChange={(event) => setDraftValue(formatUzbekPhoneForInput(event.target.value))}
      onBlur={commit}
      onPressEnter={commit}
      onFocus={(event) => event.currentTarget.select()}
    />
  );
});

export default function MissingCounterpartyModal({
  open,
  items,
  onClose,
  onApply,
}: MissingCounterpartyModalProps) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createCounterparties = useCreateBankCounterparties();
  const { mutateAsync: lookupCounterparty } = useLookupCounterparty();
  const lookedUpKeys = useRef(new Set<string>());
  const formikValuesRef = useRef<CounterpartyDraftForm | null>(null);

  const duplicateGroups = useMemo(() => {
    const grouped = new Map<string, MissingCounterpartyItem[]>();
    items.forEach((item) => {
      const key = getMissingCounterpartyKey(item);
      const group = grouped.get(key) ?? [];
      group.push(item);
      grouped.set(key, group);
    });
    return grouped;
  }, [items]);

  const baseRows = useMemo(
    () =>
      Array.from(duplicateGroups.entries()).map(([key, group], index) => {
        const transaction = group[0]?.transaction;
        const name = transaction?.counterpartyName?.trim() || "";
        const inn = transaction?.counterpartyInn?.trim() || "";

        return {
          key,
          formKey: `row_${index}`,
          count: group.length,
          sourceName: name || "-",
          sourceAccount: transaction?.counterpartyAccount || "-",
          readonlyShortName: Boolean(name),
          readonlyFullName: Boolean(name),
          readonlyInn: Boolean(inn),
          isVatPayer: false,
          shortName: name || inn,
          fullName: name || inn,
          inn,
          phoneNumber: "",
          email: "",
          regionId: null,
          districtId: null,
          address: "",
        };
      }),
    [duplicateGroups],
  );

  const formik = useFormik<CounterpartyDraftForm>({
    initialValues: {
      rows: toFormRows(baseRows),
    },
    validateOnChange: false,
    validateOnBlur: true,
    enableReinitialize: true,
    onSubmit: async (values, helpers) => {
      const rows = Object.values(values.rows);
      const hasInvalidPhone = rows.some(
        (row) => !hasFormattedPhoneValue.test(row.phoneNumber),
      );

      if (hasInvalidPhone) {
        toast.error(t("app.missingCounterparty.invalidPhone"));
        return;
      }

      const hasEmpty = rows.some(
        (row) =>
          !row.shortName.trim() ||
          !row.fullName.trim() ||
          !row.inn.trim() ||
          !row.phoneNumber.trim() ||
          !row.regionId ||
          !row.districtId ||
          !row.address.trim(),
      );

      if (hasEmpty) {
        toast.error(t("app.missingCounterparty.requiredData"));
        return;
      }

      setIsSubmitting(true);
      try {
        const payload = {
          counterparties: rows.map((row) => ({
            isVatPayer: row.isVatPayer,
            shortName: row.shortName.trim(),
            fullName: row.fullName.trim(),
            inn: row.inn.trim(),
            phoneNumber: buildApiPhoneValue(row.phoneNumber),
            email: row.email.trim(),
            regionId: Number(row.regionId),
            districtId: Number(row.districtId),
            address: row.address.trim(),
          })),
        };

        const response = await createCounterparties.mutateAsync(payload);
        const createdRows = getResponseList(response);
        const assignments: Record<string, number> = {};

        rows.forEach((row, index) => {
          const createdId = getRecordId(createdRows[index]);
          if (createdId) {
            assignments[row.key] = createdId;
          }
        });

        if (Object.keys(assignments).length !== rows.length) {
          toast.error(t("app.missingCounterparty.idsNotFound"));
          return;
        }

        toast.success(t("app.missingCounterparty.created"));
        helpers.resetForm();
        onApply(assignments);
      } catch (error) {
        errorHandlers(error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });
  const setFieldValue = formik.setFieldValue;
  const rows = useMemo(
    () => Object.values(formik.values.rows),
    [formik.values.rows],
  );
  const baseRowsByFormKey = useMemo(
    () => new Map(baseRows.map((row) => [row.formKey, row])),
    [baseRows],
  );

  useEffect(() => {
    formikValuesRef.current = formik.values;
  }, [formik.values]);

  useEffect(() => {
    if (!open) {
      lookedUpKeys.current.clear();
      return;
    }

    let cancelled = false;

    const lookupRows = async () => {
      await Promise.all(
        rows.map(async (row) => {
          const inn = row.inn.trim();
          if (!inn) return;

          const lookupKey = `${row.key}:${inn}`;
          if (lookedUpKeys.current.has(lookupKey)) return;
          lookedUpKeys.current.add(lookupKey);

          try {
            const result = await lookupCounterparty(inn);
            if (cancelled || !result.isMatch) return;

            const values = result.values;
            const currentRow = formikValuesRef.current?.rows[row.formKey];
            const originalRow = baseRowsByFormKey.get(row.formKey);
            if (!currentRow) return;

            const updateIfAvailable = (
              fieldName: keyof CounterpartyDraftRow,
              value: unknown,
            ) => {
              if (value === null || value === undefined || value === "") {
                return;
              }

              const nextValue =
                fieldName === "phoneNumber"
                  ? formatUzbekPhoneForInput(String(value))
                  : value;
              const currentValue = currentRow[fieldName];
              const originalValue = originalRow?.[fieldName];

              if (!currentValue || currentValue === originalValue) {
                setFieldValue(
                  getFieldName(row, fieldName),
                  nextValue,
                  false,
                );
              }
            };

            updateIfAvailable("shortName", values.shortName);
            updateIfAvailable("fullName", values.fullName);
            updateIfAvailable("inn", values.inn);
            updateIfAvailable("phoneNumber", values.phoneNumber);
            updateIfAvailable("email", values.email);
            updateIfAvailable("regionId", values.regionId);
            updateIfAvailable("districtId", values.districtId);
            updateIfAvailable("address", values.address);
          } catch {
            // Lookup failure should not block manual completion of the row.
          }
        }),
      );
    };

    void lookupRows();

    return () => {
      cancelled = true;
    };
  }, [baseRowsByFormKey, lookupCounterparty, open, rows, setFieldValue]);

  const updateRow = useCallback(
    <K extends keyof CounterpartyDraftRow>(
      record: CounterpartyDraftRow,
      fieldName: K,
      value: CounterpartyDraftRow[K],
    ) => {
      formik.setFieldValue(getFieldName(record, fieldName), value, false);
    },
    [formik],
  );

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  const columns = useMemo<TableColumnsType<CounterpartyDraftRow>>(() => {
    const result: TableColumnsType<CounterpartyDraftRow> = [
      {
        title: t("settings.fields.counterparty"),
        dataIndex: "sourceName",
        width: 220,
        fixed: "left",
      },
      {
        title: t("app.fields.count"),
        dataIndex: "count",
        width: 70,
        align: "center",
        render: (value) => t("app.missingCounterparty.count", { count: value }),
      },
      {
        title: t("settings.fields.isVatPayer"),
        dataIndex: "isVatPayer",
        width: 130,
        align: "center",
        render: (value, record) => (
          <Checkbox
            checked={Boolean(value)}
            onChange={(event) =>
              updateRow(record, "isVatPayer", event.target.checked)
            }
          />
        ),
      },
    ];

    if (rows.some((row) => !row.readonlyShortName)) {
      result.push({
        title: t("settings.fields.shortName"),
        dataIndex: "shortName",
        width: 190,
        render: (_, record) =>
          record.readonlyShortName ? null : (
            <CounterpartyDraftTextCell
              key={`${record.formKey}-shortName-${record.shortName}`}
              value={record.shortName}
              onCommit={(value) => updateRow(record, "shortName", value)}
            />
          ),
      });
    }

    if (rows.some((row) => !row.readonlyFullName)) {
      result.push({
        title: t("settings.fields.fullName"),
        dataIndex: "fullName",
        width: 220,
        render: (_, record) =>
          record.readonlyFullName ? null : (
            <CounterpartyDraftTextCell
              key={`${record.formKey}-fullName-${record.fullName}`}
              value={record.fullName}
              onCommit={(value) => updateRow(record, "fullName", value)}
            />
          ),
      });
    }

    if (rows.some((row) => !row.readonlyInn)) {
      result.push({
        title: t("settings.fields.inn"),
        dataIndex: "inn",
        width: 160,
        render: (_, record) =>
          record.readonlyInn ? null : (
            <CounterpartyDraftTextCell
              key={`${record.formKey}-inn-${record.inn}`}
              value={record.inn}
              onCommit={(value) => updateRow(record, "inn", value)}
            />
          ),
      });
    }

    result.push(
      {
        title: t("settings.fields.phoneNumber"),
        dataIndex: "phoneNumber",
      width: 160,
      render: (_, record) => (
        <CounterpartyDraftPhoneCell
          key={`${record.formKey}-phoneNumber-${record.phoneNumber}`}
          value={record.phoneNumber}
          onCommit={(value) =>
            updateRow(record, "phoneNumber", formatUzbekPhoneForInput(value))
          }
        />
      ),
    },
      {
        title: t("settings.fields.email"),
        dataIndex: "email",
      width: 190,
      render: (_, record) => (
        <CounterpartyDraftTextCell
          key={`${record.formKey}-email-${record.email}`}
          value={record.email}
          placeholder={t("settings.fields.email")}
          onCommit={(value) => updateRow(record, "email", value)}
        />
      ),
    },
      {
        title: t("settings.fields.region"),
        dataIndex: "regionId",
        width: 180,
        render: (_, record) => (
          <SelectCustom
            formik={formik}
            fieldName={getFieldName(record, "regionId")}
            path={selectListEndpoints.regionsSelectList}
            placeholder="settings.fields.region"
            marginBottom="mb-0"
            search
            enabled={open}
          />
        ),
      },
      {
        title: t("settings.fields.district"),
        dataIndex: "districtId",
        width: 180,
        render: (_, record) => (
          <DistrictSelect
            formik={formik}
            regionFieldName={getFieldName(record, "regionId")}
            fieldName={getFieldName(record, "districtId")}
            path={selectListEndpoints.districtsSelectList}
            marginBottom="mb-0"
          />
        ),
      },
      {
        title: t("settings.fields.address"),
        dataIndex: "address",
      width: 220,
      render: (_, record) => (
        <CounterpartyDraftTextCell
          key={`${record.formKey}-address-${record.address}`}
          value={record.address}
          placeholder={t("settings.fields.address")}
          onCommit={(value) => updateRow(record, "address", value)}
        />
      ),
    },
    );

    return result;
  }, [formik, open, rows, t, updateRow]);

  return (
    <Modal maskClosable={false}
      title={t("app.missingCounterparty.title")}
      open={open}
      onCancel={handleClose}
      footer={null}
      centered
      width="96vw"
      destroyOnHidden
    >
      <div className="mb-3 text-sm text-gray-500">
        {t("app.missingCounterparty.summary", {
          transactions: items.length,
          counterparties: rows.length,
        })}
      </div>
      <Table
        rowKey="key"
        size="small"
        pagination={false}
        dataSource={rows}
        columns={columns}
        className="[&_.ant-table-cell]:whitespace-nowrap"
        scroll={{ y: 460, x: "max-content" }}
        virtual={rows.length > 30}
      />
      <Button
        type="primary"
        block
        className="mt-3"
        loading={isSubmitting || createCounterparties.isPending}
        onClick={() => formik.handleSubmit()}
        size="large"
      >
        {t("common.submit")}
      </Button>
    </Modal>
  );
}
