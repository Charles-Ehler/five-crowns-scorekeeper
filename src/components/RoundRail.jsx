import { TOTAL_ROUNDS } from '../lib/fiveCrowns.js';

const RANK_INDEX = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// The whole game as a row of 11 mini cards: played rounds are face-up gold
// (tap to edit), the current round is raised, the rest wait face-down.
export default function RoundRail({ rounds, currentRound, complete = false, onSelect }) {
  const played = new Set(rounds.map((r) => r.roundNumber));

  return (
    <div className="grid grid-cols-11 gap-1" role="list" aria-label="Rounds">
      {Array.from({ length: TOTAL_ROUNDS }, (_, i) => i + 1).map((round) => {
        const isPlayed = played.has(round);
        const isCurrent = !complete && round === currentRound;
        const base = 'flex aspect-[5/7] md:aspect-auto md:h-12 md:text-sm items-center justify-center rounded-md text-[11px] font-bold transition-all';
        const look = isCurrent
          ? 'bg-gold text-ink shadow-md shadow-gold/40 -translate-y-1 ring-2 ring-gold-bright animate-pulse-soft'
          : isPlayed
            ? 'bg-gold/20 text-gold-deep dark:text-gold-bright'
            : 'bg-muted/10 text-muted/60 dark:bg-muted-dark/10 dark:text-muted-dark/50';
        const label = RANK_INDEX[round - 1];

        if (isPlayed && onSelect) {
          return (
            <button
              key={round}
              type="button"
              role="listitem"
              onClick={() => onSelect(round)}
              aria-label={`Edit round ${round}`}
              className={`press ${base} ${look}`}
            >
              {label}
            </button>
          );
        }
        return (
          <span key={round} role="listitem" className={`${base} ${look}`} aria-current={isCurrent ? 'step' : undefined}>
            {label}
          </span>
        );
      })}
    </div>
  );
}
