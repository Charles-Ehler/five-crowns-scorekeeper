import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronDown, Swords } from 'lucide-react';
import Avatar from './Avatar.jsx';

function formatDate(timestamp) {
  if (!timestamp?.toDate) return '';
  return timestamp.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

// Tappable — expands to the shared match history between this pair.
export default function RivalryCard({ pair, featured = false }) {
  const [expanded, setExpanded] = useState(false);
  const [a, b] = pair.wins;

  return (
    <div
      className={[
        'nb-shadow overflow-hidden rounded-2xl border-[3px] bg-card dark:bg-card-dark',
        featured ? 'border-red' : 'border-ink dark:border-ink-dark',
      ].join(' ')}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-2 p-4 text-left"
      >
        <div className="flex flex-1 flex-col items-center gap-1">
          {featured && (
            <span className="mb-1 flex items-center gap-1 rounded-full border-2 border-ink bg-yellow px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-ink dark:border-ink-dark">
              <Swords size={10} />
              Current rivalry
            </span>
          )}
          <div className="flex items-center justify-center gap-3">
            <div className="flex flex-col items-center gap-1">
              <Avatar name={a.name} sizeClass="h-9 w-9 text-sm" />
              <span className="max-w-[5rem] truncate text-xs font-bold text-ink dark:text-ink-dark">{a.name}</span>
            </div>
            <span className="text-xl font-extrabold tabular-nums text-ink dark:text-ink-dark">
              {a.wins}
              <span className="text-muted dark:text-muted-dark">-</span>
              {b.wins}
            </span>
            <div className="flex flex-col items-center gap-1">
              <Avatar name={b.name} sizeClass="h-9 w-9 text-sm" />
              <span className="max-w-[5rem] truncate text-xs font-bold text-ink dark:text-ink-dark">{b.name}</span>
            </div>
          </div>
          <p className="text-xs text-muted dark:text-muted-dark">{pair.games} games played</p>
        </div>
        <ChevronDown
          size={16}
          className={`shrink-0 text-muted transition-transform dark:text-muted-dark ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {expanded && (
        <ul className="space-y-1.5 border-t-2 border-ink p-3 text-sm dark:border-ink-dark">
          {pair.matches.map((m) => (
            <li key={m.gameId} className="flex items-center justify-between">
              <NavLink to={`/history/${m.gameId}`} className="font-bold text-ink underline decoration-blue decoration-[3px] underline-offset-2 dark:text-ink-dark">
                {formatDate(m.createdAt)}
              </NavLink>
              <span className="text-muted dark:text-muted-dark">
                {m.winnerName ? `${m.winnerName} won` : 'No clear winner'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
