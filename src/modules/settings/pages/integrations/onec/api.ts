import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { $axiosPrivate } from "@/services/AxiosService";

export type OneCConnectionStatus = "PENDING" | "ACTIVE" | "REVOKED";
export type OneCRunKind = "METADATA" | "CATALOGS" | "OPENING" | "DOCUMENTS" | "SYNC" | "OSV";
export type OneCRunStatus =
  | "QUEUED"
  | "EXTRACTING"
  | "RECEIVED"
  | "IMPORTING"
  | "DONE"
  | "FAILED"
  | "CANCELLED";

export interface OneCConnection {
  id: number;
  name: string;
  status: OneCConnectionStatus;
  clientKind: "AGENT" | "EPF" | null;
  machineName: string | null;
  basePath: string | null;
  configName: string | null;
  configSynonym: string | null;
  configVersion: string | null;
  platformVersion: string | null;
  clientVersion: string | null;
  pairingExpiresAt: string | null;
  pairedAt: string | null;
  lastSeenAt: string | null;
  isOnline: boolean;
  syncEnabled: boolean;
  syncIntervalMinutes: number;
  cutoffDate: string | null;
  createdByName: string | null;
  createdDate: string;
}

export interface OneCPairingCode {
  connectionId: number;
  code: string;
  expiresAt: string;
}

export interface OneCRun {
  id: number;
  connectionId: number;
  kind: OneCRunKind;
  dateFrom: string | null;
  dateTo: string | null;
  status: OneCRunStatus;
  requestedByName: string | null;
  createdDate: string;
  extractStartedAt: string | null;
  receivedAt: string | null;
  completedAt: string | null;
  chunkCount: number;
  objectCount: number;
  importedCount: number;
  skippedCount: number;
  failedCount: number;
  errorCode: string | null;
  errorMessage: string | null;
  extractProgress: OneCProgressPart[];
  importProgress: OneCProgressPart[];
  /** 0–100 for the stage the run is in: reading 1C, then the import here. */
  percent: number;
  heartbeatAt: string | null;
  secondsSinceHeartbeat: number | null;
  /** Is anyone on the run: null once it is finished. */
  liveness: "WORKING" | "WAITING" | "CLIENT_OFFLINE" | "STALLED" | null;
}

export interface OneCProgressPart {
  key: string;
  kind: string | null;
  total: number;
  done: number;
  imported: number;
  skipped: number;
  failed: number;
}

export interface OneCObjectIssue {
  id: number;
  kind: string;
  typeName: string;
  ref: string;
  presentation: string | null;
  status: string;
  error: string | null;
}

export interface OneCObjectStat {
  kind: string;
  typeName: string;
  status: string;
  count: number;
}

export const ACTIVE_RUN_STATUSES: OneCRunStatus[] = ["QUEUED", "EXTRACTING", "RECEIVED", "IMPORTING"];

const keys = {
  all: ["onec"] as const,
  connections: () => [...keys.all, "connections"] as const,
  runs: (connectionId: number) => [...keys.all, "runs", connectionId] as const,
  stats: (connectionId: number) => [...keys.all, "stats", connectionId] as const,
};

/** The server's message for a refused request (ProblemDetails detail), else the fallback. */
export const errorText = (error: unknown, fallback: string) =>
  (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? fallback;

export const useOneCConnections = (enabled = true) =>
  useQuery({
    queryKey: keys.connections(),
    queryFn: () => $axiosPrivate.get<OneCConnection[]>("/onec/connections").then((response) => response.data),
    enabled,
    retry: false,
    // the online mark and a pending pairing change on the client's side
    refetchInterval: 15_000,
  });

export const useOneCRuns = (connectionId: number | undefined) =>
  useQuery({
    queryKey: keys.runs(connectionId ?? 0),
    queryFn: () =>
      $axiosPrivate.get<OneCRun[]>(`/onec/connections/${connectionId}/runs`).then((response) => response.data),
    enabled: !!connectionId,
    // while a run is under way its counts move: follow them; a run queued elsewhere (the sync
    // schedule, another tab) still shows up
    refetchInterval: (query) =>
      query.state.data?.some((run) => ACTIVE_RUN_STATUSES.includes(run.status)) ? 3_000 : 10_000,
  });

export const useOneCStats = (connectionId: number | undefined, refreshKey?: string) =>
  useQuery({
    queryKey: [...keys.stats(connectionId ?? 0), refreshKey],
    queryFn: () =>
      $axiosPrivate
        .get<OneCObjectStat[]>(`/onec/connections/${connectionId}/objects/stats`)
        .then((response) => response.data),
    enabled: !!connectionId,
  });

const useInvalidate = () => {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: keys.all });
};

/** The objects of a run the import skipped or failed on, with why. */
export const useOneCRunIssues = (runId: number, enabled: boolean) =>
  useQuery({
    queryKey: [...keys.all, "issues", runId],
    queryFn: () => $axiosPrivate.get<OneCObjectIssue[]>(`/onec/runs/${runId}/issues`).then((response) => response.data),
    enabled,
  });

export const useCreateOneCConnection = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (name: string) =>
      $axiosPrivate.post<OneCPairingCode>("/onec/connections", { name }).then((response) => response.data),
    onSuccess: invalidate,
  });
};

export const useNewOneCPairingCode = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (connectionId: number) =>
      $axiosPrivate
        .post<OneCPairingCode>(`/onec/connections/${connectionId}/pairing-code`)
        .then((response) => response.data),
    onSuccess: invalidate,
  });
};

export const useRevokeOneCConnection = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (connectionId: number) => $axiosPrivate.delete(`/onec/connections/${connectionId}`),
    onSuccess: invalidate,
  });
};

export const useCreateOneCRun = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({
      connectionId,
      ...body
    }: {
      connectionId: number;
      kind: OneCRunKind;
      dateFrom?: string;
      dateTo?: string;
    }) =>
      $axiosPrivate
        .post<{ id: number }>(`/onec/connections/${connectionId}/runs`, body)
        .then((response) => response.data),
    onSuccess: invalidate,
  });
};

export const useCancelOneCRun = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (runId: number) => $axiosPrivate.post(`/onec/runs/${runId}/cancel`),
    onSuccess: invalidate,
  });
};

/** The agent (.exe) or the processing (.epf), saved under its own name. */
export const downloadOneCFile = async (kind: "agent" | "epf") => {
  const response = await $axiosPrivate.get<Blob>(`/onec/downloads/${kind}`, { responseType: "blob" });
  const url = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = kind === "agent" ? "HisobKitob1CAgent.exe" : "HisobKitob1C.epf";
  link.click();
  URL.revokeObjectURL(url);
};
