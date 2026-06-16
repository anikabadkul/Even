import type { PurchaseLine } from '../domain/shopping';

export interface KrogerProduct {
  name: string;
  price: number;
  size: string | null;
}

/** Pulls the lowest available price (promo over regular) off a Kroger product record. */
export function extractProduct(raw: unknown): KrogerProduct | null {
  const p = raw as Record<string, unknown> | undefined;
  if (!p) return null;
  const item = (p.items as Record<string, unknown>[] | undefined)?.[0];
  const price = item?.price as Record<string, number> | undefined;
  const value = price?.promo && price.promo > 0 ? price.promo : price?.regular;
  if (typeof value !== 'number') return null;
  return {
    name: typeof p.description === 'string' ? p.description : 'Item',
    price: value,
    size: typeof item?.size === 'string' ? item.size : null,
  };
}

/** Overrides each line's purchase cost with a live per-pack price where one was found. */
export function applyLivePrices(lines: PurchaseLine[], prices: Map<string, number>): PurchaseLine[] {
  return lines.map((line) => {
    const livePrice = prices.get(line.name);
    if (livePrice == null || line.added) return line;
    const packs = line.packs || 1;
    return { ...line, purchaseCost: livePrice * packs };
  });
}
