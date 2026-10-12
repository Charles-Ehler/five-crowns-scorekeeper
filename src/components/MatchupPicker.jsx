import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import Avatar from './Avatar.jsx';
import { playerKey } from '../lib/stats.js';
import { suitForName } from '../lib/suits.js';

function formatDate(timestamp) {
  if (!timestamp?.toDate) return '';
  return timestamp.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function PlayerSelect({ value, onChange, players, label }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      className="w-full min-w-0 truncate rounded-xl border border-parchment-line bg-parchment px-2 py-2 text-sm font-bold text-ink dark:border-ink-line dark:bg-ink-deep dark:text-cream"
    >
      {players.map((p) => (
        <option key={p.name} value={p.name}>
          {p.name}
        </option>
      ))}
    </select>
  );
}

// Pick any two players and see their head-to-head: a tug-of-war bar of wins
// plus their last few shared games. Reads the pairs stats.js already builds.
export default function MatchupPicker({ players, pairs }) {
  const [a, setA] = useState(pairs[0]?.names[0] ?? players[0]?.name);
  const [b, setB] = useState(pairs[0]?.names[1] ?? players[1]?.name);

  const pair = pairs.find((p) => {
    const keys = p.names.map(playerKey);
    return keys.includes(playerKey(a)) && keys.includes(playerKey(b));
  });
  const winsFor = (name) => pair?.wins.find((w) => playerKey(w.name) === playerKey(name))?.wins ?? 0;
  const aWins = winsFor(a);
  const bWins = winsFor(b);
  const decided = aWins + bWins;
  const aPct = decided ? (aWins / decided) * 100 : 50;
  const same = playerKey(a) === playerKey(b);

  return (
    <div className="card-elevated rounded-2xl bg-parchment-panel p-4 dark:bg-ink-panel">
      <div className="flex items-center gap-2">
        <PlayerSelect value={a} onChange={setA} players={players} label="First player" />
        <span className="shrink-0 font-display text-sm text-gold-deep dark:text-gold">VS</span>
        <PlayerSelect value={b} onChange={setB} players={players} label="Second player" />
      </div>

      {same ? (
        <p className="mt-4 text-center text-sm text-muted dark:text-muted-dark">Pick two different players.</p>
      ) : !pair ? (
        <p className="mt-4 text-center text-sm text-muted dark:text-muted-dark">These two haven't finished a game together yet.</p>
      ) : (
        <>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar name={a} sizeClass="h-10 w-10 text-sm" />
              <span className="font-display text-3xl text-ink dark:text-cream">{aWins}</span>
            </div>
            <span className="text-xs text-muted dark:text-muted-dark">{pair.games} games together</span>
            <div className="flex items-center gap-2">
              <span className="font-display text-3xl text-ink dark:text-cream">{bWins}</span>
              <Avatar name={b} sizeClass="h-10 w-10 text-sm" />
            </div>
          </div>
          <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-parchment-line dark:bg-ink-line">
            <div className="h-full transition-[width] duration-500" style={{ width: `${aPct}%`, background: `var(--color-${suitForName(a).key})` }} />
            <div className="h-full flex-1" style={{ background: `var(--color-${suitForName(b).key})` }} />
          </div>
          <ul className="mt-3 space-y-1 text-sm">
            {pair.matches.slice(0, 5).map((m) => (
              <li key={m.gameId} className="flex items-center justify-between">
                <NavLink to={`/history/${m.gameId}`} viewTransition className="font-bold text-gold-deep dark:text-gold">
                  {formatDate(m.createdAt)}
                </NavLink>
                <span className="text-muted dark:text-muted-dark">
                  {m.winnerName ? `${m.winnerName} won` : 'No clear winner'}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
