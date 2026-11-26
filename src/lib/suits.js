// Five Crowns' five suits, used as the app's player-identity system, real
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

// Seat colors for one game: the five suit colors plus two extras, so a full
// 7-player table never has two players in the same color. Each player keeps
// their usual (name-hashed) color when it's free, otherwise takes the next
// free one, so colors stay as stable as possible from game to game.
export const SEAT_COLORS = ['heart', 'diamond', 'club', 'star', 'spade', 'violet', 'tangerine'];
const DARK_TEXT = new Set(['star']);

export function seatColors(players) {
  const taken = new Set();
  const byId = {};
  for (const p of players) {
    const key = p.name.trim().toLowerCase();
    let i = key ? hashString(key) % SEAT_COLORS.length : 0;
    while (taken.has(SEAT_COLORS[i]) && taken.size < SEAT_COLORS.length) i = (i + 1) % SEAT_COLORS.length;
    taken.add(SEAT_COLORS[i]);
    byId[p.id] = SEAT_COLORS[i];
  }
  return byId;
}

export function colorVar(colorKey) {
  return `var(--color-${colorKey})`;
}

// Text that reads on a solid block of this color.
export function onColor(colorKey) {
  return DARK_TEXT.has(colorKey) ? '#111318' : '#ffffff';
}

// Self-check: node src/lib/suits.js
if (typeof process !== 'undefined' && process.argv?.[1]?.endsWith('suits.js')) {
  const names = ['Charles', 'Cory', 'Jordan', 'Jeff', 'Bob', 'Donna', 'Phil'];
  const colors = Object.values(seatColors(names.map((name, i) => ({ id: String(i), name }))));
  if (new Set(colors).size !== 7) throw new Error(`seat colors collide: ${colors}`);
  console.log('seatColors ok', colors.join(','));
}
