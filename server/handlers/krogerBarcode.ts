import type { Handler } from '../http';
import { sendJson, readJsonBody } from '../http';
import { lookupBarcode } from '../providers/kroger';

const handler: Handler = async (req, res) => {
  const body = (await readJsonBody(req)) as { upc?: unknown; locationId?: unknown } | null;
  const upc = body?.upc;
  const locationId = body?.locationId;
  if (typeof upc !== 'string' || typeof locationId !== 'string') {
    sendJson(res, 400, { product: null });
    return;
  }
  const product = await lookupBarcode(upc, locationId);
  sendJson(res, 200, { product });
};

export default handler;
