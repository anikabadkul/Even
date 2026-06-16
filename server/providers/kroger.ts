import { extractProduct, type KrogerProduct } from '../../src/integrations/krogerShared';

const TOKEN_URL = 'https://api.kroger.com/v1/connect/oauth2/token';
const API_BASE = 'https://api.kroger.com/v1';

export const hasKroger = Boolean(process.env.KROGER_CLIENT_ID && process.env.KROGER_CLIENT_SECRET);

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getToken(scope: string): Promise<string | null> {
  if (!hasKroger) return null;
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.value;
  try {
    const basic = Buffer.from(`${process.env.KROGER_CLIENT_ID}:${process.env.KROGER_CLIENT_SECRET}`).toString(
      'base64',
    );
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `grant_type=client_credentials&scope=${encodeURIComponent(scope)}`,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Record<string, unknown>;
    if (typeof data.access_token !== 'string') return null;
    const expiresIn = typeof data.expires_in === 'number' ? data.expires_in : 1800;
    cachedToken = { value: data.access_token, expiresAt: Date.now() + expiresIn * 1000 - 5000 };
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
    const data = (await res.json()) as Record<string, unknown>;
    const rows = data.data as Record<string, unknown>[] | undefined;
    return (rows?.[0]?.locationId as string | undefined) ?? null;
  } catch {
    return null;
  }
}

async function searchProducts(params: string, locationId: string, token: string): Promise<KrogerProduct | null> {
  try {
    const res = await fetch(`${API_BASE}/products?${params}&filter.locationId=${locationId}&filter.limit=1`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Record<string, unknown>;
    const rows = data.data as Record<string, unknown>[] | undefined;
    return extractProduct(rows?.[0]);
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
