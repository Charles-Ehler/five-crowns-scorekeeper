import { NavLink } from 'react-router-dom';
import { PlusCircle, Swords, History, Trophy } from 'lucide-react';

const TABS = [
  { to: '/', label: 'New Game', end: true, Icon: PlusCircle },
  { to: '/game', label: 'Current', Icon: Swords },
  { to: '/history', label: 'History', Icon: History },
  { to: '/stats', label: 'Stats', Icon: Trophy },
];

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-paper-line bg-paper/95 backdrop-blur dark:border-chalk-board-line dark:bg-chalk-board/95">
      <div className="mx-auto flex max-w-md">
        {TABS.map(({ to, label, end, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                'flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors',
                isActive
                  ? 'text-red-ink dark:text-amber-chalk'
                  : 'text-ink-faint hover:text-ink-soft dark:text-chalk-faint dark:hover:text-chalk-soft',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
