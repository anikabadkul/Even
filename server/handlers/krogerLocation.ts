import type { Handler } from '../http';
import { sendJson, getQuery } from '../http';
import { findLocationId } from '../providers/kroger';

const handler: Handler = async (req, res) => {
  const zip = getQuery(req).get('zip');
  if (!zip) {
    sendJson(res, 400, { locationId: null });
    return;
  }
  const locationId = await findLocationId(zip);
  sendJson(res, 200, { locationId });
};

export default handler;
