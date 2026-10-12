import { useNavigate } from 'react-router-dom';
import { formatDate, summarizeGame } from '../lib/gameSummary.js';
import { playerKey } from '../lib/stats.js';
import { suitForName } from '../lib/suits.js';

const H = 220;
const PAD = { l: 34, r: 16, t: 16, b: 30 };
const STEP = 58;

// Every finished game left to right, each player's final total as a dot
// (lower is better, so the best scores sit at the top). Winners get a gold
// ring. With a player focused, their games are joined into a line. Tap a
// game's column to open it.
export default function SeasonTimeline({ games, focus }) {
  const navigate = useNavigate();
  const summaries = games.map((g) => ({ game: g, ...summarizeGame(g) }));
  const all = summaries.flatMap((s) => s.ranked.map((r) => r.total));
  const yMin = Math.min(...all);
  const yMax = Math.max(...all);
  const span = Math.max(1, yMax - yMin);
  const W = Math.max(340, PAD.l + PAD.r + STEP * Math.max(1, games.length - 1) + 24);
  const x = (i) => PAD.l + 12 + i * STEP;
  const y = (v) => PAD.t + ((v - yMin) / span) * (H - PAD.t - PAD.b);

  const focusPoints = focus
    ? summaries
        .map((s, i) => {
          const r = s.ranked.find((e) => playerKey(e.player.name) === focus);
          return r ? `${x(i).toFixed(1)},${y(r.total).toFixed(1)}` : null;
        })
        .filter(Boolean)
    : [];

  return (
    <div className="card-elevated overflow-x-auto rounded-2xl bg-parchment-panel p-2 dark:bg-ink-panel">
      <svg viewBox={`0 0 ${W} ${H}`} style={{ minWidth: W }} className="w-full" role="img" aria-label="Final totals in every game">
        {[yMin, Math.round((yMin + yMax) / 2), yMax].map((t) => (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} className="stroke-parchment-line dark:stroke-ink-line" strokeDasharray="2 4" />
            <text x={PAD.l - 6} y={y(t) + 3} textAnchor="end" className="fill-muted text-[9px] dark:fill-muted-dark">{t}</text>
          </g>
        ))}
        {focusPoints.length > 1 && (
          <polyline points={focusPoints.join(' ')} fill="none" className="race-line stroke-gold" strokeWidth="2.5" strokeLinejoin="round" />
        )}
        {summaries.map((s, i) => (
          <g
            key={s.game.id}
            onClick={() => navigate(`/history/${s.game.id}`, { viewTransition: true })}
            className="cursor-pointer"
          >
            <rect x={x(i) - STEP / 2} y={0} width={STEP} height={H} fill="transparent" className="hover:fill-gold/5" />
            {s.ranked.map((r) => {
              const key = playerKey(r.player.name);
              const dim = focus && focus !== key;
              const isWinner = r.place === 1;
              return (
                <circle
                  key={r.player.id}
                  cx={x(i)}
                  cy={y(r.total)}
                  r={focus === key ? 7 : isWinner ? 6 : 4.5}
                  fill={`var(--color-${suitForName(r.player.name).key})`}
                  stroke={isWinner ? 'var(--color-gold)' : 'none'}
                  strokeWidth="2.5"
                  opacity={dim ? 0.18 : 1}
                >
                  <title>{`${r.player.name}: ${r.total}${isWinner ? ' (won)' : ''}`}</title>
                </circle>
              );
            })}
            <text x={x(i)} y={H - 10} textAnchor="middle" className="fill-muted text-[9px] font-semibold dark:fill-muted-dark">
              {formatDate(s.game.createdAt, { month: 'short', day: 'numeric' })}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
