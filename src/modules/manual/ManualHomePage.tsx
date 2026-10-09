import { Progress } from "antd";
import { BookOpen, CheckCircle2, ChevronRight } from "lucide-react";
import { Link } from "react-router";
import { SectionIcon } from "./components/icons";
import { isReady, manualSections, readyArticles } from "./content";
import { useManualProgress } from "./api";

/** The manual's front page: every section with its articles and how far the reader has got. */
export default function ManualHomePage() {
  const { data: read = [] } = useManualProgress();
  const ready = readyArticles();
  const readCount = ready.filter((article) => read.includes(article.id)).length;
  const percent = ready.length ? Math.round((readCount * 100) / ready.length) : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-primary-bg p-5">
        <div className="flex gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950">
            <BookOpen className="size-6" />
          </div>
          <div>
            <h1 className="m-0 text-2xl font-semibold text-text">Qo'llanma</h1>
            <p className="m-0 mt-1 max-w-2xl text-secondary-text">
              Har bir sahifa rasm bilan: raqamlangan maydonlar, ularga nima kiritiladi, o'zgartirilsa nima bo'ladi va
              nimaga ta'sir qiladi, qanday provodka yoziladi va qaysi xatolar uchrashi mumkin. Istalgan sahifada «?»
              tugmasini bosib, shu sahifa qo'llanmasini oching.
            </p>
          </div>
        </div>
        <div className="w-64">
          <div className="mb-1 text-sm font-semibold text-text">Sizning o'rganish progressingiz</div>
          <Progress percent={percent} showInfo={false} className="m-0!" />
          <div className="text-sm text-secondary-text">{readCount} / {ready.length} maqola · {percent}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {manualSections.map((section) => (
          <div key={section.id} className="rounded-xl border border-border bg-primary-bg p-4">
            <div className="mb-3 flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950">
                <SectionIcon name={section.icon} className="size-5" />
              </span>
              <span className="flex-1 font-semibold text-text">{section.title}</span>
              <span className="text-xs text-secondary-text">{section.articles.length} ta</span>
            </div>
            <div className="divide-y divide-border">
              {section.articles.map((article) => (
                <Link
                  key={article.id}
                  to={`/main/manual/${article.id}`}
                  className={`flex items-center gap-2 py-2 text-sm ${isReady(article.id) ? "text-text!" : "text-secondary-text! opacity-70"}`}
                >
                  {read.includes(article.id) ? (
                    <CheckCircle2 className="size-4 text-green-600" />
                  ) : (
                    <span className="size-1.5 rounded-full bg-gray-300" />
                  )}
                  <span className="flex-1">{article.title}</span>
                  {!isReady(article.id) && <span className="text-[10px]">tez orada</span>}
                  <ChevronRight className="size-4 text-secondary-text" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
