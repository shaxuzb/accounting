import { ChevronRight, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { SETTINGS_BASE, type SettingsGroup, type SettingsSection } from "../catalog";

/** Sozlamalar › subject › section: the way back up from any settings page. */
export default function SettingsBreadcrumb({
  group,
  section,
  sectionIsLink = false,
  extra,
}: {
  group?: SettingsGroup;
  section?: SettingsSection;
  /** on a page inside the section (an editor, a detail) the section itself leads back */
  sectionIsLink?: boolean;
  extra?: React.ReactNode;
}) {
  const { t } = useTranslation();
  const groupLink = group && group.sections.length > 1 ? `${SETTINGS_BASE}/groups/${group.key}` : null;

  return (
    <div className="mb-3 flex min-h-7 items-center justify-between gap-2">
      <nav className="flex min-w-0 items-center gap-1.5 text-sm text-secondary-text">
        <Link to={SETTINGS_BASE} className="flex items-center gap-1.5 text-secondary-text! hover:text-brand-text!">
          <Settings className="size-4" />
          {t("settings.title")}
        </Link>
        {/* a subject with a single section adds nothing to the path */}
        {group && (!section || groupLink) && (
          <>
            <ChevronRight className="size-3.5 shrink-0 text-muted" />
            {groupLink && section ? (
              <Link to={groupLink} className="truncate text-secondary-text! hover:text-brand-text!">
                {t(group.title)}
              </Link>
            ) : (
              <span className={section ? "truncate" : "truncate font-medium text-heading"}>{t(group.title)}</span>
            )}
          </>
        )}
        {section && (
          <>
            <ChevronRight className="size-3.5 shrink-0 text-muted" />
            {sectionIsLink ? (
              <Link to={`${SETTINGS_BASE}/${section.path}`} className="truncate text-secondary-text! hover:text-brand-text!">
                {t(section.title)}
              </Link>
            ) : (
              <span className="truncate font-medium text-heading">{t(section.title)}</span>
            )}
          </>
        )}
      </nav>
      {extra}
    </div>
  );
}
