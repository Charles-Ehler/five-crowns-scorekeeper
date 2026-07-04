import { NavLink } from 'react-router-dom';
import { Crown } from 'lucide-react';
import Avatar from './Avatar.jsx';

const PODIUM_STYLE = [
  { order: 'order-2', pad: 'pt-0', ring: 'ring-gold', crown: 'text-gold', size: 20 },
  { order: 'order-1', pad: 'pt-6', ring: 'ring-muted dark:ring-muted-dark', crown: 'text-muted dark:text-muted-dark', size: 15 },
  { order: 'order-3', pad: 'pt-10', ring: 'ring-diamond', crown: 'text-diamond', size: 15 },
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
              className={`press flex ${style.pad} ${style.order} flex-col items-center rounded-xl p-2`}
            >
              <div className="relative">
                <Crown size={style.size} className={`absolute -top-3.5 left-1/2 -translate-x-1/2 ${style.crown}`} fill="currentColor" />
                <Avatar name={p.name} sizeClass={`h-14 w-14 text-lg ring-2 ${style.ring}`} />
              </div>
              <p className="mt-2 max-w-[5.5rem] truncate text-center text-sm font-bold text-ink dark:text-cream">{p.name}</p>
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
                className="card-elevated press flex items-center justify-between rounded-xl bg-parchment-panel px-3 py-2 text-sm dark:bg-ink-panel"
              >
                <span className="flex items-center gap-2 text-ink dark:text-cream">
                  <span className="w-5 text-center font-bold text-muted dark:text-muted-dark">{i + 4}</span>
                  {p.name}
                </span>
                <span className="text-right text-ink dark:text-cream">
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
