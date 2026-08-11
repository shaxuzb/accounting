import { Table, type TableProps } from "antd";
import { useTableScrollRestore } from "./actions/useTableScrollRestore";

type RestorableTableProps<T extends object> = TableProps<T> & {
  scrollStorageKey: string;
  restoreEnabled?: boolean;
  restoreReady?: boolean;
};

/** Antd Table uchun qayta ishlatiladigan scroll-restoration qatlami. */
function RestorableTable<T extends object>({
  scrollStorageKey,
  restoreEnabled = true,
  restoreReady = true,
  ...tableProps
}: RestorableTableProps<T>) {
  const { tableWrapperRef } = useTableScrollRestore({
    storageKey: scrollStorageKey,
    enabled: restoreEnabled,
    ready: restoreReady,
  });

  return (
    <div ref={tableWrapperRef}>
      <Table<T> {...tableProps} />
    </div>
  );
}

export default RestorableTable;
