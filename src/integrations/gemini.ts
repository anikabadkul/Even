import type { Diet, Meal, WeekPicks } from '../domain/types';
import { MEALS } from '../data/meals';
import { GEMINI_API_KEY, hasGemini } from './env';
import { buildWeekPlanPrompt, parseWeekPlanResponse } from './aiPlan';

const MODEL = 'gemini-2.0-flash';

/** Asks Gemini to assemble a week; returns null on any failure so callers can fall back to another provider/the local assembler. */
export async function generateWeekPlan(diet: Diet, budget: number, pool: Meal[] = MEALS): Promise<WeekPicks | null> {
  if (!hasGemini) return null;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
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
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== 'string') return null;
    return parseWeekPlanResponse(text, diet, pool);
  } catch {
    return null;
  }
}
