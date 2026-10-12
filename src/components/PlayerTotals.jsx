import { useLayoutEffect, useRef } from 'react';
import { Crown } from 'lucide-react';
import AnimatedNumber from './AnimatedNumber.jsx';
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

  // FLIP: when the order changes, each row slides from where it was to where
  // it now sits, instead of the list snapping. Web Animations API, no library.
  const rowRefs = useRef(new Map());
  const prevTops = useRef(new Map());
  useLayoutEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    rowRefs.current.forEach((el, id) => {
      const top = el.offsetTop;
      const prev = prevTops.current.get(id);
      if (!reduceMotion && prev !== undefined && prev !== top) {
        el.animate([{ transform: `translateY(${prev - top}px)` }, { transform: 'none' }], {
          duration: 420,
          easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
        });
      }
      prevTops.current.set(id, top);
    });
  });

  return (
    <ol className="relative space-y-2">
      {sorted.map((p, i) => {
        const isWinner = winnerIds.includes(p.id);
        const isLeader = !complete && hasScores && totals[p.id] === lowestTotal;
        const highlighted = isWinner || isLeader;
        const behindLeader = hasScores ? totals[p.id] - lowestTotal : 0;
        return (
          <li
            key={p.id}
            ref={(el) => {
              if (el) rowRefs.current.set(p.id, el);
              else rowRefs.current.delete(p.id);
            }}
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
                {isWinner ? '✓' : <Crown size={12} fill="currentColor" />}
              </span>
            )}
            <span className="flex flex-col items-end">
              <span className="text-xl font-extrabold tabular-nums text-ink dark:text-cream"><AnimatedNumber value={totals[p.id]} /></span>
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
