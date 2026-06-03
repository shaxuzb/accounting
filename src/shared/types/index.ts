export type ID = string | number;

export interface Paginated<T> {
  items: T[];
  total: number;
  page?: number;
  pageSize?: number;
}

export interface ListParams {
  search?: string;
  page?: number;
  pageSize?: number;
  [key: string]: unknown;
}
