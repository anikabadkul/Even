import type { IncomingMessage, ServerResponse } from 'node:http';

/** A handler signature that's a structural subset of both Node's http and Vercel's (req, res) functions. */
export type Handler = (req: IncomingMessage, res: ServerResponse) => Promise<void>;

export function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

export async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  if (chunks.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return null;
  }
}

export function getQuery(req: IncomingMessage): URLSearchParams {
  const url = req.url ?? '';
  const i = url.indexOf('?');
  return new URLSearchParams(i >= 0 ? url.slice(i + 1) : '');
}
