import { NavLink } from 'react-router-dom';
import { Swords, History, Trophy } from 'lucide-react';

const TABS = [
  { to: '/play', label: 'Play', Icon: Swords },
  { to: '/history', label: 'History', Icon: History },
  { to: '/stats', label: 'Stats', Icon: Trophy },
];

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t-[3px] border-ink bg-cream dark:border-ink-dark dark:bg-canvas-dark">
      <div className="mx-auto flex max-w-md gap-2 p-2">
        {TABS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                'nb-press-sm flex flex-1 flex-col items-center gap-0.5 rounded-xl border-2 py-2 text-xs font-bold transition-colors',
                isActive
                  ? 'nb-shadow-sm border-ink bg-yellow text-ink dark:border-ink-dark'
                  : 'border-transparent text-muted dark:text-muted-dark',
              ].join(' ')
            }
          >
            <Icon size={22} strokeWidth={2.5} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
