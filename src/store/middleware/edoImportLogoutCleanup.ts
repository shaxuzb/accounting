import type { Middleware } from "@reduxjs/toolkit";
import type { AuthToken } from "@/shared/types";
import { logout } from "../features/authSlice";

export const ACTIVE_EDO_IMPORT_JOB_KEY = "accounting:edo-import:active-job";
const terminalStatuses = new Set(["COMPLETED", "FAILED", "CANCELLED"]);
const activeBulkStatuses = new Set([
  "QUEUED",
  "RUNNING",
  "PAUSED",
  "CANCEL_REQUESTED",
]);

interface ActiveEdoImportJob {
  jobId: number;
  organizationId: number;
  userId: number;
}

interface OrganizationStorageValue {
  id?: number;
}

const readJson = <T>(key: string): T | null => {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
};

const getAuthContext = () => {
  const auth = readJson<AuthToken>("login");
  const organization = readJson<OrganizationStorageValue>("org");
  const organizationId = organization?.id ?? auth?.user?.organizationId ?? 0;

  return {
    auth,
    organizationId,
    userId: auth?.user?.id ?? 0,
  };
};

const readActiveJob = (): ActiveEdoImportJob | null => {
  try {
    const value = localStorage.getItem(ACTIVE_EDO_IMPORT_JOB_KEY);
    if (!value) return null;

    const job = JSON.parse(value) as ActiveEdoImportJob;
    return Number.isInteger(job.jobId) && job.jobId > 0 ? job : null;
  } catch {
    return null;
  }
};

export const clearActiveEdoImportJob = (jobId?: number) => {
  const activeJob = readActiveJob();
  if (jobId && activeJob?.jobId !== jobId) return;

  localStorage.removeItem(ACTIVE_EDO_IMPORT_JOB_KEY);
};

export const syncActiveEdoImportJob = (jobId: number, status: string) => {
  if (terminalStatuses.has(status)) {
    clearActiveEdoImportJob(jobId);
    return;
  }

  const { auth, organizationId, userId } = getAuthContext();
  if (!auth?.token || !organizationId || !userId) return;

  const activeJob: ActiveEdoImportJob = {
    jobId,
    organizationId,
    userId,
  };
  localStorage.setItem(
    ACTIVE_EDO_IMPORT_JOB_KEY,
    JSON.stringify(activeJob),
  );
};

export const getActiveEdoImportJobId = () => {
  const activeJob = readActiveJob();
  if (!activeJob) return 0;

  const { auth, organizationId, userId } = getAuthContext();
  const belongsToCurrentSession =
    Boolean(auth?.token) &&
    activeJob.organizationId === organizationId &&
    activeJob.userId === userId;

  if (!belongsToCurrentSession) {
    clearActiveEdoImportJob();
    return 0;
  }

  return activeJob.jobId;
};

let activeCancellation: Promise<boolean> | null = null;

const cancelActiveEdoImportJobRequest = async () => {
  const activeJob = readActiveJob();
  const { auth, organizationId, userId } = getAuthContext();

  if (
    !activeJob ||
    !auth?.token ||
    activeJob.organizationId !== organizationId ||
    activeJob.userId !== userId
  ) {
    clearActiveEdoImportJob();
    return false;
  }

  const apiBaseUrl = `${import.meta.env.VITE_API_BASE_URL_PATH}/api`;
  const headers = new Headers({
    Accept: "application/json",
    Authorization: `Bearer ${auth.token}`,
    "X-Language": localStorage.getItem("lang") ?? "uz",
    "X-OrganizationId": String(organizationId),
  });

  const waitFor = <T,>(request: Promise<T>) =>
    Promise.race([
      request,
      new Promise<null>((resolve) => {
        window.setTimeout(() => resolve(null), 5000);
      }),
    ]);

  // Bulk cancel is a separate backend operation. Check its status first so
  // logout does not leave a background worker running after the session ends.
  const bulkStatusRequest = fetch(
    `${apiBaseUrl}/purchase-docs/edo-imports/${activeJob.jobId}/bulk-import/status`,
    { method: "GET", headers, keepalive: true },
  )
    .then(async (response) =>
      response.ok
        ? ((await response.json()) as { status?: string })
        : null,
    )
    .catch(() => null);
  const bulkStatus = await waitFor(bulkStatusRequest);

  if (bulkStatus && activeBulkStatuses.has(bulkStatus.status ?? "")) {
    await fetch(
      `${apiBaseUrl}/purchase-docs/edo-imports/${activeJob.jobId}/bulk-import/cancel`,
      { method: "POST", headers, keepalive: true },
    ).catch(() => null);
  }

  // keepalive lets the request finish even when logout immediately navigates
  // away and unmounts the authenticated application tree.
  const jobCancelRequest = fetch(
    `${apiBaseUrl}/purchase-docs/edo-imports/${activeJob.jobId}/cancel`,
    { method: "POST", headers, keepalive: true },
  ).catch(() => null);
  const response = await waitFor(jobCancelRequest);
  const cancelled = Boolean(
    response && (response.ok || response.status === 404),
  );

  if (cancelled) {
    clearActiveEdoImportJob(activeJob.jobId);
  }

  return cancelled;
};

export const cancelActiveEdoImportJob = () => {
  if (activeCancellation) return activeCancellation;

  activeCancellation = cancelActiveEdoImportJobRequest().finally(() => {
    activeCancellation = null;
  });

  return activeCancellation;
};

export const edoImportLogoutCleanupMiddleware: Middleware =
  () => (next) => (action) => {
    if (logout.match(action)) {
      // This must run before the reducer clears the token and organization.
      void cancelActiveEdoImportJob();
    }

    return next(action);
  };
