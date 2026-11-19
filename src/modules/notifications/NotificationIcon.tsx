import {
  AlertTriangle,
  BadgePercent,
  Bell,
  CheckCircle2,
  CircleAlert,
  FileCheck2,
  HeartPulse,
  Info,
  Megaphone,
  Wallet,
} from "lucide-react";

const meta: Record<string, { icon: typeof Bell; className: string }> = {
  info: { icon: Info, className: "bg-blue-50 text-blue-600 dark:bg-blue-950/40" },
  success: { icon: CheckCircle2, className: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40" },
  warning: { icon: AlertTriangle, className: "bg-amber-50 text-amber-600 dark:bg-amber-950/40" },
  error: { icon: CircleAlert, className: "bg-rose-50 text-rose-600 dark:bg-rose-950/40" },
  tax: { icon: BadgePercent, className: "bg-violet-50 text-violet-600 dark:bg-violet-950/40" },
  news: { icon: Megaphone, className: "bg-sky-50 text-sky-600 dark:bg-sky-950/40" },
  health: { icon: HeartPulse, className: "bg-orange-50 text-orange-600 dark:bg-orange-950/40" },
  doc_approved: { icon: FileCheck2, className: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40" },
  payment_due: { icon: Wallet, className: "bg-amber-50 text-amber-600 dark:bg-amber-950/40" },
};

/** The notification's kind as a coloured icon: an error red, a warning amber, a tax note violet … */
export default function NotificationIcon({ code, size = "md" }: { code: string; size?: "sm" | "md" }) {
  const { icon: Icon, className } = meta[code] ?? { icon: Bell, className: "bg-gray-100 text-gray-600" };
  const box = size === "sm" ? "size-8" : "size-10";
  return (
    <span className={`grid shrink-0 place-items-center rounded-full ${box} ${className}`}>
      <Icon className={size === "sm" ? "size-4" : "size-5"} />
    </span>
  );
}
