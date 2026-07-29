import { Button } from "antd";
import { RefreshCw } from "lucide-react";
import type { ReactNode } from "react";

interface ListToolbarProps {
  /** Chap tomondagi filterlar: SearchFilter, SelectFilter ... */
  filters?: ReactNode;
  /** O'ng tomondagi amallar: qo'shish tugmasi va h.k. */
  actions?: ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
  className?: string;
}

/**
 * Ro'yxat sahifalarining yuqori paneli.
 * Barcha modullarda filter va amal tugmalari bir xil joyda turishi uchun.
 */
export default function ListToolbar({
  filters,
  actions,
  onRefresh,
  refreshing = false,
  className = "",
}: ListToolbarProps) {
  return (
    <div
      className={`mb-3 flex flex-wrap items-center justify-between gap-3 ${className}`}
    >
      <div className="flex flex-wrap items-center gap-2">{filters}</div>
      <div className="flex flex-wrap items-center gap-2">
        {actions}
        {onRefresh && (
          <Button
            icon={<RefreshCw className="size-4" />}
            loading={refreshing}
            onClick={onRefresh}
          />
        )}
      </div>
    </div>
  );
}
