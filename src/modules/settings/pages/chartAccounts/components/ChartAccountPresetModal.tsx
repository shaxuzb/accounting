import { Button, Input, Modal, Spin } from "antd";
import { useState } from "react";
import toast from "react-hot-toast";
import { Search } from "lucide-react";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { useDebounce } from "@/shared/hooks/useDebounce";
import {
  useCreateChartAccountsFromPreset,
  useGetChartAccountPresetAccounts,
} from "../hooks";
import ChartAccountPresetTable, {
  PresetSelectionActions,
} from "./ChartAccountPresetTable";

interface ChartAccountPresetModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export default function ChartAccountPresetModal({
  open,
  onClose,
  onCreated,
}: ChartAccountPresetModalProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const pageSize = 50;
  const debouncedSearch = useDebounce(search.trim(), 300);
  const presetQuery = useGetChartAccountPresetAccounts(
    {
      page,
      pageSize,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    },
    open,
  );
  const createMutation = useCreateChartAccountsFromPreset();

  const rows = presetQuery.data?.items ?? [];

  const handleSubmit = async () => {
    if (!selectedIds.length) {
      toast.error("Kamida bitta hisobni tanlang");
      return;
    }

    try {
      await createMutation.mutateAsync(
        selectedIds.map((presetAccountId) => ({
          preset_account_id: presetAccountId,
        })),
      );
      toast.success("Tanlangan hisoblar qo'shildi");
      onCreated?.();
      onClose();
    } catch (error) {
      errorHandlers(error);
    }
  };

  return (
    <Modal
      title="Hisob qo'shish"
      open={open}
      onCancel={onClose}
      footer={null}
      width={980}
      destroyOnHidden
    >
      <Spin spinning={presetQuery.isLoading || presetQuery.isFetching}>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Input
              allowClear
              className="max-w-sm"
              prefix={<Search className="size-4 text-muted-second" />}
              placeholder="Raqam yoki nomi bo‘yicha qidirish"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
            <PresetSelectionActions
              rows={rows}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
            />
          </div>

            <ChartAccountPresetTable
              rows={rows}
              selectedIds={selectedIds}
              pagination={{
              current: page,
              pageSize,
              total: presetQuery.data?.totalCount ?? 0,
              onChange: setPage,
              }}
              onSelectionChange={setSelectedIds}
            />

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
            <span className="text-sm font-medium">
              Tanlangan hisoblar: {selectedIds.length}
            </span>
            <div className="flex items-center gap-2">
              <Button onClick={onClose}>Bekor qilish</Button>
              <Button
                type="primary"
                loading={createMutation.isPending}
                disabled={!selectedIds.length}
                onClick={() => handleSubmit()}
              >
                Tanlanganlarni qo'shish
              </Button>
            </div>
          </div>
        </div>
      </Spin>
    </Modal>
  );
}
