import { Button, Modal, Radio, Steps, Upload, type UploadProps } from "antd";
import * as XLSX from "xlsx";
import SheetDataTable from "./parts/SheetDataTable";
import SelectableSheetData from "./parts/SelectableSheetData";
import { UploadIcon, X } from "lucide-react";
import Card from "@/components/ui/card/Card";
import type { FormikProps } from "formik";
import type { SelectBoxOptions } from "@/modules/purchase";
import { useState, type FC } from "react";
import LineClampCell from "../text/LineClampCell";

type ExcelRow = Record<string, unknown>;
type FormValues = object;

interface WorkbookWithMeta extends XLSX.WorkBook {
  fileName?: string;
}

interface ExcelImportFileProps {
  setData: React.Dispatch<React.SetStateAction<ExcelRow[]>>;
  excelData: ExcelRow[];
  formik: FormikProps<FormValues>;
  setSelectBoxOptions: React.Dispatch<React.SetStateAction<SelectBoxOptions[]>>;
  selectBoxOptions: SelectBoxOptions[];
  disabled?: boolean;
}

const ExcelImportFile: FC<ExcelImportFileProps> = (propsSheet) => {
  const {
    setData,
    excelData,
    formik,
    selectBoxOptions,
    disabled = false,
    setSelectBoxOptions,
  } = propsSheet;
  const { Dragger } = Upload;
  const [sheetData, setSheetData] = useState<WorkbookWithMeta | null>(null);
  const [current, setCurrent] = useState<number>(0);
  const [value, setValue] = useState<string>("");
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const props: UploadProps = {
    name: "file",
    multiple: false,
    accept: ".xlsx,.xls",
    onChange(info) {
      const { status } = info.file;
      if (status === "error") {
        const file = info.file.originFileObj;
        if (file && file instanceof Blob) {
          const reader = new FileReader();
          reader.readAsArrayBuffer(file);
          reader.onload = (e) => {
            const data = e.target?.result;
            if (data) {
              const workbook = XLSX.read(data, {
                type: "binary",
                cellDates: true,
                cellFormula: false,
                cellHTML: false,
                cellNF: false,
                cellText: false,
                dense: true,
              });
              if (workbook.SheetNames.length === 1) {
                setValue(workbook.SheetNames[0]);
                setCurrent(1);
              }
              setSheetData({ ...workbook, fileName: file.name });
              setModalOpen(true);
            }
          };
        }
      }
    },
  };

  const handleDeleteFile = () => {
    setSheetData(null);
    setValue("");
    formik.resetForm();
    setData([]);
    setCurrent(0);
    setModalOpen(false);
  };

  const sheetJson =
    sheetData && value
      ? (XLSX.utils.sheet_to_json(sheetData.Sheets[value], {
          defval: null,
        } as XLSX.Sheet2JSONOpts) as ExcelRow[])
      : [];

  return (
    <div className="mt-4 w-full">
      {!sheetData ? (
        <Card className="w-full!">
          <Dragger disabled={disabled} {...props}>
            <div className="flex justify-center items-center my-3">
              <UploadIcon fontSize={40} />
            </div>
            <p className="ant-upload-text">
              Faylni yuklash uchun bu hududga bosing yoki sudrab olib keling
            </p>
            <p className="ant-upload-hint">
              Yagona yoki ko'p faylni yuklashni qo'llab-quvvatlaydi. Kompaniya
              ma'lumotlari yoki taqiqlangan fayllarni yuklash qat'iyan man
              etiladi.
            </p>
          </Dragger>
        </Card>
      ) : (
        <Card className="inline-block min-w-75 p-3 mb-4">
          <div className="flex gap-4 justify-between items-center w-auto">
            <h1 className="font-semibold text-base text-wrap w-full max-w-60">
              Yuklangan fayl: <LineClampCell text={sheetData.fileName ?? ""} />
            </h1>
            <Button type="primary" danger onClick={handleDeleteFile}>
              Faylni o'chirish
            </Button>
          </div>
        </Card>
      )}
      {sheetData &&
        sheetData.SheetNames &&
        sheetData.SheetNames.length > 0 &&
        excelData.length < 1 && (
          <Modal
            open={modalOpen}
            width={"100%"}
            centered
            closable={false}
            title={
              <div className="flex justify-between items-center">
                <h1 className="font-semibold text-lg">Excel import</h1>
                <Button
                  type="text"
                  icon={<X />}
                  onClick={() => {
                    handleDeleteFile();
                    setSelectBoxOptions((prev) =>
                      prev.map((item) => ({
                        ...item,
                        disabled: false,
                      })),
                    );
                    setModalOpen(false);
                  }}
                />
              </div>
            }
            footer={false}
          >
            <Steps
              current={current}
              items={[
                {
                  title: "Sheet tanlash",
                },
                {
                  title: "Ma'lumotlarni ko'chirish",
                },
                {
                  title: "Kalitni belgilash",
                },
              ]}
            />
            <div className="mt-6">
              {current === 0 && (
                <div className="flex justify-center items-center flex-col w-full">
                  <div>
                    <h1 className="font-semibold text-2xl mb-4!">
                      Sheetni tanlang:
                    </h1>
                  </div>
                  <div className="flex justify-center items-center w-full">
                    <Radio.Group
                      value={value}
                      className="flex! flex-col! gap-2!"
                      options={sheetData.SheetNames.map((sheetName) => ({
                        label: sheetName,
                        value: sheetName,
                      }))}
                      onChange={(e) => {
                        setValue(e.target.value);
                      }}
                    />
                  </div>
                  <div className="mt-5">
                    <Button
                      type="primary"
                      size="large"
                      disabled={!value}
                      onClick={() => setCurrent(current + 1)}
                    >
                      Keyingisi
                    </Button>
                  </div>
                </div>
              )}
              {current === 1 && (
                <div>
                  <SheetDataTable excelData={sheetJson} />
                  <div className="mt-5 flex justify-center items-center">
                    <Button
                      type="primary"
                      disabled={!value}
                      size="large"
                      onClick={() => setCurrent(current + 1)}
                    >
                      Keyingisi
                    </Button>
                  </div>
                </div>
              )}
              {current === 2 && (
                <SelectableSheetData
                  formik={formik}
                  setData={setData}
                  selectBoxOptions={selectBoxOptions}
                  setSelectBoxOptions={setSelectBoxOptions}
                  excelData={sheetJson}
                />
              )}
            </div>
          </Modal>
        )}
    </div>
  );
};

export default ExcelImportFile;




