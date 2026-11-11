import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { $axiosPrivate } from "@/services/AxiosService";

export type OneCConnectionStatus = "PENDING" | "ACTIVE" | "REVOKED";
export type OneCRunKind = "LOAD" | "METADATA" | "CATALOGS" | "OPENING" | "DOCUMENTS" | "SYNC" | "OSV";
export type OneCRunStatus =
  | "QUEUED"
  | "EXTRACTING"
  | "RECEIVED"
  | "ANALYZING"
  | "PREVIEW"
  | "IMPORT_QUEUED"
  | "IMPORTING"
  | "DONE"
  | "FAILED"
  | "CANCELLED";

/** What the analysis says the import would do with an object. */
export type OneCPreviewStatus = "NEW_ENTITY" | "MATCHED" | "NEEDS_MAPPING" | "INVALID" | "UNSUPPORTED" | "SKIP";

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

/** Someone (the 1C side or the server) is working on the run: its counts move. */
export const ACTIVE_RUN_STATUSES: OneCRunStatus[] = ["QUEUED", "EXTRACTING", "RECEIVED", "ANALYZING", "IMPORT_QUEUED", "IMPORTING"];

/** The run holds the connection: a new «Yuklash» waits until it is imported or cancelled. */
export const OPEN_RUN_STATUSES: OneCRunStatus[] = [...ACTIVE_RUN_STATUSES, "PREVIEW"];

export interface OneCPreviewSection {
  kind: string;
  typeName: string;
  synonym: string | null;
  total: number;
  selected: number;
  newEntity: number;
  matched: number;
  needsMapping: number;
  invalid: number;
  unsupported: number;
  skip: number;
  imported: number;
  failed: number;
}

export interface OneCPreviewObject {
  id: number;
  kind: string;
  typeName: string;
  ref: string;
  presentation: string | null;
  docNumber: string | null;
  docDate: string | null;
  counterpartyName: string | null;
  amount: number | null;
  isDeleted: boolean;
  selected: boolean;
  previewStatus: OneCPreviewStatus | null;
  previewNote: string | null;
  status: string;
  error: string | null;
  hasOverrides: boolean;
}

export interface OneCObjectDetail {
  row: OneCPreviewObject;
  runId: number | null;
  payload: OneCPayload;
  overrides: { fields?: Record<string, unknown> } | null;
}

/** A 1C object as the 1C side sent it. */
export interface OneCPayload {
  kind: string;
  type: string;
  ref: string;
  presentation?: string;
  number?: string;
  date?: string;
  posted?: boolean;
  deleted?: boolean;
  fields?: Record<string, unknown>;
  tables?: Record<string, Record<string, unknown>[]>;
  entries?: Record<string, unknown>[];
}

export interface OneCAccountRow {
  code: string;
  name: string | null;
  uses: number;
  accountId: number | null;
  accountCode: string | null;
  accountName: string | null;
  isMapped: boolean;
}

export interface OneCTargetAccount {
  id: number;
  number: string;
  name: string;
}

export interface OneCPreviewFilter {
  typeName?: string;
  previewStatus?: string;
  search?: string;
  page: number;
  pageSize: number;
}

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

export const useOneCRun = (runId: number) =>
  useQuery({
    queryKey: [...keys.all, "run", runId],
    queryFn: () => $axiosPrivate.get<OneCRun>(`/onec/runs/${runId}`).then((response) => response.data),
    refetchInterval: (query) => (query.state.data && ACTIVE_RUN_STATUSES.includes(query.state.data.status) ? 2_000 : false),
  });

/** The preview's sections; read again when the run moves (an analysis redone, the import's counts). */
export const useOneCPreview = (runId: number, version: string) =>
  useQuery({
    queryKey: [...keys.all, "preview", runId, version],
    queryFn: () => $axiosPrivate.get<OneCPreviewSection[]>(`/onec/runs/${runId}/preview`).then((response) => response.data),
    placeholderData: (previous) => previous,
  });

export const useOneCPreviewObjects = (runId: number, filter: OneCPreviewFilter, version: string, enabled: boolean) =>
  useQuery({
    queryKey: [...keys.all, "preview-objects", runId, filter, version],
    queryFn: () =>
      $axiosPrivate
        .get<{ items: OneCPreviewObject[]; totalCount: number }>(`/onec/runs/${runId}/preview/objects`, { params: filter })
        .then((response) => response.data),
    enabled,
    placeholderData: (previous) => previous,
  });

export const useOneCObject = (objectId: number | null) =>
  useQuery({
    queryKey: [...keys.all, "object", objectId],
    queryFn: () => $axiosPrivate.get<OneCObjectDetail>(`/onec/objects/${objectId}`).then((response) => response.data),
    enabled: objectId !== null,
  });

export const useOneCRunAccounts = (runId: number, version: string, enabled: boolean) =>
  useQuery({
    queryKey: [...keys.all, "accounts", runId, version],
    queryFn: () => $axiosPrivate.get<OneCAccountRow[]>(`/onec/runs/${runId}/accounts`).then((response) => response.data),
    enabled,
  });

export const useOneCOurAccounts = (enabled: boolean) =>
  useQuery({
    queryKey: [...keys.all, "our-accounts"],
    queryFn: () => $axiosPrivate.get<OneCTargetAccount[]>("/onec/our-accounts").then((response) => response.data),
    enabled,
    staleTime: 60_000,
  });

export const useLoadOneC = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ connectionId, dateFrom, dateTo }: { connectionId: number; dateFrom: string; dateTo: string }) =>
      $axiosPrivate
        .post<{ id: number }>(`/onec/connections/${connectionId}/load`, { dateFrom, dateTo })
        .then((response) => response.data),
    onSuccess: invalidate,
  });
};

export const useUpdateOneCObject = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: number; selected?: boolean; overrides?: { fields: Record<string, unknown> } }) =>
      $axiosPrivate.patch<OneCObjectDetail>(`/onec/objects/${id}`, body).then((response) => response.data),
    onSuccess: invalidate,
  });
};

export const useSelectOneC = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ runId, ...body }: { runId: number; typeName?: string; previewStatus?: string; selected: boolean }) =>
      $axiosPrivate.post<{ count: number }>(`/onec/runs/${runId}/preview/select`, body).then((response) => response.data),
    onSuccess: invalidate,
  });
};

export const useSaveOneCAccounts = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ runId, items }: { runId: number; items: { code: string; accountId: number | null }[] }) =>
      $axiosPrivate.put(`/onec/runs/${runId}/accounts`, { items }),
    onSuccess: invalidate,
  });
};

export const useStartOneCImport = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (runId: number) => $axiosPrivate.post(`/onec/runs/${runId}/import`),
    onSuccess: invalidate,
  });
};

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

/** The agent (.exe), saved under its own name. */
export const downloadOneCFile = async (kind: "agent") => {
  const response = await $axiosPrivate.get<Blob>(`/onec/downloads/${kind}`, { responseType: "blob" });
  const url = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = "HisobKitob1CAgent.exe";
  link.click();
  URL.revokeObjectURL(url);
};
