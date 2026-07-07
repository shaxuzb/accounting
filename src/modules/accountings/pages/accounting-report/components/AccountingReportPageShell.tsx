import { Typography } from "antd";
import type { ReactNode } from "react";
import AccountingReportTabs from "./AccountingReportTabs";

interface Props {
  title: string;
  description: string;
  children: ReactNode;
}

export default function AccountingReportPageShell({
  title,
  description,
  children,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Typography.Title level={3} className="mb-0! text-text!">
          {title}
        </Typography.Title>
        <p className="text-sm text-secondary-text">{description}</p>
      </div>

      <AccountingReportTabs />

      {children}
    </div>
  );
}
