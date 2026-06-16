export type Aisle = 'Grains & staples' | 'Protein & beans' | 'Produce' | 'Dairy & eggs' | 'Pantry';

export interface Sku {
  item: string;
  aisle: Aisle;
  packLabel: string;
  packPrice: number;
  packServings: number; // how many "uses" (recipe servings) one pack covers
}

/**
 * Pack pricing for real-world shopping. packServings is calibrated so
 * packPrice / packServings is close to the amortized perServingCost used
 * in the meal data, since the budget math relies on that consistency.
 */
export const PANTRY: Sku[] = [
  { item: 'Rolled oats', aisle: 'Grains & staples', packLabel: '42 oz bag', packPrice: 4.2, packServings: 12 },
  { item: 'Certified GF oats', aisle: 'Grains & staples', packLabel: '32 oz bag', packPrice: 5.6, packServings: 8 },
  { item: 'Oats & flour', aisle: 'Grains & staples', packLabel: 'combo pack', packPrice: 5.0, packServings: 10 },
  { item: 'Oats', aisle: 'Grains & staples', packLabel: '42 oz bag', packPrice: 4.2, packServings: 12 },
  { item: 'Rice', aisle: 'Grains & staples', packLabel: '10 lb bag', packPrice: 9.0, packServings: 20 },
  { item: 'Pasta', aisle: 'Grains & staples', packLabel: '16 oz box', packPrice: 1.6, packServings: 3 },
  { item: 'Spaghetti', aisle: 'Grains & staples', packLabel: '16 oz box', packPrice: 1.6, packServings: 3 },
  { item: 'Bread', aisle: 'Grains & staples', packLabel: 'loaf', packPrice: 2.8, packServings: 10 },
  { item: 'Tortilla', aisle: 'Grains & staples', packLabel: '10-pack', packPrice: 2.8, packServings: 10 },
  { item: 'Tortillas', aisle: 'Grains & staples', packLabel: '10-pack', packPrice: 2.8, packServings: 10 },
  { item: 'Corn tortillas', aisle: 'Grains & staples', packLabel: '20-pack', packPrice: 2.4, packServings: 10 },
  { item: 'Corn grits', aisle: 'Grains & staples', packLabel: '24 oz bag', packPrice: 2.6, packServings: 8 },
  { item: 'Cornbread mix', aisle: 'Grains & staples', packLabel: 'box', packPrice: 1.8, packServings: 6 },
  { item: 'Quinoa', aisle: 'Grains & staples', packLabel: '16 oz bag', packPrice: 5.5, packServings: 6 },
  { item: 'Potatoes', aisle: 'Grains & staples', packLabel: '5 lb bag', packPrice: 4.0, packServings: 8 },
  { item: 'Potato', aisle: 'Grains & staples', packLabel: '5 lb bag', packPrice: 4.0, packServings: 8 },
  { item: 'Potato & veg', aisle: 'Produce', packLabel: 'mixed', packPrice: 5.0, packServings: 5 },
  { item: 'Potato topping', aisle: 'Grains & staples', packLabel: '5 lb bag', packPrice: 4.0, packServings: 8 },

  { item: 'Brown lentils', aisle: 'Protein & beans', packLabel: '2 lb bag', packPrice: 3.5, packServings: 8 },
  { item: 'Red lentils', aisle: 'Protein & beans', packLabel: '2 lb bag', packPrice: 3.5, packServings: 8 },
  { item: 'Lentils', aisle: 'Protein & beans', packLabel: '2 lb bag', packPrice: 3.5, packServings: 8 },
  { item: 'Black beans', aisle: 'Protein & beans', packLabel: 'can', packPrice: 0.95, packServings: 3 },
  { item: 'Kidney beans', aisle: 'Protein & beans', packLabel: 'can', packPrice: 0.95, packServings: 3 },
  { item: 'White beans', aisle: 'Protein & beans', packLabel: 'can', packPrice: 0.95, packServings: 3 },
  { item: 'Pinto beans', aisle: 'Protein & beans', packLabel: 'can', packPrice: 0.95, packServings: 3 },
  { item: 'Baked beans', aisle: 'Protein & beans', packLabel: 'can', packPrice: 1.1, packServings: 3 },
  { item: 'Kidney & black beans', aisle: 'Protein & beans', packLabel: '2 cans', packPrice: 1.9, packServings: 6 },
  { item: 'Black beans & spices', aisle: 'Protein & beans', packLabel: 'can + spices', packPrice: 1.3, packServings: 3 },
  { item: 'Chickpeas', aisle: 'Protein & beans', packLabel: 'can', packPrice: 1.0, packServings: 3 },
  { item: 'Chickpea falafel mix', aisle: 'Protein & beans', packLabel: 'box', packPrice: 2.5, packServings: 5 },
  { item: 'Firm tofu', aisle: 'Protein & beans', packLabel: '14 oz block', packPrice: 2.6, packServings: 3 },
  { item: 'Tofu', aisle: 'Protein & beans', packLabel: '14 oz block', packPrice: 2.6, packServings: 3 },
  { item: 'Peanut butter', aisle: 'Protein & beans', packLabel: '16 oz jar', packPrice: 3.4, packServings: 14 },
  { item: 'Chicken thigh', aisle: 'Protein & beans', packLabel: '3 lb pack', packPrice: 8.0, packServings: 6 },
  { item: 'Chicken', aisle: 'Protein & beans', packLabel: '3 lb pack', packPrice: 8.0, packServings: 6 },
  { item: 'Ground beef', aisle: 'Protein & beans', packLabel: '1 lb', packPrice: 5.4, packServings: 3 },
  { item: 'Canned tuna', aisle: 'Protein & beans', packLabel: 'can', packPrice: 1.3, packServings: 1 },
  { item: 'Canned salmon', aisle: 'Protein & beans', packLabel: 'can', packPrice: 2.6, packServings: 1.5 },
  { item: 'Chia seeds', aisle: 'Protein & beans', packLabel: '12 oz bag', packPrice: 5.0, packServings: 8 },

  { item: 'Banana', aisle: 'Produce', packLabel: 'each', packPrice: 0.25, packServings: 1 },
  { item: 'Apple', aisle: 'Produce', packLabel: 'each', packPrice: 0.35, packServings: 1 },
  { item: 'Frozen berries', aisle: 'Produce', packLabel: '12 oz bag', packPrice: 3.2, packServings: 7 },
  { item: 'Berries', aisle: 'Produce', packLabel: '12 oz bag', packPrice: 3.2, packServings: 7 },
  { item: 'Carrot & onion', aisle: 'Produce', packLabel: 'mixed', packPrice: 3.0, packServings: 4 },
  { item: 'Onion & oil', aisle: 'Produce', packLabel: 'mixed', packPrice: 2.4, packServings: 4 },
  { item: 'Onion & spices', aisle: 'Produce', packLabel: 'mixed', packPrice: 2.6, packServings: 4 },
  { item: 'Pepper & onion', aisle: 'Produce', packLabel: 'mixed', packPrice: 2.6, packServings: 4 },
  { item: 'Cabbage slaw', aisle: 'Produce', packLabel: 'bag', packPrice: 3.5, packServings: 4 },
  { item: 'Frozen mixed veg', aisle: 'Produce', packLabel: '16 oz bag', packPrice: 2.6, packServings: 4 },
  { item: 'Veg & sauce', aisle: 'Produce', packLabel: 'mixed', packPrice: 3.2, packServings: 4 },
  { item: 'Veg & stock', aisle: 'Produce', packLabel: 'mixed', packPrice: 3.0, packServings: 4 },
  { item: 'Veg & soy', aisle: 'Produce', packLabel: 'mixed', packPrice: 4.0, packServings: 4 },
  { item: 'Veg & dressing', aisle: 'Produce', packLabel: 'mixed', packPrice: 3.4, packServings: 4 },
  { item: 'Veg', aisle: 'Produce', packLabel: 'mixed', packPrice: 2.8, packServings: 4 },
  { item: 'Vegetables', aisle: 'Produce', packLabel: 'mixed', packPrice: 4.0, packServings: 4 },
  { item: 'Mixed veg & beans', aisle: 'Produce', packLabel: 'mixed', packPrice: 4.6, packServings: 4 },
  { item: 'Tomato & spices', aisle: 'Pantry', packLabel: 'can + spices', packPrice: 1.6, packServings: 2 },
  { item: 'Tomato sauce', aisle: 'Pantry', packLabel: 'jar', packPrice: 2.4, packServings: 3 },
  { item: 'Salsa', aisle: 'Pantry', packLabel: 'jar', packPrice: 2.8, packServings: 5 },
  { item: 'Corn & salsa', aisle: 'Pantry', packLabel: 'mixed', packPrice: 3.0, packServings: 4 },
  { item: 'Curry base', aisle: 'Pantry', packLabel: 'jar', packPrice: 3.0, packServings: 4 },
  { item: 'Coconut milk', aisle: 'Pantry', packLabel: 'can', packPrice: 1.8, packServings: 2 },
  { item: 'Rice & spices', aisle: 'Pantry', packLabel: 'mixed', packPrice: 2.6, packServings: 3 },
  { item: 'Bell peppers', aisle: 'Produce', packLabel: '3-pack', packPrice: 3.0, packServings: 3 },
  { item: 'Greens', aisle: 'Produce', packLabel: 'bunch', packPrice: 2.3, packServings: 2 },
  { item: 'Gravy', aisle: 'Pantry', packLabel: 'packet', packPrice: 1.0, packServings: 4 },
  { item: 'Veg & gravy', aisle: 'Produce', packLabel: 'mixed', packPrice: 2.6, packServings: 4 },
  { item: 'Spices', aisle: 'Pantry', packLabel: 'jar', packPrice: 2.0, packServings: 10 },
  { item: 'Potato & salsa', aisle: 'Produce', packLabel: 'mixed', packPrice: 3.6, packServings: 4 },
  { item: 'Soy & carrot', aisle: 'Produce', packLabel: 'mixed', packPrice: 3.4, packServings: 4 },
  { item: 'Rice & veg', aisle: 'Grains & staples', packLabel: 'mixed', packPrice: 4.0, packServings: 4 },

  { item: 'Eggs (2)', aisle: 'Dairy & eggs', packLabel: 'dozen', packPrice: 3.6, packServings: 6 },
  { item: 'Egg', aisle: 'Dairy & eggs', packLabel: 'dozen', packPrice: 3.6, packServings: 12 },
  { item: 'Margarine', aisle: 'Dairy & eggs', packLabel: 'tub', packPrice: 2.4, packServings: 12 },
  { item: 'Plain yogurt', aisle: 'Dairy & eggs', packLabel: '32 oz tub', packPrice: 4.0, packServings: 6 },
  { item: 'Cheese', aisle: 'Dairy & eggs', packLabel: '8 oz block', packPrice: 3.4, packServings: 5 },
  { item: 'Cottage cheese', aisle: 'Dairy & eggs', packLabel: '16 oz tub', packPrice: 3.6, packServings: 4 },
  { item: 'Soy milk', aisle: 'Dairy & eggs', packLabel: 'half gallon', packPrice: 3.2, packServings: 8 },
  { item: 'Milk (calcium)', aisle: 'Dairy & eggs', packLabel: 'half gallon', packPrice: 2.5, packServings: 8 },
  { item: 'Eggs (protein)', aisle: 'Dairy & eggs', packLabel: 'dozen', packPrice: 3.6, packServings: 12 },
  { item: 'Frozen greens (iron)', aisle: 'Produce', packLabel: '16 oz bag', packPrice: 2.4, packServings: 6 },
  { item: 'Fruit', aisle: 'Produce', packLabel: 'mixed', packPrice: 3.0, packServings: 6 },
];

export function findSku(item: string): Sku | undefined {
  return PANTRY.find((s) => s.item === item);
}
