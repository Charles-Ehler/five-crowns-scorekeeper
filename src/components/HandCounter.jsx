import { useState } from 'react';
import { Delete } from 'lucide-react';

// Five Crowns card values: number cards at face value, J/Q/K = 11/12/13,
// that round's wild rank = 20, Jokers = 50.
const CARDS = [
  { label: '3', value: 3 },
  { label: '4', value: 4 },
  { label: '5', value: 5 },
  { label: '6', value: 6 },
  { label: '7', value: 7 },
  { label: '8', value: 8 },
  { label: '9', value: 9 },
  { label: '10', value: 10 },
  { label: 'J', value: 11 },
  { label: 'Q', value: 12 },
  { label: 'K', value: 13 },
];
const WILD_VALUE = 20;
const JOKER_VALUE = 50;

// Tap the cards left in a hand and it adds them up, instead of doing the math
// out loud at the table. Lives inside the score pad's "Count cards" tab.
// roundNumber picks which rank is wild (round 1 = 3s ... round 11 = Kings).
export default function HandCounter({ roundNumber, onUse }) {
  const [cards, setCards] = useState([]);
  const wildIndex = roundNumber - 1;
  const total = cards.reduce((sum, c) => sum + c.value, 0);

  function add(card) {
    setCards((prev) => [...prev, { ...card, key: `${Date.now()}-${prev.length}` }]);
  }

  return (
    <div>
      <div className="mb-2 flex min-h-11 items-center gap-2 rounded-xl bg-surface-sunk px-2 py-1.5">
        <div className="flex min-w-0 flex-1 flex-wrap gap-1">
          {cards.length === 0 && <span className="px-1 text-sm text-fg-soft">Tap each card left in the hand</span>}
          {cards.map((c, i) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setCards((prev) => prev.filter((_, j) => j !== i))}
              aria-label={`Remove ${c.label}`}
              className="rounded-md bg-surface px-2 py-0.5 text-sm font-bold text-fg"
            >
              {c.label}
            </button>
          ))}
        </div>
        <span className="shrink-0 font-display text-2xl font-bold tabular-nums text-fg">{total}</span>
      </div>

      <div className="grid grid-cols-6 gap-1.5">
        {CARDS.map((card, i) => {
          const isWild = i === wildIndex;
          const value = isWild ? WILD_VALUE : card.value;
          return (
            <button
              key={card.label}
              type="button"
              onClick={() => add({ label: isWild ? `${card.label}*` : card.label, value })}
              className={`pad-key h-12 flex-col gap-0 ${isWild ? 'bg-accent text-on-accent' : ''}`}
            >
              <span className="font-display text-lg font-bold leading-none">{card.label}</span>
              <span className="text-[10px] font-semibold leading-none opacity-70">{isWild ? 'wild 20' : value}</span>
            </button>
          );
        })}
        <button type="button" onClick={() => add({ label: 'Jkr', value: JOKER_VALUE })} className="pad-key h-12 flex-col gap-0 bg-[#6d3bd1] text-white">
          <span className="font-display text-lg font-bold leading-none">Jkr</span>
          <span className="text-[10px] font-semibold leading-none opacity-70">50</span>
        </button>
      </div>

      <div className="mt-1.5 grid grid-cols-6 gap-1.5">
        <button
          type="button"
          onClick={() => setCards((prev) => prev.slice(0, -1))}
          disabled={cards.length === 0}
          aria-label="Remove last card"
          className="pad-key h-12"
        >
          <Delete size={20} />
        </button>
        <button type="button" onClick={() => onUse(total)} className="pad-key col-span-5 h-12 bg-fg text-canvas">
          Use {total} {total === 1 ? 'point' : 'points'}
        </button>
      </div>
    </div>
  );
}
