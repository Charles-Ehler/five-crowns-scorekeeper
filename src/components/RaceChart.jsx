import { TOTAL_ROUNDS } from '../lib/fiveCrowns.js';
import { suitForName } from '../lib/suits.js';

const RANK_INDEX = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const W = 340;
const H = 190;
const PAD = { l: 30, r: 64, t: 14, b: 24 };
const LABEL_GAP = 13;

function cumulativeSeries(players, rounds, upToRound) {
  const byNumber = new Map(rounds.map((r) => [r.roundNumber, r]));
  return players.map((p) => {
    let total = 0;
    const points = [0];
    for (let r = 1; r <= upToRound; r += 1) {
      total += byNumber.get(r)?.scores?.[p.id]?.score ?? 0;
      points.push(total);
    }
    return { player: p, points, total };
  });
}

// Cumulative score per player across the 11 rounds, a horse race where the
// lowest line is winning. The x-axis is always the full game, so a replay or a
// game in progress visibly "grows" toward Kings. Plain SVG, no chart library.
export default function RaceChart({ players, rounds, upToRound }) {
  const lastRound = rounds.length ? Math.max(...rounds.map((r) => r.roundNumber)) : 0;
  const shownRound = Math.min(upToRound ?? lastRound, lastRound);
  // Scale against the whole game, not just the shown slice, so the y-axis
  // stays put while a replay scrubs.
  const fullSeries = cumulativeSeries(players, rounds, lastRound);
  const series = cumulativeSeries(players, rounds, shownRound);
  const yMax = Math.max(10, ...fullSeries.flatMap((s) => s.points));

  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const x = (r) => PAD.l + (r / TOTAL_ROUNDS) * innerW;
  const y = (v) => PAD.t + innerH - (v / yMax) * innerH;
  const ticks = [0, Math.round(yMax / 2), yMax];

  // End-of-line name labels, nudged apart so close totals don't overlap.
  const labels = series
    .map((s) => ({ ...s, ly: y(s.total) }))
    .sort((a, b) => a.ly - b.ly);
  for (let i = 1; i < labels.length; i += 1) {
    if (labels[i].ly - labels[i - 1].ly < LABEL_GAP) labels[i].ly = labels[i - 1].ly + LABEL_GAP;
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Cumulative score by round">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} className="stroke-parchment-line dark:stroke-ink-line" strokeDasharray="2 4" />
          <text x={PAD.l - 6} y={y(t) + 3} textAnchor="end" className="fill-muted text-[9px] dark:fill-muted-dark">
            {t}
          </text>
        </g>
      ))}
      {RANK_INDEX.map((rank, i) => (
        <text
          key={rank}
          x={x(i + 1)}
          y={H - 6}
          textAnchor="middle"
          className={`text-[9px] font-bold ${i + 1 <= shownRound ? 'fill-ink dark:fill-cream' : 'fill-muted/50 dark:fill-muted-dark/50'}`}
        >
          {rank}
        </text>
      ))}

      {series.map(({ player, points }) => {
        const color = `var(--color-${suitForName(player.name).key})`;
        const d = points.map((v, r) => `${r === 0 ? 'M' : 'L'}${x(r).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
        return (
          <g key={player.id}>
            <path d={d} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" className="race-line" />
            <circle cx={x(points.length - 1)} cy={y(points[points.length - 1])} r="4" fill={color} className="stroke-parchment-panel dark:stroke-ink-panel" strokeWidth="2" />
          </g>
        );
      })}

      {labels.map((s) => (
        <text
          key={s.player.id}
          x={x(shownRound) + 8}
          y={s.ly + 3}
          className="fill-ink text-[10px] font-bold dark:fill-cream"
        >
          {s.player.name.length > 7 ? `${s.player.name.slice(0, 6)}…` : s.player.name} {s.total}
        </text>
      ))}
    </svg>
  );
}
