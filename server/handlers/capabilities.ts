import type { Handler } from '../http';
import { sendJson } from '../http';
import { hasOpenAI } from '../providers/openai';
import { hasGroq } from '../providers/groq';
import { hasGemini } from '../providers/gemini';
import { hasKroger } from '../providers/kroger';

const handler: Handler = async (_req, res) => {
  sendJson(res, 200, { ai: hasOpenAI || hasGroq || hasGemini, kroger: hasKroger });
};

export default handler;
