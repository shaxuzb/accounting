import type { ReactNode } from "react";
import AccountingReportTabs from "./AccountingReportTabs";

interface Props {
  children: ReactNode;
}

export default function AccountingReportPageShell({ children }: Props) {
  return (
    <div className="space-y-4">
      <AccountingReportTabs />

      {children}
    </div>
  );
}
