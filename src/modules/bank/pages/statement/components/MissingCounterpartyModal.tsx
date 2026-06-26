import { Button, Input, Modal, Select, Table, type TableColumnsType } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { $axiosPrivate } from "@/services/AxiosService";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import type { BankStatementTransaction } from "../types/type";
import { getMissingCounterpartyKey } from "../utils/missingCounterpartyKey";

interface SelectOption {
  id: number;
  name: string;
}

export interface MissingCounterpartyItem {
  cardId: string;
  transactionIndex: number;
  transaction: BankStatementTransaction;
}

interface CounterpartyDraftRow {
  key: string;
  count: number;
  sourceName: string;
  sourceAccount: string;
  readonlyShortName: boolean;
  readonlyFullName: boolean;
  readonlyInn: boolean;
  counterpartyTypeId: number | null;
  shortName: string;
  fullName: string;
  inn: string;
  phoneNumber: string;
  email: string;
  regionId: number | null;
  districtId: number | null;
  address: string;
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

export default function MissingCounterpartyModal({
  open,
  items,
  onClose,
  onApply,
}: MissingCounterpartyModalProps) {
  const { t } = useTranslation();
  const [rowEdits, setRowEdits] = useState<
    Record<string, Partial<CounterpartyDraftRow>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: counterpartyTypeOptions = [], isFetching: isTypesLoading } =
    useQuery<SelectOption[]>({
      queryKey: ["selectlist", "bank-import-counterparty-types"],
      queryFn: async () => {
        const { data } = await $axiosPrivate.get<SelectOption[]>(
          selectListEndpoints.counterpartyTypesSelectList,
        );
        return data;
      },
      enabled: open,
    });

  const { data: regionOptions = [], isFetching: isRegionsLoading } = useQuery<
    SelectOption[]
  >({
    queryKey: ["selectlist", "bank-import-regions"],
    queryFn: async () => {
      const { data } = await $axiosPrivate.get<SelectOption[]>(
        selectListEndpoints.regionsSelectList,
      );
      return data;
    },
    enabled: open,
  });

  const { data: districtOptions = [], isFetching: isDistrictsLoading } =
    useQuery<SelectOption[]>({
      queryKey: ["selectlist", "bank-import-districts"],
      queryFn: async () => {
        const { data } = await $axiosPrivate.get<SelectOption[]>(
          selectListEndpoints.districtsSelectList,
        );
        return data;
      },
      enabled: open,
    });

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
      Array.from(duplicateGroups.entries()).map(([key, group]) => {
        const transaction = group[0]?.transaction;
        const name = transaction?.counterpartyName?.trim() || "";
        const inn = transaction?.counterpartyInn?.trim() || "";

        return {
          key,
          count: group.length,
          sourceName: name || "-",
          sourceAccount: transaction?.counterpartyAccount || "-",
          readonlyShortName: Boolean(name),
          readonlyFullName: Boolean(name),
          readonlyInn: Boolean(inn),
          counterpartyTypeId: null,
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

  const rows = useMemo(
    () =>
      baseRows.map((row) => ({
        ...row,
        ...rowEdits[row.key],
      })),
    [baseRows, rowEdits],
  );

  const updateRow = <K extends keyof CounterpartyDraftRow>(
    key: string,
    fieldName: K,
    value: CounterpartyDraftRow[K],
  ) => {
    setRowEdits((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [fieldName]: value,
      },
    }));
  };

  const handleClose = () => {
    setRowEdits({});
    onClose();
  };

  const handleSubmit = async () => {
    const hasEmpty = rows.some(
      (row) =>
        !row.counterpartyTypeId ||
        !row.shortName.trim() ||
        !row.fullName.trim() ||
        !row.inn.trim() ||
        !row.phoneNumber.trim() ||
        !row.regionId ||
        !row.districtId ||
        !row.address.trim(),
    );

    if (hasEmpty) {
      toast.error("Kontragent ma'lumotlarini to'liq to'ldiring");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        counterparties: rows.map((row) => ({
          counterpartyTypeId: Number(row.counterpartyTypeId),
          shortName: row.shortName.trim(),
          fullName: row.fullName.trim(),
          inn: row.inn.trim(),
          phoneNumber: row.phoneNumber.trim(),
          email: row.email.trim(),
          regionId: Number(row.regionId),
          districtId: Number(row.districtId),
          address: row.address.trim(),
        })),
      };

      const { data } = await $axiosPrivate.post("counterparty-cards/many", payload);
      const createdRows = getResponseList(data);
      const assignments: Record<string, number> = {};

      rows.forEach((row, index) => {
        const createdId = getRecordId(createdRows[index]);
        if (createdId) {
          assignments[row.key] = createdId;
        }
      });

      if (Object.keys(assignments).length !== rows.length) {
        toast.error("Yaratilgan kontragent IDlari topilmadi");
        return;
      }

      toast.success("Kontragentlar muvaffaqiyatli yaratildi");
      setRowEdits({});
      onApply(assignments);
    } catch (error) {
      errorHandlers(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: TableColumnsType<CounterpartyDraftRow> = [
    {
      title: "Manba",
      dataIndex: "sourceName",
      width: 180,
      fixed: "left",
    },
    {
      title: "Hisob raqami",
      dataIndex: "sourceAccount",
      width: 190,
    },
    {
      title: "Soni",
      dataIndex: "count",
      width: 70,
      align: "center",
      render: (value) => `${value} ta`,
    },
    {
      title: "Turi",
      dataIndex: "counterpartyTypeId",
      width: 180,
      render: (_, record) => (
        <Select
          showSearch
          className="w-full"
          loading={isTypesLoading}
          placeholder="Turi"
          value={record.counterpartyTypeId ?? undefined}
          optionFilterProp="label"
          options={counterpartyTypeOptions.map((item) => ({
            value: item.id,
            label: item.name,
          }))}
          onChange={(value) =>
            updateRow(record.key, "counterpartyTypeId", Number(value))
          }
        />
      ),
    },
    {
      title: "Qisqa nomi",
      dataIndex: "shortName",
      width: 190,
      render: (_, record) => (
        <Input
          disabled={record.readonlyShortName}
          value={record.shortName}
          onChange={(event) =>
            updateRow(record.key, "shortName", event.target.value)
          }
        />
      ),
    },
    {
      title: "To'liq nomi",
      dataIndex: "fullName",
      width: 220,
      render: (_, record) => (
        <Input
          disabled={record.readonlyFullName}
          value={record.fullName}
          onChange={(event) =>
            updateRow(record.key, "fullName", event.target.value)
          }
        />
      ),
    },
    {
      title: "INN",
      dataIndex: "inn",
      width: 160,
      render: (_, record) => (
        <Input
          disabled={record.readonlyInn}
          value={record.inn}
          onChange={(event) => updateRow(record.key, "inn", event.target.value)}
        />
      ),
    },
    {
      title: "Telefon",
      dataIndex: "phoneNumber",
      width: 160,
      render: (_, record) => (
        <Input
          value={record.phoneNumber}
          onChange={(event) =>
            updateRow(record.key, "phoneNumber", event.target.value)
          }
        />
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      width: 190,
      render: (_, record) => (
        <Input
          value={record.email}
          onChange={(event) => updateRow(record.key, "email", event.target.value)}
        />
      ),
    },
    {
      title: "Viloyat",
      dataIndex: "regionId",
      width: 170,
      render: (_, record) => (
        <Select
          showSearch
          className="w-full"
          loading={isRegionsLoading}
          placeholder="Viloyat"
          value={record.regionId ?? undefined}
          optionFilterProp="label"
          options={regionOptions.map((item) => ({
            value: item.id,
            label: item.name,
          }))}
          onChange={(value) => updateRow(record.key, "regionId", Number(value))}
        />
      ),
    },
    {
      title: "Tuman",
      dataIndex: "districtId",
      width: 170,
      render: (_, record) => (
        <Select
          showSearch
          className="w-full"
          loading={isDistrictsLoading}
          placeholder="Tuman"
          value={record.districtId ?? undefined}
          optionFilterProp="label"
          options={districtOptions.map((item) => ({
            value: item.id,
            label: item.name,
          }))}
          onChange={(value) => updateRow(record.key, "districtId", Number(value))}
        />
      ),
    },
    {
      title: "Manzil",
      dataIndex: "address",
      width: 220,
      render: (_, record) => (
        <Input
          value={record.address}
          onChange={(event) =>
            updateRow(record.key, "address", event.target.value)
          }
        />
      ),
    },
  ];

  return (
    <Modal
      title="Topilmagan counterpartyIdlarni yaratish"
      open={open}
      onCancel={handleClose}
      footer={null}
      centered
      width="96vw"
      destroyOnHidden
    >
      <div className="mb-3 text-sm text-gray-500">
        {items.length} ta transaction, {rows.length} ta kontragent
      </div>
      <Table
        rowKey="key"
        size="small"
        pagination={false}
        dataSource={rows}
        columns={columns}
        scroll={{ y: 460, x: 2180 }}
      />
      <Button
        type="primary"
        block
        className="mt-3"
        loading={isSubmitting}
        onClick={() => void handleSubmit()}
      >
        {t("common.submit")}
      </Button>
    </Modal>
  );
}
