import type { Diet, Household, Meal, Slot, WeekPicks } from './types';
import { effFor } from './money';
import { householdSize } from './nutrition';
import { mealAt, SLOTS } from './plan';
import { findSku } from '../data/pantry';
import { MEALS } from '../data/meals';

export interface AggregatedItem {
  name: string;
  aisle: string;
  uses: number; // number of recipe servings called for, before household scaling
  amortizedCost: number; // amortized cost-of-food-used, consistent with the budget math
  added: boolean;
}

export interface PurchaseLine extends AggregatedItem {
  packLabel: string;
  packs: number;
  purchaseCost: number; // what you actually pay at the till
  leftoverServings: number;
  perishableDays?: number; // set if the item spoils; undefined = shelf-stable
}

/** Aggregates ingredients across the assembled week, amortized-cost basis. */
export function aggregateIngredients(
  picks: WeekPicks,
  diet: Diet,
  hh: Household,
  boosterItems: { name: string; cost: number }[],
  pool: Meal[] = MEALS,
): AggregatedItem[] {
  const eff = effFor(householdSize(hh));
  const map = new Map<string, AggregatedItem>();
  const order: string[] = [];

  for (let day = 0; day < 7; day++) {
    for (const slot of SLOTS as Slot[]) {
      const meal = mealAt(picks, day, slot, diet, pool);
      for (const ing of meal.ingredients) {
        if (!map.has(ing.item)) {
          map.set(ing.item, { name: ing.item, aisle: aisleFor(ing.item), uses: 0, amortizedCost: 0, added: false });
          order.push(ing.item);
        }
        const entry = map.get(ing.item)!;
        entry.uses += 1;
        entry.amortizedCost += ing.perServingCost * eff;
      }
    }
  }

  for (const b of boosterItems) {
    map.set(b.name, { name: b.name, aisle: aisleFor(b.name), uses: 0, amortizedCost: b.cost, added: true });
    order.push(b.name);
  }

  return order.map((k) => map.get(k)!).sort((a, b) => b.amortizedCost - a.amortizedCost);
}

/** Converts amortized aggregation into a real, purchasable list with packs/quantities. */
export function buildShoppingList(items: AggregatedItem[], hh: Household): PurchaseLine[] {
  const n = householdSize(hh);
  return items.map((item) => {
    const sku = findSku(item.name);
    if (!sku || item.added) {
      return { ...item, packLabel: item.added ? 'added' : '', packs: 0, purchaseCost: item.amortizedCost, leftoverServings: 0 };
    }
    const servingsNeeded = item.uses * n;
    const packs = Math.max(1, Math.ceil(servingsNeeded / sku.packServings));
    const purchaseCost = packs * sku.packPrice;
    const leftoverServings = packs * sku.packServings - servingsNeeded;
    return { ...item, packLabel: sku.packLabel, packs, purchaseCost, leftoverServings, perishableDays: sku.perishableDays };
  });
}

function aisleFor(name: string): string {
  const s = name.toLowerCase();
  if (/milk|cheese|yogurt|margarine|^egg/.test(s)) return 'Dairy & eggs';
  if (/lentil|bean|chickpea|tofu|chicken|beef|peanut butter|tuna|salmon|chia/.test(s)) return 'Protein & beans';
  if (/rice|oat|bread|pasta|spaghetti|tortilla|flour|potato|quinoa|grits|cornbread/.test(s)) return 'Grains & staples';
  if (/banana|apple|fruit|berr|carrot|onion|pepper|cabbage|greens|veg|salsa|tomato|corn/.test(s)) return 'Produce';
  return 'Pantry';
}

export const AISLE_ORDER = ['Grains & staples', 'Protein & beans', 'Produce', 'Dairy & eggs', 'Pantry'];
