export type PrimitiveQueryValue = string | number | boolean | null | undefined;

export type QueryParams = Record<string, PrimitiveQueryValue> | URLSearchParams;
