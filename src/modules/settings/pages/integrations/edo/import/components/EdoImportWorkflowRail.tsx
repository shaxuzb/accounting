import {
  Check,
  CircleAlert,
  FileSearch,
  GitMerge,
  PackageCheck,
  ScanSearch,
} from "lucide-react";

export type EdoImportSection =
  | "DISCOVERY"
  | "CANDIDATES"
  | "RESOLUTION"
  | "IMPORT";

interface EdoImportWorkflowRailProps {
  active: EdoImportSection;
  onChange: (section: EdoImportSection) => void;
  hasJob: boolean;
  mappingRequiredCount?: number;
  readyCount?: number;
  failedCount?: number;
}

const steps = [
  {
    id: "DISCOVERY" as const,
    eyebrow: "01 · Qidiruv",
    title: "Preflight",
    description: "Davr va provider holati",
    icon: ScanSearch,
  },
  {
    id: "CANDIDATES" as const,
    eyebrow: "02 · Hujjatlar",
    title: "Candidates",
    description: "Topilgan EDO hujjatlari",
    icon: FileSearch,
  },
  {
    id: "RESOLUTION" as const,
    eyebrow: "03 · Tayyorlash",
    title: "Mapping va konfliktlar",
    description: "Master data va marking",
    icon: GitMerge,
  },
  {
    id: "IMPORT" as const,
    eyebrow: "04 · Natija",
    title: "Purchase Draft",
    description: "Import, progress va xatolar",
    icon: PackageCheck,
  },
];

export default function EdoImportWorkflowRail({
  active,
  onChange,
  hasJob,
  mappingRequiredCount = 0,
  readyCount = 0,
  failedCount = 0,
}: EdoImportWorkflowRailProps) {
  const badges: Partial<Record<EdoImportSection, number>> = {
    CANDIDATES: readyCount + mappingRequiredCount,
    RESOLUTION: mappingRequiredCount,
    IMPORT: failedCount,
  };

  return (
    <nav
      aria-label="EDO import bosqichlari"
      className="grid gap-2 lg:grid-cols-4"
    >
      {steps.map((step, index) => {
        const Icon = step.icon;
        const disabled = index > 0 && !hasJob;
        const selected = active === step.id;
        const badge = badges[step.id] ?? 0;
        return (
          <button
            key={step.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(step.id)}
            className={`group relative min-h-28 overflow-hidden rounded-xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 ${
              selected
                ? "border-brand/35 bg-brand-soft shadow-sm"
                : "border-border bg-primary-bg hover:border-brand/25 hover:bg-surface-muted/40"
            } ${disabled ? "cursor-not-allowed opacity-45" : ""}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary-text">
                  {step.eyebrow}
                </div>
                <div className="mt-2 font-semibold text-heading">
                  {step.title}
                </div>
                <div className="mt-1 text-xs text-secondary-text">
                  {step.description}
                </div>
              </div>
              <span
                className={`grid size-9 shrink-0 place-items-center rounded-lg ${
                  selected
                    ? "bg-brand text-white"
                    : "bg-surface-muted text-secondary-text group-hover:text-brand"
                }`}
              >
                <Icon className="size-4" />
              </span>
            </div>
            {badge > 0 && (
              <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-primary-bg px-2 py-1 text-[11px] font-semibold text-heading shadow-sm">
                {step.id === "IMPORT" ? (
                  <CircleAlert className="size-3 text-danger" />
                ) : (
                  <Check className="size-3 text-brand" />
                )}
                {badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
