import { Table, type TableProps } from "antd";
import { useTranslation } from "react-i18next";

type CustomTableProps<T> = TableProps<T>;

function CustomTable<T extends object>({
  columns,
  dataSource,
  loading,
  rowKey = "id",
  pagination,
  ...props
}: CustomTableProps<T>) {
  const { t } = useTranslation();
  return (
    <div className="w-full bg-white rounded-xl border border-gray-200/70 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
      <Table<T>
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        rowKey={rowKey}
        size="middle"
        className="custom-table"
        scroll={{ y: "calc(100vh - 310px)", x: "max-content", ...props.scroll }}
        pagination={
          pagination !== false
            ? {
                defaultPageSize: 10,
                pageSizeOptions: ["10", "20", "50", "100"],
                showSizeChanger: true,
                className:
                  "px-6 py-10 border-gray-100 !m-0 flex items-center justify-between bg-white",
                showTotal: (total) => (
                  <span className="text-[#4e5969] font-normal text-sm">
                    {t("common.resultCount", { count: total })}
                  </span>
                ),
                ...pagination,
              }
            : false
        }
        {...props}
      />
    </div>
  );
}

export default CustomTable;
