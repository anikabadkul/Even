import { CAL_ADULT, CAL_KID, PROTEIN_ADULT, PROTEIN_KID } from '../data/references';
import type { Household } from './types';

export function householdSize(hh: Household): number {
  return Math.max(1, hh.adults + hh.kids);
}

export function targetCalories(hh: Household): number {
  return hh.adults * CAL_ADULT + hh.kids * CAL_KID;
}

export function targetProtein(hh: Household): number {
  return hh.adults * PROTEIN_ADULT + hh.kids * PROTEIN_KID;
}

export function householdLabel(hh: Household): string {
  const parts: string[] = [];
  parts.push(`${hh.adults} ${hh.adults === 1 ? 'adult' : 'adults'}`);
  if (hh.kids > 0) parts.push(`${hh.kids} ${hh.kids === 1 ? 'kid' : 'kids'}`);
  return parts.join(', ');
}
