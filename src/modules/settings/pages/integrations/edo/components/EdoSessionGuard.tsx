import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { appEvents } from "@/shared/constants/appEvents";
import { useEdoActiveProvider, useEdoAuthSession } from "../hooks";
import { edoQueryKeys } from "../constants/queryKeys";
import {
  clearEdoAuthSession,
  isEdoAuthSessionActive,
  readEdoAuthSession,
} from "../utils/authSession";

const edoWorkspacePath = "/main/settings/integrations/edo";

export default function EdoSessionGuard({
  children,
  requireSession = false,
}: {
  children: ReactNode;
  requireSession?: boolean;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const providerQuery = useEdoActiveProvider();
  const providerCode = providerQuery.data?.code;
  const session = useEdoAuthSession(providerCode);
  const persistedSession = providerCode
    ? readEdoAuthSession(providerCode)
    : null;
  const effectiveSession = persistedSession ?? session;
  const isActive = isEdoAuthSessionActive(effectiveSession);
  const handledRef = useRef(false);

  const leaveEdoSession = useCallback(
    (messageKey: "sessionExpired" | "notConnected") => {
      if (handledRef.current) return;
      handledRef.current = true;

      if (providerCode) clearEdoAuthSession(providerCode);
      queryClient.removeQueries({ queryKey: edoQueryKeys.inboxes() });
      queryClient.removeQueries({
        queryKey: [...edoQueryKeys.all, "status"],
      });
      toast.error(t(`settings.integrations.edo.errors.${messageKey}`), {
        id: "edo-session-ended",
      });

      if (requireSession) navigate(edoWorkspacePath, { replace: true });
    },
    [navigate, providerCode, queryClient, requireSession, t],
  );

  useEffect(() => {
    const handleUnauthorized = () => leaveEdoSession("sessionExpired");
    window.addEventListener(appEvents.edoUnauthorized, handleUnauthorized);
    return () =>
      window.removeEventListener(appEvents.edoUnauthorized, handleUnauthorized);
  }, [leaveEdoSession]);

  useEffect(() => {
    if (isActive) handledRef.current = false;
    if (providerQuery.isLoading || !providerCode) return;

    if (!isActive) {
      const expired = Boolean(
        effectiveSession?.expiresAt &&
          new Date(effectiveSession.expiresAt).getTime() <= Date.now(),
      );
      if (expired || requireSession) {
        leaveEdoSession(expired ? "sessionExpired" : "notConnected");
      }
      return;
    }

    if (!effectiveSession?.expiresAt) return;
    const delay = new Date(effectiveSession.expiresAt).getTime() - Date.now();
    const timer = window.setTimeout(
      () => leaveEdoSession("sessionExpired"),
      Math.max(0, delay),
    );
    return () => window.clearTimeout(timer);
  }, [
    isActive,
    leaveEdoSession,
    providerQuery.isLoading,
    providerCode,
    requireSession,
    effectiveSession?.expiresAt,
  ]);

  if (requireSession && (providerQuery.isLoading || !providerCode || !isActive)) {
    return null;
  }

  return children;
}
