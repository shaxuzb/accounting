/**
 * The user's manual: sections of articles, each article one screen of the app explained as in
 * the design — an annotated screenshot, what the page is for, its fields one by one (what to
 * enter, what changing it does, what it affects), the steps, the ledger entries it posts and
 * the errors a user meets. The content is data, so every article has the same layout and a
 * part left empty shows at once.
 */

/** Marker colours, in the order the design numbers them. */
export type MarkerColor = "blue" | "green" | "orange" | "purple" | "red" | "yellow" | "pink" | "teal";

/** A numbered marker on a screenshot, placed in percent of the image so it survives resizing. */
export interface ManualMarker {
  n: number;
  /** Left edge to the marker's centre, % of the image width. */
  x: number;
  /** Top edge to the marker's centre, % of the image height. */
  y: number;
  color?: MarkerColor;
  /** A frame around the area the marker names, in % of the image: [left, top, width, height]. */
  box?: [number, number, number, number];
  /** A note shown beside the marker on the image itself (the design's 7 and 8). */
  callout?: string;
  /** Where the note sits relative to the marker. */
  calloutSide?: "left" | "right" | "top" | "bottom";
}

export interface ManualScreenshot {
  /** Under /public, e.g. "/manual/purchases/purchase-editor.jpg". */
  src: string;
  alt: string;
  caption?: string;
  /** The image's own size in pixels, so the layout holds before it loads. */
  width: number;
  height: number;
  markers: ManualMarker[];
}

/** One field or control of the screen, keyed to its marker. */
export interface ManualField {
  /** The marker's number on the screenshot, when the field has one. */
  n?: number;
  name: string;
  required?: boolean;
  /** What to enter or choose. */
  enter: string;
  /** What happens when it is changed. */
  onChange?: string;
  /** What it affects further on: entries, stock, settlements, reports. */
  affects?: string;
}

/** A group of fields under a heading (header, table columns, buttons, ...). */
export interface ManualFieldGroup {
  title: string;
  fields: ManualField[];
}

export interface ManualStep {
  title: string;
  text: string;
}

/** One ledger entry the document posts. */
export interface ManualPosting {
  /** When it is posted, e.g. «Tovar uchun». */
  when: string;
  debit: string;
  credit: string;
  /** What the amount is. */
  amount: string;
  note?: string;
}

export interface ManualError {
  /** The message exactly as the app shows it. */
  message: string;
  cause: string;
  fix: string;
}

/** A link inside the manual (an article) or into the app (a page). */
export interface ManualLink {
  title: string;
  articleId?: string;
  route?: string;
}

export interface ManualArticle {
  /** «section/article», e.g. «purchases/purchase». */
  id: string;
  sectionId: string;
  title: string;
  summary: string;
  /** App paths the article explains: its «?» button opens it there; the first one is «Sahifani ochish». */
  routes: string[];
  videoUrl?: string;
  screenshots: ManualScreenshot[];
  purpose: string;
  why: string;
  prerequisites: ManualLink[];
  /** The diagram of related sections: what the page is built on. */
  related: { center: string; items: ManualLink[] };
  steps: ManualStep[];
  fieldGroups: ManualFieldGroup[];
  postings?: { intro?: string; entries: ManualPosting[]; cancel?: string };
  errors: ManualError[];
  tips: string[];
  /** Tegishli mavzular: other articles worth reading next. */
  topics: ManualLink[];
}

/** An article in the section tree; only a ready one has content. */
export interface ManualArticleStub {
  id: string;
  title: string;
}

export interface ManualSection {
  id: string;
  title: string;
  icon: string;
  articles: ManualArticleStub[];
}
