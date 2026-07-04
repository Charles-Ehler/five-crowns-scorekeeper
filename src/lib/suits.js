// Five Crowns' five suits, used as the app's player-identity system — real
// deck suits (spade/heart/diamond/club) plus the game's own 5th suit (star),
// each with a fixed thematic color, rather than an arbitrary rainbow.
export const SUITS = [
  { key: 'spade', symbol: '♠', bg: 'bg-spade' },
  { key: 'heart', symbol: '♥', bg: 'bg-heart' },
  { key: 'diamond', symbol: '♦', bg: 'bg-diamond' },
  { key: 'club', symbol: '♣', bg: 'bg-club' },
  { key: 'star', symbol: '★', bg: 'bg-star' },
];

export function suitForIndex(index) {
  return SUITS[index % SUITS.length];
}

// Deterministic hash so the same player name always lands on the same suit
// everywhere in the app (score entry, history, stats), rather than a suit
// tied to array position within one specific game's player list.
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
