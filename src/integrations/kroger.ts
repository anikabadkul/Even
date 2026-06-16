import { applyLivePrices, extractProduct, type KrogerProduct } from './krogerShared';

export type { KrogerProduct };
export { applyLivePrices, extractProduct };

/** Resolves a zip code to the nearest Kroger-family store's locationId, via the server proxy. */
export async function findLocationId(zip: string): Promise<string | null> {
  try {
    const res = await fetch(`/api/kroger/location?zip=${encodeURIComponent(zip)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.locationId ?? null;
  } catch {
    return null;
  }
}

/** Live per-item prices for a list of grocery names, keyed by the name passed in, via the server proxy. */
export async function fetchLivePrices(names: string[], locationId: string): Promise<Map<string, number>> {
  try {
    const res = await fetch('/api/kroger/prices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ names, locationId }),
    });
    if (!res.ok) return new Map();
    const data = await res.json();
    return new Map(data?.prices ?? []);
  } catch {
    return new Map();
  }
}

/** Looks up a scanned UPC/barcode at a given store, via the server proxy. */
export async function lookupBarcode(upc: string, locationId: string): Promise<KrogerProduct | null> {
  try {
    const res = await fetch('/api/kroger/barcode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ upc, locationId }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.product ?? null;
  } catch {
    return null;
  }
}
