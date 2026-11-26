import { useLayoutEffect, useRef } from 'react';
import { Crown, Shuffle } from 'lucide-react';
import AnimatedNumber from './AnimatedNumber.jsx';
import Avatar from './Avatar.jsx';
import { computeTotals, dealerForRound } from '../lib/fiveCrowns.js';
import { colorVar, onColor, seatColors } from '../lib/suits.js';

// draftRound lets the caller preview totals with the in-progress (unsaved)
// round's scores overlaid, so the leader delta updates live as someone types,
// without writing anything early. Each row is a solid block in the player's
// seat color for this game. dealerRound is the round to show the
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
  const colors = seatColors(players);

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
            className="flex min-h-16 items-center gap-3 rounded-2xl px-3 py-2.5"
            style={{ background: colorVar(colors[p.id]), color: onColor(colors[p.id]) }}
          >
            <span className="w-5 shrink-0 text-center font-display text-lg font-bold opacity-70">{i + 1}</span>
            <Avatar name={p.name} color={colors[p.id]} sizeClass="h-10 w-10 text-sm rounded-full ring-2 ring-white/70" />
            <span className="min-w-0 flex-1 truncate text-lg font-semibold">{p.name}</span>
            {dealer?.id === p.id && (
              <span title="Dealer" aria-label="Dealer" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/15">
                <Shuffle size={14} />
              </span>
            )}
            {highlighted && (
              <span
                title={isWinner ? 'Winner' : 'Leading'}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-on-accent"
              >
                <Crown size={15} fill="currentColor" />
              </span>
            )}
            <span className="flex flex-col items-end leading-none">
              <span className="font-display text-3xl font-bold tabular-nums">
                <AnimatedNumber value={totals[p.id]} />
              </span>
              {!highlighted && behindLeader > 0 && <span className="mt-0.5 text-xs font-semibold opacity-80">+{behindLeader} behind</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
