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
        'overflow-hidden rounded-2xl border bg-paper-raised shadow-sm transition-colors dark:bg-chalk-board-raised',
        featured ? 'border-red-ink/50' : 'border-paper-line dark:border-chalk-board-line',
      ].join(' ')}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-2 p-4 text-left transition-colors active:bg-paper dark:active:bg-chalk-board"
      >
        <div className="flex flex-1 flex-col items-center gap-1">
          {featured && (
            <span className="mb-1 flex items-center gap-1 rounded-full bg-red-ink/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-ink">
              <Swords size={10} />
              Current rivalry
            </span>
          )}
          <div className="flex items-center justify-center gap-3">
            <div className="flex flex-col items-center gap-1">
              <Avatar name={a.name} sizeClass="h-9 w-9 text-sm" />
              <span className="max-w-[5rem] truncate text-xs font-medium text-ink dark:text-chalk">{a.name}</span>
            </div>
            <span className="font-mono text-xl font-bold tabular-nums text-ink dark:text-chalk">
              {a.wins}
              <span className="text-ink-faint dark:text-chalk-faint">-</span>
              {b.wins}
            </span>
            <div className="flex flex-col items-center gap-1">
              <Avatar name={b.name} sizeClass="h-9 w-9 text-sm" />
              <span className="max-w-[5rem] truncate text-xs font-medium text-ink dark:text-chalk">{b.name}</span>
            </div>
          </div>
          <p className="text-xs text-ink-faint dark:text-chalk-faint">{pair.games} games played</p>
        </div>
        <ChevronDown
          size={16}
          className={`shrink-0 text-ink-faint transition-transform dark:text-chalk-faint ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {expanded && (
        <ul className="space-y-1.5 border-t border-paper-line p-3 text-sm dark:border-chalk-board-line">
          {pair.matches.map((m) => (
            <li key={m.gameId} className="flex items-center justify-between">
              <NavLink to={`/history/${m.gameId}`} className="font-medium text-red-ink">
                {formatDate(m.createdAt)}
              </NavLink>
              <span className="text-ink-soft dark:text-chalk-soft">
                {m.winnerName ? `${m.winnerName} won` : 'No clear winner'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
