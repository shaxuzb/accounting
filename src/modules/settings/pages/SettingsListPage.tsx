import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { Empty, Input, type InputRef } from "antd";
import { History, Search, Zap } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import {
  DEFAULT_QUICK_SECTIONS,
  SETTINGS_BASE,
  readRecentSections,
  useSettingsCatalog,
} from "../catalog";
import { SettingsGroupCard, SettingsQuickTile, SettingsSectionCard } from "../components/SettingsCards";

const normalize = (value: string) => value.toLocaleLowerCase().replace(/[ʻʼ‘’`']/g, "'").trim();

export default function SettingsListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const userId = useAppSelector((state) => state.auth.user?.user?.id ?? 0);
  const catalog = useSettingsCatalog();
  const [query, setQuery] = useState("");
  const searchRef = useRef<InputRef>(null);

  // «/» jumps to the search, as on most settings pages; Ctrl+K belongs to the manual search.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target;
      const typing = target instanceof Element && target.closest("input, textarea, [contenteditable='true']");
      if (event.key === "/" && !typing) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => {
    const needle = normalize(query);
    if (!needle) return [];
    return catalog.groups.flatMap((group) =>
      group.sections
        .filter((section) =>
          [t(section.title), section.description ? t(section.description) : "", t(group.title)]
            .map(normalize)
            .some((text) => text.includes(needle)),
        )
        .map((section) => ({ section, group })),
    );
  }, [catalog, query, t]);

  const recent = useMemo(() => readRecentSections(userId), [userId]);
  const quick = useMemo(() => {
    const paths = recent.length > 0 ? recent : DEFAULT_QUICK_SECTIONS;
    return paths
      .map((path) => catalog.section(path))
      .filter((section) => section !== undefined)
      .map((section) => ({ section, group: catalog.group(section.groupKey)! }))
      .slice(0, 8);
  }, [catalog, recent]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 p-1 pb-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-heading">{t("settings.title")}</h1>
          <p className="mt-1 text-sm text-secondary-text">{t("settings.hub.subtitle")}</p>
        </div>
        <Input
          ref={searchRef}
          size="large"
          allowClear
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onPressEnter={() => results[0] && navigate(`${SETTINGS_BASE}/${results[0].section.path}`)}
          prefix={<Search className="size-4 text-muted" />}
          suffix={
            !query && (
              <kbd className="rounded border border-border px-1.5 text-xs text-muted">/</kbd>
            )
          }
          placeholder={t("settings.hub.searchPlaceholder")}
          className="w-full! rounded-xl! sm:w-96!"
        />
      </div>

      {query ? (
        <div>
          <div className="mb-3 text-sm text-secondary-text">
            {t("settings.hub.results", { count: results.length })}
          </div>
          {results.length === 0 ? (
            <Empty description={t("settings.hub.noResults")} />
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {results.map(({ section, group }) => (
                <SettingsSectionCard key={section.path} section={section} group={group} showGroup />
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {catalog.groups.map((group) => (
              <SettingsGroupCard key={group.key} group={group} />
            ))}
          </div>

          {quick.length > 0 && (
            <div>
              <div className="mb-3 flex items-center gap-2 font-semibold text-heading">
                {recent.length > 0 ? (
                  <History className="size-5 text-brand-text" />
                ) : (
                  <Zap className="size-5 text-amber-500" />
                )}
                {t(recent.length > 0 ? "settings.hub.recent" : "settings.hub.quick")}
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {quick.map(({ section, group }) => (
                  <SettingsQuickTile key={section.path} section={section} group={group} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
