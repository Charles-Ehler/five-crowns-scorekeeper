import { suitForIndex } from '../lib/suits.js';

// The rank progression IS the rule that defines Five Crowns (wild rank climbs
// one step every round), so the round header is drawn as a real card's
// corner index — big rank + suit pip — instead of a generic label. The
// caller remounts this with a fresh `key={round}`, which retriggers the
// card-flip-in animation to "turn over" to the next rank.
const RANK_INDEX = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export default function RoundCornerCard({ round, wildRankWord }) {
  const suit = suitForIndex(round - 1);
  const rank = RANK_INDEX[round - 1];

  return (
    <div className="animate-card-flip flex items-center gap-3" style={{ perspective: '600px' }}>
      <div className={`card-elevated flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-parchment-panel dark:bg-ink-panel`}>
        <span className="font-display text-2xl leading-none text-ink dark:text-cream">{rank}</span>
        <span className={`mt-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] text-cream ${suit.bg}`}>
          {suit.symbol}
        </span>
      </div>
      <p className="font-display text-3xl text-ink dark:text-cream">{wildRankWord}</p>
    </div>
  );
}
