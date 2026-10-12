import { useState } from 'react';
import { Delete, X } from 'lucide-react';

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

// Tap the cards left in your hand and it adds them up, instead of doing the
// math out loud at the table. roundNumber picks which rank is wild (round 1 =
// 3s ... round 11 = Kings), so that rank's key counts 20.
export default function HandCounter({ playerName, roundNumber, onDone, onCancel }) {
  const [cards, setCards] = useState([]);
  const wildIndex = roundNumber - 1;
  const total = cards.reduce((sum, c) => sum + c.value, 0);

  function add(card) {
    setCards((prev) => [...prev, { ...card, key: `${Date.now()}-${prev.length}` }]);
  }

  function removeAt(index) {
    setCards((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-deep/70 backdrop-blur-sm sm:items-center sm:p-4" onClick={onCancel}>
      <div
        className="card-elevated animate-sheet-up w-full max-w-sm rounded-t-3xl bg-parchment-panel p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] dark:bg-ink-panel sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted dark:text-muted-dark">Count the hand</p>
            <h2 className="font-display text-xl text-ink dark:text-cream">{playerName}</h2>
          </div>
          <button type="button" onClick={onCancel} aria-label="Close" className="press flex h-9 w-9 items-center justify-center rounded-full bg-muted/10 text-ink dark:bg-muted-dark/10 dark:text-cream">
            <X size={18} />
          </button>
        </div>

        <div className="mb-3 flex min-h-[3.25rem] items-center gap-2 rounded-2xl bg-parchment p-2 dark:bg-ink-deep">
          <div className="flex min-w-0 flex-1 flex-wrap gap-1">
            {cards.length === 0 && <span className="px-1 text-sm text-muted dark:text-muted-dark">Tap the cards left in hand</span>}
            {cards.map((c, i) => (
              <button
                key={c.key}
                type="button"
                onClick={() => removeAt(i)}
                aria-label={`Remove ${c.label}`}
                className="animate-pop-in rounded-md bg-parchment-panel px-1.5 py-0.5 text-xs font-bold text-ink shadow-sm dark:bg-ink-panel dark:text-cream"
              >
                {c.label}
              </button>
            ))}
          </div>
          <span className="shrink-0 font-display text-3xl text-ink dark:text-cream">{total}</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {CARDS.map((card, i) => {
            const isWild = i === wildIndex;
            const value = isWild ? WILD_VALUE : card.value;
            return (
              <button
                key={card.label}
                type="button"
                onClick={() => add({ label: isWild ? `${card.label}★` : card.label, value })}
                className={[
                  'press flex aspect-[5/4] flex-col items-center justify-center rounded-xl border font-display text-lg',
                  isWild
                    ? 'border-gold bg-gold/20 text-gold-deep dark:text-gold-bright'
                    : 'border-parchment-line bg-parchment text-ink dark:border-ink-line dark:bg-ink-deep dark:text-cream',
                ].join(' ')}
              >
                {card.label}
                <span className="font-sans text-[10px] font-semibold opacity-70">{isWild ? 'wild 20' : value}</span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => add({ label: 'Jkr', value: JOKER_VALUE })}
            className="press flex aspect-[5/4] flex-col items-center justify-center rounded-xl border border-star bg-star/20 font-display text-lg text-star"
          >
            Joker
            <span className="font-sans text-[10px] font-semibold opacity-70">50</span>
          </button>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => setCards((prev) => prev.slice(0, -1))}
            disabled={cards.length === 0}
            aria-label="Remove last card"
            className="press flex w-14 items-center justify-center rounded-xl border border-parchment-line text-ink disabled:opacity-30 dark:border-ink-line dark:text-cream"
          >
            <Delete size={18} />
          </button>
          <button
            type="button"
            onClick={() => onDone(total)}
            className="press flex-1 rounded-xl bg-gold py-3 font-bold text-ink"
          >
            Use {total} points
          </button>
        </div>
      </div>
    </div>
  );
}
