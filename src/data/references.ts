/**
 * Every figure here must be defensible and traceable to a source.
 * Working values are flagged where the real published table should
 * replace them before launch.
 */

// USDA Thrifty Food Plan weekly cost by household size, 2026 (working
// values — calibrate against the published USDA TFP table before launch).
// Source: https://www.fns.usda.gov/cnpp/usda-food-plans-thrifty-food-plan
export const TFP_WEEKLY_FLOOR: Record<number, number> = {
  1: 57.4,
  2: 141.0,
  3: 190.0,
  4: 229.0,
  5: 272.0,
};

// USDA Dietary Guidelines for Americans 2025-2030, daily reference values.
export const CAL_ADULT = 2000;
export const CAL_KID = 1500;
export const PROTEIN_ADULT = 50;
export const PROTEIN_KID = 30;

// SNAP average benefit, used only as a budget anchor hint in the UI.
// ~$188/person/month -> ~$6.17/day -> ~$43/week.
export const SNAP_AVG_WEEKLY_PER_PERSON = 43;

export const SOURCES = {
  thriftyFoodPlan: 'USDA Thrifty Food Plan (2026)',
  dietaryGuidelines: 'USDA Dietary Guidelines for Americans (2025-2030)',
  proteinRda: 'USDA Dietary Guidelines protein RDA',
  snapAverage: 'USDA SNAP average benefit per person, 2026',
};
