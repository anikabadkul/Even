import type { Diet, Meal, Slot, WeekPicks } from '../domain/types';
import { eligibleMeals, SLOTS } from '../domain/plan';
import { MEALS } from '../data/meals';
import { GEMINI_API_KEY, hasGemini } from './env';

const MODEL = 'gemini-2.0-flash';

export function buildGeminiPrompt(diet: Diet, budget: number, pool: Meal[] = MEALS): string {
  const options = (SLOTS as Slot[]).map((slot) => ({
    slot,
    meals: eligibleMeals(slot, diet, pool).map((m) => ({ id: m.id, name: m.name, cost: m.cost })),
  }));
  return [
    `You are planning a 7-day meal calendar for a "${diet}" diet on a weekly grocery budget of $${budget.toFixed(2)}.`,
    'Pick one meal id per day per slot (B = breakfast, L = lunch, D = dinner) from the eligible lists below.',
    'Favor variety across the week (avoid repeating the same meal id more than twice) and lean toward lower-cost meals when the budget is tight.',
    'Eligible meals by slot:',
    JSON.stringify(options),
    'Respond with ONLY a JSON object of this exact shape, no prose, no markdown fences:',
    '{"0":{"B":"<mealId>","L":"<mealId>","D":"<mealId>"},"1":{...}, ... "6":{...}}',
  ].join('\n');
}

/** Validates and converts a Gemini response into WeekPicks (indices into eligibleMeals), or null if invalid. */
export function parseGeminiPlan(responseText: string, diet: Diet, pool: Meal[] = MEALS): WeekPicks | null {
  let raw: unknown;
  try {
    const cleaned = responseText.trim().replace(/^```(json)?/i, '').replace(/```$/, '').trim();
    raw = JSON.parse(cleaned);
  } catch {
    return null;
  }
  if (!raw || typeof raw !== 'object') return null;

  const picks: WeekPicks = {};
  const eligibleBySlot = Object.fromEntries(
    (SLOTS as Slot[]).map((slot) => [slot, eligibleMeals(slot, diet, pool)]),
  ) as Record<Slot, Meal[]>;

  for (let day = 0; day < 7; day++) {
    const dayObj = (raw as Record<string, unknown>)[String(day)];
    if (!dayObj || typeof dayObj !== 'object') return null;
    const row = {} as Record<Slot, number>;
    for (const slot of SLOTS as Slot[]) {
      const mealId = (dayObj as Record<string, unknown>)[slot];
      if (typeof mealId !== 'string') return null;
      const index = eligibleBySlot[slot].findIndex((m) => m.id === mealId);
      if (index < 0) return null;
      row[slot] = index;
    }
    picks[day] = row;
  }
  return picks;
}

/** Asks Gemini to assemble a week; returns null on any failure so callers can fall back to the local assembler. */
export async function generateWeekPlan(diet: Diet, budget: number, pool: Meal[] = MEALS): Promise<WeekPicks | null> {
  if (!hasGemini) return null;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: buildGeminiPrompt(diet, budget, pool) }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      },
    );
    if (!res.ok) return null;
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== 'string') return null;
    return parseGeminiPlan(text, diet, pool);
  } catch {
    return null;
  }
}
