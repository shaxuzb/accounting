import { Button, Empty, Progress, Tag } from "antd";
import {
  AlertTriangle,
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  ExternalLink,
  FileText,
  Lightbulb,
  ListChecks,
  Network,
  PlayCircle,
  Settings2,
  Target,
  Workflow,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import AnnotatedScreenshot from "./components/AnnotatedScreenshot";
import { colorOf } from "./components/markers";
import { SectionIcon } from "./components/icons";
import { getArticle, getSection, readyArticles } from "./content";
import { useManualProgress, useSetArticleRead } from "./api";
import type { ManualArticle, ManualLink } from "./types";

const card = "rounded-xl border border-border bg-primary-bg";

const linkTarget = (link: ManualLink) =>
  link.articleId ? `/main/manual/${link.articleId}` : link.route ?? "#";

/** One article: the page explained field by field, as in the design. */
export default function ManualArticlePage() {
  const { sectionId, articleId } = useParams();
  const id = `${sectionId}/${articleId}`;
  const article = getArticle(id);
  const section = getSection(sectionId);

  if (!article || !section) {
    const stub = section?.articles.find((x) => x.id === id);
    return (
      <div className={`${card} flex min-h-[420px] items-center justify-center p-8`}>
        <Empty
          description={
            <div className="space-y-1">
              <div className="text-base font-semibold text-text">{stub?.title ?? "Maqola topilmadi"}</div>
              <div className="text-secondary-text">Bu maqola tayyorlanmoqda — tez orada qo'shiladi.</div>
            </div>
          }
        />
      </div>
    );
  }
  return <Article key={article.id} article={article} sectionTitle={section.title} sectionIcon={section.icon} />;
}

function Article({ article, sectionTitle, sectionIcon }: { article: ManualArticle; sectionTitle: string; sectionIcon: string }) {
  const navigate = useNavigate();
  const [active, setActive] = useState<number | null>(null);
  const { data: read = [], isSuccess: progressLoaded } = useManualProgress();
  const setRead = useSetArticleRead();
  const isRead = read.includes(article.id);

  const ready = useMemo(() => readyArticles(), []);
  const readCount = ready.filter((x) => read.includes(x.id)).length;
  const percent = ready.length ? Math.round((readCount * 100) / ready.length) : 0;
  const index = ready.findIndex((x) => x.id === article.id);
  const previous = index > 0 ? ready[index - 1] : undefined;
  const next = index >= 0 && index < ready.length - 1 ? ready[index + 1] : undefined;

  // reading to the end marks the article read, once a visit: a reader who takes the mark off
  // keeps it off
  const endRef = useRef<HTMLDivElement | null>(null);
  const autoMarked = useRef(false);
  useEffect(() => {
    const target = endRef.current;
    if (!target || !progressLoaded || isRead || autoMarked.current) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        autoMarked.current = true;
        setRead.mutate({ articleId: article.id, read: true });
        observer.disconnect();
      }
    });
    observer.observe(target);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article.id, isRead, progressLoaded]);

  // another article opens at its top, not where the previous one was scrolled to
  const topRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    topRef.current?.scrollIntoView({ block: "start" });
  }, [article.id]);

  const fieldsByMarker = useMemo(
    () =>
      new Map(
        article.fieldGroups.flatMap((group) => group.fields).flatMap((field) => (field.n !== undefined ? [[field.n, field] as const] : [])),
      ),
    [article],
  );

  return (
    <div ref={topRef} className="space-y-4">
      {/* the path, the title and the actions */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-secondary-text">
          <button type="button" className="cursor-pointer" onClick={() => navigate("/main/manual")}>
            <ChevronLeft className="size-4" />
          </button>
          <Link to="/main/manual" className="text-secondary-text!">Qo'llanma</Link>
          <ChevronRight className="size-3.5" />
          <span>{sectionTitle}</span>
          <ChevronRight className="size-3.5" />
          <span className="font-medium text-text">{article.title}</span>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="mt-1 flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950">
              <SectionIcon name={sectionIcon} className="size-6" />
            </div>
            <div>
              <h1 className="m-0 text-2xl font-semibold text-text">{article.title}</h1>
              <p className="m-0 mt-1 max-w-3xl text-secondary-text">{article.summary}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {article.videoUrl && (
              <Button type="primary" size="large" icon={<PlayCircle className="size-4" />} href={article.videoUrl} target="_blank">
                Video qo'llanma
              </Button>
            )}
            {article.routes[0] && (
              <Button size="large" icon={<ExternalLink className="size-4" />} onClick={() => navigate(article.routes[0])}>
                Sahifani ochish
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-4">
          {/* the page as it looks, numbered */}
          {article.screenshots.map((shot) => (
            <div key={shot.src} className={`${card} p-3`}>
              <AnnotatedScreenshot shot={shot} fields={fieldsByMarker} active={active} onActivate={setActive} />
            </div>
          ))}

          {/* what it is for */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
            <InfoCard n={1} icon={<Target className="size-4" />} title="Sahifa maqsadi" text={article.purpose} />
            <InfoCard n={2} icon={<Lightbulb className="size-4" />} title="Nima uchun kerak" text={article.why} />
            <InfoCard n={3} icon={<Settings2 className="size-4" />} title="Oldindan kerak bo'ladigan sozlamalar">
              <ul className="m-0 list-none space-y-1.5 p-0">
                {article.prerequisites.map((link) => (
                  <li key={link.title} className="flex gap-1.5">
                    <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-green-600" />
                    {link.articleId || link.route ? (
                      <Link to={linkTarget(link)} className="text-text! hover:text-blue-600!">{link.title}</Link>
                    ) : (
                      <span>{link.title}</span>
                    )}
                  </li>
                ))}
              </ul>
            </InfoCard>
            <div className={`${card} p-4`}>
              <div className="mb-3 flex items-center gap-2 font-semibold text-text">
                <Network className="size-4 text-blue-600" /> Bog'liq bo'limlar
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300">
                  {article.related.center}
                </div>
                <div className="h-3 w-px bg-border" />
                <div className="flex flex-wrap justify-center gap-1.5">
                  {article.related.items.map((link) => (
                    <Link
                      key={link.title}
                      to={linkTarget(link)}
                      className="rounded-md border border-border px-2 py-1 text-xs text-text! hover:border-blue-400"
                    >
                      {link.title}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* step by step */}
          <Block icon={<Workflow className="size-5" />} title="Qadam-baqadam ishlash" subtitle="Hujjatni to'ldirish tartibi">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-4">
              {article.steps.map((step, i) => (
                <div key={step.title} className="relative rounded-xl border border-border p-4">
                  <div className="flex gap-3">
                    <span
                      className="flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{ background: colorOf(i + 1).bg }}
                    >
                      {i + 1}
                    </span>
                    <div>
                      <div className="font-semibold text-text">{step.title}</div>
                      <div className="mt-1 text-sm text-secondary-text">{step.text}</div>
                    </div>
                  </div>
                  {i < article.steps.length - 1 && (
                    <ChevronRight className="absolute -right-3.5 top-1/2 z-10 hidden size-5 -translate-y-1/2 rounded-full bg-primary-bg text-secondary-text 2xl:block" />
                  )}
                </div>
              ))}
            </div>
          </Block>

          {/* every field: what to enter, what changing it does, what it affects */}
          <Block icon={<ListChecks className="size-5" />} title="Maydonlar va tugmalar izohi" subtitle="Raqamlar yuqoridagi rasmdagi belgilarga mos keladi">
            <div className="space-y-5">
              {article.fieldGroups.map((group) => (
                <div key={group.title}>
                  <div className="mb-2 font-semibold text-text">{group.title}</div>
                  <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full min-w-[760px] border-collapse text-sm">
                      <thead>
                        <tr className="bg-secondary-foreground text-left text-secondary-text">
                          <th className="w-12 px-3 py-2 font-medium">№</th>
                          <th className="w-44 px-3 py-2 font-medium">Maydon</th>
                          <th className="px-3 py-2 font-medium">Nima kiritiladi</th>
                          <th className="px-3 py-2 font-medium">O'zgartirilsa nima bo'ladi</th>
                          <th className="px-3 py-2 font-medium">Nimaga ta'sir qiladi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.fields.map((field) => {
                          const lit = field.n !== undefined && field.n === active;
                          return (
                            <tr
                              key={`${group.title}-${field.name}`}
                              className="border-t border-border align-top transition-colors"
                              style={lit ? { background: `${colorOf(field.n!).bg}14` } : undefined}
                              onMouseEnter={() => field.n !== undefined && setActive(field.n)}
                              onMouseLeave={() => field.n !== undefined && setActive(null)}
                            >
                              <td className="px-3 py-2.5">
                                {field.n !== undefined ? (
                                  <span
                                    className="flex size-6 items-center justify-center rounded-full text-xs font-bold text-white"
                                    style={{ background: colorOf(field.n).bg }}
                                  >
                                    {field.n}
                                  </span>
                                ) : (
                                  <Circle className="size-2 text-secondary-text" />
                                )}
                              </td>
                              <td className="px-3 py-2.5 font-medium text-text">
                                {field.name}
                                {field.required && <Tag color="red" className="ml-1.5! text-[10px]!">majburiy</Tag>}
                              </td>
                              <td className="px-3 py-2.5 text-text">{field.enter}</td>
                              <td className="px-3 py-2.5 text-secondary-text">{field.onChange ?? "—"}</td>
                              <td className="px-3 py-2.5 text-secondary-text">{field.affects ?? "—"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </Block>

          {/* what posting writes */}
          {article.postings && (
            <Block icon={<FileText className="size-5" />} title="Buxgalteriya provodkalari" subtitle={article.postings.intro}>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full min-w-[640px] border-collapse text-sm">
                  <thead>
                    <tr className="bg-secondary-foreground text-left text-secondary-text">
                      <th className="px-3 py-2 font-medium">Qachon</th>
                      <th className="w-28 px-3 py-2 font-medium">Debet</th>
                      <th className="w-28 px-3 py-2 font-medium">Kredit</th>
                      <th className="px-3 py-2 font-medium">Summa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {article.postings.entries.map((entry) => (
                      <tr key={`${entry.when}-${entry.debit}-${entry.credit}`} className="border-t border-border align-top">
                        <td className="px-3 py-2.5 text-text">
                          {entry.when}
                          {entry.note && <div className="mt-0.5 text-xs text-secondary-text">{entry.note}</div>}
                        </td>
                        <td className="px-3 py-2.5 font-mono font-semibold text-green-700 dark:text-green-400">{entry.debit}</td>
                        <td className="px-3 py-2.5 font-mono font-semibold text-rose-700 dark:text-rose-400">{entry.credit}</td>
                        <td className="px-3 py-2.5 text-secondary-text">{entry.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {article.postings.cancel && (
                <div className="mt-3 rounded-lg bg-secondary-foreground p-3 text-sm text-text">
                  <b>Bekor qilinganda:</b> {article.postings.cancel}
                </div>
              )}
            </Block>
          )}

          {/* the errors a user meets */}
          {article.errors.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-rose-200 dark:border-rose-900">
              <div className="flex items-center gap-2 bg-rose-50 px-4 py-3 dark:bg-rose-950">
                <AlertTriangle className="size-5 text-rose-600" />
                <span className="font-semibold text-text">Tez-tez uchraydigan xatolar</span>
                <span className="text-sm text-secondary-text">Xabar, sababi va nima qilish kerak</span>
              </div>
              <div className="divide-y divide-border bg-primary-bg">
                {article.errors.map((error) => (
                  <div key={error.message} className="grid grid-cols-1 gap-2 px-4 py-3 text-sm md:grid-cols-3">
                    <div className="font-medium text-rose-700 dark:text-rose-400">«{error.message}»</div>
                    <div className="text-secondary-text"><b className="text-text">Sabab:</b> {error.cause}</div>
                    <div className="text-secondary-text"><b className="text-text">Yechim:</b> {error.fix}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* the end: read, previous, next */}
          <div ref={endRef} className={`${card} flex flex-wrap items-center justify-between gap-3 p-4`}>
            <Button
              icon={isRead ? <BookOpenCheck className="size-4" /> : <CheckCircle2 className="size-4" />}
              type={isRead ? "default" : "primary"}
              onClick={() => {
                autoMarked.current = true;
                setRead.mutate({ articleId: article.id, read: !isRead });
              }}
            >
              {isRead ? "O'qilgan (belgini olib tashlash)" : "O'qib chiqdim"}
            </Button>
            <div className="flex gap-2">
              {previous && (
                <Button icon={<ChevronLeft className="size-4" />} onClick={() => navigate(`/main/manual/${previous.id}`)}>
                  {previous.title}
                </Button>
              )}
              {next && (
                <Button type="primary" ghost onClick={() => navigate(`/main/manual/${next.id}`)}>
                  {next.title} <ArrowRight className="size-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* the side panel: progress, related topics, a tip */}
        <aside className="space-y-4 xl:sticky xl:top-4 xl:self-start">
          <div className={`${card} p-4`}>
            <div className="mb-2 font-semibold text-text">Sizning o'rganish progressingiz</div>
            <div className="flex items-center gap-3">
              <Progress percent={percent} showInfo={false} className="m-0! flex-1" />
              <span className="text-sm font-semibold text-text">{readCount} / {ready.length}</span>
            </div>
            <div className="mt-1 text-right text-xs text-secondary-text">{percent}%</div>
          </div>
          {article.topics.length > 0 && (
            <div className={`${card} p-4`}>
              <div className="mb-2 font-semibold text-text">Tegishli mavzular</div>
              <div className="divide-y divide-border">
                {article.topics.map((topic) => (
                  <Link
                    key={topic.title}
                    to={linkTarget(topic)}
                    className="flex items-center justify-between gap-2 py-2 text-sm text-text! hover:text-blue-600!"
                  >
                    <span className="flex items-center gap-2">
                      <FileText className="size-4 text-secondary-text" /> {topic.title}
                    </span>
                    <ChevronRight className="size-4 text-secondary-text" />
                  </Link>
                ))}
              </div>
            </div>
          )}
          {article.tips.map((tip) => (
            <div key={tip} className="rounded-xl bg-blue-50 p-4 dark:bg-blue-950">
              <div className="mb-1 flex items-center gap-2 font-semibold text-blue-700 dark:text-blue-300">
                <Lightbulb className="size-4" /> Maslahat
              </div>
              <div className="text-sm text-text">{tip}</div>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}

function InfoCard({
  n,
  icon,
  title,
  text,
  children,
}: {
  n: number;
  icon: React.ReactNode;
  title: string;
  text?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`${card} p-4`}>
      <div className="mb-2 flex items-start gap-2">
        <span
          className="flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ background: colorOf(n).bg }}
        >
          {n}
        </span>
        <span className="flex items-center gap-1.5 font-semibold text-text">
          {icon}
          {title}
        </span>
      </div>
      {text && <p className="m-0 text-sm text-secondary-text">{text}</p>}
      {children && <div className="text-sm">{children}</div>}
    </div>
  );
}

function Block({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`${card} p-4`}>
      <div className="mb-3 flex items-start gap-2.5">
        <span className="mt-0.5 text-blue-600">{icon}</span>
        <div>
          <div className="text-base font-semibold text-text">{title}</div>
          {subtitle && <div className="text-sm text-secondary-text">{subtitle}</div>}
        </div>
      </div>
      {children}
    </section>
  );
}
