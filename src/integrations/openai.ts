import type { Diet, Meal, WeekPicks } from '../domain/types';
import { MEALS } from '../data/meals';
import { OPENAI_API_KEY, hasOpenAI } from './env';
import { buildWeekPlanPrompt, parseWeekPlanResponse } from './aiPlan';

const MODEL = 'gpt-4o-mini';

/** Asks OpenAI to assemble a week; returns null on any failure so callers can fall back to another provider/the local assembler. */
export async function generateWeekPlan(diet: Diet, budget: number, pool: Meal[] = MEALS): Promise<WeekPicks | null> {
  if (!hasOpenAI) return null;
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        response_format: { type: 'json_object' },
        messages: [{ role: 'user', content: buildWeekPlanPrompt(diet, budget, pool) }],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    if (typeof text !== 'string') return null;
    return parseWeekPlanResponse(text, diet, pool);
  } catch {
    return null;
  }
}
