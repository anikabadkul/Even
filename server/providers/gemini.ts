import type { Diet, Meal, WeekPicks } from '../../src/domain/types';
import { MEALS } from '../../src/data/meals';
import { buildWeekPlanPrompt, parseWeekPlanResponse } from '../../src/integrations/aiPlan';

const MODEL = 'gemini-2.0-flash';

export const hasGemini = Boolean(process.env.GEMINI_API_KEY);

/** Asks Gemini to assemble a week; returns null on any failure so callers can fall back to another provider/the local assembler. */
export async function generateWeekPlan(diet: Diet, budget: number, pool: Meal[] = MEALS): Promise<WeekPicks | null> {
  if (!hasGemini) return null;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: buildWeekPlanPrompt(diet, budget, pool) }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as Record<string, unknown>;
    const candidates = data.candidates as Record<string, unknown>[] | undefined;
    const content = candidates?.[0]?.content as Record<string, unknown> | undefined;
    const text = (content?.parts as Record<string, unknown>[] | undefined)?.[0]?.text;
    if (typeof text !== 'string') return null;
    return parseWeekPlanResponse(text, diet, pool);
  } catch {
    return null;
  }
}
