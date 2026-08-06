import { Button, Tooltip } from "antd";
import { Inbox } from "lucide-react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import EdoProviderPanel from "../components/EdoProviderPanel";
import EdoAuthenticationPanel from "../components/EdoAuthenticationPanel";
import { useEdoActiveProvider, useEdoAuthSession } from "../hooks";
import { isEdoAuthSessionActive } from "../utils/authSession";

export default function EdoWorkspacePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const providerQuery = useEdoActiveProvider();
  const session = useEdoAuthSession(providerQuery.data?.code);
  const canOpenInbox = isEdoAuthSessionActive(session);

  return (
    <div className="w-full space-y-2">
      <div className="flex flex-wrap items-start justify-end gap-4 px-1">
        {/* <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand">
            <Settings2 className="size-4" /> EDO
          </div>
          <h1 className="text-2xl font-semibold text-heading">
            {t("settings.integrations.edo.title")}
          </h1>
          <p className="mt-1 text-sm text-secondary-text">
            {t("settings.integrations.edo.description")}
          </p>
        </div> */}
        <Tooltip
          title={
            canOpenInbox
              ? undefined
              : t("settings.integrations.edo.errors.notConnected")
          }
        >
          <span>
            <Button
              type="primary"
              icon={<Inbox className="size-4" />}
              disabled={!canOpenInbox}
              onClick={() => navigate("inbox")}
            >
              {t("settings.integrations.edo.inbox.title")}
            </Button>
          </span>
        </Tooltip>
      </div>

      <EdoProviderPanel />
      <EdoAuthenticationPanel onAuthenticated={() => navigate("inbox")} />
    </div>
  );
}
