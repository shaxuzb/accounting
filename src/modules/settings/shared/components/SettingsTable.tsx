import { Table } from "antd";
import type { TableProps } from "antd";
import Card from "@/components/ui/card/Card";

export default function SettingsTable<T extends object>(props: TableProps<T>) {
  return (
    <Card className="overflow-hidden border border-border">
      <Table<T>
        pagination={false}
        scroll={{ x: "max-content", y: "calc(100vh - 350px)" }}
        {...props}
      />
    </Card>
  );
}
