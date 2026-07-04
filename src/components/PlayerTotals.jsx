import Avatar from './Avatar.jsx';
import DealerBadge from './DealerBadge.jsx';
import { computeTotals, dealerForRound } from '../lib/fiveCrowns.js';

// draftRound lets the caller preview totals with the in-progress (unsaved)
// round's scores overlaid, so the leader delta updates live as someone types
// — without writing anything early. dealerRound is the round to show the
// dealer marker for (omit/pass null once the game is complete).
export default function PlayerTotals({
  players,
  rounds,
  winnerIds = [],
  complete = false,
  draftRound = null,
  dealerRound = null,
}) {
  const previewRounds = draftRound ? [...rounds, draftRound] : rounds;
  const totals = computeTotals(players, previewRounds);
  const sorted = [...players].sort((a, b) => totals[a.id] - totals[b.id]);
  const lowestTotal = sorted.length ? totals[sorted[0].id] : null;
  const hasScores = previewRounds.length > 0;
  const dealer = dealerRound ? dealerForRound(dealerRound, players) : null;

  return (
    <ol className="space-y-2">
      {sorted.map((p, i) => {
        const isWinner = winnerIds.includes(p.id);
        const isLeader = !complete && hasScores && totals[p.id] === lowestTotal;
        const highlighted = isWinner || isLeader;
        const behindLeader = hasScores ? totals[p.id] - lowestTotal : 0;
        return (
          <li
            key={p.id}
            className={[
              'card-elevated flex items-center gap-3 rounded-2xl p-3',
              isWinner
                ? 'bg-gold/15 ring-1 ring-gold'
                : isLeader
                  ? 'bg-gold/8'
                  : 'bg-parchment-panel dark:bg-ink-panel',
            ].join(' ')}
          >
            <span className="w-5 shrink-0 text-center text-sm font-extrabold text-muted dark:text-muted-dark">
              {i + 1}
            </span>
            <Avatar name={p.name} sizeClass="h-8 w-8 text-xs" />
            <span className="min-w-0 flex-1 truncate font-bold text-ink dark:text-cream">{p.name}</span>
            {dealer?.id === p.id && <DealerBadge iconOnly />}
            {highlighted && (
              <span
                className={[
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-extrabold',
                  isWinner ? 'bg-gold text-ink' : 'bg-gold/25 text-gold-deep dark:text-gold',
                ].join(' ')}
              >
                {isWinner ? '✓' : '●'}
              </span>
            )}
            <span className="flex flex-col items-end">
              <span className="text-xl font-extrabold tabular-nums text-ink dark:text-cream">{totals[p.id]}</span>
              {!highlighted && behindLeader > 0 && (
                <span className="text-[11px] font-bold text-muted dark:text-muted-dark">
                  +{behindLeader} behind
                </span>
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
