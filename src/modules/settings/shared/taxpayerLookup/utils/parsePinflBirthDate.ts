const CENTURY_BY_PINFL_PREFIX: Record<string, number> = {
  "1": 1800,
  "2": 1800,
  "3": 1900,
  "4": 1900,
  "5": 2000,
  "6": 2000,
  "7": 2100,
  "8": 2100,
};

const isLeapYear = (year: number) =>
  year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);

const daysInMonth = (year: number, month: number) => {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
};

/**
 * PINFLning 2-7 raqamlaridan DDMMYY sanani olib,
 * formalar ishlatadigan YYYY-MM-DD formatiga o'tkazadi.
 */
export const parsePinflBirthDate = (pinfl?: string | null): string | null => {
  const value = (pinfl ?? "").trim();
  if (!/^\d{14}$/.test(value)) return null;

  const century = CENTURY_BY_PINFL_PREFIX[value[0]];
  if (century === undefined) return null;

  const day = Number(value.slice(1, 3));
  const month = Number(value.slice(3, 5));
  const year = century + Number(value.slice(5, 7));

  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > daysInMonth(year, month)
  ) {
    return null;
  }

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};
