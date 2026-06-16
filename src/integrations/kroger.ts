import type { PurchaseLine } from '../domain/shopping';
import { KROGER_CLIENT_ID, KROGER_CLIENT_SECRET, hasKroger } from './env';

const TOKEN_URL = 'https://api.kroger.com/v1/connect/oauth2/token';
const API_BASE = 'https://api.kroger.com/v1';

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getToken(scope: string): Promise<string | null> {
  if (!hasKroger) return null;
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.value;
  try {
    const basic = btoa(`${KROGER_CLIENT_ID}:${KROGER_CLIENT_SECRET}`);
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `grant_type=client_credentials&scope=${encodeURIComponent(scope)}`,
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (typeof data.access_token !== 'string') return null;
    cachedToken = { value: data.access_token, expiresAt: Date.now() + (data.expires_in ?? 1800) * 1000 - 5000 };
    return cachedToken.value;
  } catch {
    return null;
  }
}

/** Resolves a zip code to the nearest Kroger-family store's locationId. */
export async function findLocationId(zip: string): Promise<string | null> {
  const token = await getToken('product.compact');
  if (!token) return null;
  try {
    const res = await fetch(`${API_BASE}/locations?filter.zipCode.near=${encodeURIComponent(zip)}&filter.limit=1`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.data?.[0]?.locationId ?? null;
  } catch {
    return null;
  }
}

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

async function searchProducts(params: string, locationId: string, token: string): Promise<KrogerProduct | null> {
  try {
    const res = await fetch(`${API_BASE}/products?${params}&filter.locationId=${locationId}&filter.limit=1`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return extractProduct(data?.data?.[0]);
  } catch {
    return null;
  }
}

/** Live per-item prices for a list of grocery names, keyed by the name passed in. */
export async function fetchLivePrices(names: string[], locationId: string): Promise<Map<string, number>> {
  const result = new Map<string, number>();
  const token = await getToken('product.compact');
  if (!token) return result;
  await Promise.all(
    names.map(async (name) => {
      const product = await searchProducts(`filter.term=${encodeURIComponent(name)}`, locationId, token);
      if (product) result.set(name, product.price);
    }),
  );
  return result;
}

/** Looks up a scanned UPC/barcode at a given store. */
export async function lookupBarcode(upc: string, locationId: string): Promise<KrogerProduct | null> {
  const token = await getToken('product.compact');
  if (!token) return null;
  return searchProducts(`filter.productId=${encodeURIComponent(upc)}`, locationId, token);
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
