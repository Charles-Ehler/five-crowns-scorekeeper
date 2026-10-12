import { NavLink, useLocation } from 'react-router-dom';
import { Swords, History, Trophy } from 'lucide-react';

const TABS = [
  { to: '/play', label: 'Play', Icon: Swords },
  { to: '/history', label: 'History', Icon: History },
  { to: '/stats', label: 'Stats', Icon: Trophy },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const activeIndex = Math.max(0, TABS.findIndex((t) => pathname.startsWith(t.to)));

  return (
    <nav style={{ viewTransitionName: 'bottom-nav' }} className="pb-[env(safe-area-inset-bottom)] fixed inset-x-0 bottom-0 z-30 border-t border-parchment-line bg-parchment-panel/95 backdrop-blur dark:border-ink-line dark:bg-ink-panel/95">
      <div className="relative mx-auto flex max-w-md gap-1 p-2">
        {/* One gold pill that slides to the active tab instead of each tab lighting up on its own. */}
        <span
          aria-hidden="true"
          className="absolute inset-y-2 left-2 rounded-xl bg-gold/15 transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
          style={{ width: `calc((100% - 1rem - ${TABS.length - 1} * 0.25rem) / ${TABS.length})`, transform: `translateX(calc(${activeIndex} * (100% + 0.25rem)))` }}
        />
        {TABS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            viewTransition
            className={({ isActive }) =>
              [
                'press relative flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 text-xs font-semibold',
                isActive ? 'text-gold-deep dark:text-gold' : 'text-muted dark:text-muted-dark',
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
