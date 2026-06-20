import { Input, Tooltip } from "antd";
import type { InputRef } from "antd";
import { ScanBarcode } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface BarcodeScannerInputProps {
  disabled?: boolean;
  loading?: boolean;
  onScan: (barcode: string) => Promise<void> | void;
}

export default function BarcodeScannerInput({
  disabled = false,
  loading = false,
  onScan,
}: BarcodeScannerInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled, loading]);

  const submit = async () => {
    const barcode = value.trim();
    if (!barcode || disabled || loading) return;
    setValue("");
    await onScan(barcode);
    inputRef.current?.focus();
  };

  return (
    <Input
      ref={inputRef}
      value={value}
      disabled={disabled}
      onChange={(event) => setValue(event.target.value)}
      onPressEnter={() => void submit()}
      placeholder={
        disabled
          ? "Avval savdo hujjatini yarating"
          : "Barcode skanerlang yoki qo'lda kiriting"
      }
      size="large"
      autoComplete="off"
      suffix={
        <Tooltip title="Barcode skaneri">
          <ScanBarcode className="size-5 text-slate-500" />
        </Tooltip>
      }
    />
  );
}
