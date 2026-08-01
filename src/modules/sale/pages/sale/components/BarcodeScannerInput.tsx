import { Input, Tooltip } from "antd";
import type { InputRef } from "antd";
import { ScanBarcode } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useBarcodeScanner } from "../hooks";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const [value, setValue] = useState("");
  const inputRef = useRef<InputRef>(null);

  useBarcodeScanner({
    onScan,
    enabled: !disabled && !loading,
  });

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
          ? t("sale.messages.createDocumentFirst")
          : t("sale.messages.scanBarcodeOrEnter")
      }
      size="large"
      autoComplete="off"
      suffix={
        <Tooltip title={t("sale.fields.barcodeScanner")}>
          <ScanBarcode className="size-5 text-slate-500" />
        </Tooltip>
      }
    />
  );
}
