export interface PostingTemplateView {
  id: string | number;
  [key: string]: unknown;
}

export interface PostingTemplateViewsPageParams {
  [key: string]: string | number | boolean | null | undefined;
}

export interface PostingTemplateViewDetailRow {
  key: string;
  field: string;
  value: unknown;
}
