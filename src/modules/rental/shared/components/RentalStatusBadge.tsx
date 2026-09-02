import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";

interface RentalStatusBadgeProps {
  statusId?: number | null;
  statusName?: string | null;
}

export default function RentalStatusBadge({
  statusId,
  statusName,
}: RentalStatusBadgeProps) {
  return <ProcessStatusBadge statusId={statusId} statusName={statusName} />;
}
