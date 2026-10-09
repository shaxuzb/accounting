import { Input } from "antd";
import { CheckCircle2, ChevronDown, ChevronRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, Outlet, useParams } from "react-router";
import { SectionIcon } from "./components/icons";
import { isReady, manualSections } from "./content";
import { useManualProgress } from "./api";

/** The manual: the sections and their articles on the left («Qo'llanma markazi»), the article on the right. */
export default function ManualLayout() {
  const { sectionId, articleId } = useParams();
  const current = sectionId && articleId ? `${sectionId}/${articleId}` : null;
  const [filter, setFilter] = useState("");
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const { data: read = [] } = useManualProgress();

  const sections = useMemo(() => {
    const text = filter.trim().toLocaleLowerCase("uz");
    if (!text) return manualSections;
    return manualSections
      .map((section) => ({
        ...section,
        articles: section.articles.filter((article) => article.title.toLocaleLowerCase("uz").includes(text)),
      }))
      .filter((section) => section.articles.length > 0 || section.title.toLocaleLowerCase("uz").includes(text));
  }, [filter]);

  const isOpen = (id: string) => Boolean(filter.trim()) || (open[id] ?? id === sectionId);

  return (
    <div className="flex min-h-full w-full gap-4">
      <aside className="sticky top-0 hidden w-[290px] shrink-0 self-start rounded-xl border border-border bg-primary-bg p-4 lg:block">
        <div className="text-lg font-semibold text-text">Qo'llanma markazi</div>
        <div className="mb-3 text-sm text-secondary-text">Tizimdan samarali foydalanish uchun batafsil yo'riqnomalar</div>
        <Input
          allowClear
          prefix={<Search className="size-4 text-secondary-text" />}
          placeholder="Qo'llanmada izlash..."
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="mb-3"
        />
        <nav className="space-y-0.5">
          {sections.map((section) => {
            const expanded = isOpen(section.id);
            return (
              <div key={section.id}>
                <button
                  type="button"
                  className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-secondary-foreground ${
                    section.id === sectionId ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300" : "text-text"
                  }`}
                  onClick={() => setOpen((state) => ({ ...state, [section.id]: !expanded }))}
                >
                  <SectionIcon name={section.icon} className="size-4.5 shrink-0" />
                  <span className="flex-1 text-sm font-medium">{section.title}</span>
                  <span className="rounded-md bg-secondary-foreground px-1.5 text-xs text-secondary-text">
                    {section.articles.length}
                  </span>
                  {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                </button>
                {expanded && (
                  <div className="mb-1 ml-4 border-l border-border pl-2">
                    {section.articles.map((article) => {
                      const active = article.id === current;
                      const ready = isReady(article.id);
                      return (
                        <Link
                          key={article.id}
                          to={`/main/manual/${article.id}`}
                          className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm ${
                            active
                              ? "bg-blue-50 font-medium text-blue-700! dark:bg-blue-950 dark:text-blue-300!"
                              : ready
                                ? "text-text! hover:bg-secondary-foreground"
                                : "text-secondary-text! opacity-70 hover:bg-secondary-foreground"
                          }`}
                        >
                          {read.includes(article.id) ? (
                            <CheckCircle2 className="size-3.5 shrink-0 text-green-600" />
                          ) : (
                            <span className={`size-1.5 shrink-0 rounded-full ${active ? "bg-blue-600" : "bg-gray-300"}`} />
                          )}
                          <span className="flex-1">{article.title}</span>
                          {!ready && <span className="text-[10px] text-secondary-text">tez orada</span>}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}
