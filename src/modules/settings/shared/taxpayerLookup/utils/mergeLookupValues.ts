/**
 * Oldingi lookup natijasidan qolgan, foydalanuvchi o'zgartirmagan qiymatlarni
 * tozalaydi va yangi lookup natijasini ustiga qo'yadi.
 */
export const mergeLookupValues = <T extends object>(
  current: T,
  previous: Partial<T>,
  mapped: Partial<T>,
  emptyValues: Partial<T>,
): T => {
  const next = { ...current } as T;
  const currentRecord = current as Record<string, unknown>;
  const previousRecord = previous as Record<string, unknown>;
  const emptyRecord = emptyValues as Record<string, unknown>;

  for (const key of Object.keys(previous)) {
    if (Object.is(currentRecord[key], previousRecord[key])) {
      (next as Record<string, unknown>)[key] = emptyRecord[key];
    }
  }

  return Object.assign(next, mapped);
};
