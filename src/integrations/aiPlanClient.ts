import type { Diet, WeekPicks } from '../domain/types';

/** Asks the server-side proxy to assemble a week (tries OpenAI, then Groq, then Gemini); returns null on any failure. */
export async function generateWeekPlan(diet: Diet, budget: number): Promise<WeekPicks | null> {
  try {
    const res = await fetch('/api/generate-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ diet, budget }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.plan ?? null;
  } catch {
    return null;
  }
}
