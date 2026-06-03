import dayjs from "dayjs";

export const formatDate = (value?: string | number | Date, format = "DD.MM.YYYY") =>
  value ? dayjs(value).format(format) : "-";

export const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");

export const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));
