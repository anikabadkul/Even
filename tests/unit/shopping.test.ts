import { describe, expect, it } from 'vitest';
import { assembleWeek } from '../../src/domain/plan';
import { aggregateIngredients, buildShoppingList } from '../../src/domain/shopping';
import type { Household } from '../../src/domain/types';

describe('shopping list aggregation', () => {
  const hh: Household = { adults: 2, kids: 1 };
  const picks = assembleWeek('omnivore', 0);
  const items = aggregateIngredients(picks, 'omnivore', hh, []);

  it('aggregates every distinct ingredient across the week', () => {
    expect(items.length).toBeGreaterThan(0);
    const names = new Set(items.map((i) => i.name));
    expect(names.size).toBe(items.length);
  });

  it('sorts by cost, most expensive first', () => {
    for (let i = 1; i < items.length; i++) {
      expect(items[i - 1].amortizedCost).toBeGreaterThanOrEqual(items[i].amortizedCost - 1e-9);
    }
  });

  it('booster items are flagged as added with no recipe uses', () => {
    const withBooster = aggregateIngredients(picks, 'omnivore', hh, [{ name: 'Milk (calcium)', cost: 2 }]);
    const booster = withBooster.find((i) => i.name === 'Milk (calcium)');
    expect(booster?.added).toBe(true);
    expect(booster?.uses).toBe(0);
  });

  it('the purchase list converts uses into real packs scaled by household size', () => {
    const lines = buildShoppingList(items, hh);
    for (const line of lines) {
      if (line.added) continue;
      expect(line.packs).toBeGreaterThanOrEqual(1);
      expect(line.purchaseCost).toBeGreaterThan(0);
      expect(line.leftoverServings).toBeGreaterThanOrEqual(0);
    }
  });

  it('a larger household needs at least as many packs as a smaller one', () => {
    const small: Household = { adults: 1, kids: 0 };
    const big: Household = { adults: 4, kids: 1 };
    const smallLines = buildShoppingList(aggregateIngredients(picks, 'omnivore', small, []), small);
    const bigLines = buildShoppingList(aggregateIngredients(picks, 'omnivore', big, []), big);
    const smallTotal = smallLines.reduce((s, l) => s + l.packs, 0);
    const bigTotal = bigLines.reduce((s, l) => s + l.packs, 0);
    expect(bigTotal).toBeGreaterThanOrEqual(smallTotal);
  });
});
