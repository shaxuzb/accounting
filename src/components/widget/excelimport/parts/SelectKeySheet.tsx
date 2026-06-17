import type { SelectBoxOptions } from "@/modules/purchase/pages/purchase";
import {
  Button,
  Divider,
  Input,
  Select,
  Space,
  type InputRef,
  type TableColumnType,
} from "antd";
import { getIn, type FormikProps } from "formik";
import { Plus } from "lucide-react";
import { useRef, useState, type FC, type SetStateAction } from "react";

type FormValues = object;

type ExcelRow = Record<string, unknown>;

interface SelectKeySheetProps {
  selectBoxOptions: SelectBoxOptions[];
  handleChangeSelectBox: (value: string, type: string) => void;
  column: TableColumnType<ExcelRow>;
  formik: FormikProps<FormValues>;
  setSelectBoxOptions: React.Dispatch<SetStateAction<SelectBoxOptions[]>>;
  handleClearSelectBox: (value: string) => void;
}

const SelectKeySheet: FC<SelectKeySheetProps> = (props) => {
  const {
    selectBoxOptions,
    handleChangeSelectBox,
    formik,
    handleClearSelectBox,
    setSelectBoxOptions,
    column,
  } = props;
  const [name, setName] = useState("");
  const inputRef = useRef<InputRef>(null);
  const [value, setValue] = useState("");

  const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const addItem = (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>,
  ) => {
    e.preventDefault();
    setSelectBoxOptions([
      ...selectBoxOptions,
      {
        code: name.toLowerCase().split(" ").join("_"),
        label: name,
        disabled: false,
        new: true,
      },
    ]);
    setName("");
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const isCharacter = Boolean(getIn(formik.values, "isCharacter"));

  return (
    <Select
      size="middle"
      value={value}
      placeholder="Kalitni tanlang"
      allowClear
      style={{ width: 200 }}
      onClear={() => {
        handleClearSelectBox(
          selectBoxOptions.find((item) => item.code === value)?.code || "",
        );
        setValue("");
      }}
      options={selectBoxOptions.map((option) => ({
        label: option.label,
        value: option.code,
        disabled: option.disabled,
      }))}
      popupRender={
        isCharacter
          ? (menu) => (
              <>
                {menu}
                <Divider style={{ margin: "8px 0" }} />
                <Space style={{ padding: "0 8px 4px" }}>
                  <Input
                    placeholder="Yangi tavsif"
                    ref={inputRef}
                    value={name}
                    onChange={onNameChange}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                  <Button type="text" icon={<Plus />} onClick={addItem} />
                </Space>
              </>
            )
          : undefined
      }
      onSelect={(selectedValue) => {
        const nextValue = String(selectedValue);
        setValue(nextValue);
        if (value) {
          handleClearSelectBox(value);
        }
        handleChangeSelectBox(nextValue, String(column.dataIndex));
      }}
    />
  );
};

export default SelectKeySheet;




