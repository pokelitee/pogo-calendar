export type BonusCategory =
  | 'shiny'
  | 'stardust'
  | 'xp'
  | 'candy'
  | 'eggs'
  | 'raids'
  | 'megaMax'
  | 'rocket'
  | 'trades'
  | 'research'
  | 'spawns'
  | 'gifts'
  | 'items'
  | 'other';

export const BONUS_CATEGORY_LABELS: Record<BonusCategory, string> = {
  shiny: 'Shiny Odds',
  stardust: 'Stardust',
  xp: 'XP',
  candy: 'Candy',
  eggs: 'Eggs & Hatching',
  raids: 'Raids',
  megaMax: 'Mega & Max',
  rocket: 'Team GO Rocket',
  trades: 'Trades & Friendship',
  research: 'Research',
  spawns: 'Spawns, Lures & Incense',
  gifts: 'Gifts',
  items: 'Items',
  other: 'Other',
};

// Bonus text is free-form, so the first matching pattern wins: rewards
// (Stardust, XP, Candy) come before the activity that grants them, so
// "2× Stardust from Raid Battles" is a Stardust bonus.
const BONUS_PATTERNS: [BonusCategory, RegExp][] = [
  ['shiny', /shiny/i],
  ['stardust', /stardust/i],
  ['xp', /\bxp\b/i],
  ['candy', /candy/i],
  ['eggs', /\beggs?\b|hatch|incubat/i],
  ['raids', /raid/i],
  ['megaMax', /\bmega\b|mega-|max (battle|particle)|power spot|dynamax|gigantamax/i],
  ['rocket', /rocket|frustration/i],
  ['trades', /trad(e|es|ing)\b|friend/i],
  ['research', /research/i],
  ['spawns', /lure|incense|spawn|appear|in the wild|encounter|routes?\b/i],
  ['gifts', /gift/i],
  ['items', /\bballs?\b|potions?\b|revives?\b|berr(y|ies)\b|star piece|souvenir|item bag/i],
];

export function categorizeBonus(bonus: string): BonusCategory {
  return BONUS_PATTERNS.find(([, pattern]) => pattern.test(bonus))?.[0] ?? 'other';
}
