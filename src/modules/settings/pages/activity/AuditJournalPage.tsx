import Card from "@/components/ui/card/Card";
import AuditJournal from "./AuditJournal";

/** Sozlamalar → Harakatlar jurnali: everything the organization's users did. */
export default function AuditJournalPage() {
  return (
    <Card className="p-4">
      <AuditJournal />
    </Card>
  );
}
