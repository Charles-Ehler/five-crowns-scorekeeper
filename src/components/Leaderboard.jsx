import { NavLink } from 'react-router-dom';
import Avatar from './Avatar.jsx';

const PODIUM_STYLE = [
  { order: 'order-2', pad: 'pt-0', ring: 'ring-amber-chalk', badge: '1st' },
  { order: 'order-1', pad: 'pt-5', ring: 'ring-ink-faint dark:ring-chalk-faint', badge: '2nd' },
  { order: 'order-3', pad: 'pt-8', ring: 'ring-red-ink/60', badge: '3rd' },
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
              className={`flex ${style.pad} ${style.order} flex-col items-center rounded-xl p-1 transition-colors active:bg-paper dark:active:bg-chalk-board`}
            >
              <div className="relative">
                <Avatar name={p.name} sizeClass="h-14 w-14 text-lg" className={`ring-4 ${style.ring}`} />
                {i === 0 && (
                  <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-red-ink text-[10px] font-bold text-red-ink">
                    1
                  </span>
                )}
              </div>
              <p className="mt-2 max-w-[5.5rem] truncate text-center text-sm font-semibold text-ink dark:text-chalk">{p.name}</p>
              <p className="text-xs text-ink-faint dark:text-chalk-faint">
                {p.wins} {p.wins === 1 ? 'win' : 'wins'}
              </p>
              <p className="text-[11px] text-ink-faint dark:text-chalk-faint">{p.gamesPlayed} games</p>
            </NavLink>
          );
        })}
      </div>

      {rest.length > 0 && (
        <ol className="mt-5 space-y-1.5">
          {rest.map((p, i) => (
            <li key={p.name}>
              <NavLink
                to={`/stats/${encodeURIComponent(p.name)}`}
                className="flex items-center justify-between rounded-xl border border-paper-line bg-paper-raised px-3 py-2 text-sm shadow-sm transition-colors hover:bg-paper dark:border-chalk-board-line dark:bg-chalk-board-raised dark:hover:bg-chalk-board"
              >
                <span className="flex items-center gap-2 text-ink dark:text-chalk">
                  <span className="w-5 text-center font-semibold text-ink-faint dark:text-chalk-faint">{i + 4}</span>
                  {p.name}
                </span>
                <span className="text-right text-ink dark:text-chalk">
                  <span className="font-semibold">{p.wins} wins</span>
                  <span className="ml-1.5 text-xs text-ink-faint dark:text-chalk-faint">· {p.gamesPlayed} games</span>
                </span>
              </NavLink>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
