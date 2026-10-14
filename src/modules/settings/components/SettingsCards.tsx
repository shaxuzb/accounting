import clsx from "clsx";
import { ArrowRight, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { SETTINGS_BASE, toneClasses, type SettingsGroup, type SettingsSection } from "../catalog";

/** A subject on the settings home page: its sections are listed so the right card is easy to spot. */
export function SettingsGroupCard({ group }: { group: SettingsGroup }) {
  const { t } = useTranslation();
  const tone = toneClasses[group.tone];
  const Icon = group.icon;
  const target =
    group.sections.length === 1
      ? `${SETTINGS_BASE}/${group.sections[0].path}`
      : `${SETTINGS_BASE}/groups/${group.key}`;

  return (
    <Link
      to={target}
      className={clsx(
        "group flex min-h-44 flex-col rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg",
        tone.card,
      )}
    >
      <div className={clsx("flex size-12 items-center justify-center rounded-xl", tone.icon)}>
        <Icon className="size-6" />
      </div>
      <div className="mt-4 text-base font-semibold text-heading">{t(group.title)}</div>
      <div className={clsx("mt-1 text-sm font-medium", tone.accent)}>
        {t("settings.hub.sectionsCount", { count: group.sections.length })}
      </div>
      <div className="mt-2 line-clamp-2 text-sm text-secondary-text">
        {group.sections.map((section) => t(section.title)).join(", ")}
      </div>
      <div className="mt-auto flex justify-end pt-3">
        <span
          className={clsx(
            "flex size-8 items-center justify-center rounded-full bg-card shadow-sm transition-colors",
            tone.arrow,
          )}
        >
          <ArrowRight className="size-4" />
        </span>
      </div>
    </Link>
  );
}

/** One settings section: icon, name, what it is for. */
export function SettingsSectionCard({
  section,
  group,
  showGroup = false,
}: {
  section: SettingsSection;
  group: SettingsGroup;
  showGroup?: boolean;
}) {
  const { t } = useTranslation();
  const tone = toneClasses[group.tone];

  return (
    <Link
      to={`${SETTINGS_BASE}/${section.path}`}
      className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-brand hover:shadow-md"
    >
      <div className={clsx("flex size-10 shrink-0 items-center justify-center rounded-lg", tone.icon)}>
        {section.icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-heading group-hover:text-brand-text">{t(section.title)}</div>
        {showGroup && <div className={clsx("text-xs font-medium", tone.accent)}>{t(group.title)}</div>}
        {section.description && (
          <div className="mt-1 line-clamp-2 text-xs text-secondary-text">{t(section.description)}</div>
        )}
      </div>
      <ChevronRight className="mt-2 size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

/** A small tile for the quick access row. */
export function SettingsQuickTile({ section, group }: { section: SettingsSection; group: SettingsGroup }) {
  const { t } = useTranslation();
  const tone = toneClasses[group.tone];

  return (
    <Link
      to={`${SETTINGS_BASE}/${section.path}`}
      className="flex w-32 shrink-0 flex-col items-center gap-2 rounded-xl border border-border bg-card px-2 py-3 text-center transition-all hover:-translate-y-0.5 hover:border-brand hover:shadow-md"
    >
      <div className={clsx("flex size-9 items-center justify-center rounded-lg", tone.icon)}>{section.icon}</div>
      <div className="line-clamp-2 text-xs font-medium text-text">{t(section.title)}</div>
    </Link>
  );
}
