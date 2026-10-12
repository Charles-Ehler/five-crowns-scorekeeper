import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import Avatar from './Avatar.jsx';
import { formatDate } from '../lib/gameSummary.js';
import { playerKey } from '../lib/stats.js';

function findPair(pairs, a, b) {
  return pairs.find((p) => {
    const keys = p.names.map(playerKey);
    return keys.includes(playerKey(a)) && keys.includes(playerKey(b));
  });
}

function winsFor(pair, name) {
  return pair?.wins.find((w) => playerKey(w.name) === playerKey(name))?.wins ?? 0;
}

// Everyone against everyone. Each cell is the row player's record against the
// column player in games they both played: green when the row player leads,
// red when they trail. Tap a cell for the story of that rivalry.
export default function HeadToHead({ players, pairs, focus }) {
  const busiest = pairs.find((p) => p.names.every((n) => players.some((pl) => playerKey(pl.name) === playerKey(n))));
  const [picked, setPicked] = useState(busiest ? busiest.names : null);
  const pair = picked ? findPair(pairs, picked[0], picked[1]) : null;

  return (
    <div className="space-y-3">
      <div className="card-elevated overflow-x-auto rounded-2xl bg-parchment-panel p-2 dark:bg-ink-panel">
        <table className="mx-auto border-separate border-spacing-1">
          <thead>
            <tr>
              <th />
              {players.map((p) => (
                <th key={p.name} className="p-1">
                  <span className="flex justify-center" title={p.name}>
                    <Avatar name={p.name} sizeClass="h-8 w-8 text-xs" />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {players.map((row) => (
              <tr key={row.name} className={focus && focus !== playerKey(row.name) ? 'opacity-40' : ''}>
                <th className="pr-2 text-right text-sm font-semibold text-ink dark:text-cream">
                  <span className="block max-w-[5.5rem] truncate">{row.name}</span>
                </th>
                {players.map((col) => {
                  if (row.name === col.name) {
                    return <td key={col.name} className="h-11 w-12 rounded-lg bg-muted/5 dark:bg-muted-dark/5" />;
                  }
                  const p = findPair(pairs, row.name, col.name);
                  const mine = winsFor(p, row.name);
                  const theirs = winsFor(p, col.name);
                  const tone = !p ? '' : mine > theirs ? 'bg-club/20 text-club' : mine < theirs ? 'bg-heart/15 text-heart' : 'bg-muted/10 text-muted dark:text-muted-dark';
                  const selected = picked && picked.includes(row.name) && picked.includes(col.name);
                  return (
                    <td key={col.name} className="p-0">
                      <button
                        type="button"
                        disabled={!p}
                        onClick={() => setPicked([row.name, col.name])}
                        aria-label={`${row.name} vs ${col.name}`}
                        className={`press flex h-11 w-12 items-center justify-center rounded-lg text-sm font-bold tabular-nums disabled:cursor-default ${tone} ${selected ? 'ring-2 ring-gold' : ''}`}
                      >
                        {p ? `${mine}–${theirs}` : ''}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pair && (
        <div key={picked.join('|')} className="card-elevated animate-pop-in rounded-2xl bg-parchment-panel p-4 dark:bg-ink-panel">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Avatar name={picked[0]} sizeClass="h-10 w-10 text-sm" />
              <span className="font-display text-3xl font-bold text-ink dark:text-cream">{winsFor(pair, picked[0])}</span>
            </div>
            <p className="text-center text-sm text-muted dark:text-muted-dark">
              {picked[0]} vs {picked[1]}
              <br />
              {pair.games} {pair.games === 1 ? 'game' : 'games'} together
            </p>
            <div className="flex items-center gap-2">
              <span className="font-display text-3xl font-bold text-ink dark:text-cream">{winsFor(pair, picked[1])}</span>
              <Avatar name={picked[1]} sizeClass="h-10 w-10 text-sm" />
            </div>
          </div>
          <ul className="mt-3 divide-y divide-parchment-line text-sm dark:divide-ink-line">
            {pair.matches.slice(0, 5).map((m) => (
              <li key={m.gameId}>
                <NavLink to={`/history/${m.gameId}`} viewTransition className="flex items-center justify-between py-2">
                  <span className="text-muted dark:text-muted-dark">{formatDate(m.createdAt)}</span>
                  <span className="font-semibold text-ink dark:text-cream">{m.winnerName ? `${m.winnerName} won` : 'Neither won'}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
