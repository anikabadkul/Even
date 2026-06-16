import type { Diet, Meal, WeekPicks } from '../../src/domain/types';
import { MEALS } from '../../src/data/meals';
import { buildWeekPlanPrompt, parseWeekPlanResponse } from '../../src/integrations/aiPlan';

const MODEL = 'llama-3.3-70b-versatile';

export const hasGroq = Boolean(process.env.GROQ_API_KEY);

/** Asks Groq (OpenAI-compatible chat completions) to assemble a week; returns null on any failure. */
export async function generateWeekPlan(diet: Diet, budget: number, pool: Meal[] = MEALS): Promise<WeekPicks | null> {
  if (!hasGroq) return null;
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
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
