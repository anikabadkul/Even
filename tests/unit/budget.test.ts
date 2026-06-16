import { describe, expect, it } from 'vitest';
import { assembleWeek } from '../../src/domain/plan';
import { computeBudget, summarizeWeek, floorFor, boosterItems } from '../../src/domain/budget';
import type { Household } from '../../src/domain/types';

function planFor(diet: 'vegan' | 'vegetarian' | 'omnivore' | 'halal' | 'gf', seed = 0) {
  const picks = assembleWeek(diet, seed);
  return summarizeWeek(picks, diet);
}

describe('budget model — persona: one adult at $41.50', () => {
  const hh: Household = { adults: 1, kids: 0 };
  const week = planFor('omnivore');

  it('computes a sane base cost for one person', () => {
    const result = computeBudget(41.5, hh, week);
    expect(result.baseHH).toBeGreaterThan(0);
    expect(result.baseHH).toBeLessThan(60);
  });

  it('uses the published floor for household size 1', () => {
    const result = computeBudget(41.5, hh, week);
    expect(result.floorHH).toBe(floorFor(1));
    expect(result.floorHH).toBeCloseTo(57.4, 5);
  });

  it('never reports a higher total than the floor', () => {
    const result = computeBudget(1000, hh, week);
    expect(result.total).toBeCloseTo(result.floorHH, 5);
    expect(result.total).toBeLessThanOrEqual(result.floorHH + 0.001);
  });

  it('reports an honest gap when below the floor', () => {
    const result = computeBudget(41.5, hh, week);
    expect(result.gap).toBeCloseTo(result.floorHH - 41.5, 5);
    expect(result.gap).toBeGreaterThan(0);
  });
});

describe('budget model — persona: two adults + two kids at $198', () => {
  const hh: Household = { adults: 2, kids: 2 };
  const week = planFor('omnivore');

  it('computes the floor for household size 4', () => {
    const result = computeBudget(198, hh, week);
    expect(result.floorHH).toBeCloseTo(229.0, 5);
  });

  it('fraction and gap move together correctly', () => {
    const result = computeBudget(198, hh, week);
    expect(result.frac).toBeGreaterThanOrEqual(0);
    expect(result.frac).toBeLessThanOrEqual(1);
    expect(result.gap).toBeCloseTo(229.0 - 198, 5);
  });

  it('total rises monotonically with budget up to the floor', () => {
    const low = computeBudget(150, hh, week);
    const mid = computeBudget(198, hh, week);
    const high = computeBudget(229, hh, week);
    expect(mid.total).toBeGreaterThanOrEqual(low.total - 0.001);
    expect(high.total).toBeGreaterThanOrEqual(mid.total - 0.001);
    expect(high.total).toBeCloseTo(229.0, 2);
  });
});

describe('edge cases', () => {
  it('budget below the cheapest possible plan never claims to fit', () => {
    const hh: Household = { adults: 1, kids: 0 };
    const week = planFor('omnivore');
    const result = computeBudget(5, hh, week);
    expect(result.fits).toBe(false);
    expect(result.total).toBeGreaterThan(5);
  });

  it('budget far above the floor caps spending at a complete week and shows leftover', () => {
    const hh: Household = { adults: 1, kids: 0 };
    const week = planFor('omnivore');
    const result = computeBudget(400, hh, week);
    expect(result.total).toBeCloseTo(result.floorHH, 2);
    expect(result.leftover).toBeCloseTo(400 - result.floorHH, 2);
    expect(result.fits).toBe(true);
  });

  it('household of five uses the size-5 floor and efficiency factor', () => {
    const hh: Household = { adults: 3, kids: 2 };
    const week = planFor('omnivore');
    const result = computeBudget(272, hh, week);
    expect(result.floorHH).toBeCloseTo(272.0, 5);
  });

  it('gap is exactly zero once budget reaches the floor', () => {
    const hh: Household = { adults: 1, kids: 0 };
    const week = planFor('omnivore');
    const result = computeBudget(floorFor(1), hh, week);
    expect(result.gap).toBeCloseTo(0, 5);
    expect(result.fits).toBe(true);
  });

  it('booster items are empty below the rounding threshold', () => {
    expect(boosterItems(0.1)).toEqual([]);
  });

  it('booster items split proportionally and sum to the booster cost', () => {
    const items = boosterItems(20);
    const sum = items.reduce((s, i) => s + i.cost, 0);
    expect(sum).toBeCloseTo(20, 5);
  });
});
