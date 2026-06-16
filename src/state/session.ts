import { create } from 'zustand';
import { assembleWeek } from '../domain/plan';
import { DIET_KEY } from '../domain/plan';
import type { Diet, DietLabel, WeekPicks } from '../domain/types';
import { generateWeekPlan as generateWeekPlanOpenAI } from '../integrations/openai';
import { generateWeekPlan as generateWeekPlanGemini } from '../integrations/gemini';
import { fetchLivePrices, findLocationId, lookupBarcode, type KrogerProduct } from '../integrations/kroger';
import { hasAI, hasOpenAI, hasKroger } from '../integrations/env';

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

  aiStatus: AsyncStatus;
  generateWithAI: () => Promise<void>;

  zip: string;
  locationId: string | null;
  locationStatus: AsyncStatus;
  livePrices: Map<string, number>;
  setZip: (zip: string) => void;
  refreshLivePrices: (itemNames: string[]) => Promise<void>;

  barcodeStatus: AsyncStatus;
  barcodeResult: KrogerProduct | null;
  scanBarcode: (upc: string) => Promise<void>;
  clearBarcode: () => void;
  scannerOpen: boolean;
  openScanner: () => void;
  closeScanner: () => void;

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

  aiStatus: 'idle',
  zip: '',
  locationId: null,
  locationStatus: 'idle',
  livePrices: new Map(),
  barcodeStatus: 'idle',
  barcodeResult: null,
  scannerOpen: false,

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

  generateWithAI: async () => {
    if (!hasAI) return;
    set({ aiStatus: 'loading' });
    const { diet, budget } = get();
    const key = DIET_KEY[diet];
    const plan = hasOpenAI
      ? (await generateWeekPlanOpenAI(key, budget)) ?? (await generateWeekPlanGemini(key, budget))
      : await generateWeekPlanGemini(key, budget);
    if (plan) {
      set({ picks: plan, picksDiet: key, edited: false, aiStatus: 'done' });
    } else {
      set({ aiStatus: 'error' });
    }
  },

  setZip: (zip) => set({ zip, locationId: null, locationStatus: 'idle', livePrices: new Map() }),

  refreshLivePrices: async (itemNames) => {
    if (!hasKroger) return;
    const { zip } = get();
    if (!zip) return;
    set({ locationStatus: 'loading' });
    let locationId = get().locationId;
    if (!locationId) {
      locationId = await findLocationId(zip);
      if (!locationId) {
        set({ locationStatus: 'error' });
        return;
      }
      set({ locationId });
    }
    const prices = await fetchLivePrices(itemNames, locationId);
    set({ livePrices: prices, locationStatus: 'done' });
  },

  scanBarcode: async (upc) => {
    if (!hasKroger) return;
    set({ barcodeStatus: 'loading', barcodeResult: null });
    let locationId = get().locationId;
    if (!locationId && get().zip) locationId = await findLocationId(get().zip);
    if (!locationId) {
      set({ barcodeStatus: 'error' });
      return;
    }
    set({ locationId });
    const product = await lookupBarcode(upc, locationId);
    set({ barcodeResult: product, barcodeStatus: product ? 'done' : 'error' });
  },

  clearBarcode: () => set({ barcodeResult: null, barcodeStatus: 'idle' }),
  openScanner: () => set({ scannerOpen: true }),
  closeScanner: () => set({ scannerOpen: false, barcodeResult: null, barcodeStatus: 'idle' }),
}));

export function householdOf(state: Pick<SessionState, 'adults' | 'kids'>) {
  return { adults: state.adults, kids: state.kids };
}
