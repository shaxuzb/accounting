import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { Navigate, NavLink, useParams } from "react-router";
import { SETTINGS_BASE, toneClasses, useSettingsCatalog } from "../catalog";
import { SettingsSectionCard } from "../components/SettingsCards";
import SettingsBreadcrumb from "../components/SettingsBreadcrumb";

/** One subject of the settings: its sections as cards, the other subjects on the left. */
export default function SettingsGroupPage() {
  const { t } = useTranslation();
  const { groupKey } = useParams();
  const catalog = useSettingsCatalog();
  const group = catalog.group(groupKey);

  if (!group) return <Navigate to={SETTINGS_BASE} replace />;

  const tone = toneClasses[group.tone];
  const Icon = group.icon;

  return (
    <div className="mx-auto max-w-[1400px] p-1 pb-6">
      <SettingsBreadcrumb group={group} />
      <div className="flex gap-5">
        <aside className="hidden w-60 shrink-0 lg:block">
          <nav className="sticky top-2 space-y-0.5 rounded-xl border border-border bg-card p-2">
            {catalog.groups.map((item) => {
              const ItemIcon = item.icon;
              return (
                <NavLink
                  key={item.key}
                  to={`${SETTINGS_BASE}/groups/${item.key}`}
                  className={({ isActive }) =>
                    clsx(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-brand-soft font-semibold text-brand-text!"
                        : "text-text! hover:bg-surface-hover",
                    )
                  }
                >
                  <ItemIcon className="size-4 shrink-0" />
                  <span className="truncate">{t(item.title)}</span>
                </NavLink>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0 flex-1 space-y-4">
          <div className={clsx("flex items-center gap-4 rounded-2xl border p-5", tone.card)}>
            <div className={clsx("flex size-14 shrink-0 items-center justify-center rounded-xl", tone.icon)}>
              <Icon className="size-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-heading">{t(group.title)}</h1>
              <p className="mt-0.5 text-sm text-secondary-text">{t(group.description)}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3">
            {group.sections.map((section) => (
              <SettingsSectionCard key={section.path} section={section} group={group} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
