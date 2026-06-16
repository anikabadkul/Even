import { describe, expect, it } from 'vitest';
import { buildWeekPlanPrompt, parseWeekPlanResponse } from '../../src/integrations/aiPlan';
import { eligibleMeals, mealAt, SLOTS } from '../../src/domain/plan';

describe('shared AI plan prompt/response handling (used by both Gemini and OpenAI)', () => {
  it('builds a prompt that lists every eligible meal id for the diet', () => {
    const prompt = buildWeekPlanPrompt('vegan', 50);
    for (const slot of SLOTS) {
      for (const meal of eligibleMeals(slot, 'vegan')) {
        expect(prompt).toContain(meal.id);
      }
    }
  });

  it('parses a valid model response into WeekPicks matching real meal ids', () => {
    const diet = 'vegetarian';
    const day = Object.fromEntries(
      SLOTS.map((slot) => [slot, eligibleMeals(slot, diet)[0].id]),
    );
    const response = JSON.stringify(Object.fromEntries([0, 1, 2, 3, 4, 5, 6].map((d) => [d, day])));
    const picks = parseWeekPlanResponse(response, diet);
    expect(picks).not.toBeNull();
    for (let d = 0; d < 7; d++) {
      for (const slot of SLOTS) {
        const meal = mealAt(picks!, d, slot, diet);
        expect(meal.diets).toContain(diet);
      }
    }
  });

  it('strips markdown code fences before parsing', () => {
    const diet = 'omnivore';
    const day = Object.fromEntries(SLOTS.map((slot) => [slot, eligibleMeals(slot, diet)[0].id]));
    const body = Object.fromEntries([0, 1, 2, 3, 4, 5, 6].map((d) => [d, day]));
    const response = '```json\n' + JSON.stringify(body) + '\n```';
    expect(parseWeekPlanResponse(response, diet)).not.toBeNull();
  });

  it('rejects a response missing a day', () => {
    const diet = 'omnivore';
    const day = Object.fromEntries(SLOTS.map((slot) => [slot, eligibleMeals(slot, diet)[0].id]));
    const body = Object.fromEntries([0, 1, 2, 3, 4, 5].map((d) => [d, day])); // missing day 6
    expect(parseWeekPlanResponse(JSON.stringify(body), diet)).toBeNull();
  });

  it('rejects a response referencing an unknown meal id', () => {
    const diet = 'omnivore';
    const day = Object.fromEntries(SLOTS.map((slot) => [slot, 'not-a-real-id']));
    const body = Object.fromEntries([0, 1, 2, 3, 4, 5, 6].map((d) => [d, day]));
    expect(parseWeekPlanResponse(JSON.stringify(body), diet)).toBeNull();
  });

  it('rejects malformed JSON', () => {
    expect(parseWeekPlanResponse('not json at all', 'omnivore')).toBeNull();
  });
});
