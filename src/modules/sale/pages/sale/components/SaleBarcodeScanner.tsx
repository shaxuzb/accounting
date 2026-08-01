import { ScanBarcode } from "lucide-react";
import BarcodeScannerInput from "./BarcodeScannerInput";
import { useTranslation } from "react-i18next";

interface Props {
  onScan: (markingNumber: string) => Promise<void> | void;
}

export default function SaleBarcodeScanner({ onScan }: Props) {
  const { t } = useTranslation();

  return (
    <div className="grid min-h-36 items-center gap-4 rounded-md border border-dashed border-blue-400 bg-blue-50/40 p-4 sm:grid-cols-[88px_minmax(0,1fr)]">
      <div className="hidden size-20 items-center justify-center rounded-md bg-blue-600 text-white shadow-sm sm:flex">
        <ScanBarcode className="size-11" />
      </div>
      <div className="min-w-0 space-y-2">
        <div>
          <h2 className="text-base font-semibold text-blue-700">
            {t("sale.actions.scanMarking")}
          </h2>
          <p className="text-sm text-slate-500">
            {t("sale.messages.scanOrEnter")}
          </p>
        </div>
        <BarcodeScannerInput onScan={onScan} />
      </div>
    </div>
  );
}
