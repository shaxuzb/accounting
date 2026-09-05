import { Tag } from "antd";
import {
  getAccountingPolicySourceStatusLabel,
  getAccountingPolicySourceStatusTone,
} from "../utils/status";
import type { SourceStatus } from "../types/type";

export default function PolicyStatusBadge({
  status,
}: {
  status: SourceStatus;
}) {
  return (
    <Tag color={getAccountingPolicySourceStatusTone(status)}>
      {getAccountingPolicySourceStatusLabel(status)}
    </Tag>
  );
}
