import { Input, Modal } from "antd";
import { BookOpen, CircleHelp, FileText, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { findArticleByPath, searchManual } from "../content";

/**
 * The navbar's way into the manual: a search box (Ctrl+K) over every article, its fields and
 * errors, and a «?» button that opens the article of the page the user is on.
 */
export default function ManualSearch() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const hits = useMemo(() => searchManual(query), [query]);
  const pageArticle = findArticleByPath(location.pathname);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (articleId: string) => {
    setOpen(false);
    setQuery("");
    navigate(`/main/manual/${articleId}`);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden h-9 w-64 cursor-pointer items-center gap-2 rounded-lg border border-border bg-primary-bg px-3 text-sm text-secondary-text transition-colors hover:border-blue-400 md:flex xl:w-80"
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">Qo'llanmadan izlash...</span>
        <kbd className="rounded border border-border px-1.5 text-[11px]">Ctrl K</kbd>
      </button>
      {pageArticle && (
        <button
          type="button"
          title="Shu sahifa qo'llanmasi"
          onClick={() => navigate(`/main/manual/${pageArticle.id}`)}
          className="flex size-9 cursor-pointer items-center justify-center rounded-lg text-primary-text transition-colors hover:bg-secondary-foreground hover:text-blue-600"
        >
          <CircleHelp className="size-5" />
        </button>
      )}
      <Modal open={open} onCancel={() => setOpen(false)} footer={null} closable={false} width={640} destroyOnHidden>
        <Input
          autoFocus
          size="large"
          allowClear
          prefix={<Search className="size-4 text-secondary-text" />}
          placeholder="Masalan: shartnoma, QQS, markirovka, hisob davri yopilgan..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onPressEnter={() => hits[0] && go(hits[0].articleId)}
        />
        <div className="mt-3 max-h-[60vh] overflow-y-auto">
          {query.trim() === "" ? (
            <div className="space-y-1 text-sm text-secondary-text">
              {pageArticle && (
                <button
                  type="button"
                  onClick={() => go(pageArticle.id)}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-lg p-2 text-left hover:bg-secondary-foreground"
                >
                  <CircleHelp className="size-4 text-blue-600" /> Shu sahifa: <b className="text-text">{pageArticle.title}</b>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  navigate("/main/manual");
                }}
                className="flex w-full cursor-pointer items-center gap-2 rounded-lg p-2 text-left hover:bg-secondary-foreground"
              >
                <BookOpen className="size-4 text-blue-600" /> Qo'llanma markazini ochish
              </button>
            </div>
          ) : hits.length === 0 ? (
            <div className="p-4 text-center text-sm text-secondary-text">Hech narsa topilmadi</div>
          ) : (
            hits.map((hit) => (
              <button
                key={hit.articleId}
                type="button"
                onClick={() => go(hit.articleId)}
                className="flex w-full cursor-pointer gap-3 rounded-lg p-2.5 text-left hover:bg-secondary-foreground"
              >
                <FileText className="mt-0.5 size-4 shrink-0 text-secondary-text" />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-text">
                    {hit.title} {!hit.ready && <span className="text-xs font-normal text-secondary-text">· tez orada</span>}
                  </span>
                  <span className="block text-xs text-secondary-text">{hit.sectionTitle}</span>
                  {hit.snippet && <span className="mt-0.5 block text-xs text-secondary-text">{hit.snippet}</span>}
                </span>
              </button>
            ))
          )}
        </div>
      </Modal>
    </>
  );
}
