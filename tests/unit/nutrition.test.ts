import { describe, expect, it } from 'vitest';
import { householdLabel, householdSize, targetCalories, targetProtein } from '../../src/domain/nutrition';

describe('nutrition targets', () => {
  it('one adult targets 2000 kcal / 50g protein', () => {
    expect(targetCalories({ adults: 1, kids: 0 })).toBe(2000);
    expect(targetProtein({ adults: 1, kids: 0 })).toBe(50);
  });

  it('two adults plus two kids combine adult and kid guidelines', () => {
    const hh = { adults: 2, kids: 2 };
    expect(targetCalories(hh)).toBe(2 * 2000 + 2 * 1500);
    expect(targetProtein(hh)).toBe(2 * 50 + 2 * 30);
  });

  it('household size is never below 1', () => {
    expect(householdSize({ adults: 0, kids: 0 })).toBe(1);
  });

  it('formats a readable household label', () => {
    expect(householdLabel({ adults: 1, kids: 0 })).toBe('1 adult');
    expect(householdLabel({ adults: 2, kids: 2 })).toBe('2 adults, 2 kids');
    expect(householdLabel({ adults: 2, kids: 1 })).toBe('2 adults, 1 kid');
  });
});
