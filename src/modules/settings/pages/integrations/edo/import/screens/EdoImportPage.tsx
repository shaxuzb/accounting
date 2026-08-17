import { Alert, Button, Tag } from "antd";
import { ArrowLeft, DatabaseZap, ShieldCheck } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import Card from "@/components/ui/card/Card";
import EdoImportCandidatesPanel from "../components/EdoImportCandidatesPanel";
import EdoImportDiscoveryPanel from "../components/EdoImportDiscoveryPanel";
import EdoImportDraftPanel from "../components/EdoImportDraftPanel";
import EdoImportResolutionPanel from "../components/EdoImportResolutionPanel";
import EdoImportWorkflowRail, {
  type EdoImportSection,
} from "../components/EdoImportWorkflowRail";
import { useEdoImportJob } from "../hooks";
import type { EdoImportJobDto } from "../types";
import { getImportErrorMessage, importStatusTag } from "../components/presentation";
import { getActiveEdoImportJobId } from "@/store/middleware/edoImportLogoutCleanup";

const sections = new Set<EdoImportSection>([
  "DISCOVERY",
  "CANDIDATES",
  "RESOLUTION",
  "IMPORT",
]);

export default function EdoImportPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const rawJobId = Number(searchParams.get("jobId"));
  const jobId =
    Number.isInteger(rawJobId) && rawJobId > 0
      ? rawJobId
      : getActiveEdoImportJobId();
  const rawSection = searchParams.get("stage") as EdoImportSection | null;
  const activeSection = rawSection && sections.has(rawSection) ? rawSection : "DISCOVERY";
  const jobQuery = useEdoImportJob(jobId, jobId > 0);
  const job = jobQuery.data;

  const setParams = (values: { jobId?: number; stage?: EdoImportSection }) => {
    const next = new URLSearchParams(searchParams);
    if (values.jobId) next.set("jobId", String(values.jobId));
    if (values.stage) next.set("stage", values.stage);
    setSearchParams(next, { replace: true });
  };

  const onJobCreated = (created: EdoImportJobDto) => {
    setParams({ jobId: created.id, stage: "DISCOVERY" });
  };

  let currentPanel;
  if (activeSection === "DISCOVERY") {
    currentPanel = (
        <EdoImportDiscoveryPanel
          job={job}
          jobLoading={jobQuery.isLoading || jobQuery.isFetching}
          jobError={jobQuery.error}
          onJobCreated={onJobCreated}
          onRefresh={() => void jobQuery.refetch()}
          onOpenAuthentication={() => navigate("..")}
        />
      );
  } else if (!jobId) {
    currentPanel = (
        <Alert
          type="info"
          showIcon
          message="Avval preflight job yarating"
          description="Candidate, mapping va import ma’lumotlari job ID bilan olinadi."
          action={<Button onClick={() => setParams({ stage: "DISCOVERY" })}>Preflightga qaytish</Button>}
        />
      );
  } else if (activeSection === "CANDIDATES") {
    currentPanel = <EdoImportCandidatesPanel jobId={jobId} />;
  } else if (activeSection === "RESOLUTION") {
    currentPanel = <EdoImportResolutionPanel jobId={jobId} />;
  } else {
    currentPanel = <EdoImportDraftPanel jobId={jobId} jobStatus={job?.status} />;
  }

  return (
    <div className="w-full space-y-4">
      <Card className="relative overflow-hidden border border-border p-5">
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-72 overflow-hidden lg:block" aria-hidden>
          <div className="absolute -right-16 -top-24 size-64 rounded-full border-[34px] border-brand/5" />
          <div className="absolute bottom-5 right-10 grid grid-cols-6 gap-1 opacity-30">
            {Array.from({ length: 24 }, (_, index) => (
              <span key={index} className={`size-1.5 rounded-full ${index % 5 === 0 ? "bg-brand" : "bg-border"}`} />
            ))}
          </div>
        </div>

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <Button
              type="text"
              icon={<ArrowLeft className="size-4" />}
              onClick={() => navigate("..")}
              className="-ml-3 mb-2"
            >
              EDO boshqaruviga qaytish
            </Button>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand">
                <DatabaseZap className="size-4" /> Tarixiy EDO → Purchase
              </span>
              {job ? importStatusTag(job.status) : <Tag className="m-0">Yangi job</Tag>}
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-heading sm:text-3xl">
              Hujjatni topishdan Draftgacha — bitta nazorat oqimi
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-secondary-text">
              DIDOX va EDOCS xarid hujjatlarini tekshiring, master data konfliktlarini hal qiling va posting qilmasdan Purchase Draft yarating.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3 rounded-xl border border-success/20 bg-success/5 px-4 py-3">
            <ShieldCheck className="size-5 text-success" />
            <div>
              <div className="text-sm font-semibold text-heading">Organization scoped</div>
              <div className="text-xs text-secondary-text">X-OrganizationId avtomatik yuboriladi</div>
            </div>
          </div>
        </div>
      </Card>

      <EdoImportWorkflowRail
        active={activeSection}
        onChange={(stage) => setParams({ stage })}
        hasJob={jobId > 0}
        readyCount={job?.readyCount}
        mappingRequiredCount={job?.mappingRequiredCount}
        failedCount={job?.status === "FAILED" ? 1 : 0}
      />

      {jobQuery.isError && activeSection !== "DISCOVERY" && (
        <Alert type="error" showIcon message={getImportErrorMessage(jobQuery.error)} />
      )}

      {currentPanel}
    </div>
  );
}
