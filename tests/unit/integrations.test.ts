import { describe, expect, it } from 'vitest';
import { buildWeekPlanPrompt, parseWeekPlanResponse } from '../../src/integrations/aiPlan';
import { applyLivePrices, extractProduct } from '../../src/integrations/kroger';
import { eligibleMeals, mealAt, SLOTS } from '../../src/domain/plan';
import type { PurchaseLine } from '../../src/domain/shopping';

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

describe('kroger integration', () => {
  it('extracts the promo price when one is offered', () => {
    const product = extractProduct({
      description: 'Bananas',
      items: [{ size: '1 lb', price: { regular: 0.59, promo: 0.39 } }],
    });
    expect(product).toEqual({ name: 'Bananas', price: 0.39, size: '1 lb' });
  });

  it('falls back to the regular price when there is no promo', () => {
    const product = extractProduct({ description: 'Rice', items: [{ size: '2 lb', price: { regular: 3.49, promo: 0 } }] });
    expect(product?.price).toBe(3.49);
  });

  it('returns null for a malformed or missing product record', () => {
    expect(extractProduct(undefined)).toBeNull();
    expect(extractProduct({ description: 'Empty' })).toBeNull();
  });

  it('overrides purchase cost with live price times pack count', () => {
    const lines: PurchaseLine[] = [
      { name: 'Rice', aisle: 'Grains & staples', uses: 1, amortizedCost: 1, added: false, packLabel: '2 lb', packs: 2, purchaseCost: 6, leftoverServings: 0 },
      { name: 'Booster snack', aisle: 'Pantry', uses: 0, amortizedCost: 2, added: true, packLabel: 'added', packs: 0, purchaseCost: 2, leftoverServings: 0 },
    ];
    const prices = new Map([['Rice', 2.5]]);
    const result = applyLivePrices(lines, prices);
    expect(result[0].purchaseCost).toBe(5); // 2.5 * 2 packs
    expect(result[1].purchaseCost).toBe(2); // added items are never overridden
  });

  it('leaves a line untouched when no live price was found for it', () => {
    const lines: PurchaseLine[] = [
      { name: 'Oats', aisle: 'Grains & staples', uses: 1, amortizedCost: 1, added: false, packLabel: '1 lb', packs: 1, purchaseCost: 3, leftoverServings: 0 },
    ];
    expect(applyLivePrices(lines, new Map())[0].purchaseCost).toBe(3);
  });
});
