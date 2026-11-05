/** Accept Ethiopian mobile numbers in local form and other numbers in E.164 form. */
export function normalizePhone(input: string): string | null {
  const compact = input.trim().replace(/[\s().-]/g, "");
  const ethiopian = compact.match(/^(?:\+251|251|0)?([79]\d{8})$/);
  if (ethiopian) return `+251${ethiopian[1]}`;
  return /^\+[1-9]\d{7,14}$/.test(compact) ? compact : null;
}
