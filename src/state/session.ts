import { create } from 'zustand';
import { assembleWeek } from '../domain/plan';
import { DIET_KEY } from '../domain/plan';
import type { Diet, DietLabel, WeekPicks } from '../domain/types';
import { generateWeekPlan } from '../integrations/aiPlanClient';
import { fetchCapabilities, type Capabilities } from '../integrations/env';

export type Screen = 'welcome' | 'setup' | 'plan' | 'list';
export type AsyncStatus = 'idle' | 'loading' | 'done' | 'error';

export interface SelectedMeal {
  day: number;
  slot: 'B' | 'L' | 'D';
}

interface SessionState {
  screen: Screen;
  budget: number;
  adults: number;
  kids: number;
  diet: DietLabel;
  seed: number;
  picks: WeekPicks;
  picksDiet: Diet;
  edited: boolean;
  saved: boolean;
  selected: SelectedMeal | null;

  capabilities: Capabilities;
  loadCapabilities: () => Promise<void>;

  aiStatus: AsyncStatus;
  generateWithAI: () => Promise<void>;

  setScreen: (s: Screen) => void;
  setBudget: (n: number) => void;
  setAdults: (n: number) => void;
  setKids: (n: number) => void;
  setDiet: (d: DietLabel) => void;
  rebuildIfDietChanged: () => void;
  shuffle: () => { undo: () => void };
  swap: (day: number, slot: 'B' | 'L' | 'D', index: number) => void;
  openMeal: (day: number, slot: 'B' | 'L' | 'D') => void;
  closeMeal: () => void;
  markSaved: () => void;
}

const clampBudget = (v: number) => Math.min(400, Math.max(10, Math.round((v || 0) * 2) / 2));

export const useSession = create<SessionState>((set, get) => ({
  screen: 'welcome',
  budget: 41.5,
  adults: 1,
  kids: 0,
  diet: 'Vegetarian',
  seed: 0,
  picks: assembleWeek(DIET_KEY['Vegetarian'], 0),
  picksDiet: DIET_KEY['Vegetarian'],
  edited: false,
  saved: false,
  selected: null,

  capabilities: { ai: false },

  aiStatus: 'idle',

  setScreen: (s) => set({ screen: s }),
  setBudget: (n) => set({ budget: clampBudget(n) }),
  setAdults: (n) => set({ adults: n }),
  setKids: (n) => set({ kids: n }),
  setDiet: (d) => set({ diet: d }),

  rebuildIfDietChanged: () => {
    const { diet, picksDiet, seed } = get();
    const key = DIET_KEY[diet];
    if (key !== picksDiet) {
      set({ picks: assembleWeek(key, seed), picksDiet: key, edited: false });
    }
  },

  shuffle: () => {
    const snapshot = { picks: get().picks, seed: get().seed, edited: get().edited };
    const nextSeed = get().seed + 1;
    const key = DIET_KEY[get().diet];
    set({ picks: assembleWeek(key, nextSeed), seed: nextSeed, edited: false });
    return {
      undo: () => set({ picks: snapshot.picks, seed: snapshot.seed, edited: snapshot.edited }),
    };
  },

  swap: (day, slot, index) => {
    set((state) => ({
      picks: { ...state.picks, [day]: { ...state.picks[day], [slot]: index } },
      edited: true,
    }));
  },

  openMeal: (day, slot) => set({ selected: { day, slot } }),
  closeMeal: () => set({ selected: null }),
  markSaved: () => set({ saved: true }),

  loadCapabilities: async () => {
    set({ capabilities: await fetchCapabilities() });
  },

  generateWithAI: async () => {
    if (!get().capabilities.ai) return;
    set({ aiStatus: 'loading' });
    const { diet, budget } = get();
    const key = DIET_KEY[diet];
    const plan = await generateWeekPlan(key, budget);
    if (plan) {
      set({ picks: plan, picksDiet: key, edited: false, aiStatus: 'done' });
    } else {
      set({ aiStatus: 'error' });
    }
  },

}));

export function householdOf(state: Pick<SessionState, 'adults' | 'kids'>) {
  return { adults: state.adults, kids: state.kids };
}
