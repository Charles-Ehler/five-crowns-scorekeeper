import { TOTAL_ROUNDS } from '../lib/fiveCrowns.js';

const RANK_INDEX = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// The whole game as a row of 11 mini cards: played rounds are filled in (tap
// to edit), the current round is solid, the rest wait. onBlock: drawn on top
// of the colored round header, so it uses translucent white/black tones.
export default function RoundRail({ rounds, currentRound, complete = false, onSelect, onBlock = false }) {
  const played = new Set(rounds.map((r) => r.roundNumber));

  return (
    <div className="grid grid-cols-11 gap-1" role="list" aria-label="Rounds">
      {Array.from({ length: TOTAL_ROUNDS }, (_, i) => i + 1).map((round) => {
        const isPlayed = played.has(round);
        const isCurrent = !complete && round === currentRound;
        const base = 'flex h-10 items-center justify-center rounded-lg font-display text-sm font-bold md:h-12 md:text-base';
        const look = onBlock
          ? isCurrent
            ? 'bg-white text-[#111318]'
            : isPlayed
              ? 'bg-black/20'
              : 'bg-white/15 opacity-60'
          : isCurrent
            ? 'bg-fg text-canvas'
            : isPlayed
              ? 'bg-accent text-on-accent'
              : 'bg-surface-sunk text-fg-soft';
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
