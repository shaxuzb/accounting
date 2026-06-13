import useWindowSize from "@/shared/hooks/useWindowSize";
import { Table, type TableColumnType } from "antd";
import { type FC } from "react";

type ExcelRow = Record<string, unknown>;

interface SelectableSheetDataProps {
  excelData: ExcelRow[];
}

const SheetDataTable: FC<SelectableSheetDataProps> = (props) => {
  const { height } = useWindowSize();
  const { excelData } = props;
  const tableColumnLabels: TableColumnType<ExcelRow>[] = Object.keys(
    excelData[0] || {},
  ).map((key, index) => ({
    dataIndex: key,
    title: key,
    width: index === 0 ? 50 : 100,
    align: "center",
    ellipsis: true,
  }));

  return (
    <div className="rounded-lg relative">
      <Table
        columns={tableColumnLabels}
        dataSource={excelData?.map((item, index) => ({
          ...item,
          indexId: index + 1,
          key: index + 1,
        }))}
        bordered
        virtual
        scroll={{ y: height - 400 }}
        pagination={false}
      />
    </div>
  );
};

export default SheetDataTable;
