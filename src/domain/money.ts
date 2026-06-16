/**
 * Economies of scale: per-person cost falls as the household grows
 * (bulk buying, shared staples, less waste). Working values pending
 * calibration against real USDA pack pricing.
 */
export const EFF: Record<number, number> = {
  1: 1.0,
  2: 0.96,
  3: 0.93,
  4: 0.9,
  5: 0.88,
};

export function effFor(size: number): number {
  const n = Math.min(Math.max(1, Math.round(size)), 5);
  return EFF[n];
}

export function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

export function formatMoney(n: number, locale = 'en-US', currency = 'USD'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(n);
}
