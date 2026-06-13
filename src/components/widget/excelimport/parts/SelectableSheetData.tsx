import { Button, ConfigProvider, Table, type TableColumnType } from "antd";
import SelectKeySheet from "./SelectKeySheet";
import type { FormikProps } from "formik";
import type { SelectBoxOptions } from "@/modules/purchase";
import { useState, type FC } from "react";
import LineClampCell from "../../text/LineClampCell";

type ExcelRow = Record<string, unknown>;
type FormValues = object;

interface SelectableSheetDataProps {
  excelData: ExcelRow[];
  setData: React.Dispatch<React.SetStateAction<ExcelRow[]>>;
  formik: FormikProps<FormValues>;
  selectBoxOptions: SelectBoxOptions[];
  setSelectBoxOptions: React.Dispatch<React.SetStateAction<SelectBoxOptions[]>>;
}

const SelectableSheetData: FC<SelectableSheetDataProps> = (props) => {
  const { excelData, setData, formik, selectBoxOptions, setSelectBoxOptions } =
    props;
  const [newData, setNewData] = useState<ExcelRow[]>([]);

  const tableSource = excelData.map((item, index) => ({
    Tartib: index + 1,
    ...item,
  }));

  const tableColumnLabels: TableColumnType<ExcelRow>[] = Object.keys(
    tableSource[0] || {},
  ).map((key, index) => ({
    dataIndex: key,
    title: key,
    width: index === 0 ? 50 : 230,
    align: "center",
    render: (value: unknown) => (
      <LineClampCell text={value == null ? null : String(value)} />
    ),
  }));

  const handleChangeSelectBox = (value: string, type: string) => {
    setSelectBoxOptions((prev) =>
      prev.map((option) =>
        option.code === value ? { ...option, disabled: true } : option,
      ),
    );

    setNewData((prevData) =>
      excelData.map((item, i) => ({
        ...prevData[i],
        [value]: item[type],
      })),
    );
  };

  const handleClearSelectBox = (value: string) => {
    setSelectBoxOptions((prev) =>
      prev.map((option) =>
        option.code === value ? { ...option, disabled: false } : option,
      ),
    );

    setNewData((prevData) =>
      prevData.map((item) => {
        const newItem = { ...item };
        delete newItem[value];
        return newItem;
      }),
    );
  };

  const handleSaveData = () => {
    const finalData = newData.map((item, index) => ({
      ...item,
      indexId: index + 1,
    }));
    setSelectBoxOptions((prev) =>
      prev.map((item) => ({ ...item, disabled: false })),
    );
    setData(finalData);
  };

  return (
    <div>
      <div className="rounded-lg relative">
        <ConfigProvider
          theme={{
            components: {
              Table: {
                fontSize: 15,
                cellFontSize: 12,
              },
            },
          }}
        >
          <Table
            columns={tableColumnLabels}
            dataSource={excelData?.slice(0, 5).map((item, index) => ({
              ...item,
              indexId: index + 1,
              key: index + 1,
            }))}
            className="excel-table"
            scroll={{
              x: "max-content",
            }}
            pagination={false}
            summary={() => {
              return (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    {tableColumnLabels.map((column, index) => (
                      <Table.Summary.Cell
                        key={String(column.dataIndex)}
                        index={index}
                        align="center"
                      >
                        {column.dataIndex !== "indexId" && index !== 0 ? (
                          <SelectKeySheet
                            formik={formik}
                            column={column}
                            handleChangeSelectBox={handleChangeSelectBox}
                            setSelectBoxOptions={setSelectBoxOptions}
                            handleClearSelectBox={handleClearSelectBox}
                            selectBoxOptions={selectBoxOptions}
                          />
                        ) : (
                          <span></span>
                        )}
                      </Table.Summary.Cell>
                    ))}
                  </Table.Summary.Row>
                </Table.Summary>
              );
            }}
          />
        </ConfigProvider>
      </div>
      <div className="mt-5 flex justify-center items-center">
        <Button
          type="primary"
          disabled={selectBoxOptions.some((item) => !item.disabled)}
          size="large"
          onClick={() => handleSaveData()}
        >
          Saqlash
        </Button>
      </div>
    </div>
  );
};

export default SelectableSheetData;
