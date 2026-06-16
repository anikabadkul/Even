import type { Handler } from '../http';
import { sendJson } from '../http';
import { hasOpenAI } from '../providers/openai';
import { hasXai } from '../providers/xai';
import { hasGroq } from '../providers/groq';
import { hasGemini } from '../providers/gemini';

const handler: Handler = async (_req, res) => {
  sendJson(res, 200, { ai: hasOpenAI || hasXai || hasGroq || hasGemini });
};

export default handler;
