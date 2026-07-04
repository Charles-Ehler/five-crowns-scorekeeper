import { suitForName } from '../lib/suits.js';

// Lightweight CSS-bar comparison — deliberately not a charting library, just
// a handful of divs sized by percentage of the max value.
export default function WinBar({ title, entries, formatValue = (v) => v }) {
  const max = Math.max(1, ...entries.map((e) => e.value));

  return (
    <div className="nb-shadow rounded-2xl border-[3px] border-ink bg-card p-4 dark:border-ink-dark dark:bg-card-dark">
      <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted dark:text-muted-dark">{title}</p>
      <div className="space-y-2.5">
        {entries.map((entry) => {
          const suit = suitForName(entry.name);
          const pct = Math.max(4, Math.round((entry.value / max) * 100));
          return (
            <div key={entry.name} className="flex items-center gap-2">
              <span className="w-16 shrink-0 truncate text-xs font-bold text-ink dark:text-ink-dark">{entry.name}</span>
              <div className="h-4 flex-1 overflow-hidden rounded-full border-2 border-ink dark:border-ink-dark">
                <div className={`h-full ${suit.bg}`} style={{ width: `${pct}%` }} />
              </div>
              <span className="w-10 shrink-0 text-right text-xs font-bold tabular-nums text-ink dark:text-ink-dark">
                {formatValue(entry.value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
