import type { Diet, Meal, WeekPicks } from '../../src/domain/types';
import { MEALS } from '../../src/data/meals';
import { buildWeekPlanPrompt, parseWeekPlanResponse } from '../../src/integrations/aiPlan';

const MODEL = 'grok-4-fast';

export const hasXai = Boolean(process.env.XAI_API_KEY);

/** Asks xAI's Grok (OpenAI-compatible chat completions) to assemble a week; returns null on any failure. */
export async function generateWeekPlan(diet: Diet, budget: number, pool: Meal[] = MEALS): Promise<WeekPicks | null> {
  if (!hasXai) return null;
  try {
    const res = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.XAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        response_format: { type: 'json_object' },
        messages: [{ role: 'user', content: buildWeekPlanPrompt(diet, budget, pool) }],
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Record<string, unknown>;
    const choices = data.choices as Record<string, unknown>[] | undefined;
    const text = (choices?.[0]?.message as Record<string, unknown> | undefined)?.content;
    if (typeof text !== 'string') return null;
    return parseWeekPlanResponse(text, diet, pool);
  } catch {
    return null;
  }
}
