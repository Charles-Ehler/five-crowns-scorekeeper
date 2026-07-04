import { NavLink } from 'react-router-dom';
import Avatar from './Avatar.jsx';

const PODIUM_STYLE = [
  { order: 'order-2', pad: 'pt-0', badge: 'bg-yellow', medal: '1' },
  { order: 'order-1', pad: 'pt-6', badge: 'bg-card dark:bg-card-dark', medal: '2' },
  { order: 'order-3', pad: 'pt-10', badge: 'bg-red', medal: '3' },
];

export default function Leaderboard({ players }) {
  const top3 = players.slice(0, 3);
  const rest = players.slice(3);

  return (
    <div>
      <div className="flex items-end justify-center gap-3">
        {top3.map((p, i) => {
          const style = PODIUM_STYLE[i];
          return (
            <NavLink
              key={p.name}
              to={`/stats/${encodeURIComponent(p.name)}`}
              className={`nb-press flex ${style.pad} ${style.order} flex-col items-center rounded-xl border-2 border-transparent p-2 transition-colors active:border-ink dark:active:border-ink-dark`}
            >
              <div className="relative">
                <Avatar name={p.name} sizeClass="h-14 w-14 text-lg" />
                <span
                  className={`absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-ink text-xs font-extrabold text-ink dark:border-ink-dark ${style.badge}`}
                >
                  {style.medal}
                </span>
              </div>
              <p className="mt-2 max-w-[5.5rem] truncate text-center text-sm font-bold text-ink dark:text-ink-dark">{p.name}</p>
              <p className="text-xs text-muted dark:text-muted-dark">
                {p.wins} {p.wins === 1 ? 'win' : 'wins'}
              </p>
              <p className="text-[11px] text-muted dark:text-muted-dark">{p.gamesPlayed} games</p>
            </NavLink>
          );
        })}
      </div>

      {rest.length > 0 && (
        <ol className="mt-5 space-y-2">
          {rest.map((p, i) => (
            <li key={p.name}>
              <NavLink
                to={`/stats/${encodeURIComponent(p.name)}`}
                className="nb-press-sm flex items-center justify-between rounded-xl border-2 border-ink bg-card px-3 py-2 text-sm dark:border-ink-dark dark:bg-card-dark"
              >
                <span className="flex items-center gap-2 text-ink dark:text-ink-dark">
                  <span className="w-5 text-center font-bold text-muted dark:text-muted-dark">{i + 4}</span>
                  {p.name}
                </span>
                <span className="text-right text-ink dark:text-ink-dark">
                  <span className="font-bold">{p.wins} wins</span>
                  <span className="ml-1.5 text-xs text-muted dark:text-muted-dark">· {p.gamesPlayed} games</span>
                </span>
              </NavLink>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
