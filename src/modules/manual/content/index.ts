import type { ManualArticle, ManualSection } from "../types";
import { manualArticles } from "./articles";
import { manualSections } from "./sections";

export { manualSections };

export const getArticle = (id?: string | null): ManualArticle | undefined =>
  id ? manualArticles[id] : undefined;

export const isReady = (id: string) => Boolean(manualArticles[id]);

export const getSection = (id?: string | null): ManualSection | undefined =>
  manualSections.find((section) => section.id === id);

/** Every article that has content, in the order of the sections. */
export const readyArticles = (): ManualArticle[] =>
  manualSections.flatMap((section) => section.articles.map((stub) => manualArticles[stub.id]).filter(Boolean));

/** The article an app page is explained by: the longest route that the path starts with. */
export const findArticleByPath = (pathname: string): ManualArticle | undefined => {
  let best: { article: ManualArticle; length: number } | undefined;
  for (const article of Object.values(manualArticles)) {
    for (const route of article.routes) {
      if ((pathname === route || pathname.startsWith(`${route}/`)) && route.length > (best?.length ?? 0))
        best = { article, length: route.length };
    }
  }
  return best?.article;
};

export interface ManualSearchHit {
  articleId: string;
  title: string;
  sectionTitle: string;
  /** Where the words were found, shown under the title. */
  snippet?: string;
  ready: boolean;
}

const normalize = (text: string) => text.toLocaleLowerCase("uz").replace(/[‘’ʻʼ`]/g, "'");

/** Titles of all articles, and in the ready ones their text, fields and errors. */
export const searchManual = (query: string, limit = 20): ManualSearchHit[] => {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const matches = (text?: string) => {
    if (!text) return false;
    const value = normalize(text);
    return words.every((word) => value.includes(word));
  };

  const hits: (ManualSearchHit & { score: number })[] = [];
  for (const section of manualSections) {
    for (const stub of section.articles) {
      const article = manualArticles[stub.id];
      if (matches(stub.title)) {
        hits.push({ articleId: stub.id, title: stub.title, sectionTitle: section.title, ready: Boolean(article), score: 3 });
        continue;
      }
      if (!article) continue;
      const texts: string[] = [
        article.summary,
        article.purpose,
        article.why,
        ...article.steps.map((step) => `${step.title}. ${step.text}`),
        ...article.fieldGroups.flatMap((group) =>
          group.fields.map((field) => `${field.name}: ${field.enter} ${field.onChange ?? ""} ${field.affects ?? ""}`),
        ),
        ...article.errors.map((error) => `${error.message} — ${error.fix}`),
        ...article.tips,
      ];
      const found = texts.find(matches);
      if (found)
        hits.push({
          articleId: stub.id,
          title: stub.title,
          sectionTitle: section.title,
          snippet: found.length > 140 ? `${found.slice(0, 140)}…` : found,
          ready: true,
          score: 1,
        });
    }
  }
  return hits.sort((a, b) => b.score - a.score || Number(b.ready) - Number(a.ready)).slice(0, limit);
};
