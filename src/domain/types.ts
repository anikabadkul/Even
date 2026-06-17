export type Slot = 'B' | 'L' | 'D';
export type Diet = 'vegan' | 'vegetarian' | 'omnivore' | 'halal' | 'gf';
export type DietLabel = 'Vegan' | 'Vegetarian' | 'Omnivore' | 'Halal' | 'Gluten-free';

export interface Ingredient {
  item: string;
  perServingCost: number;
}

export interface Meal {
  id: string;
  slot: Slot;
  name: string;
  cost: number; // per-serving cost in dollars
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  diets: Diet[];
  ingredients: Ingredient[];
  recipe: string[];
  photo?: string;
  blurb?: string;
}

export interface Household {
  adults: number;
  kids: number;
}

export interface DayPlan {
  dow: string;
  date: string;
  meals: Record<Slot, Meal>;
  cost: number;
  index: number;
}

export interface WeekPicks {
  [dayIndex: number]: Record<Slot, number>;
}

export interface BudgetResult {
  baseHH: number;
  floorHH: number;
  total: number;
  boosterCost: number;
  frac: number;
  targetKcal: number;
  targetProtein: number;
  providedKcal: number;
  providedProtein: number;
  avgKcal: number;
  avgProtein: number;
  calMet: boolean;
  protMet: boolean;
  microMet: boolean;
  calPct: number;
  protPct: number;
  microPct: number;
  fits: boolean;
  gap: number;
  leftover: number;
  meterPct: number;
  showGap: boolean;
}

export interface SkuLine {
  name: string;
  aisle: string;
  count: number;
  cost: number;
  added: boolean;
}
