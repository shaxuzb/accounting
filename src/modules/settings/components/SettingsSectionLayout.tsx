import { useEffect, useState } from "react";
import clsx from "clsx";
import { Button, Tooltip } from "antd";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NavLink, Outlet, useLocation } from "react-router";
import { useAppSelector } from "@/store/hooks";
import { SETTINGS_BASE, rememberSection, toneClasses, useSettingsCatalog } from "../catalog";
import SettingsBreadcrumb from "./SettingsBreadcrumb";

const NAV_KEY = "settings-section-nav-hidden";

function readNavHidden() {
  try {
    return localStorage.getItem(NAV_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Every settings section: the path back up, and on the section's own page the other sections of
 * its subject on the left, so the neighbouring setting is one click away.
 */
export default function SettingsSectionLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const userId = useAppSelector((state) => state.auth.user?.user?.id ?? 0);
  const catalog = useSettingsCatalog();
  const [navHidden, setNavHidden] = useState(readNavHidden);

  const rest = location.pathname.startsWith(`${SETTINGS_BASE}/`)
    ? location.pathname.slice(SETTINGS_BASE.length + 1).replace(/\/+$/, "")
    : "";
  const [sectionPath, ...deeper] = rest.split("/");
  const section = catalog.section(sectionPath);
  const group = section ? catalog.group(section.groupKey) : undefined;
  const isSectionRoot = deeper.length === 0;
  const showNav = Boolean(group && isSectionRoot && group.sections.length > 1);

  useEffect(() => {
    if (section && userId) rememberSection(userId, section.path);
  }, [section, userId]);

  const toggleNav = () => {
    setNavHidden((value) => {
      try {
        localStorage.setItem(NAV_KEY, value ? "0" : "1");
      } catch {
        // storage unavailable: the choice lasts for this page only
      }
      return !value;
    });
  };

  if (!section || !group) return <Outlet />;

  const tone = toneClasses[group.tone];
  const GroupIcon = group.icon;
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    clsx(
      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors [&_svg]:size-4! [&_svg]:shrink-0",
      isActive ? "bg-brand-soft font-semibold text-brand-text!" : "text-text! hover:bg-surface-hover",
    );

  return (
    <div>
      <SettingsBreadcrumb
        group={group}
        section={section}
        sectionIsLink={!isSectionRoot}
        extra={
          showNav && (
            <Tooltip title={t(navHidden ? "settings.hub.showNav" : "settings.hub.hideNav")}>
              <Button
                type="text"
                size="small"
                className="hidden! lg:inline-flex!"
                aria-label={t(navHidden ? "settings.hub.showNav" : "settings.hub.hideNav")}
                onClick={toggleNav}
                icon={navHidden ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
              />
            </Tooltip>
          )
        }
      />

      {showNav && (
        <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1 lg:hidden">
          {group.sections.map((item) => (
            <NavLink
              key={item.path}
              to={`${SETTINGS_BASE}/${item.path}`}
              className={({ isActive }) =>
                clsx(
                  "shrink-0 rounded-full border px-3 py-1 text-sm whitespace-nowrap transition-colors",
                  isActive
                    ? "border-brand bg-brand-soft font-medium text-brand-text!"
                    : "border-border bg-card text-text! hover:border-brand",
                )
              }
            >
              {t(item.title)}
            </NavLink>
          ))}
        </div>
      )}

      <div className="flex gap-4">
        {showNav && !navHidden && (
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-2 rounded-xl border border-border bg-card p-2">
              <NavLink
                to={`${SETTINGS_BASE}/groups/${group.key}`}
                end
                className="mb-1 flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-surface-hover"
              >
                <span className={clsx("flex size-7 items-center justify-center rounded-md", tone.icon)}>
                  <GroupIcon className="size-4" />
                </span>
                <span className="truncate text-sm font-semibold text-heading">{t(group.title)}</span>
              </NavLink>
              <nav className="space-y-0.5 border-t border-border pt-1">
                {group.sections.map((item) => (
                  <NavLink key={item.path} to={`${SETTINGS_BASE}/${item.path}`} className={linkClass}>
                    {item.icon}
                    <span className="truncate">{t(item.title)}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
          </aside>
        )}
        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
