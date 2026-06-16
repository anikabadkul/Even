export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
export const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
export const KROGER_CLIENT_ID = import.meta.env.VITE_KROGER_CLIENT_ID as string | undefined;
export const KROGER_CLIENT_SECRET = import.meta.env.VITE_KROGER_CLIENT_SECRET as string | undefined;

export const hasGemini = Boolean(GEMINI_API_KEY);
export const hasOpenAI = Boolean(OPENAI_API_KEY);
export const hasAI = hasGemini || hasOpenAI;
export const hasKroger = Boolean(KROGER_CLIENT_ID && KROGER_CLIENT_SECRET);
