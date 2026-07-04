import { Shuffle } from 'lucide-react';

// icon-only: a compact marker for tight spaces (running totals, scorecard
// cells). Otherwise: a small labeled pill, for the score entry row.
export default function DealerBadge({ iconOnly = false }) {
  if (iconOnly) {
    return (
      <span
        title="Dealer"
        aria-label="Dealer"
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink/10 dark:bg-chalk/15"
      >
        <Shuffle size={11} className="text-ink dark:text-chalk" />
      </span>
    );
  }

  return (
    <span className="flex shrink-0 items-center gap-1 rounded-full bg-ink/10 px-2 py-1 text-[11px] font-semibold text-ink dark:bg-chalk/15 dark:text-chalk">
      <Shuffle size={12} />
      Dealer
    </span>
  );
}
