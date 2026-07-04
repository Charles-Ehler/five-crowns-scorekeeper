import { NavLink } from 'react-router-dom';
import { Swords, History, Trophy } from 'lucide-react';

const TABS = [
  { to: '/play', label: 'Play', Icon: Swords },
  { to: '/history', label: 'History', Icon: History },
  { to: '/stats', label: 'Stats', Icon: Trophy },
];

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-parchment-line bg-parchment-panel/95 backdrop-blur dark:border-ink-line dark:bg-ink-panel/95">
      <div className="mx-auto flex max-w-md gap-1 p-2">
        {TABS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                'press flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 text-xs font-semibold',
                isActive ? 'bg-gold/15 text-gold-deep dark:text-gold' : 'text-muted dark:text-muted-dark',
              ].join(' ')
            }
          >
            <Icon size={22} strokeWidth={2.2} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
