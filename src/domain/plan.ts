import type { Diet, DietLabel, Meal, Slot, WeekPicks } from './types';
import { MEALS } from '../data/meals';

export const DIET_KEY: Record<DietLabel, Diet> = {
  Vegan: 'vegan',
  Vegetarian: 'vegetarian',
  Omnivore: 'omnivore',
  Halal: 'halal',
  'Gluten-free': 'gf',
};

export const SLOTS: Slot[] = ['B', 'L', 'D'];
export const SLOT_LABEL: Record<Slot, string> = { B: 'Breakfast', L: 'Lunch', D: 'Dinner' };

export function eligibleMeals(slot: Slot, diet: Diet, pool: Meal[] = MEALS): Meal[] {
  return pool.filter((m) => m.slot === slot && m.diets.includes(diet));
}

/**
 * Deterministic week assembly seeded by a counter so the result is
 * reproducible. Shuffle increments the seed; swap mutates one slot.
 */
export function assembleWeek(diet: Diet, seed: number, pool: Meal[] = MEALS): WeekPicks {
  const offsets: Record<Slot, number> = { B: 0, L: 2, D: 4 };
  const picks: WeekPicks = {};
  for (let day = 0; day < 7; day++) {
    const row = {} as Record<Slot, number>;
    for (const slot of SLOTS) {
      const elig = eligibleMeals(slot, diet, pool);
      row[slot] = elig.length ? (day + offsets[slot] + seed * 3) % elig.length : 0;
    }
    picks[day] = row;
  }
  return picks;
}

export function mealAt(picks: WeekPicks, day: number, slot: Slot, diet: Diet, pool: Meal[] = MEALS): Meal {
  const elig = eligibleMeals(slot, diet, pool);
  if (!elig.length) throw new Error(`No meals available for slot ${slot} and diet ${diet}`);
  return elig[picks[day][slot] % elig.length];
}

export function swapMeal(picks: WeekPicks, day: number, slot: Slot, newIndex: number): WeekPicks {
  return { ...picks, [day]: { ...picks[day], [slot]: newIndex } };
}

/** Asserts no meal is tagged for a diet it actually breaks. Used by tests. */
export function findDietViolations(pool: Meal[] = MEALS): { mealId: string; diet: Diet; reason: string }[] {
  const violations: { mealId: string; diet: Diet; reason: string }[] = [];
  const meatWords = /chicken|beef|salmon|tuna/i;
  const isPlantMilk = (item: string) => /soy milk|coconut milk/i.test(item);
  const dairyEggWords = /\begg|cheese|yogurt|\bmilk\b/i;
  const isCornBased = (item: string) => /corn tortilla|corn grits|cornbread/i.test(item);
  const wheatWords = /bread|pasta|spaghetti|tortilla|flour/i;

  for (const meal of pool) {
    const items = meal.ingredients.map((i) => i.item);
    const hasMeat = items.some((it) => meatWords.test(it));
    const hasDairyEgg = items.some((it) => dairyEggWords.test(it) && !isPlantMilk(it));
    const hasWheat = items.some((it) => wheatWords.test(it) && !isCornBased(it));

    if (meal.diets.includes('vegan')) {
      if (hasMeat) violations.push({ mealId: meal.id, diet: 'vegan', reason: 'contains meat/fish' });
      if (hasDairyEgg) violations.push({ mealId: meal.id, diet: 'vegan', reason: 'contains dairy/egg' });
    }
    if (meal.diets.includes('vegetarian') && hasMeat) {
      violations.push({ mealId: meal.id, diet: 'vegetarian', reason: 'contains meat/fish' });
    }
    if (meal.diets.includes('gf') && hasWheat) {
      violations.push({ mealId: meal.id, diet: 'gf', reason: 'contains wheat/gluten ingredient' });
    }
  }
  return violations;
}
