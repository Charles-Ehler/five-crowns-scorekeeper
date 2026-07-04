// Five Crowns' five suits, used purely as a decorative accent system
// (player badges, headers, icons) — never tied to actual game logic.
// Colors pulled from the Scorepad palette: ink, red pen, forest, mustard, plum.
export const SUITS = [
  { key: 'ink', symbol: '♠', text: 'text-[#1D3557] dark:text-[#AEC3D8]', bg: 'bg-[#1D3557]', soft: 'bg-[#1D3557]/8 dark:bg-[#1D3557]/30', ring: 'ring-[#1D3557]/40' },
  { key: 'red-pen', symbol: '♥', text: 'text-[#C1121F] dark:text-[#F08A93]', bg: 'bg-[#C1121F]', soft: 'bg-[#C1121F]/8 dark:bg-[#C1121F]/25', ring: 'ring-[#C1121F]/40' },
  { key: 'forest', symbol: '♣', text: 'text-[#3A5A40] dark:text-[#9CC0A3]', bg: 'bg-[#3A5A40]', soft: 'bg-[#3A5A40]/8 dark:bg-[#3A5A40]/30', ring: 'ring-[#3A5A40]/40' },
  { key: 'mustard', symbol: '♦', text: 'text-[#B08900] dark:text-[#E8C15C]', bg: 'bg-[#B08900]', soft: 'bg-[#B08900]/8 dark:bg-[#B08900]/25', ring: 'ring-[#B08900]/40' },
  { key: 'plum', symbol: '★', text: 'text-[#6D4C6E] dark:text-[#C7A9C8]', bg: 'bg-[#6D4C6E]', soft: 'bg-[#6D4C6E]/8 dark:bg-[#6D4C6E]/30', ring: 'ring-[#6D4C6E]/40' },
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
