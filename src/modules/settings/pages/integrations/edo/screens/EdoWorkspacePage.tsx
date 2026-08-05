import { Button } from "antd";
import { Inbox } from "lucide-react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import EdoProviderPanel from "../components/EdoProviderPanel";
import EdoAuthenticationPanel from "../components/EdoAuthenticationPanel";

export default function EdoWorkspacePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

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
        <Button
          type="primary"
          icon={<Inbox className="size-4" />}
          onClick={() => navigate("inbox")}
        >
          {t("settings.integrations.edo.inbox.title")}
        </Button>
      </div>

      <EdoProviderPanel />
      <EdoAuthenticationPanel onAuthenticated={() => navigate("inbox")} />
    </div>
  );
}
