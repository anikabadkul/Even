import type { BudgetResult, Diet, Household, Meal, Slot, WeekPicks } from './types';
import { TFP_WEEKLY_FLOOR } from '../data/references';
import { effFor, clamp } from './money';
import { householdSize, targetCalories, targetProtein } from './nutrition';
import { mealAt, SLOTS } from './plan';
import { MEALS } from '../data/meals';

export function floorFor(size: number): number {
  const n = Math.min(Math.max(1, Math.round(size)), 5);
  return TFP_WEEKLY_FLOOR[n];
}

interface WeekCostSummary {
  perPersonWeeklyCost: number; // sum of the assembled week's per-serving costs
  avgKcalPerDay: number; // per serving, averaged across the week
  avgProteinPerDay: number;
}

export function summarizeWeek(picks: WeekPicks, diet: Diet, pool: Meal[] = MEALS): WeekCostSummary {
  let cost = 0;
  let kcal = 0;
  let protein = 0;
  for (let day = 0; day < 7; day++) {
    for (const slot of SLOTS as Slot[]) {
      const meal = mealAt(picks, day, slot, diet, pool);
      cost += meal.cost;
      kcal += meal.kcal;
      protein += meal.protein;
    }
  }
  return {
    perPersonWeeklyCost: cost,
    avgKcalPerDay: kcal / 7,
    avgProteinPerDay: protein / 7,
  };
}

/**
 * The honest budget model. Computes how far a given budget reaches
 * toward a complete week for this household, and where it falls short.
 */
export function computeBudget(budget: number, hh: Household, week: WeekCostSummary): BudgetResult {
  const n = householdSize(hh);
  const eff = effFor(n);
  const floorHH = floorFor(n);

  const baseHH = week.perPersonWeeklyCost * n * eff;
  const baseKcalHHDay = week.avgKcalPerDay * n;
  const baseProteinHHDay = week.avgProteinPerDay * n;

  const targetKcal = targetCalories(hh);
  const targetProt = targetProtein(hh);

  const spend = Math.min(budget, floorHH);
  const denom = floorHH - baseHH;
  const frac = denom > 0 ? clamp((spend - baseHH) / denom, 0, 1) : budget >= baseHH ? 1 : 0;

  const boosterCost = frac * Math.max(0, floorHH - baseHH);
  const total = baseHH + boosterCost;

  const providedKcal = baseKcalHHDay + frac * Math.max(0, targetKcal - baseKcalHHDay);
  const providedProtein = baseProteinHHDay + frac * Math.max(0, targetProt - baseProteinHHDay);

  const calMet = providedKcal >= targetKcal * 0.97;
  const protMet = providedProtein >= targetProt * 0.97;
  const microMet = frac >= 0.85;

  const calPct = Math.min(100, (providedKcal / targetKcal) * 100);
  const protPct = Math.min(100, (providedProtein / targetProt) * 100);
  const microPct = Math.min(100, frac * 100);

  const fits = total <= budget + 0.001;
  const gap = Math.max(0, floorHH - budget);
  const leftover = budget - total;
  const meterPct = Math.min(100, (budget / floorHH) * 100);
  const showGap = budget < floorHH || !calMet || !protMet || !microMet;

  return {
    baseHH,
    floorHH,
    total,
    boosterCost,
    frac,
    targetKcal,
    targetProtein: targetProt,
    providedKcal,
    providedProtein,
    avgKcal: Math.round(providedKcal / 10) * 10,
    avgProtein: Math.round(providedProtein),
    calMet,
    protMet,
    microMet,
    calPct,
    protPct,
    microPct,
    fits,
    gap,
    leftover,
    meterPct,
    showGap,
  };
}

/** The "added with your budget" enrichment items, cheapest nutrition wins first. */
export function boosterItems(boosterCost: number): { name: string; cost: number }[] {
  if (boosterCost < 0.5) return [];
  const split: [string, number][] = [
    ['Milk (calcium)', 0.28],
    ['Eggs (protein)', 0.2],
    ['Frozen greens (iron)', 0.27],
    ['Fruit', 0.25],
  ];
  return split.map(([name, fraction]) => ({ name, cost: boosterCost * fraction }));
}
