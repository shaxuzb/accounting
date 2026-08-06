import { useEffect, useState } from "react";
import { useAppSelector } from "@/store/hooks";
import type { EdoProviderCode } from "../types/type";
import {
  edoAuthSessionChangedEvent,
  readEdoAuthSession,
} from "../utils/authSession";

export const useEdoAuthSession = (providerCode?: EdoProviderCode) => {
  const userId = useAppSelector((state) => state.auth.user?.user?.id);
  const organizationId = useAppSelector((state) => state.organization.id);
  const [session, setSession] = useState(() =>
    readEdoAuthSession(providerCode),
  );

  useEffect(() => {
    const syncSession = () => setSession(readEdoAuthSession(providerCode));
    const syncFromStorage = (event: StorageEvent) => {
      if (event.storageArea === localStorage) syncSession();
    };

    syncSession();
    window.addEventListener(edoAuthSessionChangedEvent, syncSession);
    window.addEventListener("storage", syncFromStorage);
    return () => {
      window.removeEventListener(edoAuthSessionChangedEvent, syncSession);
      window.removeEventListener("storage", syncFromStorage);
    };
  }, [organizationId, providerCode, userId]);

  return session;
};
