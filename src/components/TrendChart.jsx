import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { suitForName } from '../lib/suits.js';

const W = 340;
const H = 150;
const PAD = { l: 30, r: 12, t: 14, b: 14 };

function formatDate(timestamp) {
  if (!timestamp?.toDate) return '';
  return timestamp.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

// One player's final totals, oldest to newest, against their average. Tap a
// point to see that game. Wins are drawn as gold dots.
export default function TrendChart({ name, history, average }) {
  const games = [...history].reverse(); // history is newest-first
  const [selected, setSelected] = useState(games.length - 1);
  if (games.length < 2) return null;

  const color = `var(--color-${suitForName(name).key})`;
  const totals = games.map((g) => g.total);
  const yMin = Math.min(...totals);
  const yMax = Math.max(...totals);
  const span = Math.max(1, yMax - yMin);
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const x = (i) => PAD.l + (i / (games.length - 1)) * innerW;
  const y = (v) => PAD.t + ((v - yMin) / span) * innerH; // lower score drawn higher: up is better
  const d = games.map((g, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(g.total).toFixed(1)}`).join(' ');
  const pick = games[selected] ?? games[games.length - 1];

  return (
    <div className="card-elevated rounded-2xl bg-parchment-panel p-3 dark:bg-ink-panel">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full touch-none" role="img" aria-label={`${name}'s game totals over time`}>
        <line x1={PAD.l} x2={W - PAD.r} y1={y(average)} y2={y(average)} className="stroke-gold" strokeDasharray="4 4" opacity="0.7" />
        <text x={PAD.l - 6} y={y(average) + 3} textAnchor="end" className="fill-gold-deep text-[9px] font-bold dark:fill-gold">avg</text>
        <text x={PAD.l - 6} y={PAD.t + 3} textAnchor="end" className="fill-muted text-[9px] dark:fill-muted-dark">{yMin}</text>
        <text x={PAD.l - 6} y={H - PAD.b + 3} textAnchor="end" className="fill-muted text-[9px] dark:fill-muted-dark">{yMax}</text>
        <path d={d} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" className="race-line" />
        {games.map((g, i) => (
          <g key={g.gameId} onClick={() => setSelected(i)} className="cursor-pointer">
            <circle cx={x(i)} cy={y(g.total)} r="12" fill="transparent" />
            <circle
              cx={x(i)}
              cy={y(g.total)}
              r={i === selected ? 6 : 3.5}
              className={g.won ? 'fill-gold' : ''}
              fill={g.won ? undefined : color}
              stroke={i === selected ? 'currentColor' : 'none'}
              strokeWidth="2"
              style={{ transition: 'r 150ms' }}
            />
          </g>
        ))}
      </svg>
      <div className="mt-1 flex items-center justify-between text-sm">
        <span className="text-muted dark:text-muted-dark">
          {formatDate(pick.createdAt)} · {pick.won ? 'Won' : `#${pick.placement}`}
        </span>
        <NavLink to={`/history/${pick.gameId}`} viewTransition className="font-bold text-gold-deep dark:text-gold">
          {pick.total} pts →
        </NavLink>
      </div>
    </div>
  );
}
