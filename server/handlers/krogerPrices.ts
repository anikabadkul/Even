import type { Handler } from '../http';
import { sendJson, readJsonBody } from '../http';
import { fetchLivePrices } from '../providers/kroger';

const handler: Handler = async (req, res) => {
  const body = (await readJsonBody(req)) as { names?: unknown; locationId?: unknown } | null;
  const names = body?.names;
  const locationId = body?.locationId;
  if (!Array.isArray(names) || typeof locationId !== 'string') {
    sendJson(res, 400, { prices: [] });
    return;
  }
  const prices = await fetchLivePrices(names.filter((n): n is string => typeof n === 'string'), locationId);
  sendJson(res, 200, { prices: Array.from(prices.entries()) });
};

export default handler;
