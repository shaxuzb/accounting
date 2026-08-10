import { Tooltip } from "antd";
import {
  Files,
  FileText,
  Inbox,
  LockKeyhole,
  Send,
} from "lucide-react";
import { memo, type ComponentType } from "react";
import { useTranslation } from "react-i18next";
import type {
  EdoNavigationItem,
  EdoWorkspaceSection,
} from "../constants/navigation";

interface EdoSectionNavigationProps {
  items: EdoNavigationItem[];
  activeSection: EdoWorkspaceSection;
  onSelect: (section: EdoWorkspaceSection) => void;
}

const sectionIcons: Record<
  EdoWorkspaceSection,
  ComponentType<{ className?: string }>
> = {
  INBOX: Inbox,
  OUTBOX: Send,
  DRAFTS: FileText,
  ALL: Files,
};

function EdoSectionNavigation({
  items,
  activeSection,
  onSelect,
}: EdoSectionNavigationProps) {
  const { t } = useTranslation();

  return (
    <nav
      aria-label={t("settings.integrations.edo.title")}
      className="overflow-x-auto rounded-xl border border-border bg-surface-muted/45 p-1.5"
    >
      <div className="flex min-w-max items-center gap-1">
        {items.map((item) => {
          const Icon = sectionIcons[item.id];
          const isActive = item.id === activeSection;

          return (
            <Tooltip
              key={item.id}
              title={
                item.available
                  ? undefined
                  : t("settings.integrations.edo.navigation.notAvailable")
              }
            >
              <button
                type="button"
                aria-current={isActive ? "page" : undefined}
                className={`group inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 ${
                  isActive
                    ? "bg-surface text-brand shadow-sm"
                    : "text-secondary-text hover:bg-surface/75 hover:text-heading"
                } ${item.available ? "" : "opacity-60"}`}
                onClick={() => onSelect(item.id)}
              >
                <Icon className="size-4 shrink-0" />
                <span>{t(item.labelKey)}</span>
                {!item.available && <LockKeyhole className="size-3.5" />}
              </button>
            </Tooltip>
          );
        })}
      </div>
    </nav>
  );
}

export default memo(EdoSectionNavigation);
