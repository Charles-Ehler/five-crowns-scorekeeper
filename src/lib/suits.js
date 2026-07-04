// Five Crowns' five suits, used purely as a decorative accent system
// (player badges, avatars, chips) — never tied to actual game logic.
// Neubrutalism reads as solid color blocks, not colored text — every suit
// pairs its fill with black ink text/borders, never a tinted text color,
// so contrast stays consistent across all five without per-color tuning.
export const SUITS = [
  { key: 'yellow', bg: 'bg-yellow' },
  { key: 'red', bg: 'bg-red' },
  { key: 'blue', bg: 'bg-blue' },
  { key: 'green', bg: 'bg-green' },
  { key: 'purple', bg: 'bg-purple' },
];

export function suitForIndex(index) {
  return SUITS[index % SUITS.length];
}

// Deterministic hash so the same player name always lands on the same suit
// color everywhere in the app (score entry, history, stats), rather than a
// color tied to array position within one specific game's player list.
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function suitForName(name) {
  const key = name.trim().toLowerCase();
  if (!key) return SUITS[0];
  return SUITS[hashString(key) % SUITS.length];
}
