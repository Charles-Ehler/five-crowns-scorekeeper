import { NavLink } from 'react-router-dom';
import Avatar from './Avatar.jsx';

const FORM_LENGTH = 5;

// Each player's last five finishes, newest on the right, like a sports form
// table: a gold crown chip for a win, the placement otherwise.
export default function FormGuide({ players }) {
  return (
    <ul className="card-elevated divide-y divide-parchment-line rounded-2xl bg-parchment-panel dark:divide-ink-line dark:bg-ink-panel">
      {players.map((p) => {
        const recent = p.history.slice(0, FORM_LENGTH).reverse();
        return (
          <li key={p.name}>
            <NavLink to={`/stats/${encodeURIComponent(p.name)}`} viewTransition className="press flex items-center gap-3 px-3 py-2.5">
              <Avatar name={p.name} sizeClass="h-8 w-8 text-xs" />
              <span className="min-w-0 flex-1 truncate text-sm font-bold text-ink dark:text-cream">{p.name}</span>
              <span className="flex gap-1">
                {recent.map((g) => (
                  <span
                    key={g.gameId}
                    title={g.won ? 'Won' : `Finished #${g.placement}`}
                    className={[
                      'flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-extrabold',
                      g.won ? 'bg-gold text-ink' : 'bg-muted/10 text-muted dark:bg-muted-dark/10 dark:text-muted-dark',
                    ].join(' ')}
                  >
                    {g.won ? '♛' : g.placement}
                  </span>
                ))}
              </span>
            </NavLink>
          </li>
        );
      })}
    </ul>
  );
}
