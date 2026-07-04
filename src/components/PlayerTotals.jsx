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
              'flex items-center gap-3 rounded-2xl border p-3 transition-colors',
              isWinner
                ? 'border-red-ink/50 bg-red-ink/5 shadow-sm dark:bg-red-ink/10'
                : isLeader
                  ? 'border-amber-chalk/50 bg-amber-chalk/10 dark:bg-amber-chalk/10'
                  : 'border-paper-line bg-paper-raised dark:border-chalk-board-line dark:bg-chalk-board-raised',
            ].join(' ')}
          >
            <span className="w-5 shrink-0 text-center text-sm font-semibold text-ink-faint dark:text-chalk-faint">
              {i + 1}
            </span>
            <Avatar name={p.name} sizeClass="h-8 w-8 text-xs" />
            <span className="min-w-0 flex-1 truncate font-medium text-ink dark:text-chalk">{p.name}</span>
            {dealer?.id === p.id && <DealerBadge iconOnly />}
            {highlighted && (
              <span
                className={[
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold',
                  isWinner ? 'border-red-ink text-red-ink' : 'border-amber-chalk text-amber-chalk',
                ].join(' ')}
              >
                {isWinner ? '✓' : '●'}
              </span>
            )}
            <span className="flex flex-col items-end">
              <span className="font-mono text-xl font-bold tabular-nums text-ink dark:text-chalk">{totals[p.id]}</span>
              {!highlighted && behindLeader > 0 && (
                <span className="text-[11px] font-medium text-ink-faint dark:text-chalk-faint">
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
