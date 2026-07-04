import { suitForName } from '../lib/suits.js';

// Lightweight CSS-bar comparison — deliberately not a charting library, just
// a handful of divs sized by percentage of the max value.
export default function WinBar({ title, entries, formatValue = (v) => v }) {
  const max = Math.max(1, ...entries.map((e) => e.value));

  return (
    <div className="rounded-2xl border border-paper-line bg-paper-raised p-4 shadow-sm dark:border-chalk-board-line dark:bg-chalk-board-raised">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-faint dark:text-chalk-faint">{title}</p>
      <div className="space-y-2.5">
        {entries.map((entry) => {
          const suit = suitForName(entry.name);
          const pct = Math.max(4, Math.round((entry.value / max) * 100));
          return (
            <div key={entry.name} className="flex items-center gap-2">
              <span className="w-16 shrink-0 truncate text-xs font-medium text-ink dark:text-chalk">{entry.name}</span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-paper-line/60 dark:bg-chalk-board-line">
                <div className={`h-full rounded-full ${suit.bg}`} style={{ width: `${pct}%` }} />
              </div>
              <span className="w-10 shrink-0 text-right font-mono text-xs font-semibold tabular-nums text-ink dark:text-chalk">
                {formatValue(entry.value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
