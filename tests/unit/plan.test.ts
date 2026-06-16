import { describe, expect, it } from 'vitest';
import { assembleWeek, eligibleMeals, findDietViolations, mealAt, swapMeal, SLOTS } from '../../src/domain/plan';
import { MEALS } from '../../src/data/meals';
import { PANTRY } from '../../src/data/pantry';
import type { Diet } from '../../src/domain/types';

const DIETS: Diet[] = ['vegan', 'vegetarian', 'omnivore', 'halal', 'gf'];

describe('diet enforcement', () => {
  it('has at least 8 options per slot for every diet', () => {
    for (const diet of DIETS) {
      for (const slot of SLOTS) {
        const count = eligibleMeals(slot, diet).length;
        expect(count, `${diet} ${slot} has only ${count} options`).toBeGreaterThanOrEqual(8);
      }
    }
  });

  it('no meal is tagged for a diet it actually breaks', () => {
    const violations = findDietViolations();
    expect(violations).toEqual([]);
  });

  it('an assembled week never contains a meal outside the selected diet', () => {
    for (const diet of DIETS) {
      const picks = assembleWeek(diet, 0);
      for (let day = 0; day < 7; day++) {
        for (const slot of SLOTS) {
          const meal = mealAt(picks, day, slot, diet);
          expect(meal.diets).toContain(diet);
        }
      }
    }
  });
});

describe('assembly determinism', () => {
  it('the same diet and seed always produce the same week', () => {
    const a = assembleWeek('omnivore', 3);
    const b = assembleWeek('omnivore', 3);
    expect(a).toEqual(b);
  });

  it('shuffle (incrementing the seed) changes at least one slot', () => {
    const a = assembleWeek('omnivore', 0);
    const b = assembleWeek('omnivore', 1);
    expect(a).not.toEqual(b);
  });
});

describe('swap', () => {
  it('changes exactly one slot and leaves the rest untouched', () => {
    const picks = assembleWeek('omnivore', 0);
    const swapped = swapMeal(picks, 2, 'L', 5);
    expect(swapped[2].L).toBe(5);
    expect(swapped[2].B).toBe(picks[2].B);
    expect(swapped[2].D).toBe(picks[2].D);
    expect(swapped[0]).toEqual(picks[0]);
  });
});

describe('pool sanity', () => {
  it('every meal belongs to a valid slot and has positive cost/macros', () => {
    for (const meal of MEALS) {
      expect(['B', 'L', 'D']).toContain(meal.slot);
      expect(meal.cost).toBeGreaterThan(0);
      expect(meal.kcal).toBeGreaterThan(0);
    }
  });

  it('every ingredient in the meal pool has a matching pantry SKU', () => {
    const pantrySet = new Set(PANTRY.map((p) => p.item));
    const missing = new Set<string>();
    for (const meal of MEALS) {
      for (const ing of meal.ingredients) {
        if (!pantrySet.has(ing.item)) missing.add(ing.item);
      }
    }
    expect([...missing]).toEqual([]);
  });
});
