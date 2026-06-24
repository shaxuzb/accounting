import { ScanBarcode } from "lucide-react";
import BarcodeScannerInput from "./BarcodeScannerInput";

interface Props {
  onScan: (markingNumber: string) => Promise<void> | void;
}

export default function SaleBarcodeScanner({ onScan }: Props) {
  return (
    <div className="grid min-h-36 items-center gap-4 rounded-md border border-dashed border-blue-400 bg-blue-50/40 p-4 sm:grid-cols-[88px_minmax(0,1fr)]">
      <div className="hidden size-20 items-center justify-center rounded-md bg-blue-600 text-white shadow-sm sm:flex">
        <ScanBarcode className="size-11" />
      </div>
      <div className="min-w-0 space-y-2">
        <div>
          <h2 className="text-base font-semibold text-blue-700">
            Markirovka kodini skaner qiling
          </h2>
          <p className="text-sm text-slate-500">
            Skanerlang yoki kodni kiriting va Enter bosing
          </p>
        </div>
        <BarcodeScannerInput onScan={onScan} />
      </div>
    </div>
  );
}
