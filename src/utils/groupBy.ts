export function groupBy<T>(
  value: T[],
  groupBy: (item: T) => string | number | symbol
): {
  [key: string | number | symbol]: T[];
} {
  const obj: { [key: string | number | symbol]: T[] } = {};
  value.forEach(v => (obj[groupBy(v)] ??= []).push(v));
  return obj;
}
