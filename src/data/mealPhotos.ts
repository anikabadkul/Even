const IMG = (uid: string) =>
  `https://images.unsplash.com/photo-${uid}?auto=format&fit=crop&w=700&q=72`;

const B = [
  IMG('1494390248081-4e521a5940db'),
  IMG('1525351326368-efbb5cb6814d'),
  IMG('1494597564530-871f2b93ac55'),
  IMG('1586985289688-ca3cf47d3e19'),
  IMG('1478145046317-234201e3a36d'),
  IMG('1550583724-aa135a47a7ea'),
  IMG('1484723091739-30e0791f88fc'),
];
const L = [
  IMG('1547592180-85f173990554'),
  IMG('1512058564366-18510be2db19'),
  IMG('1540420773420-3a05bb8a5e29'),
  IMG('1565299624946-b28f40a0ae38'),
  IMG('1473093226795-af9932fe5856'),
  IMG('1490474418585-ba9bad8fd0ea'),
  IMG('1512621776951-a57141f2eefd'),
];
const D = [
  IMG('1467003909585-2f8a72700288'),
  IMG('1546069901-5ec6a79120b0'),
  IMG('1565958411396-27e3ec16d444'),
  IMG('1504674900247-0877df9cc836'),
  IMG('1574071318508-1cdbab80d002'),
  IMG('1540189549336-e6e99074536a'),
  IMG('1502741224143-90386d7f8c82'),
];

const PHOTOS: Record<string, string> = {
  b1: B[0], b2: B[1], b3: B[2], b4: B[3], b5: B[4], b6: B[5], b7: B[6],
  b8: B[0], b9: B[1], b10: B[2], b11: B[3], b12: B[4], b13: B[5],
  l1: L[0], l2: L[1], l3: L[2], l4: L[3], l5: L[4], l6: L[5], l7: L[6],
  l8: L[0], l9: L[1], l10: L[2], l11: L[3], l12: L[4], l13: L[5], l14: L[6],
  d1: D[0], d2: D[1], d3: D[2], d4: D[3], d5: D[4], d6: D[5], d7: D[6],
  d8: D[0], d9: D[1], d10: D[2], d11: D[3], d12: D[4], d13: D[5],
};

const FALLBACK_B = B[0];
const FALLBACK_L = L[0];
const FALLBACK_D = D[0];

export function getMealPhoto(id: string): string {
  if (PHOTOS[id]) return PHOTOS[id];
  if (id.startsWith('b')) return FALLBACK_B;
  if (id.startsWith('l')) return FALLBACK_L;
  return FALLBACK_D;
}
