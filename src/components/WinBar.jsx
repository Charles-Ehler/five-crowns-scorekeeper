import { suitForName } from '../lib/suits.js';

// Lightweight CSS-bar comparison — deliberately not a charting library, just
// a handful of divs sized by percentage of the max value.
export default function WinBar({ title, entries, formatValue = (v) => v }) {
  const max = Math.max(1, ...entries.map((e) => e.value));

  return (
    <div className="card-elevated rounded-2xl bg-parchment-panel p-4 dark:bg-ink-panel">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted dark:text-muted-dark">{title}</p>
      <div className="space-y-2.5">
        {entries.map((entry) => {
          const suit = suitForName(entry.name);
          const pct = Math.max(4, Math.round((entry.value / max) * 100));
          return (
            <div key={entry.name} className="flex items-center gap-2">
              <span className="w-16 shrink-0 truncate text-xs font-bold text-ink dark:text-cream">{entry.name}</span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-parchment-line/60 dark:bg-ink-line">
                <div className={`h-full rounded-full ${suit.bg}`} style={{ width: `${pct}%` }} />
              </div>
              <span className="w-10 shrink-0 text-right text-xs font-bold tabular-nums text-ink dark:text-cream">
                {formatValue(entry.value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
