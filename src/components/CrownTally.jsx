import { Crown } from 'lucide-react';
import Avatar from './Avatar.jsx';
import { playerKey } from '../lib/stats.js';

const MAX_DRAWN = 12;

// Wins drawn as crowns, one per game won, so the leader is obvious at a
// glance. Tapping a player highlights them across the whole dashboard.
export default function CrownTally({ players, focus, onFocus }) {
  const sorted = [...players].sort((a, b) => b.wins - a.wins || b.wins / b.gamesPlayed - a.wins / a.gamesPlayed);

  return (
    <ul className="space-y-1">
      {sorted.map((p, row) => {
        const key = playerKey(p.name);
        const dimmed = focus && focus !== key;
        return (
          <li key={key}>
            <button
              type="button"
              onClick={() => onFocus(focus === key ? null : key)}
              aria-pressed={focus === key}
              className={[
                'press flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-opacity',
                focus === key ? 'bg-gold/15' : '',
                dimmed ? 'opacity-40' : '',
              ].join(' ')}
            >
              <Avatar name={p.name} sizeClass="h-9 w-9 text-sm" />
              <span className="w-20 shrink-0 truncate font-semibold text-ink dark:text-cream">{p.name}</span>
              <span className="flex min-w-0 flex-1 flex-wrap items-center gap-0.5">
                {p.wins === 0 && <span className="text-sm text-muted dark:text-muted-dark">No crowns yet</span>}
                {Array.from({ length: Math.min(p.wins, MAX_DRAWN) }, (_, i) => (
                  <Crown
                    key={i}
                    size={18}
                    fill="currentColor"
                    className="animate-crown-pop text-gold"
                    style={{ animationDelay: `${row * 90 + i * 70}ms` }}
                  />
                ))}
                {p.wins > MAX_DRAWN && <span className="ml-1 text-sm font-bold text-gold">+{p.wins - MAX_DRAWN}</span>}
              </span>
              <span className="shrink-0 text-right text-sm text-muted dark:text-muted-dark">
                <span className="font-display text-xl font-bold text-ink dark:text-cream">{p.wins}</span> of {p.gamesPlayed}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
