import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDown, ArrowUp, Flame } from 'lucide-react';
import Avatar from './Avatar.jsx';
import { playerKey } from '../lib/stats.js';

// Lower is better for scores, so those columns sort ascending first.
const COLUMNS = [
  { key: 'wins', label: 'Crowns', value: (p) => p.wins, better: 'high' },
  { key: 'winRate', label: 'Win rate', value: (p) => p.wins / p.gamesPlayed, better: 'high', format: (v) => `${Math.round(v * 100)}%` },
  { key: 'average', label: 'Avg score', value: (p) => p.average, better: 'low', format: (v) => v.toFixed(1) },
  { key: 'best', label: 'Best game', value: (p) => p.bestGame?.total ?? Infinity, better: 'low', wide: true, format: (v) => (v === Infinity ? '-' : v) },
  { key: 'outRate', label: 'Goes out', value: (p) => p.outRate, better: 'high', wide: true, format: (v) => `${Math.round(v * 100)}%` },
  { key: 'games', label: 'Games', value: (p) => p.gamesPlayed, better: 'high', wide: true },
];

const FORM_LENGTH = 5;

// Every player side by side. Tap a column to sort by it (tap again to flip),
// tap a row to open that player. The best value in each column is gold.
export default function PlayerTable({ players, focus }) {
  const navigate = useNavigate();
  const [sort, setSort] = useState({ key: 'wins', dir: 'desc' });
  const column = COLUMNS.find((c) => c.key === sort.key);
  const sorted = [...players].sort((a, b) => {
    const diff = column.value(a) - column.value(b);
    return (sort.dir === 'asc' ? diff : -diff) || b.wins - a.wins;
  });

  function toggleSort(col) {
    setSort((prev) =>
      prev.key === col.key
        ? { key: col.key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key: col.key, dir: col.better === 'low' ? 'asc' : 'desc' },
    );
  }

  const bestOf = Object.fromEntries(
    COLUMNS.map((c) => {
      const values = players.map(c.value).filter((v) => Number.isFinite(v));
      return [c.key, c.better === 'low' ? Math.min(...values) : Math.max(...values)];
    }),
  );

  return (
    <div className="card-elevated overflow-x-auto rounded-2xl bg-parchment-panel dark:bg-ink-panel">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-parchment-line text-muted dark:border-ink-line dark:text-muted-dark">
            <th className="px-3 py-3 text-left font-semibold">Player</th>
            {COLUMNS.map((c) => (
              <th key={c.key} className={`px-2 py-1 text-right font-semibold ${c.wide ? 'hidden md:table-cell' : ''}`}>
                <button
                  type="button"
                  onClick={() => toggleSort(c)}
                  className={`press inline-flex items-center gap-0.5 rounded-lg px-1.5 py-2 ${sort.key === c.key ? 'text-gold-deep dark:text-gold' : ''}`}
                >
                  {c.label}
                  {sort.key === c.key && (sort.dir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
                </button>
              </th>
            ))}
            <th className="hidden px-3 py-3 text-right font-semibold lg:table-cell">Last {FORM_LENGTH}</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((p) => {
            const key = playerKey(p.name);
            return (
              <tr
                key={key}
                onClick={() => navigate(`/stats/${encodeURIComponent(p.name)}`, { viewTransition: true })}
                className={[
                  'cursor-pointer border-b border-parchment-line/60 transition-colors last:border-0 hover:bg-gold/5 dark:border-ink-line/60',
                  focus === key ? 'bg-gold/10' : '',
                  focus && focus !== key ? 'opacity-50' : '',
                ].join(' ')}
              >
                <td className="px-3 py-2.5">
                  <span className="flex items-center gap-2.5">
                    <Avatar name={p.name} sizeClass="h-8 w-8 text-xs" />
                    <span className="truncate font-semibold text-ink dark:text-cream">{p.name}</span>
                    {p.currentStreak >= 2 && (
                      <span title={`${p.currentStreak} wins in a row`} className="flex items-center text-xs font-bold text-heart">
                        <Flame size={13} fill="currentColor" />
                        {p.currentStreak}
                      </span>
                    )}
                  </span>
                </td>
                {COLUMNS.map((c) => {
                  const v = c.value(p);
                  const isBest = players.length > 1 && v === bestOf[c.key];
                  return (
                    <td
                      key={c.key}
                      className={`px-3 py-2.5 text-right tabular-nums ${c.wide ? 'hidden md:table-cell' : ''} ${isBest ? 'font-bold text-gold-deep dark:text-gold' : 'text-ink dark:text-cream'}`}
                    >
                      {c.format ? c.format(v) : v}
                    </td>
                  );
                })}
                <td className="hidden px-3 py-2.5 lg:table-cell">
                  <span className="flex justify-end gap-1">
                    {p.history.slice(0, FORM_LENGTH).reverse().map((g) => (
                      <span
                        key={g.gameId}
                        title={g.won ? 'Won' : `Finished #${g.placement}`}
                        className={`flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-bold ${g.won ? 'bg-gold text-ink' : 'bg-muted/10 text-muted dark:bg-muted-dark/10 dark:text-muted-dark'}`}
                      >
                        {g.won ? '♛' : g.placement}
                      </span>
                    ))}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
